/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { sendAndHandleStatusAndReason as send } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';

/**
 * @alpha
 */
export interface IAppWindow {
  /**
   * Send a message to the AppWindow.
   *
   * @param message - The message to send
   * @returns Promise that will be fulfilled when the AppWindow posts back a response
   */
  postMessage(message): Promise<void>;

  /**
   * Add a listener that will be called when an event is received from this AppWindow.
   *
   * @param type - The event to listen to. Currently the only supported type is 'message'.
   * @param listener - The listener that will be called
   */
  addEventListener(type: string, listener: Function): void;
}

export class ChildAppWindow implements IAppWindow {
  public postMessage(message: any): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized();
      resolve(send('messageForChild', message));
    });
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
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

  public postMessage(message: any): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.task);
      resolve(send('messageForParent', message));
    });
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      registerHandler('messageForChild', listener);
    }
  }
}
