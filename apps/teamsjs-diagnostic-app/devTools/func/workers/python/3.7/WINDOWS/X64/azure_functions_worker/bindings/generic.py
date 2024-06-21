# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
import typing

from . import datumdef
from typing import Any, Optional


class GenericBinding:

    @classmethod
    def has_trigger_support(cls) -> bool:
        return False

    @classmethod
    def check_input_type_annotation(cls, pytype: type) -> bool:
        return issubclass(pytype, (str, bytes))

    @classmethod
    def check_output_type_annotation(cls, pytype: type) -> bool:
        return issubclass(pytype, (str, bytes, bytearray))

    @classmethod
    def encode(cls, obj: Any, *,
               expected_type: Optional[type]) -> datumdef.Datum:
        if isinstance(obj, str):
            return datumdef.Datum(type='string', value=obj)

        elif isinstance(obj, (bytes, bytearray)):
            return datumdef.Datum(type='bytes', value=bytes(obj))
        elif obj is None:
            return datumdef.Datum(type=None, value=obj)
        else:
            raise NotImplementedError

    @classmethod
    def decode(cls, data: datumdef.Datum, *, trigger_metadata) -> typing.Any:
        # Enabling support for Dapr bindings
        # https://github.com/Azure/azure-functions-python-worker/issues/1316
        if data is None:
            return None
        data_type = data.type

        if data_type == 'string':
            result = data.value
        elif data_type == 'bytes':
            result = data.value
        elif data_type == 'json':
            result = data.value
        elif data_type is None:
            result = None
        else:
            raise ValueError(
                f'unexpected type of data received for the "generic" binding '
                f': {data_type!r}'
            )

        return result

    @classmethod
    def has_implicit_output(cls, bind_name: Optional[str]) -> bool:
        if bind_name == 'durableClient':
            return False
        return True
