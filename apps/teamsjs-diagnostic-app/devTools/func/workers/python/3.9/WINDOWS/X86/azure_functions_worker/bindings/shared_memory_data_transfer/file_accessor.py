# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import mmap
from abc import ABCMeta, abstractmethod
from typing import Optional
from .shared_memory_constants import SharedMemoryConstants as consts


class FileAccessor(metaclass=ABCMeta):
    """
    For accessing memory maps.
    This is an interface that must be implemented by sub-classes to provide
    platform-specific support for accessing memory maps.
    Currently the following two sub-classes are implemented:
        1) FileAccessorWindows
        2) FileAccessorUnix
    Note: Platform specific details of mmap can be found in the official docs:
          https://docs.python.org/3/library/mmap.html
    """
    @abstractmethod
    def open_mem_map(
            self,
            mem_map_name: str,
            mem_map_size: int,
            access: int = mmap.ACCESS_READ) -> Optional[mmap.mmap]:
        """
        Opens an existing memory map.
        Returns the opened mmap if successful, None otherwise.
        """
        raise NotImplementedError

    @abstractmethod
    def create_mem_map(self, mem_map_name: str, mem_map_size: int) \
            -> Optional[mmap.mmap]:
        """
        Creates a new memory map.
        Returns the created mmap if successful, None otherwise.
        """
        raise NotImplementedError

    @abstractmethod
    def delete_mem_map(self, mem_map_name: str, mem_map: mmap.mmap) -> bool:
        """
        Deletes the memory map and any backing resources associated with it.
        If there is no memory map with the given name, then no action is
        performed.
        Returns True if the memory map was successfully deleted, False
        otherwise.
        """
        raise NotImplementedError

    def _is_mem_map_initialized(self, mem_map: mmap.mmap) -> bool:
        """
        Checks if the dirty bit of the memory map has been set or not.
        This is used to check if a new memory map was created successfully and
        we don't end up using an existing one.
        """
        original_pos = mem_map.tell()
        # The dirty bit is the first byte of the header so seek to the beginning
        mem_map.seek(0)
        # Read the first byte
        byte_read = mem_map.read(1)
        # Check if the dirty bit was set or not
        if byte_read == consts.HeaderFlags.Initialized:
            is_set = True
        else:
            is_set = False
        # Seek back the memory map to the original position
        mem_map.seek(original_pos)
        return is_set

    def _set_mem_map_initialized(self, mem_map: mmap.mmap):
        """
        Sets the dirty bit in the header of the memory map to indicate that this
        memory map is not new anymore.
        """
        original_pos = mem_map.tell()
        # The dirty bit is the first byte of the header so seek to the beginning
        mem_map.seek(0)
        # Set the dirty bit
        mem_map.write(consts.HeaderFlags.Initialized)
        # Seek back the memory map to the original position
        mem_map.seek(original_pos)


class DummyFileAccessor(FileAccessor):
    def open_mem_map(self, mem_map_name: str, mem_map_size: int,
                     access: int = mmap.ACCESS_READ) -> Optional[mmap.mmap]:
        pass

    def create_mem_map(self, mem_map_name: str,
                       mem_map_size: int) -> Optional[mmap.mmap]:
        pass

    def delete_mem_map(self, mem_map_name: str, mem_map: mmap.mmap) -> bool:
        pass
