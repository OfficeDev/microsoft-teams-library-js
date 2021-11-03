/**
 * @privateRemarks
 * Hide from docs
 * Shim in definitions used for browser-compat
 *
 * @internal
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DOMMessageEvent {
  origin?: any;
  source?: any;
  data?: any;
  // Needed for Chrome1964
  originalEvent: DOMMessageEvent;
}

/**
 * @privateRemarks
 * Hide from docs
 *
 * @internal
 */
export interface TeamsNativeClient {
  framelessPostMessage(msg: string): void;
}

/**
 * @privateRemarks
 * Hide from docs
 *
 * @internal
 */
export interface ExtendedWindow extends Window {
  nativeInterface: TeamsNativeClient;
  onNativeMessage(evt: DOMMessageEvent): void;
}

/** @internal */
export interface MessageRequest {
  id?: number;
  func: string;
  timestamp?: number;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough to postMessage where we do allow any[]
}

/** @internal */
export interface MessageResponse {
  id: number;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough from OnMessage where we do receive any[]
  isPartialResponse?: boolean; // If the message is partial, then there will be more future responses for the given message ID.
}

/**
 * @privateRemarks
 * Meant for Message objects that are sent to children without id
 *
 * @internal
 */
export interface DOMMessageEvent {
  func: string;
  args?: any[]; // tslint:disable-line:no-any The args here are a passthrough to postMessage where we do allow any[]
}
