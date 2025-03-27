import { GlobalVars } from './globalVars';
import { MessageRequestWithRequiredProperties } from './messageObjects';
import { getLogger } from './telemetry';

const nestedAppAuthLogger = getLogger('nestedAppAuthUtils');
const tryPolyfillWithNestedAppAuthBridgeLogger = nestedAppAuthLogger.extend('tryPolyfillWithNestedAppAuthBridge');

/**
 * @hidden
 * Enumeration for nested app authentication message event names.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @enum {string}
 *
 * @property {string} Request - Event name for a nested app authentication request.
 * @property {string} Response - Event name for a nested app authentication response.
 */
export const enum NestedAppAuthMessageEventNames {
  Request = 'NestedAppAuthRequest',
  Response = 'NestedAppAuthResponse',
}

/**
 * @hidden
 * Interface for a nested app authentication request.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @interface
 * @extends {MessageRequest}
 *
 * @property {string} func - The function name, should always be 'nestedAppAuthRequest'.
 * @property {string} data - data associated with the request, represented as a string.
 */
export interface NestedAppAuthRequest extends MessageRequestWithRequiredProperties {
  func: 'nestedAppAuth.execute';
  data: string;
}

/**
 * @hidden
 * Interface for parsed data from a nested app authentication message.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @interface
 * @property {NestedAppAuthMessageEventNames} messageType - The type of the nested app authentication message event.
 */
export interface ParsedNestedAppAuthMessageData {
  messageType: NestedAppAuthMessageEventNames;
}

/**
 * @hidden
 * Interface for a nested app authentication bridge.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @interface
 *
 * @property {Function} addEventListener - Function to add an event listener to the bridge. Takes an event name and a callback function as parameters.
 * @property {Function} postMessage - Function to post a message to the bridge. Takes a message string as a parameter.
 * @property {Function} removeEventListener - Function to remove an event listener from the bridge. Takes an event name and a callback function as parameters.
 */
export interface NestedAppAuthBridge {
  addEventListener: (eventName: string, callback: (response: string) => void) => void;
  postMessage: (message: string) => void;
  removeEventListener: (eventName: string, callback: (response: string) => void) => void;
}

/**
 * @hidden
 * Interface for a Window object extended with a nested app authentication bridge.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @interface
 * @extends {Window}
 *
 * @property {NestedAppAuthBridge} nestedAppAuthBridge - The nested app authentication bridge associated with the window.
 */
export interface NestedAuthExtendedWindow extends Window {
  nestedAppAuthBridge: NestedAppAuthBridge;
}

/**
 * @hidden
 * Type for handlers in a nested app authentication bridge.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @typedef {Object} NestedAppAuthBridgeHandlers
 *
 * @property {Function} onMessage - Function to handle a message event. Takes a MessageEvent object and a callback function as parameters. The callback function is called when a message is received.
 * @property {Function} handlePostMessage - Function to handle posting a message. Takes a message string as a parameter.
 */
type NestedAppAuthBridgeHandlers = {
  onMessage: (evt: MessageEvent, onMessageReceived: (response: string) => void) => void;
  sendPostMessage: (message: string) => void;
};

/**
 * @hidden
 * Attempt to polyfill the nestedAppAuthBridge object on the given window
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function tryPolyfillWithNestedAppAuthBridge(
  clientSupportedSDKVersion: string,
  window: Window | null,
  handlers: NestedAppAuthBridgeHandlers,
): void {
  const logger = tryPolyfillWithNestedAppAuthBridgeLogger;

  if (GlobalVars.isFramelessWindow) {
    logger('Cannot polyfill nestedAppAuthBridge as current window is frameless');
    return;
  }

  if (!window) {
    logger('Cannot polyfill nestedAppAuthBridge as current window does not exist');
    return;
  }

  // Skip injection if this is a nested iframe (i.e., not the top-most app)
  if (window.parent !== window.top) {
    logger('Default NAA bridge injection not supported in nested iframe. Use standalone NAA bridge instead.');
    return;
  }

  const parsedClientSupportedSDKVersion = (() => {
    try {
      return JSON.parse(clientSupportedSDKVersion);
    } catch (e) {
      return null;
    }
  })();

  if (!parsedClientSupportedSDKVersion || !parsedClientSupportedSDKVersion.supports?.nestedAppAuth) {
    logger('Cannot polyfill nestedAppAuthBridge as current hub does not support nested app auth');
    return;
  }

  const extendedWindow = window as unknown as NestedAuthExtendedWindow;
  if (extendedWindow.nestedAppAuthBridge) {
    logger('nestedAppAuthBridge already exists on current window, skipping polyfill');
    return;
  }

  const nestedAppAuthBridge = createNestedAppAuthBridge(extendedWindow, handlers);
  if (nestedAppAuthBridge) {
    extendedWindow.nestedAppAuthBridge = nestedAppAuthBridge;
  }
}

const createNestedAppAuthBridgeLogger = nestedAppAuthLogger.extend('createNestedAppAuthBridge');

/**
 * @hidden
 * Creates a bridge for nested app authentication.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @param {Window | null} window - The window object where the nested app authentication bridge will be created. If null, the function will log an error message and return null.
 * @returns {NestedAppAuthBridge | null} Returns an object with methods for adding and removing event listeners, and posting messages. If the provided window is null, returns null.
 *
 * @property {Function} addEventListener - Adds an event listener to the window. Only supports the 'message' event. If an unsupported event is passed, logs an error message.
 * @property {Function} postMessage - Posts a message to the window. The message should be a stringified JSON object with a messageType of 'NestedAppAuthRequest'. If the message does not meet these criteria, logs an error message.
 * @property {Function} removeEventListener - Removes an event listener from the window.
 */
function createNestedAppAuthBridge(
  window: Window | null,
  bridgeHandlers: NestedAppAuthBridgeHandlers,
): NestedAppAuthBridge | null {
  const logger = createNestedAppAuthBridgeLogger;

  if (!window) {
    logger('nestedAppAuthBridge cannot be created as current window does not exist');
    return null;
  }

  const { onMessage, sendPostMessage } = bridgeHandlers;
  const nestedAppAuthBridgeHandler = (callback: (response: string) => void) => (evt: MessageEvent) =>
    onMessage(evt, callback);

  return {
    addEventListener: (eventName, callback): void => {
      if (eventName === 'message') {
        window.addEventListener(eventName, nestedAppAuthBridgeHandler(callback));
      } else {
        logger(`Event ${eventName} is not supported by nestedAppAuthBridge`);
      }
    },
    postMessage: (message: string): void => {
      // Validate that it is a valid auth bridge request message
      const parsedMessage = (() => {
        try {
          return JSON.parse(message);
        } catch (e) {
          return null;
        }
      })();

      if (
        !parsedMessage ||
        typeof parsedMessage !== 'object' ||
        parsedMessage.messageType !== NestedAppAuthMessageEventNames.Request
      ) {
        logger('Unrecognized data format received by app, message being ignored. Message: %o', message);
        return;
      }

      // Post the message to the top window
      sendPostMessage(message);
    },
    removeEventListener: (eventName: string, callback): void => {
      window.removeEventListener(eventName, nestedAppAuthBridgeHandler(callback));
    },
  };
}
