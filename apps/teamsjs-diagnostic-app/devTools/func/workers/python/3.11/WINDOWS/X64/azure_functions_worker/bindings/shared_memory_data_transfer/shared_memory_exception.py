# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.


class SharedMemoryException(Exception):
    """
    Exception raised when using shared memory.
    """
    def __init__(self, msg: str) -> None:
        super().__init__(msg)
