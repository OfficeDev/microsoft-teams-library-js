# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import abc
import asyncio
import importlib
import socket
import sys
from typing import Dict

from azure_functions_worker.constants import X_MS_INVOCATION_ID, \
    BASE_EXT_SUPPORTED_PY_MINOR_VERSION, PYTHON_ENABLE_INIT_INDEXING
from azure_functions_worker.logging import logger
from azure_functions_worker.utils.common import is_envvar_false


# Http V2 Exceptions
class HttpServerInitError(Exception):
    """Exception raised when there is an error during HTTP server
    initialization."""


class MissingHeaderError(ValueError):
    """Exception raised when a required header is missing in the
    HTTP request."""


class BaseContextReference(abc.ABC):
    """
    Base class for context references.
    """
    def __init__(self, event_class, http_request=None, http_response=None,
                 function=None, fi_context=None, args=None,
                 http_trigger_param_name=None):
        self._http_request = http_request
        self._http_response = http_response
        self._function = function
        self._fi_context = fi_context
        self._args = args
        self._http_trigger_param_name = http_trigger_param_name
        self._http_request_available_event = event_class()
        self._http_response_available_event = event_class()

    @property
    def http_request(self):
        return self._http_request

    @http_request.setter
    def http_request(self, value):
        self._http_request = value
        self._http_request_available_event.set()

    @property
    def http_response(self):
        return self._http_response

    @http_response.setter
    def http_response(self, value):
        self._http_response = value
        self._http_response_available_event.set()

    @property
    def function(self):
        return self._function

    @function.setter
    def function(self, value):
        self._function = value

    @property
    def fi_context(self):
        return self._fi_context

    @fi_context.setter
    def fi_context(self, value):
        self._fi_context = value

    @property
    def http_trigger_param_name(self):
        return self._http_trigger_param_name

    @http_trigger_param_name.setter
    def http_trigger_param_name(self, value):
        self._http_trigger_param_name = value

    @property
    def args(self):
        return self._args

    @args.setter
    def args(self, value):
        self._args = value

    @property
    def http_request_available_event(self):
        return self._http_request_available_event

    @property
    def http_response_available_event(self):
        return self._http_response_available_event


class AsyncContextReference(BaseContextReference):
    """
    Asynchronous context reference class.
    """
    def __init__(self, http_request=None, http_response=None, function=None,
                 fi_context=None, args=None):
        super().__init__(event_class=asyncio.Event, http_request=http_request,
                         http_response=http_response,
                         function=function, fi_context=fi_context, args=args)
        self.is_async = True


class SingletonMeta(type):
    """
    Metaclass for implementing the singleton pattern.
    """
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]


class HttpCoordinator(metaclass=SingletonMeta):
    """
    HTTP coordinator class for managing HTTP v2 requests and responses.
    """
    def __init__(self):
        self._context_references: Dict[str, BaseContextReference] = {}

    def set_http_request(self, invoc_id, http_request):
        if invoc_id not in self._context_references:
            self._context_references[invoc_id] = AsyncContextReference()
        context_ref = self._context_references.get(invoc_id)
        context_ref.http_request = http_request

    def set_http_response(self, invoc_id, http_response):
        if invoc_id not in self._context_references:
            raise KeyError("No context reference found for invocation %s"
                           % invoc_id)
        context_ref = self._context_references.get(invoc_id)
        context_ref.http_response = http_response

    async def get_http_request_async(self, invoc_id):
        if invoc_id not in self._context_references:
            self._context_references[invoc_id] = AsyncContextReference()

        await self._context_references.get(
            invoc_id).http_request_available_event.wait()
        return self._pop_http_request(invoc_id)

    async def await_http_response_async(self, invoc_id):
        if invoc_id not in self._context_references:
            raise KeyError("No context reference found for invocation %s"
                           % invoc_id)

        await self._context_references.get(
            invoc_id).http_response_available_event.wait()
        return self._pop_http_response(invoc_id)

    def _pop_http_request(self, invoc_id):
        context_ref = self._context_references.get(invoc_id)
        request = context_ref.http_request
        if request is not None:
            context_ref.http_request = None
            return request

        raise ValueError("No http request found for invocation %s" % invoc_id)

    def _pop_http_response(self, invoc_id):
        context_ref = self._context_references.get(invoc_id)
        response = context_ref.http_response
        if response is not None:
            context_ref.http_response = None
            return response

        raise ValueError("No http response found for invocation %s" % invoc_id)


def get_unused_tcp_port():
    # Create a TCP socket
    tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # Bind it to a free port provided by the OS
    tcp_socket.bind(("", 0))
    # Get the port number
    port = tcp_socket.getsockname()[1]
    # Close the socket
    tcp_socket.close()
    # Return the port number
    return port


def initialize_http_server(host_addr, **kwargs):
    """
    Initialize HTTP v2 server for handling HTTP requests.
    """
    try:
        ext_base = HttpV2Registry.ext_base()
        web_extension_mod_name = ext_base.ModuleTrackerMeta.get_module()
        extension_module = importlib.import_module(web_extension_mod_name)
        web_app_class = extension_module.WebApp
        web_server_class = extension_module.WebServer

        unused_port = get_unused_tcp_port()

        app = web_app_class()
        request_type = ext_base.RequestTrackerMeta.get_request_type()

        @app.route
        async def catch_all(request: request_type):  # type: ignore
            invoc_id = request.headers.get(X_MS_INVOCATION_ID)
            if invoc_id is None:
                raise MissingHeaderError("Header %s not found" %
                                         X_MS_INVOCATION_ID)
            logger.info('Received HTTP request for invocation %s', invoc_id)
            http_coordinator.set_http_request(invoc_id, request)
            http_resp = \
                await http_coordinator.await_http_response_async(invoc_id)

            logger.info('Sending HTTP response for invocation %s', invoc_id)
            # if http_resp is an python exception, raise it
            if isinstance(http_resp, Exception):
                raise http_resp

            return http_resp

        web_server = web_server_class(host_addr, unused_port, app)
        web_server_run_task = web_server.serve()

        loop = asyncio.get_event_loop()
        loop.create_task(web_server_run_task)

        web_server_address = f"http://{host_addr}:{unused_port}"
        logger.info('HTTP server starting on %s', web_server_address)

        return web_server_address

    except Exception as e:
        raise HttpServerInitError("Error initializing HTTP server: %s" % e) \
            from e


async def sync_http_request(http_request, invoc_request):
    # Sync http request route params from invoc_request to http_request
    route_params = {key: item.string for key, item
                    in invoc_request.trigger_metadata.items()
                    if key not in ['Headers', 'Query']}
    (HttpV2Registry.ext_base().RequestTrackerMeta
     .get_synchronizer()
     .sync_route_params(http_request, route_params))


class HttpV2Registry:
    """
    HTTP v2 registry class for managing HTTP v2 states.
    """
    _http_v2_enabled = False
    _ext_base = None
    _http_v2_enabled_checked = False

    @classmethod
    def http_v2_enabled(cls, **kwargs):
        # Check if HTTP/2 enablement has already been checked
        if not cls._http_v2_enabled_checked:
            # If not checked yet, mark as checked
            cls._http_v2_enabled_checked = True

            cls._http_v2_enabled = cls._check_http_v2_enabled()

        # Return the result of HTTP/2 enablement
        return cls._http_v2_enabled

    @classmethod
    def ext_base(cls):
        return cls._ext_base

    @classmethod
    def _check_http_v2_enabled(cls):
        if sys.version_info.minor < BASE_EXT_SUPPORTED_PY_MINOR_VERSION or \
                is_envvar_false(PYTHON_ENABLE_INIT_INDEXING):
            return False

        import azurefunctions.extensions.base as ext_base
        cls._ext_base = ext_base

        return cls._ext_base.HttpV2FeatureChecker.http_v2_enabled()


http_coordinator = HttpCoordinator()
