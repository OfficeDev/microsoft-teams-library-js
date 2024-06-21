# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.


class RpcException:

    def __init__(self,
                 source: str,
                 stack_trace: str,
                 message: str) -> None:
        self.__source = source
        self.__stack_trace = stack_trace
        self.__message = message

    @property
    def source(self) -> str:
        return self.__source

    @property
    def stack_trace(self) -> str:
        return self.__stack_trace

    @property
    def message(self) -> str:
        return self.__message
