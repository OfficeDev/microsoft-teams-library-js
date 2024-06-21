# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from azure_functions_worker import constants
import os
import mmap
from typing import Optional, List
from io import BufferedRandom
from .shared_memory_constants import SharedMemoryConstants as consts
from .shared_memory_exception import SharedMemoryException
from .file_accessor import FileAccessor
from ...utils.common import get_app_setting
from ...logging import logger


class FileAccessorUnix(FileAccessor):
    """
    For accessing memory maps.
    This implements the FileAccessor interface for Unix platforms.
    """
    def __init__(self):
        # From the list of configured directories where memory maps can be
        # stored, get the list of directories which are valid (either existed
        # already or have been created successfully for use).
        self.valid_dirs = self._get_valid_mem_map_dirs()

    def __del__(self):
        del self.valid_dirs

    def open_mem_map(
            self,
            mem_map_name: str,
            mem_map_size: int,
            access: int = mmap.ACCESS_READ) -> Optional[mmap.mmap]:
        """
        Note: mem_map_size = 0 means open the entire mmap.
        """
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot open memory map. Invalid name {mem_map_name}')
        if mem_map_size < 0:
            raise SharedMemoryException(
                f'Cannot open memory map. Invalid size {mem_map_size}')
        fd = self._open_mem_map_file(mem_map_name)
        if fd is None:
            logger.warning('Cannot open file: %s', mem_map_name)
            return None
        mem_map = mmap.mmap(fd.fileno(), mem_map_size, access=access)
        return mem_map

    def create_mem_map(self, mem_map_name: str, mem_map_size: int) \
            -> Optional[mmap.mmap]:
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot create memory map. Invalid name {mem_map_name}')
        if mem_map_size <= 0:
            raise SharedMemoryException(
                f'Cannot create memory map. Invalid size {mem_map_size}')
        file = self._create_mem_map_file(mem_map_name, mem_map_size)
        if file is None:
            logger.warning('Cannot create file: %s', mem_map_name)
            return None
        mem_map = mmap.mmap(file.fileno(), mem_map_size, mmap.MAP_SHARED,
                            mmap.PROT_WRITE)
        if self._is_mem_map_initialized(mem_map):
            raise SharedMemoryException(f'Memory map {mem_map_name} '
                                        'already exists')
        self._set_mem_map_initialized(mem_map)
        return mem_map

    def delete_mem_map(self, mem_map_name: str, mem_map: mmap.mmap) -> bool:
        if mem_map_name is None or mem_map_name == '':
            raise SharedMemoryException(
                f'Cannot delete memory map. Invalid name {mem_map_name}')
        try:
            fd = self._open_mem_map_file(mem_map_name)
            os.remove(fd.name)
        except Exception as e:
            # In this case, we don't want to fail right away but log that
            # deletion was unsuccessful.
            # These logs can help identify if we may be leaking memory and not
            # cleaning up the created memory maps.
            logger.error('Cannot delete memory map %s - %s', mem_map_name, e,
                         exc_info=True)
            return False
        mem_map.close()
        return True

    def _get_allowed_mem_map_dirs(self) -> List[str]:
        """
        Get the list of directories where memory maps can be created.
        If specified in AppSetting, that list will be used.
        Otherwise, the default value will be used.
        """
        setting = constants.UNIX_SHARED_MEMORY_DIRECTORIES
        allowed_mem_map_dirs_str = get_app_setting(setting)
        if allowed_mem_map_dirs_str is None:
            allowed_mem_map_dirs = consts.UNIX_TEMP_DIRS
            logger.info(
                'Using allowed directories for shared memory: %s from App '
                'Setting: %s',
                allowed_mem_map_dirs, setting)
        else:
            allowed_mem_map_dirs = allowed_mem_map_dirs_str.split(',')
            logger.info(
                'Using default allowed directories for shared memory: %s',
                allowed_mem_map_dirs)
        return allowed_mem_map_dirs

    def _get_valid_mem_map_dirs(self) -> List[str]:
        """
        From the configured list of allowed directories where memory maps can be
        stored, return all those that either already existed or were created
        successfully for use.
        Returns list of directories, in decreasing order of preference, where
        memory maps can be created.
        """
        allowed_dirs = self._get_allowed_mem_map_dirs()
        # Iterate over all the possible directories where the memory map could
        # be created and try to create each of them if they don't exist already.
        valid_dirs = []
        for temp_dir in allowed_dirs:
            dir_path = os.path.join(temp_dir, consts.UNIX_TEMP_DIR_SUFFIX)
            if os.path.exists(dir_path):
                # A valid directory already exists
                valid_dirs.append(dir_path)
                logger.debug('Found directory %s to store memory maps',
                             dir_path)
            else:
                try:
                    os.makedirs(dir_path)
                    valid_dirs.append(dir_path)
                except Exception as e:
                    # We keep trying to check/create others
                    logger.warning('Cannot create directory %s to '
                                   'store memory maps - %s', dir_path, e,
                                   exc_info=True)
        if len(valid_dirs) == 0:
            logger.error('No valid directory for memory maps in %s',
                         allowed_dirs)
        return valid_dirs

    def _open_mem_map_file(self, mem_map_name: str) -> Optional[BufferedRandom]:
        """
        Get the file descriptor of an existing memory map.
        Returns the BufferedRandom stream to the file.
        """
        # Iterate over all the possible directories where the memory map could
        # be present and try to open it.
        for temp_dir in self.valid_dirs:
            file_path = os.path.join(temp_dir, mem_map_name)
            if os.path.exists(file_path):
                try:
                    fd = open(file_path, 'r+b')
                    return fd
                except Exception as e:
                    logger.error('Cannot open file %s - %s', file_path, e,
                                 exc_info=True)
        # The memory map was not found in any of the known directories
        logger.error(
            'Cannot open memory map %s in any of the following directories: '
            '%s',
            mem_map_name, self.valid_dirs)
        return None

    def _create_mem_map_file(self, mem_map_name: str, mem_map_size: int) \
            -> Optional[BufferedRandom]:
        """
        Create the file descriptor for a new memory map.
        Returns the BufferedRandom stream to the file.
        """
        # Ensure that the file does not already exist
        for temp_dir in self.valid_dirs:
            file_path = os.path.join(temp_dir, mem_map_name)
            if os.path.exists(file_path):
                raise SharedMemoryException(
                    f'File {file_path} for memory map {mem_map_name} '
                    f'already exists')
        # Create the file
        for temp_dir in self.valid_dirs:
            file_path = os.path.join(temp_dir, mem_map_name)
            try:
                file = open(file_path, 'wb+')
                file.truncate(mem_map_size)
                return file
            except Exception as e:
                # If the memory map could not be created in this directory, we
                # keep trying in other applicable directories.
                logger.warning('Cannot create memory map in %s - %s.'
                               ' Trying other directories.', file_path, e,
                               exc_info=True)
        # Could not create the memory map in any of the applicable directory
        # paths so we fail.
        logger.error(
            'Cannot create memory map %s with size %s in any of the '
            'following directories: %s',
            mem_map_name, mem_map_size, self.valid_dirs)
        return None
