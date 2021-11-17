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
   * @param message - The message to send
   * @returns Promise that will be fulfilled when the AppWindow posts back a response
   */
  postMessage(message: any): Promise<void>;
  /**
   * @deprecated As of 2.0.0-beta.1. Please use {@link IAppWindow.postMessage IAppWindow.postMessage(message: any): Promise\<void\>} instead.
   * @param message - The message to send
   * @param onComplete - The deprecated way of invoking a callback to know if the postMessage has been success/failed.
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
   * Send a message to the AppWindow.
   * @param message - The message to send
   * @returns Promise that will be fulfilled when the AppWindow posts back a response
   */
  public postMessage(message: any): Promise<void>;
  /**
   * @deprecated As of 2.0.0-beta.1. Please use {@link ChildAppWindow.postMessage ChildAppWindow.postMessage(message: any): Promise\<void\>} instead.
   * @param message - The message to send
   * @param onComplete - The deprecated way of invoking a callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete: (status: boolean, reason?: string) => void): void;
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): Promise<void> {
    ensureInitialized();
    return this.postMessageHelper(message)
      .then(() => {
        if (onComplete) {
          onComplete(true);
        }
      })
      .catch((err: Error) => {
        if (onComplete) {
          onComplete(false, err.message);
          return;
        }
        throw err;
      });
  }
  public postMessageHelper(message: any): Promise<void> {
    return new Promise<void>(resolve => {
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

  /**
   * Send a message to the AppWindow.
   * @param message - The message to send
   * @returns Promise that will be fulfilled when the AppWindow posts back a response
   */
  public postMessage(message: any): Promise<void>;
  /**
   * @deprecated As of 2.0.0-beta.1. Please use {@link ParentAppWindow.postMessage ParentAppWindow.postMessage(message: any): Promise\<void\>} instead.
   * @param message - The message to send
   * @param onComplete - The deprecated way of invoking a callback to know if the postMessage has been success/failed.
   */
  public postMessage(message: any, onComplete: (status: boolean, reason?: string) => void): void;
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): Promise<void> {
    ensureInitialized(FrameContexts.task);
    return this.postMessageHelper(message)
      .then(() => {
        if (onComplete) {
          onComplete(true);
        }
      })
      .catch((err: Error) => {
        if (onComplete) {
          onComplete(false, err.message);
          return;
        }
        throw err;
      });
  }
  public postMessageHelper(message: any): Promise<void> {
    return new Promise<void>(resolve => {
      resolve(send('messageForParent', message));
    });
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      registerHandler('messageForChild', listener);
    }
  }
}
