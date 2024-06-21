# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.


class Out:

    def __init__(self) -> None:
        self.__value = None

    def set(self, val):
        self.__value = val

    def get(self) -> str:
        return self.__value
