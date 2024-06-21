# Imported from https://github.com/ilevkivskyi/typing_inspect/blob/168fa6f7c5c55f720ce6282727211cf4cf6368f6/typing_inspect.py  # NoQA E501
# Author: Ivan Levkivskyi
# License: MIT

"""Defines experimental API for runtime inspection of types defined
in the standard "typing" module.

Example usage::
    from typing_inspect import is_generic_type
"""

# NOTE: This module must support Python 2.7 in addition to Python 3.x

import sys
import collections.abc
from typing import (
    Generic, Callable, Union, TypeVar, ClassVar, Tuple, _GenericAlias
)

NEW_39_TYPING = sys.version_info[:3] >= (3, 9, 0)  # PEP 560
if NEW_39_TYPING:
    from typing import _SpecialGenericAlias


# from mypy_extensions import _TypedDictMeta

def is_generic_type(tp):
    """Test if the given type is a generic type. This includes Generic itself,
     but excludes special typing constructs such as Union, Tuple, Callable,
     ClassVar.
    Examples::

        is_generic_type(int) == False
        is_generic_type(Union[int, str]) == False
        is_generic_type(Union[int, T]) == False
        is_generic_type(ClassVar[List[int]]) == False
        is_generic_type(Callable[..., T]) == False
        is_generic_type(Generic) == True
        is_generic_type(Generic[T]) == True
        is_generic_type(Iterable[int]) == True
        is_generic_type(Mapping) == True
        is_generic_type(MutableMapping[T, List[int]]) == True
        is_generic_type(Sequence[Union[str, bytes]]) == True
    """
    if NEW_39_TYPING:
        return (isinstance(tp, type) and issubclass(tp, Generic)
                or ((isinstance(tp, _GenericAlias) or isinstance(tp, _SpecialGenericAlias))  # NoQA E501
                and tp.__origin__ not in (Union, tuple, ClassVar, collections.abc.Callable)))  # NoQA E501
    return (isinstance(tp, type)
            and issubclass(tp, Generic)
            or isinstance(tp, _GenericAlias)
            and tp.__origin__ not in (Union, tuple, ClassVar, collections.abc.Callable))  # NoQA E501


def is_callable_type(tp):
    """Test if the type is a generic callable type, including subclasses
    excluding non-generic types and callables.
    Examples::

        is_callable_type(int) == False
        is_callable_type(type) == False
        is_callable_type(Callable) == True
        is_callable_type(Callable[..., int]) == True
        is_callable_type(Callable[[int, int], Iterable[str]]) == True
        class MyClass(Callable[[int], int]):
            ...
        is_callable_type(MyClass) == True

    For more general tests use callable(), for more precise test
    (excluding subclasses) use::

        get_origin(tp) is collections.abc.Callable  # Callable prior to Python 3.7  # NoQA E501
    """
    return (tp is Callable or isinstance(tp, _GenericAlias) and
            tp.__origin__ is collections.abc.Callable or
            isinstance(tp, type) and issubclass(tp, Generic) and
            issubclass(tp, collections.abc.Callable))


def is_tuple_type(tp):
    """Test if the type is a generic tuple type, including subclasses excluding
    non-generic classes.
    Examples::

        is_tuple_type(int) == False
        is_tuple_type(tuple) == False
        is_tuple_type(Tuple) == True
        is_tuple_type(Tuple[str, int]) == True
        class MyClass(Tuple[str, int]):
            ...
        is_tuple_type(MyClass) == True

    For more general tests use issubclass(..., tuple), for more precise test
    (excluding subclasses) use::

        get_origin(tp) is tuple  # Tuple prior to Python 3.7
    """
    return (tp is Tuple or isinstance(tp, _GenericAlias) and
            tp.__origin__ is tuple or
            isinstance(tp, type) and issubclass(tp, Generic) and
            issubclass(tp, tuple))


def is_union_type(tp):
    """Test if the type is a union type. Examples::

        is_union_type(int) == False
        is_union_type(Union) == True
        is_union_type(Union[int, int]) == False
        is_union_type(Union[T, int]) == True
    """
    return (tp is Union or
            isinstance(tp, _GenericAlias) and tp.__origin__ is Union)


def is_typevar(tp):
    """Test if the type represents a type variable. Examples::

        is_typevar(int) == False
        is_typevar(T) == True
        is_typevar(Union[T, int]) == False
    """

    return type(tp) is TypeVar


def is_classvar(tp):
    """Test if the type represents a class variable. Examples::

        is_classvar(int) == False
        is_classvar(ClassVar) == True
        is_classvar(ClassVar[int]) == True
        is_classvar(ClassVar[List[T]]) == True
    """
    return (tp is ClassVar or
            isinstance(tp, _GenericAlias) and tp.__origin__ is ClassVar)


def get_last_origin(tp):
    """Get the last base of (multiply) subscripted type. Supports generic types,
    Union, Callable, and Tuple. Returns None for unsupported types.
    Examples::

        get_last_origin(int) == None
        get_last_origin(ClassVar[int]) == None
        get_last_origin(Generic[T]) == Generic
        get_last_origin(Union[T, int][str]) == Union[T, int]
        get_last_origin(List[Tuple[T, T]][int]) == List[Tuple[T, T]]
        get_last_origin(List) == List
    """
    raise ValueError('This function is only supported in Python 3.6,'
                     ' use get_origin instead')


def get_origin(tp):
    """Get the unsubscripted version of a type. Supports generic types, Union,
    Callable, and Tuple. Returns None for unsupported types. Examples::

        get_origin(int) == None
        get_origin(ClassVar[int]) == None
        get_origin(Generic) == Generic
        get_origin(Generic[T]) == Generic
        get_origin(Union[T, int]) == Union
        get_origin(List[Tuple[T, T]][int]) == list  # List prior to Python 3.7
    """
    if isinstance(tp, _GenericAlias):
        return tp.__origin__ if tp.__origin__ is not ClassVar else None
    if tp is Generic:
        return Generic
    return None


def get_parameters(tp):
    """Return type parameters of a parameterizable type as a tuple
    in lexicographic order. Parameterizable types are generic types,
    unions, tuple types and callable types. Examples::

        get_parameters(int) == ()
        get_parameters(Generic) == ()
        get_parameters(Union) == ()
        get_parameters(List[int]) == ()

        get_parameters(Generic[T]) == (T,)
        get_parameters(Tuple[List[T], List[S_co]]) == (T, S_co)
        get_parameters(Union[S_co, Tuple[T, T]][int, U]) == (U,)
        get_parameters(Mapping[T, Tuple[S_co, T]]) == (T, S_co)
    """
    if (isinstance(tp, _GenericAlias) or isinstance(tp, type) and
        issubclass(tp, Generic) and tp is not Generic):   # NoQA E129
        return tp.__parameters__
    return ()


def get_last_args(tp):
    """Get last arguments of (multiply) subscripted type.
       Parameters for Callable are flattened. Examples::

        get_last_args(int) == ()
        get_last_args(Union) == ()
        get_last_args(ClassVar[int]) == (int,)
        get_last_args(Union[T, int]) == (T, int)
        get_last_args(Iterable[Tuple[T, S]][int, T]) == (int, T)
        get_last_args(Callable[[T], int]) == (T, int)
        get_last_args(Callable[[], int]) == (int,)
    """
    raise ValueError('This function is only supported in Python 3.6,'
                     ' use get_args instead')


def _eval_args(args):
    """Internal helper for get_args."""
    res = []
    for arg in args:
        if not isinstance(arg, tuple):
            res.append(arg)
        elif is_callable_type(arg[0]):
            if len(arg) == 2:
                res.append(Callable[[], arg[1]])
            elif arg[1] is Ellipsis:
                res.append(Callable[..., arg[2]])
            else:
                res.append(Callable[list(arg[1:-1]), arg[-1]])
        else:
            res.append(type(arg[0]).__getitem__(arg[0], _eval_args(arg[1:])))
    return tuple(res)


def get_args(tp, evaluate=None):
    """Get type arguments with all substitutions performed. For unions,
    basic simplifications used by Union constructor are performed.
    On versions prior to 3.7 if `evaluate` is False (default),
    report result as nested tuple, this matches
    the internal representation of types. If `evaluate` is True
    (or if Python version is 3.7 or greater), then all
    type parameters are applied (this could be time and memory expensive).
    Examples::

        get_args(int) == ()
        get_args(Union[int, Union[T, int], str][int]) == (int, str)
        get_args(Union[int, Tuple[T, int]][str]) == (int, (Tuple, str, int))

        get_args(Union[int, Tuple[T, int]][str], evaluate=True) == \
                 (int, Tuple[str, int])
        get_args(Dict[int, Tuple[T, T]][Optional[int]], evaluate=True) == \
                 (int, Tuple[Optional[int], Optional[int]])
        get_args(Callable[[], T][int], evaluate=True) == ([], int,)
    """
    if evaluate is not None and not evaluate:
        raise ValueError('evaluate can only be True in Python 3.7')
    if isinstance(tp, _GenericAlias):
        res = tp.__args__
        if get_origin(tp) is collections.abc.Callable and res[0] is not Ellipsis:    # NoQA E501
            res = (list(res[:-1]), res[-1])
        return res
    return ()


def get_generic_type(obj):
    """Get the generic type of an object if possible, or runtime class
    otherwise.
    Examples::

        class Node(Generic[T]):
            ...
        type(Node[int]()) == Node
        get_generic_type(Node[int]()) == Node[int]
        get_generic_type(Node[T]()) == Node[T]
        get_generic_type(1) == int
    """

    gen_type = getattr(obj, '__orig_class__', None)
    return gen_type if gen_type is not None else type(obj)


def get_generic_bases(tp):
    """Get generic base types of a type or empty tuple if not possible.
    Example::

        class MyClass(List[int], Mapping[str, List[int]]):
            ...
        MyClass.__bases__ == (List, Mapping)
        get_generic_bases(MyClass) == (List[int], Mapping[str, List[int]])
    """

    return getattr(tp, '__orig_bases__', ())


def typed_dict_keys(td):
    """If td is a TypedDict class, return a dictionary mapping the typed keys
    to types. Otherwise, return None. Examples::

        class TD(TypedDict):
            x: int
            y: int
        class Other(dict):
            x: int
            y: int

        typed_dict_keys(TD) == {'x': int, 'y': int}
        typed_dict_keys(dict) == None
        typed_dict_keys(Other) == None
    """
    if isinstance(td, _TypedDictMeta):  # NoQA F821
        return td.__annotations__.copy()
    return None
