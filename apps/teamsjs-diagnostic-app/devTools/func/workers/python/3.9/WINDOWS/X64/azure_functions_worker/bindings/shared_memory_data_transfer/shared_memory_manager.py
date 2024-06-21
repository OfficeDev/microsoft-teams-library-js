# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import uuid
from typing import Dict, Optional
from .shared_memory_constants import SharedMemoryConstants as consts
from .file_accessor_factory import FileAccessorFactory
from .shared_memory_metadata import SharedMemoryMetadata
from .shared_memory_map import SharedMemoryMap
from ..datumdef import Datum
from ...logging import logger
from ...utils.common import is_envvar_true
from ...constants import FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED


class SharedMemoryManager:
    """
    Performs all operations related to reading/writing data from/to shared
    memory.
    This is used for transferring input/output data of the function from/to the
    functions host over shared memory as opposed to RPC to improve the rate of
    data transfer and the function's end-to-end latency.
    """
    def __init__(self):
        # The allocated memory maps are tracked here so that a reference to them
        # is kept open until they have been used (e.g. if they contain a
        # function's output, it is read by the functions host).
        # Having a mapping of the name and the memory map is then later used to
        # close a given memory map by its name, after it has been used.
        # key: mem_map_name, val: SharedMemoryMap
        self._allocated_mem_maps: Dict[str, SharedMemoryMap] = {}
        self._file_accessor = FileAccessorFactory.create_file_accessor()

    def __del__(self):
        del self._file_accessor
        del self._allocated_mem_maps

    @property
    def allocated_mem_maps(self):
        """
        List of allocated shared memory maps.
        """
        return self._allocated_mem_maps

    @property
    def file_accessor(self):
        """
        FileAccessor instance for accessing memory maps.
        """
        return self._file_accessor

    def is_enabled(self) -> bool:
        """
        Whether supported types should be transferred between functions host and
        the worker using shared memory.
        """
        return is_envvar_true(
            FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED)

    def is_supported(self, datum: Datum) -> bool:
        """
        Whether the given Datum object can be transferred to the functions host
        using shared memory.
        This logic is kept consistent with the host's which can be found in
        SharedMemoryManager.cs
        """
        if datum.type == 'bytes':
            num_bytes = len(datum.value)
            if num_bytes >= consts.MIN_BYTES_FOR_SHARED_MEM_TRANSFER and \
                    num_bytes <= consts.MAX_BYTES_FOR_SHARED_MEM_TRANSFER:
                return True
        elif datum.type == 'string':
            num_bytes = len(datum.value) * consts.SIZE_OF_CHAR_BYTES
            if num_bytes >= consts.MIN_BYTES_FOR_SHARED_MEM_TRANSFER and \
                    num_bytes <= consts.MAX_BYTES_FOR_SHARED_MEM_TRANSFER:
                return True
        return False

    def put_bytes(self, content: bytes) -> Optional[SharedMemoryMetadata]:
        """
        Writes the given bytes into shared memory.
        Returns metadata about the shared memory region to which the content was
        written if successful, None otherwise.
        """
        if content is None:
            return None
        mem_map_name = str(uuid.uuid4())
        content_length = len(content)
        shared_mem_map = self._create(mem_map_name, content_length)
        if shared_mem_map is None:
            return None
        try:
            num_bytes_written = shared_mem_map.put_bytes(content)
        except Exception as e:
            logger.warning('Cannot write %s bytes into shared memory %s - %s',
                           content_length, mem_map_name, e)
            shared_mem_map.dispose()
            return None
        if num_bytes_written != content_length:
            logger.error(
                'Cannot write data into shared memory %s (%s != %s)',
                mem_map_name, num_bytes_written, content_length)
            shared_mem_map.dispose()
            return None
        self.allocated_mem_maps[mem_map_name] = shared_mem_map
        return SharedMemoryMetadata(mem_map_name, content_length)

    def put_string(self, content: str) -> Optional[SharedMemoryMetadata]:
        """
        Writes the given string into shared memory.
        Returns the name of the memory map into which the data was written if
        succesful, None otherwise.
        Note: The encoding used here must be consistent with what is used by the
              host in SharedMemoryManager.cs (GetStringAsync/PutStringAsync).
        """
        if content is None:
            return None
        content_bytes = content.encode('utf-8')
        return self.put_bytes(content_bytes)

    def get_bytes(self, mem_map_name: str, offset: int, count: int) \
            -> Optional[bytes]:
        """
        Reads data from the given memory map with the provided name, starting at
        the provided offset and reading a total of count bytes.
        Returns the data read from shared memory as bytes if successful, None
        otherwise.
        """
        if offset != 0:
            logger.error(
                'Cannot read bytes. Non-zero offset (%s) not supported.',
                offset)
            return None
        shared_mem_map = self._open(mem_map_name, count)
        if shared_mem_map is None:
            return None
        try:
            content = shared_mem_map.get_bytes(content_offset=0,
                                               bytes_to_read=count)
        finally:
            shared_mem_map.dispose(is_delete_file=False)
        return content

    def get_string(self, mem_map_name: str, offset: int, count: int) \
            -> Optional[str]:
        """
        Reads data from the given memory map with the provided name, starting at
        the provided offset and reading a total of count bytes.
        Returns the data read from shared memory as a string if successful, None
        otherwise.
        Note: The encoding used here must be consistent with what is used by the
              host in SharedMemoryManager.cs (GetStringAsync/PutStringAsync).
        """
        content_bytes = self.get_bytes(mem_map_name, offset, count)
        if content_bytes is None:
            return None
        content_str = content_bytes.decode('utf-8')
        return content_str

    def free_mem_map(self, mem_map_name: str,
                     to_delete_backing_resources: bool = True) -> bool:
        """
        Frees the memory map and, if specified, any backing resources (e.g.
        file in the case of Unix) associated with it.
        If there is no memory map with the given name being tracked, then no
        action is performed.
        Returns True if the memory map was freed successfully, False otherwise.
        """
        if mem_map_name not in self.allocated_mem_maps:
            logger.error(
                'Cannot find memory map in list of allocations %s',
                mem_map_name)
            return False
        shared_mem_map = self.allocated_mem_maps[mem_map_name]
        success = shared_mem_map.dispose(to_delete_backing_resources)
        del self.allocated_mem_maps[mem_map_name]
        return success

    def _create(self, mem_map_name: str, content_length: int) \
            -> Optional[SharedMemoryMap]:
        """
        Creates a new SharedMemoryMap with the given name and content length.
        Returns the SharedMemoryMap object if successful, None otherwise.
        """
        mem_map_size = consts.CONTENT_HEADER_TOTAL_BYTES + content_length
        mem_map = self.file_accessor.create_mem_map(mem_map_name, mem_map_size)
        if mem_map is None:
            return None
        return SharedMemoryMap(self.file_accessor, mem_map_name, mem_map)

    def _open(self, mem_map_name: str, content_length: int) \
            -> Optional[SharedMemoryMap]:
        """
        Opens an existing SharedMemoryMap with the given name and content
        length.
        Returns the SharedMemoryMap object if successful, None otherwise.
        """
        mem_map_size = consts.CONTENT_HEADER_TOTAL_BYTES + content_length
        mem_map = self.file_accessor.open_mem_map(mem_map_name, mem_map_size)
        if mem_map is None:
            return None
        return SharedMemoryMap(self.file_accessor, mem_map_name, mem_map)
