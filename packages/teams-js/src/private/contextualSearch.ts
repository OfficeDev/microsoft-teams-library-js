/**
 * @hidden
 * Module to interact with the Teams Contextual Search pane.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @module
 */

import { callFunctionInHost } from '../internal/communication';
import { registerHandlerHelper } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * v1 APIs telemetry file: All APIs in this capability file should
 * send API version v1 only.
 */
const contextualSearchTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * Parameters used when opening the contextual search pane.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export interface OpenContextualSearchRequest {
  /**
   * Identifies the entry point that triggered contextual search.
   * This value may be used by the host for telemetry.
   */
  triggerSource?: string;
}

/**
 * Handler invoked when the contextual search pane becomes visible.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type ContextualSearchOpenedHandler = () => void;

/**
 * Handler invoked when the contextual search pane is closed.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export type ContextualSearchClosedHandler = () => void;

/**
 * Opens the contextual search pane.
 *
 * The returned promise resolves when the host has processed the request.
 *
 * @param request - Optional parameters for opening contextual search.
 * @returns Promise resolved when the host processes the request.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function openContextualSearch(request?: OpenContextualSearchRequest): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const args = request?.triggerSource ? [request.triggerSource] : [];

  return callFunctionInHost(
    ApiName.ContextualSearch_OpenContextualSearch,
    args,
    getApiVersionTag(contextualSearchTelemetryVersionNumber, ApiName.ContextualSearch_OpenContextualSearch),
  );
}

/**
 * Closes the contextual search pane.
 *
 * The returned promise resolves when the host has processed the request.
 *
 * @returns Promise resolved when the host processes the request.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function closeContextualSearch(): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  return callFunctionInHost(
    ApiName.ContextualSearch_CloseContextualSearch,
    [],
    getApiVersionTag(contextualSearchTelemetryVersionNumber, ApiName.ContextualSearch_CloseContextualSearch),
  );
}

/**
 * Registers a handler invoked when the contextual search pane becomes visible.
 *
 * This includes pane visibility changes initiated by host entry points such as
 * keyboard shortcuts or autosuggest.
 *
 * @param handler - Handler invoked when contextual search becomes visible.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnContextualSearchOpenedHandler(handler: ContextualSearchOpenedHandler): void {
  registerHandlerHelper(
    getApiVersionTag(
      contextualSearchTelemetryVersionNumber,
      ApiName.ContextualSearch_RegisterOpenContextualSearchHandler,
    ),
    'contextualSearchOpened',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Registers a handler invoked when the contextual search pane is closed.
 *
 * @param handler - Handler invoked when contextual search is closed.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnContextualSearchClosedHandler(handler: ContextualSearchClosedHandler): void {
  registerHandlerHelper(
    getApiVersionTag(
      contextualSearchTelemetryVersionNumber,
      ApiName.ContextualSearch_RegisterCloseContextualSearchHandler,
    ),
    'contextualSearchClosed',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Checks whether the contextual search capability is supported by the host.
 *
 * @returns Whether contextual search is supported.
 *
 * @throws Error if {@linkcode app.initialize} has not completed successfully.
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.contextualSearch;
}
