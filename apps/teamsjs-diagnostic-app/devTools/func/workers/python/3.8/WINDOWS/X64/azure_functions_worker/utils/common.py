# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
import importlib
import os
import sys
import re
from types import ModuleType
from typing import Optional, Callable

from azure_functions_worker.constants import CUSTOMER_PACKAGES_PATH, \
    PYTHON_EXTENSIONS_RELOAD_FUNCTIONS


def is_true_like(setting: str) -> bool:
    if setting is None:
        return False

    return setting.lower().strip() in {'1', 'true', 't', 'yes', 'y'}


def is_false_like(setting: str) -> bool:
    if setting is None:
        return False

    return setting.lower().strip() in {'0', 'false', 'f', 'no', 'n'}


def is_envvar_true(env_key: str) -> bool:
    if os.getenv(env_key) is None:
        return False

    return is_true_like(os.environ[env_key])


def is_envvar_false(env_key: str) -> bool:
    if os.getenv(env_key) is None:
        return False

    return is_false_like(os.environ[env_key])


def is_python_version(version: str) -> bool:
    current_version = f'{sys.version_info.major}.{sys.version_info.minor}'
    return current_version == version


def get_app_setting(
    setting: str,
    default_value: Optional[str] = None,
    validator: Optional[Callable[[str], bool]] = None
) -> Optional[str]:
    """Returns the application setting from environment variable.

    Parameters
    ----------
    setting: str
        The name of the application setting (e.g. FUNCTIONS_RUNTIME_VERSION)

    default_value: Optional[str]
        The expected return value when the application setting is not found,
        or the app setting does not pass the validator.

    validator: Optional[Callable[[str], bool]]
        A function accepts the app setting value and should return True when
        the app setting value is acceptable.

    Returns
    -------
    Optional[str]
        A string value that is set in the application setting
    """
    app_setting_value = os.getenv(setting)

    # If an app setting is not configured, we return the default value
    if app_setting_value is None:
        return default_value

    # If there's no validator, we should return the app setting value directly
    if validator is None:
        return app_setting_value

    # If the app setting is set with a validator,
    # On True, should return the app setting value
    # On False, should return the default value
    if validator(app_setting_value):
        return app_setting_value
    return default_value


def get_sdk_version(module: ModuleType) -> str:
    """Check the version of azure.functions sdk.

    Parameters
    ----------
    module: ModuleType
        The azure.functions SDK module

    Returns
    -------
    str
        The SDK version that our customer has installed.
    """

    return getattr(module, '__version__', 'undefined')


def get_sdk_from_sys_path() -> ModuleType:
    """Get the azure.functions SDK from the latest sys.path defined.
    This is to ensure the extension loaded from SDK coming from customer's
    site-packages.

    Returns
    -------
    ModuleType
        The azure.functions that is loaded from the first sys.path entry
    """

    if is_envvar_true(PYTHON_EXTENSIONS_RELOAD_FUNCTIONS):
        backup_azure_functions = None
        backup_azure = None

        if 'azure.functions' in sys.modules:
            backup_azure_functions = sys.modules.pop('azure.functions')
        if 'azure' in sys.modules:
            backup_azure = sys.modules.pop('azure')

        module = importlib.import_module('azure.functions')

        if backup_azure:
            sys.modules['azure'] = backup_azure
        if backup_azure_functions:
            sys.modules['azure.functions'] = backup_azure_functions

        return module

    if CUSTOMER_PACKAGES_PATH not in sys.path:
        sys.path.insert(0, CUSTOMER_PACKAGES_PATH)

    return importlib.import_module('azure.functions')


class InvalidFileNameError(Exception):

    def __init__(self, file_name: str) -> None:
        super().__init__(
            f'Invalid file name: {file_name}')


def validate_script_file_name(file_name: str):
    # First character can be a letter, number, or underscore
    # Following characters can be a letter, number, underscore, hyphen, or dash
    # Ending must be .py
    pattern = re.compile(r'^[a-zA-Z0-9_][a-zA-Z0-9_\-]*\.py$')
    if not pattern.match(file_name):
        raise InvalidFileNameError(file_name)
