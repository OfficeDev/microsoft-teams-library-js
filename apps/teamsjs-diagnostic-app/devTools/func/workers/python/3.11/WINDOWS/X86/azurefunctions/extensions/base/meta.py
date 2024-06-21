# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import abc
import inspect
import json
from typing import Any, Dict, Mapping, Optional, Tuple, Union

from . import sdkType, utils


class Datum:
    def __init__(self, value: Any, type: Optional[str]):
        self.value: Any = value
        self.type: Optional[str] = type

    @property
    def python_value(self) -> Any:
        if self.value is None or self.type is None:
            return None
        elif self.type in ("bytes", "string", "int", "double"):
            return self.value
        elif self.type == "json":
            return json.loads(self.value)
        elif self.type == "collection_string":
            return [v for v in self.value.string]
        elif self.type == "collection_bytes":
            return [v for v in self.value.bytes]
        elif self.type == "collection_double":
            return [v for v in self.value.double]
        elif self.type == "collection_sint64":
            return [v for v in self.value.sint64]
        else:
            return self.value

    @property
    def python_type(self) -> type:
        return type(self.python_value)

    def __eq__(self, other):
        if not isinstance(other, type(self)):
            return False

        return self.value == other.value and self.type == other.type

    def __hash__(self):
        return hash((type(self), (self.value, self.type)))

    def __repr__(self):
        val_repr = repr(self.value)
        if len(val_repr) > 10:
            val_repr = val_repr[:10] + "..."
        return "<Datum {} {}>".format(self.type, val_repr)


class _ConverterMeta(abc.ABCMeta):

    _bindings: Dict[str, type] = {}

    def __new__(
        mcls, name, bases, dct, *, binding: Optional[str], trigger: Optional[str] = None
    ):
        cls = super().__new__(mcls, name, bases, dct)
        cls._trigger = trigger  # type: ignore
        if binding is None:
            return cls

        if binding in mcls._bindings:
            raise RuntimeError(
                f"cannot register a converter for {binding!r} binding: "
                f"another converter for this binding has already been "
                f"registered"
            )

        mcls._bindings[binding] = cls
        if trigger is not None:
            mcls._bindings[trigger] = cls

        return cls

    @classmethod
    def get(cls, binding_name):
        return cls._bindings.get(binding_name)

    @classmethod
    def get_raw_bindings(cls, indexed_function, input_types):
        return utils.get_raw_bindings(indexed_function, input_types)

    @classmethod
    def check_supported_type(cls, subclass: type) -> bool:
        if subclass is not None and inspect.isclass(subclass):
            return issubclass(subclass, sdkType.SdkType)
        return False

    def has_trigger_support(cls) -> bool:
        return cls._trigger is not None  # type: ignore


class _BaseConverter(metaclass=_ConverterMeta, binding=None):

    @classmethod
    def _decode_typed_data(
        cls,
        data: Datum,
        *,
        python_type: Union[type, Tuple[type, ...]],
        context: str = "data",
    ) -> Any:
        if data is None:
            return None

        data_type = data.type
        if data_type == "model_binding_data":
            result = data.value
        elif data_type is None:
            return None
        else:
            raise ValueError(f"unsupported type of {context}: {data_type}")

        if not isinstance(result, python_type):
            if isinstance(python_type, (tuple, list, dict)):
                raise ValueError(
                    f"unexpected value type in {context}: "
                    f"{type(result).__name__}, expected one of: "
                    f'{", ".join(t.__name__ for t in python_type)}'
                )
            else:
                try:
                    # Try coercing into the requested type
                    result = python_type(result)
                except (TypeError, ValueError) as e:
                    raise ValueError(
                        f"cannot convert value of {context} into "
                        f"{python_type.__name__}: {e}"
                    ) from None

        return result

    @classmethod
    def _decode_trigger_metadata_field(
        cls,
        trigger_metadata: Mapping[str, Datum],
        field: str,
        *,
        python_type: Union[type, Tuple[type, ...]],
    ) -> Any:
        data = trigger_metadata.get(field)
        if data is None:
            return None
        else:
            return cls._decode_typed_data(
                data,
                python_type=python_type,
                context=f"field {field!r} in trigger metadata",
            )


class InConverter(_BaseConverter, binding=None):

    @classmethod
    @abc.abstractmethod
    def check_input_type_annotation(cls, pytype: type) -> bool:
        pass

    @classmethod
    @abc.abstractmethod
    def decode(cls, data: Datum, *, trigger_metadata) -> Any:
        raise NotImplementedError

    @classmethod
    @abc.abstractmethod
    def has_implicit_output(cls) -> bool:
        return False


class OutConverter(_BaseConverter, binding=None):

    @classmethod
    @abc.abstractmethod
    def check_output_type_annotation(cls, pytype: type) -> bool:
        pass

    @classmethod
    @abc.abstractmethod
    def encode(cls, obj: Any, *, expected_type: Optional[type]) -> Optional[Datum]:
        raise NotImplementedError


def get_binding_registry():
    return _ConverterMeta
