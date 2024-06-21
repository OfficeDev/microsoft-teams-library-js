# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

from typing import Dict


class TraceContext:
    """Check https://www.w3.org/TR/trace-context/ for more information"""

    def __init__(self, trace_parent: str,
                 trace_state: str, attributes: Dict[str, str]) -> None:
        self.__trace_parent = trace_parent
        self.__trace_state = trace_state
        self.__attributes = attributes

    @property
    def Tracestate(self) -> str:
        """Get trace state from trace-context (deprecated)."""
        return self.__trace_state

    @property
    def Traceparent(self) -> str:
        """Get trace parent from trace-context (deprecated)."""
        return self.__trace_parent

    @property
    def Attributes(self) -> Dict[str, str]:
        """Get trace-context attributes (deprecated)."""
        return self.__attributes

    @property
    def trace_state(self) -> str:
        """Get trace state from trace-context"""
        return self.__trace_state

    @property
    def trace_parent(self) -> str:
        """Get trace parent from trace-context"""
        return self.__trace_parent

    @property
    def attributes(self) -> Dict[str, str]:
        """Get trace-context attributes"""
        return self.__attributes
