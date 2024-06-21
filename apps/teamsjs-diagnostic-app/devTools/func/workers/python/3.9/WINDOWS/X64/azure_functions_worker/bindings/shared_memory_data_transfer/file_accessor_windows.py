# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import mmap
from typing import Optional
from .shared_memory_exception import SharedMemoryException
from .file_accessor import FileAccessor
from ...logging import logger


class FileAccessorWindows(FileAccessor):
    """
    For accessing memory maps.
    This implements the FileAccessor interface for Windows.
    """
    def open_mem_map(
            self,
            mem_map_name: str,
            mem_map_size: int,
            access: int = mmap.ACCESS_READ) -> Optional[mmap.mmap]:
        """
        Note: mem_map_size = 0 means open the entire mmap.
        Note: On Windows, an mmap is created if one does not exist even when
              attempting to open it.
        """
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot open memory map. Invalid name {mem_map_name}')
        if mem_map_size < 0:
            raise SharedMemoryException(
                f'Cannot open memory map. Invalid size {mem_map_size}')
        try:
            mem_map = mmap.mmap(-1, mem_map_size, mem_map_name, access=access)
            return mem_map
        except Exception as e:
            logger.warning(
                'Cannot open memory map %s with size %s - %s', mem_map_name,
                mem_map_size, e)
            return None

    def create_mem_map(self, mem_map_name: str, mem_map_size: int) \
            -> Optional[mmap.mmap]:
        # Windows also creates the mmap when trying to open it, if it does not
        # already exist.
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot create memory map. Invalid name {mem_map_name}')
        if mem_map_size <= 0:
            raise SharedMemoryException(
                f'Cannot create memory map. Invalid size {mem_map_size}')
        mem_map = self.open_mem_map(mem_map_name, mem_map_size,
                                    mmap.ACCESS_WRITE)
        if mem_map is None:
            return None
        if self._is_mem_map_initialized(mem_map):
            raise SharedMemoryException(
                f'Cannot create memory map {mem_map_name} as it '
                f'already exists')
        self._set_mem_map_initialized(mem_map)
        return mem_map

    def delete_mem_map(self, mem_map_name: str, mem_map: mmap.mmap) -> bool:
        """
        In Windows, an mmap is not backed by a file so no file needs to be
        deleted.
        """
        mem_map.close()
        return True
