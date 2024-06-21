# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import mmap
import os
import struct
import sys
from typing import Optional
from .shared_memory_constants import SharedMemoryConstants as consts
from .shared_memory_exception import SharedMemoryException
from .file_accessor import FileAccessor
from ...logging import logger


class SharedMemoryMap:
    """
    Shared memory region to read/write data from.
    """
    def __init__(
            self,
            file_accessor: FileAccessor,
            mem_map_name: str,
            mem_map: mmap.mmap):
        if mem_map is None:
            raise SharedMemoryException(
                'Cannot initialize SharedMemoryMap. Invalid memory map '
                'provided')
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot initialize SharedMemoryMap. Invalid name '
                f'{mem_map_name}')
        self.file_accessor = file_accessor
        self.mem_map_name = mem_map_name
        self.mem_map = mem_map

    def put_bytes(self, content: bytes) -> Optional[int]:
        """
        Writes the given content bytes into this SharedMemoryMap.
        The number of bytes written must be less than or equal to the size of
        the SharedMemoryMap.
        Returns the number of bytes of content written.
        """
        if content is None:
            return None
        content_length = len(content)
        # Seek past the MemoryMapInitialized flag section of the header
        self.mem_map.seek(consts.MEM_MAP_INITIALIZED_FLAG_NUM_BYTES)
        # Write the content length into the header
        content_length_bytes = content_length.to_bytes(
            consts.CONTENT_LENGTH_NUM_BYTES, byteorder=sys.byteorder)
        num_content_length_bytes = len(content_length_bytes)
        num_content_length_bytes_written = self.mem_map.write(
            content_length_bytes)
        if num_content_length_bytes_written != num_content_length_bytes:
            logger.error(
                'Cannot write content size to memory map %s (%s != %s)',
                self.mem_map_name, num_content_length_bytes_written,
                num_content_length_bytes)
            return 0
        # Write the content
        num_content_bytes_written = self.mem_map.write(content)
        self.mem_map.flush()
        return num_content_bytes_written

    def get_bytes(self, content_offset: int = 0, bytes_to_read: int = 0) \
            -> Optional[bytes]:
        """
        Read content from this SharedMemoryMap with the given name and starting
        at the given offset.
        content_offset = 0 means read from the beginning of the content.
        bytes_to_read = 0 means read the entire content.
        Returns the content as bytes if successful, None otherwise.
        """
        content_length = self._get_content_length()
        if content_length is None:
            return None
        # Seek past the header and get to the content
        self.mem_map.seek(consts.CONTENT_HEADER_TOTAL_BYTES)
        if content_offset > 0:
            self.mem_map.seek(content_offset, os.SEEK_CUR)
        if bytes_to_read > 0:
            # Read up to the specified number of bytes to read
            content = self.mem_map.read(bytes_to_read)
        else:
            # Read the entire content
            content = self.mem_map.read()
        return content

    def dispose(self, is_delete_file: bool = True) -> bool:
        """
        Close the underlying memory map.
        Returns True if the resources were disposed, False otherwise.
        """
        success = True
        if is_delete_file:
            success = self.file_accessor.delete_mem_map(self.mem_map_name,
                                                        self.mem_map)
        self.mem_map.close()
        return success

    def _bytes_to_long(self, input_bytes) -> int:
        """
        Decode a set of bytes representing a long.
        This uses the format that the functions host (i.e. C#) uses.
        """
        return struct.unpack("<q", input_bytes)[0]

    def _get_content_length(self) -> Optional[int]:
        """
        Read the header of the memory map to determine the length of content
        contained in that memory map.
        Returns the content length as a non-negative integer if successful,
        None otherwise.
        """
        self.mem_map.seek(consts.MEM_MAP_INITIALIZED_FLAG_NUM_BYTES)
        header_bytes = self.mem_map.read(consts.CONTENT_LENGTH_NUM_BYTES)
        content_length = self._bytes_to_long(header_bytes)
        return content_length
