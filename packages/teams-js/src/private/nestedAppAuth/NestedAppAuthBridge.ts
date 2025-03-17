import { v4 as generateUUID } from 'uuid';

/**
 * Interface representing a request structure.
 */
interface NestedAppAuthRequest {
  id: string;
  uuid: string;
  func: 'nestedAppAuth.execute';
  timestamp: number;
  monotonicTimestamp: number;
  args: [];
  data: string;
}

/**
 * Interface representing a response structure.
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
 * Interface defining the structure of parsed authentication messages.
 */
interface ParsedNestedAppAuthMessageData {
  messageType: NestedAppAuthMessageEventNames;
}

/**
 * Interface representing the bridge used for message passing.
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

let storedTopOrigin: string | null = null;

/**
 * Initializes the Nested App Auth Bridge.
 * @param window The window object where the bridge will be attached.
 * @param topOrigin The origin of the top-level frame.
 */
export function initializeNestedAppAuthBridge(window: Window | null, topOrigin: string): void {
  if (!window) {
    throw new Error('Cannot polyfill nestedAppAuthBridge as the current window does not exist');
  }

  if (!topOrigin) {
    throw new Error('Top origin is required to initialize the Nested App Auth Bridge');
  }

  storedTopOrigin = topOrigin;
  const extendedWindow = window as NestedAuthExtendedWindow;

  // If the bridge is already present, do nothing.
  if (extendedWindow.nestedAppAuthBridge) {
    return;
  }

  // Create and assign the bridge to the window.
  const nestedAppAuthBridge = createNestedAppAuthBridge(extendedWindow);
  if (nestedAppAuthBridge) {
    extendedWindow.nestedAppAuthBridge = nestedAppAuthBridge;
  }
}

/**
 * Creates the Nested App Authentication Bridge.
 * @param window The window object where the bridge is being injected.
 * @returns A NestedAppAuthBridge instance.
 */
function createNestedAppAuthBridge(window: Window): NestedAppAuthBridge {
  const { onMessage } = bridgeHandlers;

  const nestedAppAuthBridgeHandler = (callback: (response: string) => void) => (evt: MessageEvent) =>
    onMessage(evt, callback);

  return {
    /**
     * Adds an event listener for message events.
     */
    addEventListener: (eventName, callback): void => {
      if (eventName === 'message') {
        window.addEventListener(eventName, nestedAppAuthBridgeHandler(callback));
      } else {
        console.log(`Event ${eventName} is not supported by nestedAppAuthBridge`);
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

            if (window !== window.top && window.top && storedTopOrigin) {
              window.top.postMessage(request, storedTopOrigin);
            } else {
              console.error('window.top is not available for posting messages');
            }
          }
        } catch {
          console.log('Failed to parse message. Message: %o', message);
        }
      } else {
        console.error('window.top is not available for posting messages');
      }
    },

    /**
     * Removes a previously attached event listener.
     */
    removeEventListener: (eventName: 'message', callback: (response: string) => void): void => {
      window.removeEventListener(eventName, nestedAppAuthBridgeHandler(callback));
    },
  };
}

/**
 * Processes messages received through the auth bridge.
 * @param evt The message event containing the response.
 * @param onMessageReceived Callback function to handle the received message.
 */
function processAuthBridgeMessage(evt: MessageEvent, onMessageReceived: (response: string) => void): void {
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    console.log('Invalid message format, ignoring. Message: %o', evt);
    return;
  }

  // Validate message source before processing
  if (!shouldProcessIncomingMessage(evt.source as Window, evt.origin)) {
    console.log('Message source/origin not allowed, ignoring.');
    return;
  }

  const { args } = evt.data as SerializedMessageResponse;
  const [, message] = args ?? [];

  const parsedData: ParsedNestedAppAuthMessageData = (() => {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  })();

  if (!parsedData || parsedData.messageType !== NestedAppAuthMessageEventNames.Response) {
    console.log('Invalid response format, ignoring. Message: %o', evt);
    return;
  }
  onMessageReceived(message);
}

function shouldProcessIncomingMessage(messageSource: Window, messageOrigin: string): boolean {
  // Reject messages if they are not from the top window
  if (messageSource && messageSource !== window.top) {
    console.log('Should not process message because it is not coming from the top window');
    return false;
  }

  // Check if messageOrigin matches storedTopOrigin
  if (messageOrigin === storedTopOrigin) {
    try {
      console.log(messageOrigin);
      return new URL(messageOrigin).protocol === 'https:';
    } catch (error) {
      console.error('Invalid message origin URL:', error);
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
    monotonicTimestamp: timestamp,
    args: [],
    data,
  };
}

/**
 * Generates a unique ID for authentication requests.
 * @returns A randomly generated unique string.
 */
function generateUniqueId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11);
}
