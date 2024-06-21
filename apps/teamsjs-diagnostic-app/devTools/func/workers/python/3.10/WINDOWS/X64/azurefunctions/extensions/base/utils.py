# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import inspect
import json
import re
from abc import ABC
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from . import meta

SNAKE_CASE_RE = re.compile(r"^([a-zA-Z]+\d*_|_+[a-zA-Z\d])\w*$")
WORD_RE = re.compile(r"^([a-zA-Z]+\d*)$")


class StringifyEnum(Enum):
    """This class output name of enum object when printed as string."""

    def __str__(self):
        return str(self.name)


class StringifyEnumJsonEncoder(json.JSONEncoder):
    def default(self, o):
        return str(o)


class BuildDictMeta(type):
    def __new__(mcs, name, bases, dct):
        """BuildDictMeta will apply to every binding.
        It will apply :meth:`add_to_dict` decorator to :meth:`__init__` of
        every binding class to collect list of params to include in building
        json dictionary which corresponds to function.json in legacy app.
        It will also apply :meth:`skip_none` to :meth:`get_dict_repr` to
        enable json dictionary generated for every binding has non-empty
        value fields. It is needed for enabling binding param optionality.
        """
        cls = super().__new__(mcs, name, bases, dct)
        setattr(cls, "__init__", cls.add_to_dict(getattr(cls, "__init__")))
        setattr(cls, "get_dict_repr", cls.skip_none(getattr(cls, "get_dict_repr")))
        return cls

    @staticmethod
    def skip_none(func):
        def wrapper(*args, **kw):
            res = func(*args, **kw)
            return BuildDictMeta.clean_nones(res)

        return wrapper

    @staticmethod
    def add_to_dict(func: Callable[..., Any]):
        def wrapper(*args, **kwargs):
            if args is None or len(args) == 0:
                raise ValueError(
                    f"{func.__name__} has no args. Please ensure func is an "
                    f"object method."
                )

            func(*args, **kwargs)

            self = args[0]

            init_params = list(inspect.signature(func).parameters.keys())
            init_params.extend(list(kwargs.keys()))
            for key in kwargs.keys():
                if not hasattr(self, key):
                    setattr(self, key, kwargs[key])

            setattr(self, "init_params", init_params)

        return wrapper

    @staticmethod
    def clean_nones(value):
        """
        Recursively remove all None values from dictionaries and lists,
        and returns
        the result as a new dictionary or list.
        """
        if isinstance(value, list):
            return [BuildDictMeta.clean_nones(x) for x in value if x is not None]
        elif isinstance(value, dict):
            return {
                key: BuildDictMeta.clean_nones(val)
                for key, val in value.items()
                if val is not None
            }
        else:
            return value


# Enums
class BindingDirection(StringifyEnum):
    """Direction of the binding used in function.json"""

    IN = 0
    """Input binding direction."""
    OUT = 1
    """Output binding direction."""
    INOUT = 2
    """Some bindings support a special binding direction. """


class DataType(StringifyEnum):
    """Data type of the binding used in function.json"""

    """Parse binding argument as undefined."""
    UNDEFINED = 0
    """Parse binding argument as string."""
    STRING = 1
    """Parse binding argument as binary."""
    BINARY = 2
    """Parse binding argument as stream."""
    STREAM = 3


class Binding(ABC):
    """Abstract binding class which captures common attributes and
    functions. :meth:`get_dict_repr` can auto generate the function.json for
    every binding, the only restriction is ***ENSURE*** __init__ parameter
    names of any binding class are snake case form of corresponding
    attribute in function.json when new binding classes are created.
    Ref: https://aka.ms/azure-function-binding-http"""

    EXCLUDED_INIT_PARAMS = {"self", "kwargs", "type", "data_type", "direction"}

    @staticmethod
    def get_binding_name() -> str:
        pass

    def __init__(
        self,
        name: str,
        direction: BindingDirection,
        data_type: Optional[DataType] = None,
        type: Optional[str] = None,
    ):  # NoQa
        # For natively supported bindings, get_binding_name is always
        # implemented, and for generic bindings, type is a required argument
        # in decorator functions.
        self.type = (
            self.get_binding_name() if self.get_binding_name() is not None else type
        )
        self.name = name
        self._direction = direction
        self._data_type = data_type
        self._dict = {
            "direction": self._direction,
            "dataType": self._data_type,
            "type": self.type,
        }

    @property
    def data_type(self) -> Optional[int]:
        return self._data_type.value if self._data_type else None

    @property
    def direction(self) -> int:
        return self._direction.value

    def get_dict_repr(binding, input_types):
        """Build a dictionary of a particular binding. The keys are camel
        cased binding field names defined in `init_params` list and
        :class:`Binding` class. \n
        This method is invoked in function :meth:`get_raw_bindings` of class
        :class:`Function` to generate json dict for each binding.

        :return: Dictionary representation of the binding. Dict representation
        of the binding in the format:
        ((binding type, pytype), deferred bindings enabled)
        """
        params = list(dict.fromkeys(getattr(binding, "init_params", [])))
        binding_info = {}
        for p in params:
            if p not in Binding.EXCLUDED_INIT_PARAMS:
                binding._dict[to_camel_case(p)] = getattr(binding, p, None)

        if input_types.get(binding.name) is not None:
            pytype = input_types.get(binding.name).pytype
        else:
            pytype = None
        # Adding flag to signal to the host to send MBD object
        # 1. check if the binding is a supported type (blob, blobTrigger)
        # 2. check if the binding is an input binding
        # 3. check if the defined type is an SdkType
        if (
            binding.type in meta._ConverterMeta._bindings
            and binding.direction == 0
            and meta._ConverterMeta.check_supported_type(pytype)
        ):
            binding._dict["properties"] = {"SupportsDeferredBinding": True}
            binding_info = {binding.name: {pytype: "True"}}
        # if it isn't, we set the flag to false
        else:
            binding._dict["properties"] = {"SupportsDeferredBinding": False}
            binding_info = {binding.name: {pytype: "False"}}

        return binding._dict, binding_info


def to_camel_case(snake_case_str: str):
    if snake_case_str is None or len(snake_case_str) == 0:
        raise ValueError(f"Please ensure arg name {snake_case_str} is not empty!")

    if not is_snake_case(snake_case_str) and not is_word(snake_case_str):
        raise ValueError(
            f"Please ensure {snake_case_str} is a word or snake case "
            f"string with underscore as separator."
        )
    words = snake_case_str.split("_")
    return words[0] + "".join([ele.title() for ele in words[1:]])


def is_snake_case(input_string: str) -> bool:
    """
    Checks if a string is formatted as "snake case".
    A string is considered snake case when:
    - it's composed only by lowercase/uppercase letters and digits
    - it contains at least one underscore
    - it does not start with a number
    *Examples:*
    >>> is_snake_case('foo_bar_baz') # returns true
    >>> is_snake_case('foo') # returns false
    :param input_string: String to test.
    :return: True for a snake case string, false otherwise.
    """
    return SNAKE_CASE_RE.match(input_string) is not None


def is_word(input_string: str) -> bool:
    """
    Checks if a string is one word.
    A string is considered one word when:
    - it's composed only by lowercase/uppercase letters and digits
    - it does not start with a number
    *Examples:*
    >>> is_word('1foo') # returns false
    >>> is_word('foo_') # returns false
    >>> is_word('foo') # returns true
    :param input_string: String to test.
    :return: True for one word string, false otherwise.
    """
    return WORD_RE.match(input_string) is not None


def get_raw_bindings(indexed_function, input_types):
    binding_dict_repr = []
    bindings_logs = {}
    for b in indexed_function._bindings:
        dict_repr, logs = Binding.get_dict_repr(b, input_types)
        binding_dict_repr.append(json.dumps(dict_repr, cls=StringifyEnumJsonEncoder))
        bindings_logs.update(logs)
    return binding_dict_repr, bindings_logs
