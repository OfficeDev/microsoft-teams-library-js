/**
 * @private
 * Hide from docs
 * Shim in definitions used for browser-compat
 */
export interface DOMMessageEvent {
  origin?: any;
  source?: any;
  data?: any;
  // Needed for Chrome1964
  originalEvent: DOMMessageEvent;
}

/**
 * @private
 * Hide from docs
 */
export interface TeamsNativeClient {
  framelessPostMessage(msg: string): void;
}

/**
 * @private
 * Hide from docs
 */
export interface ExtendedWindow extends Window {
  nativeInterface: TeamsNativeClient;
  onNativeMessage(evt: DOMMessageEvent): void;
}

export interface MessageRequest {
  id?: number;
  func: string;
  timestamp?: number;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough to postMessage where we do allow any[]
}

export interface MessageResponse {
  id: number;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough from OnMessage where we do receive any[]
  isPartialResponse?: boolean; // If the message is partial, then there will be more future responses for the given message ID.
}

/**
 * Meant for Message objects that are sent to children without id
 */
export interface DOMMessageEvent {
  func: string;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough to postMessage where we do allow any[]
}
