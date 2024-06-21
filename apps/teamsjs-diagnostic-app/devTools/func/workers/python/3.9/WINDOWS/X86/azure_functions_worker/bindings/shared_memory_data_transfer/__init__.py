# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

"""
This module provides functionality for accessing shared memory maps.
These are used for transferring data between functions host and the worker
proces.
The initial set of corresponding changes to enable shared memory maps in the
functions host can be found in the following Pull Request:
https://github.com/Azure/azure-functions-host/pull/6836
The issue tracking shared memory transfer related changes is:
https://github.com/Azure/azure-functions-host/issues/6791
"""

from .file_accessor_factory import FileAccessorFactory
from .file_accessor import FileAccessor
from .shared_memory_constants import SharedMemoryConstants
from .shared_memory_exception import SharedMemoryException
from .shared_memory_map import SharedMemoryMap
from .shared_memory_manager import SharedMemoryManager

__all__ = (
    'FileAccessorFactory', 'FileAccessor', 'SharedMemoryConstants',
    'SharedMemoryException', 'SharedMemoryMap', 'SharedMemoryManager'
)
