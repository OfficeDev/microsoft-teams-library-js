import { generateGUID, validateUuid } from './utils';

/**
 * @hidden
 * Hide from docs
 * Shim in definitions used for browser-compat
 *
 * @internal
 * Limited to Microsoft-internal use
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DOMMessageEvent {
  origin?: any;
  source?: any;
  data?: any;
  ports?: any;
  // Needed for Chrome1964
  originalEvent: DOMMessageEvent;
}

/**
 * @hidden
 * Hide from docs
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamsNativeClient {
  framelessPostMessage(msg: string): void;
}

/**
 * @hidden
 * Hide from docs
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ExtendedWindow extends Window {
  nativeInterface: TeamsNativeClient;
  onNativeMessage(evt: DOMMessageEvent): void;
}

/**
 * @hidden
 * Meant for Message objects that are sent to children without id
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface DOMMessageEvent {
  func: string;
  args?: any[];
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * UUID object
 */
export class UUID {
  public constructor(private readonly uuid: string = generateGUID()) {
    validateUuid(uuid);
  }

  public toString(): string {
    return this.uuid;
  }
}
