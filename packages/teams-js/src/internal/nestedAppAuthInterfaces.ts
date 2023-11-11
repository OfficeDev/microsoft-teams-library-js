import { MessageRequestWithRequiredProperties } from './messageObjects';

/**
 * @hidden
 * Interface for a nested app authentication request.
 *
 * @interface
 * @extends {MessageRequest}
 *
 * @property {string} func - The function name, should always be 'nestedAppAuthRequest'.
 * @property {string} data - data associated with the request, represented as a string.
 */
export interface NestedAppAuthRequest extends MessageRequestWithRequiredProperties {
  func: 'nestedAppAuthRequest';
  data: string;
}

/**
 *
 * @hidden
 * Interface for a nested app authentication bridge.
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
 * @interface
 * @extends {Window}
 *
 * @property {NestedAppAuthBridge} nestedAppAuthBridge - The nested app authentication bridge associated with the window.
 */
export interface NestedAuthExtendedWindow extends Window {
  nestedAppAuthBridge: NestedAppAuthBridge;
}
