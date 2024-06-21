# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
import inspect
import operator
import pathlib
import typing
import uuid

from .constants import HTTP_TRIGGER
from . import bindings as bindings_utils
from . import protos
from ._thirdparty import typing_inspect
from .protos import BindingInfo


class ParamTypeInfo(typing.NamedTuple):
    binding_name: str
    pytype: typing.Optional[type]
    deferred_bindings_enabled: typing.Optional[bool] = False


class FunctionInfo(typing.NamedTuple):
    func: typing.Callable

    name: str
    directory: str
    function_id: str
    requires_context: bool
    is_async: bool
    has_return: bool
    is_http_func: bool
    deferred_bindings_enabled: bool

    input_types: typing.Mapping[str, ParamTypeInfo]
    output_types: typing.Mapping[str, ParamTypeInfo]
    return_type: typing.Optional[ParamTypeInfo]

    trigger_metadata: typing.Optional[typing.Dict[str, typing.Any]]


class FunctionLoadError(RuntimeError):

    def __init__(self, function_name: str, msg: str) -> None:
        super().__init__(
            f'cannot load the {function_name} function: {msg}')


class Registry:
    _functions: typing.MutableMapping[str, FunctionInfo]
    _deferred_bindings_enabled: bool = False

    def __init__(self) -> None:
        self._functions = {}

    def get_function(self, function_id: str) -> FunctionInfo:
        if function_id in self._functions:
            return self._functions[function_id]

        return None

    def deferred_bindings_enabled(self) -> bool:
        return self._deferred_bindings_enabled

    @staticmethod
    def get_explicit_and_implicit_return(binding_name: str,
                                         binding: BindingInfo,
                                         explicit_return: bool,
                                         implicit_return: bool,
                                         bound_params: dict) -> \
            typing.Tuple[bool, bool]:
        if binding_name == '$return':
            explicit_return = True
        elif bindings_utils.has_implicit_output(
                binding.type):
            implicit_return = True
            bound_params[binding_name] = binding
        else:
            bound_params[binding_name] = binding
        return explicit_return, implicit_return

    @staticmethod
    def get_return_binding(binding_name: str,
                           binding_type: str,
                           return_binding_name: str,
                           explicit_return_val_set: bool) \
            -> typing.Tuple[str, bool]:
        # prioritize explicit return value
        if explicit_return_val_set:
            return return_binding_name, explicit_return_val_set
        if binding_name == "$return":
            return_binding_name = binding_type
            assert return_binding_name is not None
            explicit_return_val_set = True
        elif bindings_utils.has_implicit_output(binding_type):
            return_binding_name = binding_type

        return return_binding_name, explicit_return_val_set

    @staticmethod
    def validate_binding_direction(binding_name: str,
                                   binding_direction: str,
                                   func_name: str):
        if binding_direction == protos.BindingInfo.inout:
            raise FunctionLoadError(
                func_name,
                '"inout" bindings are not supported')

        if binding_name == '$return' and \
                binding_direction != protos.BindingInfo.out:
            raise FunctionLoadError(
                func_name,
                '"$return" binding must have direction set to "out"')

    @staticmethod
    def is_context_required(params, bound_params: dict,
                            annotations: dict,
                            func_name: str) -> bool:
        requires_context = False
        if 'context' in params and 'context' not in bound_params:
            requires_context = True
            params.pop('context')
            if 'context' in annotations:
                ctx_anno = annotations.get('context')
                if (not isinstance(ctx_anno, type)
                        or ctx_anno.__name__ != 'Context'):
                    raise FunctionLoadError(
                        func_name,
                        'the "context" parameter is expected to be of '
                        'type azure.functions.Context, got '
                        f'{ctx_anno!r}')
        return requires_context

    @staticmethod
    def validate_function_params(params: dict, bound_params: dict,
                                 annotations: dict, func_name: str):
        if set(params) - set(bound_params):
            raise FunctionLoadError(
                func_name,
                'the following parameters are declared in Python but '
                f'not in function.json: {set(params) - set(bound_params)!r}')

        if set(bound_params) - set(params):
            raise FunctionLoadError(
                func_name,
                f'the following parameters are declared in function.json but '
                f'not in Python: {set(bound_params) - set(params)!r}')

        input_types: typing.Dict[str, ParamTypeInfo] = {}
        output_types: typing.Dict[str, ParamTypeInfo] = {}
        fx_deferred_bindings_enabled = False

        for param in params.values():
            binding = bound_params[param.name]

            param_has_anno = param.name in annotations
            param_anno = annotations.get(param.name)

            # Check if deferred bindings is enabled
            fx_deferred_bindings_enabled, is_deferred_binding = (
                bindings_utils.check_deferred_bindings_enabled(
                    param_anno,
                    fx_deferred_bindings_enabled))

            if param_has_anno:
                if typing_inspect.is_generic_type(param_anno):
                    param_anno_origin = typing_inspect.get_origin(param_anno)
                    if param_anno_origin is not None:
                        is_param_out = (
                            isinstance(param_anno_origin, type)
                            and param_anno_origin.__name__ == 'Out'
                        )
                    else:
                        is_param_out = (
                            isinstance(param_anno, type)
                            and param_anno.__name__ == 'Out'
                        )
                else:
                    is_param_out = (
                        isinstance(param_anno, type)
                        and param_anno.__name__ == 'Out'
                    )
            else:
                is_param_out = False

            is_binding_out = binding.direction == protos.BindingInfo.out

            if is_param_out:
                param_anno_args = typing_inspect.get_args(param_anno)
                if len(param_anno_args) != 1:
                    raise FunctionLoadError(
                        func_name,
                        f'binding {param.name} has invalid Out annotation '
                        f'{param_anno!r}')
                param_py_type = param_anno_args[0]

                # typing_inspect.get_args() returns a flat list,
                # so if the annotation was func.Out[typing.List[foo]],
                # we need to reconstruct it.
                if (isinstance(param_py_type, tuple)
                        and typing_inspect.is_generic_type(param_py_type[0])):
                    param_py_type = operator.getitem(
                        param_py_type[0], *param_py_type[1:])
            else:
                param_py_type = param_anno

            if (param_has_anno and not isinstance(param_py_type, type)
                    and not typing_inspect.is_generic_type(param_py_type)):
                raise FunctionLoadError(
                    func_name,
                    f'binding {param.name} has invalid non-type annotation '
                    f'{param_anno!r}')

            if is_binding_out and param_has_anno and not is_param_out:
                raise FunctionLoadError(
                    func_name,
                    f'binding {param.name} is declared to have the "out" '
                    'direction, but its annotation in Python is not '
                    'a subclass of azure.functions.Out')

            if not is_binding_out and is_param_out:
                raise FunctionLoadError(
                    func_name,
                    f'binding {param.name} is declared to have the "in" '
                    'direction in function.json, but its annotation '
                    'is azure.functions.Out in Python')

            if param_has_anno and param_py_type in (str, bytes) and (
                    not bindings_utils.has_implicit_output(binding.type)):
                param_bind_type = 'generic'
            else:
                param_bind_type = binding.type

            if param_has_anno:
                if is_param_out:
                    checks_out = bindings_utils.check_output_type_annotation(
                        param_bind_type, param_py_type)
                else:
                    checks_out = bindings_utils.check_input_type_annotation(
                        param_bind_type, param_py_type, is_deferred_binding)

                if not checks_out:
                    if binding.data_type is not protos.BindingInfo.undefined:
                        raise FunctionLoadError(
                            func_name,
                            f'{param.name!r} binding type "{binding.type}" '
                            f'and dataType "{binding.data_type}" in '
                            f'function.json do not match the corresponding '
                            f'function parameter\'s Python type '
                            f'annotation "{param_py_type.__name__}"')
                    else:
                        raise FunctionLoadError(
                            func_name,
                            f'type of {param.name} binding in function.json '
                            f'"{binding.type}" does not match its Python '
                            f'annotation "{param_py_type.__name__}"')

            param_type_info = ParamTypeInfo(param_bind_type,
                                            param_py_type,
                                            is_deferred_binding)
            if is_binding_out:
                output_types[param.name] = param_type_info
            else:
                input_types[param.name] = param_type_info
        return input_types, output_types, fx_deferred_bindings_enabled

    @staticmethod
    def get_function_return_type(annotations: dict, has_explicit_return: bool,
                                 has_implicit_return: bool, binding_name: str,
                                 func_name: str):
        return_pytype = None
        if has_explicit_return and 'return' in annotations:
            return_anno = annotations.get('return')
            if typing_inspect.is_generic_type(
                    return_anno) and typing_inspect.get_origin(
                    return_anno).__name__ == 'Out':
                raise FunctionLoadError(
                    func_name,
                    'return annotation should not be azure.functions.Out')

            return_pytype = return_anno
            if not isinstance(return_pytype, type):
                raise FunctionLoadError(
                    func_name,
                    f'has invalid non-type return '
                    f'annotation {return_pytype!r}')

            if return_pytype is (str, bytes):
                binding_name = 'generic'

            if not bindings_utils.check_output_type_annotation(
                    binding_name, return_pytype):
                raise FunctionLoadError(
                    func_name,
                    f'Python return annotation "{return_pytype.__name__}" '
                    f'does not match binding type "{binding_name}"')

        if has_implicit_return and 'return' in annotations:
            return_pytype = annotations.get('return')

        return_type = None
        if has_explicit_return or has_implicit_return:
            return_type = ParamTypeInfo(binding_name, return_pytype)

        return return_type

    def add_func_to_registry_and_return_funcinfo(
            self, function,
            function_name: str,
            function_id: str,
            directory: str,
            requires_context: bool,
            has_explicit_return: bool,
            has_implicit_return: bool,
            deferred_bindings_enabled: bool,
            input_types: typing.Dict[str, ParamTypeInfo],
            output_types: typing.Dict[str, ParamTypeInfo],
            return_type: str):

        http_trigger_param_name = self._get_http_trigger_param_name(input_types)

        trigger_metadata = None
        is_http_func = False
        if http_trigger_param_name is not None:
            trigger_metadata = {
                "type": HTTP_TRIGGER,
                "param_name": http_trigger_param_name
            }
            is_http_func = True

        function_info = FunctionInfo(
            func=function,
            name=function_name,
            directory=directory,
            function_id=function_id,
            requires_context=requires_context,
            is_async=inspect.iscoroutinefunction(function),
            has_return=has_explicit_return or has_implicit_return,
            is_http_func=is_http_func,
            deferred_bindings_enabled=deferred_bindings_enabled,
            input_types=input_types,
            output_types=output_types,
            return_type=return_type,
            trigger_metadata=trigger_metadata)

        self._functions[function_id] = function_info

        if not self._deferred_bindings_enabled:
            self._deferred_bindings_enabled = deferred_bindings_enabled

        return function_info

    def _get_http_trigger_param_name(self, input_types):
        http_trigger_param_name = next(
            (input_type for input_type, type_info in input_types.items()
             if type_info.binding_name == HTTP_TRIGGER),
            None
        )
        return http_trigger_param_name

    def add_function(self, function_id: str,
                     func: typing.Callable,
                     metadata: protos.RpcFunctionMetadata):
        func_name = metadata.name
        sig = inspect.signature(func)
        params = dict(sig.parameters)
        annotations = typing.get_type_hints(func)
        return_binding_name: typing.Optional[str] = None
        explicit_return_val_set = False
        has_explicit_return = False
        has_implicit_return = False

        bound_params = {}
        for binding_name, binding_info in metadata.bindings.items():
            self.validate_binding_direction(binding_name,
                                            binding_info.direction, func_name)

            has_explicit_return, has_implicit_return = \
                self.get_explicit_and_implicit_return(
                    binding_name, binding_info, has_explicit_return,
                    has_implicit_return, bound_params)

            return_binding_name, explicit_return_val_set = \
                self.get_return_binding(binding_name,
                                        binding_info.type,
                                        return_binding_name,
                                        explicit_return_val_set)

        requires_context = self.is_context_required(params, bound_params,
                                                    annotations,
                                                    func_name)

        input_types, output_types, _ = self.validate_function_params(
            params, bound_params, annotations, func_name)

        return_type = \
            self.get_function_return_type(annotations,
                                          has_explicit_return,
                                          has_implicit_return,
                                          return_binding_name,
                                          func_name)

        self.add_func_to_registry_and_return_funcinfo(func, func_name,
                                                      function_id,
                                                      metadata.directory,
                                                      requires_context,
                                                      has_explicit_return,
                                                      has_implicit_return,
                                                      _,
                                                      input_types,
                                                      output_types,
                                                      return_type)

    def add_indexed_function(self, function):
        func = function.get_user_function()
        func_name = function.get_function_name()
        function_id = str(uuid.uuid5(namespace=uuid.NAMESPACE_OID,
                                     name=func_name))
        return_binding_name: typing.Optional[str] = None
        explicit_return_val_set = False
        has_explicit_return = False
        has_implicit_return = False

        sig = inspect.signature(func)
        params = dict(sig.parameters)
        annotations = typing.get_type_hints(func)
        func_dir = str(pathlib.Path(inspect.getfile(func)).parent)

        bound_params = {}
        for binding in function.get_bindings():
            self.validate_binding_direction(binding.name,
                                            binding.direction,
                                            func_name)

            has_explicit_return, has_implicit_return = \
                self.get_explicit_and_implicit_return(
                    binding.name, binding, has_explicit_return,
                    has_implicit_return, bound_params)

            return_binding_name, explicit_return_val_set = \
                self.get_return_binding(binding.name,
                                        binding.type,
                                        return_binding_name,
                                        explicit_return_val_set)

        requires_context = self.is_context_required(params, bound_params,
                                                    annotations,
                                                    func_name)

        (input_types, output_types,
         deferred_bindings_enabled) = self.validate_function_params(
            params,
            bound_params,
            annotations,
            func_name)

        return_type = \
            self.get_function_return_type(annotations,
                                          has_explicit_return,
                                          has_implicit_return,
                                          return_binding_name,
                                          func_name)

        return \
            self.add_func_to_registry_and_return_funcinfo(
                func, func_name, function_id, func_dir,
                requires_context, has_explicit_return,
                has_implicit_return, deferred_bindings_enabled,
                input_types, output_types,
                return_type)
