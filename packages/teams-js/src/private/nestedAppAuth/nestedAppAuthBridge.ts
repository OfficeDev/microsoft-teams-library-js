import { v4 as generateUUID } from 'uuid';

/**
 * @beta
 * @hidden
 * Local version of the Nested App Auth Bridge module.
 *
 * This version is specific to this standalone module and is not tied to the overall TeamsJS SDK version.
 * It allows developers to track changes within this module and handle version-based compatibility if needed.
 *
 * While not strictly required today, having a version provides flexibility for future updates,
 * especially if breaking changes are introduced later.
 *
 * Example:
 *   if (nestedAppAuthBridge.version.startsWith('1.')) {
 *     // Safe to use with current logic
 *   }
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const version = '1.0.2';

/**
 * Interface representing a request structure.
 *
 * @see {@link https://github.com/OfficeDev/microsoft-teams-library-js/blob/main/packages/teams-js/src/internal/nestedAppAuthUtils.ts | NestedAppAuthRequest}
 */
interface NestedAppAuthRequest {
  id: string;
  uuidAsString: string;
  func: 'nestedAppAuth.execute';
  timestamp: number;
  monotonicTimestamp: number;
  apiVersionTag?: string;
  args: [];
  data: string;
}

/**
 * Correlation metadata for a live request. Inner auth payloads are not retained.
 */
interface PendingRequest {
  uuidAsString: string;
  requestId: string;
}

/**
 * Interface representing the bridge used for message passing.
 *
 * @see {@link https://github.com/OfficeDev/microsoft-teams-library-js/blob/main/packages/teams-js/src/internal/nestedAppAuthUtils.ts | NestedAppAuthBridge}
 */
interface NestedAppAuthBridge {
  addEventListener: (eventName: 'message', callback: (response: string) => void) => void;
  postMessage: (message: string) => void;
  removeEventListener: (eventName: 'message', callback: (response: string) => void) => void;
}

/**
 * Extended Window interface to include the nestedAppAuthBridge.
 */
interface NestedAuthExtendedWindow extends Window {
  nestedAppAuthBridge: NestedAppAuthBridge;
}

/**
 * Enum defining possible event names for NestedAppAuth messages.
 *
 * @see {@link https://github.com/OfficeDev/microsoft-teams-library-js/blob/main/packages/teams-js/src/internal/nestedAppAuthUtils.ts | NestedAppAuthMessageEventNames}
 */
const enum NestedAppAuthMessageEventNames {
  Request = 'NestedAppAuthRequest',
  Response = 'NestedAppAuthResponse',
}

/**
 * @beta
 * @hidden
 * Initializes the Nested App Auth Bridge.
 * @param window The window object where the bridge will be attached.
 * @param topOrigin The origin of the top-level frame.
 * @param enableLogging - Optional flag to enable internal debug and error logging. Defaults to false.
 * @remarks
 * Configuration belongs to the installed bridge. Reinitialization does not retarget requests or
 * replace an existing native bridge. Responses must echo the sent outer ID and serialized UUID,
 * and contain the original inner request ID. Accepted inner responses are forwarded unchanged.
 * Removing a listener is not cancellation; live requests have no authentication deadline.
 * Outer SDK refusals are not converted into MSAL errors by this module.
 * Incoming origin filtering retains the existing origin-only policy, without source-window validation.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function initialize(window: Window | null, topOrigin: string, enableLogging = false): void {
  if (!window) {
    throw new Error('Cannot polyfill nestedAppAuthBridge as the current window does not exist');
  }

  if (!topOrigin) {
    throw new Error('Top origin is required to initialize the Nested App Auth Bridge');
  }

  let topOriginForNAA: string;
  try {
    const parsedOrigin = new URL(topOrigin);
    if (parsedOrigin.protocol !== 'https:') {
      throw new Error(`Invalid top origin: ${topOrigin}. Only HTTPS origins are allowed.`);
    }
    topOriginForNAA = parsedOrigin.origin;
  } catch (error) {
    throw new Error(`Failed to initialize bridge: invalid top origin: ${topOrigin}`);
  }

  const extendedWindow = window as NestedAuthExtendedWindow;

  // If the bridge is already present, return.
  if (extendedWindow.nestedAppAuthBridge) {
    log(enableLogging, 'Nested App Auth Bridge is already present');
    return;
  }

  // Create and assign the bridge to the window.
  extendedWindow.nestedAppAuthBridge = createNestedAppAuthBridge(extendedWindow, topOriginForNAA, enableLogging);
}

/**
 * Creates the Nested App Auth Bridge.
 * @param window The window object where the bridge is being injected.
 * @param topOrigin The canonical HTTPS origin captured during initialization.
 * @param enableLogging Whether to enable payload-free diagnostic logging.
 * @returns A NestedAppAuthBridge instance.
 */
function createNestedAppAuthBridge(window: Window, topOrigin: string, enableLogging: boolean): NestedAppAuthBridge {
  const callbacks = new Set<(response: string) => void>();
  const pendingRequests = new Map<string, PendingRequest>();
  const activeInnerRequests = new Set<string>();

  const onMessage = (evt: MessageEvent): void => {
    const response: unknown = evt.data;
    if (evt.origin !== topOrigin || !isRecord(response)) {
      log(enableLogging, 'Message origin or format not allowed, ignoring.');
      return;
    }

    const { id, uuidAsString, args, isPartialResponse } = response;
    if (
      typeof id !== 'string' ||
      typeof uuidAsString !== 'string' ||
      (isPartialResponse !== undefined && isPartialResponse !== false) ||
      !Array.isArray(args) ||
      args.length !== 2 ||
      args[0] !== null ||
      typeof args[1] !== 'string'
    ) {
      log(enableLogging, 'Unsupported response envelope, ignoring.');
      return;
    }

    const pending = pendingRequests.get(id);
    if (!pending || pending.uuidAsString !== uuidAsString) {
      log(enableLogging, 'Response does not match a live request, ignoring.');
      return;
    }

    const message = args[1];
    const parsedData = parseMessage(message, enableLogging);
    if (
      !isRecord(parsedData) ||
      parsedData.messageType !== NestedAppAuthMessageEventNames.Response ||
      parsedData.requestId !== pending.requestId ||
      typeof parsedData.success !== 'boolean'
    ) {
      log(enableLogging, 'Invalid inner response, ignoring.');
      return;
    }

    pendingRequests.delete(id);
    activeInnerRequests.delete(pending.requestId);

    let callbackFailed = false;
    let callbackError: unknown;
    for (const callback of Array.from(callbacks)) {
      if (callbacks.has(callback)) {
        try {
          callback(message);
        } catch (error) {
          if (!callbackFailed) {
            callbackError = error;
            callbackFailed = true;
          }
        }
      }
    }
    if (callbackFailed) {
      throw callbackError;
    }
  };

  return {
    /**
     * Adds an event listener for message events.
     */
    addEventListener: (eventName, callback): void => {
      if (eventName === 'message') {
        if (callbacks.size === 0) {
          window.addEventListener(eventName, onMessage);
        }
        callbacks.add(callback);
      } else {
        log(enableLogging, `Event ${eventName} is not supported by nestedAppAuthBridge`);
      }
    },

    /**
     * Sends a message using postMessage.
     */
    postMessage: (message: string): void => {
      const top = window.top;
      if (!top) {
        throw new Error('window.top is not available for posting messages');
      }
      if (window === top) {
        logError(enableLogging, 'Not in an embedded iframe; skipping postMessage.');
        return;
      }

      const parsedMessage = parseMessage(message, enableLogging);
      if (
        !isRecord(parsedMessage) ||
        parsedMessage.messageType !== NestedAppAuthMessageEventNames.Request ||
        typeof parsedMessage.requestId !== 'string' ||
        parsedMessage.requestId.length === 0 ||
        typeof parsedMessage.method !== 'string' ||
        parsedMessage.method.length === 0
      ) {
        logError(enableLogging, 'Invalid auth request, ignoring.');
        return;
      }

      const request = createNestedAppAuthRequest(message);
      if (activeInnerRequests.has(parsedMessage.requestId) || pendingRequests.has(request.id)) {
        logError(enableLogging, 'Auth request ID is already pending, ignoring.');
        return;
      }

      pendingRequests.set(request.id, { uuidAsString: request.uuidAsString, requestId: parsedMessage.requestId });
      activeInnerRequests.add(parsedMessage.requestId);
      try {
        top.postMessage(request, topOrigin);
      } catch (error) {
        if (pendingRequests.delete(request.id)) {
          activeInnerRequests.delete(parsedMessage.requestId);
          logError(enableLogging, 'Failed to post auth request.');
        } else {
          throw error;
        }
      }
    },

    /**
     * Removes a previously attached event listener.
     */
    removeEventListener: (eventName: 'message', callback: (response: string) => void): void => {
      if (eventName === 'message' && callbacks.delete(callback) && callbacks.size === 0) {
        window.removeEventListener(eventName, onMessage);
      }
    },
  };
}

/**
 * Checks an untrusted parsed message without accepting arrays or null.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseMessage(message: string, enableLogging: boolean): unknown {
  try {
    return JSON.parse(message);
  } catch (error) {
    logError(enableLogging, 'Failed to parse auth message.');
    return undefined;
  }
}

/**
 * Creates a NAA request with a unique ID and timestamp.
 * @param data The data to be included in the request.
 * @returns An SDK request envelope with its serialized UUID and original inner data.
 */
function createNestedAppAuthRequest(data: string): NestedAppAuthRequest {
  const timestamp = Date.now();
  return {
    id: generateUniqueId(),
    uuidAsString: generateUUID(),
    func: 'nestedAppAuth.execute',
    timestamp: timestamp,
    apiVersionTag: 'v3_nestedAppAuth.execute', // Hardcoded to avoid coupling with the `ApiName` enum from the TeamsJS core module.
    monotonicTimestamp: timestamp,
    args: [],
    data,
  };
}

/**
 * Generates a unique ID for NAA auth requests.
 * @returns A randomly generated unique string.
 */
function generateUniqueId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);
}

/**
 * Logs informational messages to the console if logging is enabled.
 * Used internally for non-critical debug output.
 *
 * @param args - The data to be logged.
 */
function log(enableLogging: boolean, ...args: unknown[]): void {
  if (enableLogging) {
    console.log(...args);
  }
}

/**
 * Logs error messages to the console if logging is enabled.
 * Used internally for debugging and error tracing.
 *
 * @param args - The error data to be logged.
 */
function logError(enableLogging: boolean, ...args: unknown[]): void {
  if (enableLogging) {
    console.error(...args);
  }
}
