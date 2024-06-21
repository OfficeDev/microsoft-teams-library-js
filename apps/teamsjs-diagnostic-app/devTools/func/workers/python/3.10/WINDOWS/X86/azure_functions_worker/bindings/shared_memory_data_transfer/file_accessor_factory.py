# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import os
import sys

from .file_accessor import DummyFileAccessor
from .file_accessor_unix import FileAccessorUnix
from .file_accessor_windows import FileAccessorWindows
from ...constants import FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED
from ...utils.common import is_envvar_true


class FileAccessorFactory:
    """
    For creating the platform-appropriate instance of FileAccessor to perform
    memory map related operations.
    """
    @staticmethod
    def create_file_accessor():
        if sys.platform == "darwin" and not is_envvar_true(
                FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED):
            return DummyFileAccessor()
        elif os.name == 'nt':
            return FileAccessorWindows()
        return FileAccessorUnix()
