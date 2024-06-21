# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.
import os
import sys

from ..constants import (PYTHON_ROLLBACK_CWD_PATH,
                         PYTHON_THREADPOOL_THREAD_COUNT,
                         PYTHON_ISOLATE_WORKER_DEPENDENCIES,
                         PYTHON_ENABLE_WORKER_EXTENSIONS,
                         PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT,
                         PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT_39,
                         PYTHON_ENABLE_DEBUG_LOGGING,
                         FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED,
                         PYTHON_SCRIPT_FILE_NAME, PYTHON_ENABLE_INIT_INDEXING)


def get_python_appsetting_state():
    current_vars = os.environ.copy()
    python_specific_settings = \
        [PYTHON_ROLLBACK_CWD_PATH,
         PYTHON_THREADPOOL_THREAD_COUNT,
         PYTHON_ISOLATE_WORKER_DEPENDENCIES,
         PYTHON_ENABLE_DEBUG_LOGGING,
         PYTHON_ENABLE_WORKER_EXTENSIONS,
         FUNCTIONS_WORKER_SHARED_MEMORY_DATA_TRANSFER_ENABLED,
         PYTHON_SCRIPT_FILE_NAME,
         PYTHON_ENABLE_INIT_INDEXING]

    app_setting_states = "".join(
        f"{app_setting}: {current_vars[app_setting]} | "
        for app_setting in python_specific_settings
        if app_setting in current_vars
    )

    # Special case for extensions
    if 'PYTHON_ENABLE_WORKER_EXTENSIONS' not in current_vars:
        if sys.version_info.minor == 9:
            app_setting_states += \
                (f"{PYTHON_ENABLE_WORKER_EXTENSIONS}: "
                 f"{str(PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT_39)}")
        else:
            app_setting_states += \
                (f"{PYTHON_ENABLE_WORKER_EXTENSIONS}: "
                 f"{str(PYTHON_ENABLE_WORKER_EXTENSIONS_DEFAULT)}")

    return app_setting_states
