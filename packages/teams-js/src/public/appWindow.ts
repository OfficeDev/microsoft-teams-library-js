/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';

export interface IAppWindow {
  /**
   * Send a message to the AppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void;

  /**
   * Add a listener that will be called when an event is received from this AppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  addEventListener(type: string, listener: Function): void;
}

export class ChildAppWindow implements IAppWindow {
  /**
   * Send a message to the ChildAppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void {
    ensureInitialized();
    sendMessageToParent('messageForChild', [message], onComplete ? onComplete : getGenericOnCompleteHandler());
  }
  /**
   * Add a listener that will be called when an event is received from the ChildAppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  public addEventListener(type: string, listener: (message: any) => void): void {
    ensureInitialized();
    if (type === 'message') {
      registerHandler('messageForParent', listener);
    }
  }
}

export class ParentAppWindow implements IAppWindow {
  private static _instance: ParentAppWindow;
  public static get Instance(): IAppWindow {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  /**
   * Send a message to the ParentAppWindow.
   *
   * @param message - The message to send
   * @param onComplete - The callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void {
    ensureInitialized(FrameContexts.task);
    sendMessageToParent('messageForParent', [message], onComplete ? onComplete : getGenericOnCompleteHandler());
  }

  /**
   * Add a listener that will be called when an event is received from the ParentAppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  public addEventListener(type: string, listener: (message: any) => void): void {
    ensureInitialized(FrameContexts.task);
    if (type === 'message') {
      registerHandler('messageForChild', listener);
    }
  }
}
