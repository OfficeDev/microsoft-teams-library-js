# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from dataclasses import dataclass
from enum import Enum

from . import rpcexception


class RetryPolicy(Enum):
    """Retry policy for the function invocation"""

    MAX_RETRY_COUNT = "max_retry_count"
    STRATEGY = "strategy"
    DELAY_INTERVAL = "delay_interval"
    MINIMUM_INTERVAL = "minimum_interval"
    MAXIMUM_INTERVAL = "maximum_interval"


@dataclass
class RetryContext:
    """Gets the current retry count from retry-context"""
    retry_count: int

    """Gets the max retry count from retry-context"""
    max_retry_count: int

    rpc_exception: rpcexception.RpcException
