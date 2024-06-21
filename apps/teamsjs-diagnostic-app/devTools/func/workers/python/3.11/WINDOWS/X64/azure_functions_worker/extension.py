# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import functools
import logging
from types import ModuleType
from typing import Any, Callable, List, Optional

from .constants import (
    PYTHON_ISOLATE_WORKER_DEPENDENCIES,
    PYTHON_ENABLE_WORKER_EXTENSIONS,
    PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT,
    PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT_39
)
from .logging import logger, SYSTEM_LOG_PREFIX
from .utils.common import (
    is_python_version,
    get_sdk_from_sys_path,
    get_sdk_version
)
from .utils.wrappers import enable_feature_by

# Extension Hooks
FUNC_EXT_POST_FUNCTION_LOAD = "post_function_load"
FUNC_EXT_PRE_INVOCATION = "pre_invocation"
FUNC_EXT_POST_INVOCATION = "post_invocation"
APP_EXT_POST_FUNCTION_LOAD = "post_function_load_app_level"
APP_EXT_PRE_INVOCATION = "pre_invocation_app_level"
APP_EXT_POST_INVOCATION = "post_invocation_app_level"


class ExtensionManager:
    _is_sdk_detected: bool = False
    """This marks if the ExtensionManager has already proceeded a detection,
    if so, the sdk will be cached in ._extension_enabled_sdk
    """

    _extension_enabled_sdk: Optional[ModuleType] = None
    """This is a cache of azure.functions module that supports extension
    interfaces. If this is None, that mean the sdk does not support extension.
    """

    @classmethod
    @enable_feature_by(
        flag=PYTHON_ENABLE_WORKER_EXTENSIONS,
        flag_default=(
            PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT_39 if
            is_python_version('3.9') else
            PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT
        )
    )
    def function_load_extension(cls, func_name, func_directory):
        """Helper to execute function load extensions. If one of the extension
        fails in the extension chain, the rest of them will continue, emitting
        an error log of an exception trace for failed extension.

        Parameters
        ----------
        func_name: str
            The name of the trigger (e.g. HttpTrigger)
        func_directory: str
            The folder path of the trigger
            (e.g. /home/site/wwwroot/HttpTrigger).
        """
        sdk = cls._try_get_sdk_with_extension_enabled()
        if sdk is None:
            return

        # Reports application & function extensions installed on customer's app
        cls._info_discover_extension_list(func_name, sdk)

        # Get function hooks from azure.functions.extension.ExtensionMeta
        # The return type is FuncExtensionHooks
        funcs = sdk.ExtensionMeta.get_function_hooks(func_name)

        # Invoke function hooks
        cls._safe_execute_function_load_hooks(
            funcs, FUNC_EXT_POST_FUNCTION_LOAD, func_name, func_directory
        )

        # Get application hooks from azure.functions.extension.ExtensionMeta
        # The reutnr type is AppExtensionHooks
        apps = sdk.ExtensionMeta.get_application_hooks()

        # Invoke application hook
        cls._safe_execute_function_load_hooks(
            apps, APP_EXT_POST_FUNCTION_LOAD, func_name, func_directory
        )

    @classmethod
    @enable_feature_by(
        flag=PYTHON_ENABLE_WORKER_EXTENSIONS,
        flag_default=(
            PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT_39 if
            is_python_version('3.9') else
            PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT
        )
    )
    def _invocation_extension(cls, ctx, hook_name, func_args, func_ret=None):
        """Helper to execute extensions. If one of the extension fails in the
        extension chain, the rest of them will continue, emitting an error log
        of an exception trace for failed extension.

        Parameters
        ----------
        ctx: azure.functions.Context
            Azure Functions context to be passed onto extension
        hook_name: str
            The exetension name to be executed (e.g. pre_invocations).
            These are defined in azure.functions.FuncExtensionHooks.
        """
        sdk = cls._try_get_sdk_with_extension_enabled()
        if sdk is None:
            return

        # Get function hooks from azure.functions.extension.ExtensionMeta
        # The return type is FuncExtensionHooks
        funcs = sdk.ExtensionMeta.get_function_hooks(ctx.function_name)

        # Invoke function hooks
        cls._safe_execute_invocation_hooks(
            funcs, hook_name, ctx, func_args, func_ret
        )

        # Get application hooks from azure.functions.extension.ExtensionMeta
        # The reutnr type is AppExtensionHooks
        apps = sdk.ExtensionMeta.get_application_hooks()

        # Invoke application hook
        cls._safe_execute_invocation_hooks(
            apps, hook_name, ctx, func_args, func_ret
        )

    @classmethod
    def get_sync_invocation_wrapper(cls, ctx, func) -> Callable[[List], Any]:
        """Get a synchronous lambda of extension wrapped function which takes
        function parameters
        """
        return functools.partial(cls._raw_invocation_wrapper, ctx, func)

    @classmethod
    async def get_async_invocation_wrapper(cls, ctx, function, args) -> Any:
        """An asynchronous coroutine for executing function with extensions
        """
        cls._invocation_extension(ctx, APP_EXT_PRE_INVOCATION, args)
        cls._invocation_extension(ctx, FUNC_EXT_PRE_INVOCATION, args)
        result = await function(**args)
        cls._invocation_extension(ctx, FUNC_EXT_POST_INVOCATION, args, result)
        cls._invocation_extension(ctx, APP_EXT_POST_INVOCATION, args, result)
        return result

    @staticmethod
    def _is_extension_enabled_in_sdk(module: ModuleType) -> bool:
        """Check if the extension feature is enabled in particular
        azure.functions package.

        Parameters
        ----------
        module: ModuleType
            The azure.functions SDK module

        Returns
        -------
        bool
            True on azure.functions SDK supports extension registration
        """
        return getattr(module, 'ExtensionMeta', None) is not None

    @classmethod
    def _is_pre_invocation_hook(cls, name) -> bool:
        return name in (FUNC_EXT_PRE_INVOCATION, APP_EXT_PRE_INVOCATION)

    @classmethod
    def _is_post_invocation_hook(cls, name) -> bool:
        return name in (FUNC_EXT_POST_INVOCATION, APP_EXT_POST_INVOCATION)

    @classmethod
    def _safe_execute_invocation_hooks(cls, hooks, hook_name, ctx, fargs, fret):
        # hooks from azure.functions.ExtensionMeta.get_function_hooks() or
        #            azure.functions.ExtensionMeta.get_application_hooks()
        if hooks:
            # Invoke extension implementation from .<hook_name>.ext_impl
            for hook_meta in getattr(hooks, hook_name, []):
                # Register a system logger with prefix azure_functions_worker
                ext_logger = logging.getLogger(
                    f'{SYSTEM_LOG_PREFIX}.extension.{hook_meta.ext_name}'
                )
                try:
                    if cls._is_pre_invocation_hook(hook_name):
                        hook_meta.ext_impl(ext_logger, ctx, fargs)
                    elif cls._is_post_invocation_hook(hook_name):
                        hook_meta.ext_impl(ext_logger, ctx, fargs, fret)
                except Exception as e:
                    ext_logger.error(e, exc_info=True)

    @classmethod
    def _safe_execute_function_load_hooks(cls, hooks, hook_name, fname, fdir):
        # hooks from azure.functions.ExtensionMeta.get_function_hooks() or
        #            azure.functions.ExtensionMeta.get_application_hooks()
        if hooks:
            # Invoke extension implementation from .<hook_name>.ext_impl
            for hook_meta in getattr(hooks, hook_name, []):
                try:
                    hook_meta.ext_impl(fname, fdir)
                except Exception as e:
                    logger.error(e, exc_info=True)

    @classmethod
    def _raw_invocation_wrapper(cls, ctx, function, args) -> Any:
        """Calls pre_invocation and post_invocation extensions additional
        to function invocation
        """
        cls._invocation_extension(ctx, APP_EXT_PRE_INVOCATION, args)
        cls._invocation_extension(ctx, FUNC_EXT_PRE_INVOCATION, args)
        result = function(**args)
        cls._invocation_extension(ctx, FUNC_EXT_POST_INVOCATION, args, result)
        cls._invocation_extension(ctx, APP_EXT_POST_INVOCATION, args, result)
        return result

    @classmethod
    def _try_get_sdk_with_extension_enabled(cls) -> Optional[ModuleType]:
        if cls._is_sdk_detected:
            return cls._extension_enabled_sdk

        sdk = get_sdk_from_sys_path()
        if cls._is_extension_enabled_in_sdk(sdk):
            cls._info_extension_is_enabled(sdk)
            cls._extension_enabled_sdk = sdk
        else:
            cls._warn_sdk_not_support_extension(sdk)
            cls._extension_enabled_sdk = None

        cls._is_sdk_detected = True
        return cls._extension_enabled_sdk

    @classmethod
    def _info_extension_is_enabled(cls, sdk):
        logger.info(
            'Python Worker Extension is enabled in azure.functions (%s). '
            'Sdk path: %s', get_sdk_version(sdk), sdk.__file__)

    @classmethod
    def _info_discover_extension_list(cls, function_name, sdk):
        logger.info(
            'Python Worker Extension Manager is loading %s, current '
            'registered extensions: %s',
            function_name, sdk.ExtensionMeta.get_registered_extensions_json()
        )

    @classmethod
    def _warn_sdk_not_support_extension(cls, sdk):
        logger.warning(
            'The azure.functions (%s) does not support Python worker '
            'extensions. If you believe extensions are correctly installed, '
            'please set the %s and %s to "true"',
            get_sdk_version(sdk), PYTHON_ISOLATE_WORKER_DEPENDENCIES,
            PYTHON_ENABLE_WORKER_EXTENSIONS
        )
