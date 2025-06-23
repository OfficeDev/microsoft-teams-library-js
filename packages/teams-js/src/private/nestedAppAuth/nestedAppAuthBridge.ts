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
export const version = '1.0.1';

/**
 * Interface representing a request structure.
 *
 * @see {@link https://github.com/OfficeDev/microsoft-teams-library-js/blob/main/packages/teams-js/src/internal/nestedAppAuthUtils.ts | NestedAppAuthRequest}
 */
interface NestedAppAuthRequest {
  id: string;
  uuid: string;
  func: 'nestedAppAuth.execute';
  timestamp: number;
  monotonicTimestamp: number;
  apiVersionTag?: string;
  args: [];
  data: string;
}

/**
 * Interface representing a response structure.
 *
 * @see {@link https://github.com/OfficeDev/microsoft-teams-library-js/blob/main/packages/teams-js/src/internal/messageObjects.ts | SerializedMessageResponse}
 */
interface SerializedMessageResponse {
  id: number;
  uuidAsString?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  monotonicTimestamp?: number;
  isPartialResponse?: boolean;
}

/**
 * Interface defining the structure of parsed NAA auth messages.
 */
interface ParsedNestedAppAuthMessageData {
  messageType: NestedAppAuthMessageEventNames;
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
 * Type defining the bridge handlers.
 */
type NestedAppAuthBridgeHandlers = {
  onMessage: (evt: MessageEvent, onMessageReceived: (response: string) => void) => void;
};

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
 * Bridge handlers used for processing messages.
 */
const bridgeHandlers: NestedAppAuthBridgeHandlers = {
  onMessage: processAuthBridgeMessage,
};

let topOriginForNAA: string | null = null;
let isNAALoggerEnabled = false;

/**
 * @beta
 * @hidden
 * Initializes the Nested App Auth Bridge.
 * @param window The window object where the bridge will be attached.
 * @param topOrigin The origin of the top-level frame.
 * @param enableLogging - Optional flag to enable internal debug and error logging. Defaults to false.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function initialize(window: Window | null, topOrigin: string, enableLogging = false): void {
  isNAALoggerEnabled = enableLogging;

  if (!window) {
    throw new Error('Cannot polyfill nestedAppAuthBridge as the current window does not exist');
  }

  if (!topOrigin) {
    throw new Error('Top origin is required to initialize the Nested App Auth Bridge');
  }

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
    log('Nested App Auth Bridge is already present');
    return;
  }

  // Create and assign the bridge to the window.
  const nestedAppAuthBridge = createNestedAppAuthBridge(extendedWindow);
  if (nestedAppAuthBridge) {
    extendedWindow.nestedAppAuthBridge = nestedAppAuthBridge;
  }
}

/**
 * Creates the Nested App Auth Bridge.
 * @param window The window object where the bridge is being injected.
 * @returns A NestedAppAuthBridge instance.
 */
function createNestedAppAuthBridge(window: Window): NestedAppAuthBridge {
  const messageHandlers = new WeakMap<(response: string) => void, EventListener>();
  const { onMessage } = bridgeHandlers;

  const nestedAppAuthBridgeHandler = (callback: (response: string) => void) => (evt: MessageEvent) =>
    onMessage(evt, callback);

  return {
    /**
     * Adds an event listener for message events.
     */
    addEventListener: (eventName, callback): void => {
      if (eventName === 'message') {
        const handler = nestedAppAuthBridgeHandler(callback);
        messageHandlers.set(callback, handler);
        window.addEventListener(eventName, handler);
      } else {
        log(`Event ${eventName} is not supported by nestedAppAuthBridge`);
      }
    },

    /**
     * Sends a message using postMessage.
     */
    postMessage: (message: string): void => {
      if (window.top) {
        try {
          const parsedMessage = JSON.parse(message);

          if (
            typeof parsedMessage === 'object' &&
            parsedMessage.messageType === NestedAppAuthMessageEventNames.Request
          ) {
            const request = createNestedAppAuthRequest(message);

            if (window !== window.top && topOriginForNAA) {
              window.top.postMessage(request, topOriginForNAA);
            } else {
              logError('Not in an embedded iframe; skipping postMessage.');
              return;
            }
          }
        } catch (error) {
          logError('Failed to parse message:', error, 'Original message:', message);
          return;
        }
      } else {
        throw new Error('window.top is not available for posting messages');
      }
    },

    /**
     * Removes a previously attached event listener.
     */
    removeEventListener: (eventName: 'message', callback: (response: string) => void): void => {
      const handler = messageHandlers.get(callback);
      if (handler) {
        window.removeEventListener(eventName, handler);
        messageHandlers.delete(callback);
      }
    },
  };
}

/**
 * Processes messages received through the auth bridge.
 * @param evt The message event containing the response.
 * @param onMessageReceived Callback function to handle the received message.
 */
function processAuthBridgeMessage(evt: MessageEvent, onMessageReceived: (response: string) => void): void {
  if (!evt || !evt.data || typeof evt.data !== 'object' || evt.data === null) {
    log('Invalid message format, ignoring. Message: %o', evt);
    return;
  }

  // Validate message source before processing
  if (!shouldProcessIncomingMessage(evt.source as Window, evt.origin)) {
    log('Message source/origin not allowed, ignoring.');
    return;
  }

  const { args } = evt.data as SerializedMessageResponse;
  const [, message] = args ?? [];

  const parsedData: ParsedNestedAppAuthMessageData = (() => {
    try {
      return JSON.parse(message);
    } catch (error) {
      logError('Failed to parse response message:', error);
      return null;
    }
  })();

  if (!parsedData || parsedData.messageType !== NestedAppAuthMessageEventNames.Response) {
    log('Invalid response format, ignoring. Message: %o', evt);
    return;
  }
  onMessageReceived(message);
}

function shouldProcessIncomingMessage(messageSource: Window, messageOrigin: string): boolean {
  // Check if messageOrigin matches topOriginForNAA
  if (messageOrigin === topOriginForNAA) {
    try {
      return new URL(messageOrigin).protocol === 'https:';
    } catch (error) {
      logError('Invalid message origin URL:', error);
      return false;
    }
  }

  return false;
}

/**
 * Creates a NAA request with a unique ID and timestamp.
 * @param data The data to be included in the request.
 * @returns A stringified JSON request object.
 */
function createNestedAppAuthRequest(data: string): NestedAppAuthRequest {
  const timestamp = Date.now();
  return {
    id: generateUniqueId(),
    uuid: generateUUID(),
    func: 'nestedAppAuth.execute',
    timestamp: timestamp,
    apiVersionTag: 'v2_nestedAppAuth.execute', // Hardcoded to avoid coupling with the `ApiName` enum from the TeamsJS core module.
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
function log(...args: unknown[]): void {
  if (isNAALoggerEnabled) {
    console.log(...args);
  }
}

/**
 * Logs error messages to the console if logging is enabled.
 * Used internally for debugging and error tracing.
 *
 * @param args - The error data to be logged.
 */
function logError(...args: unknown[]): void {
  if (isNAALoggerEnabled) {
    console.error(...args);
  }
}
