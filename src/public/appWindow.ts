import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { Communication } from '../internal/communication';

export interface IAppWindow {
  postMessage(message): void;
  addEventListener(type: string, listener: Function): void;
}

export class ChildAppWindow implements IAppWindow {
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void {
    ensureInitialized();
    Communication.sendMessageToParent(
      'messageForChild',
      [message],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      Communication.handlers['messageForParent'] = listener;
    }
  }
}

export class ParentAppWindow implements IAppWindow {
  private static _instance: ParentAppWindow;
  public static get Instance(): IAppWindow {
    // Do you need arguments? Make it a regular method instead.
    return this._instance || (this._instance = new this());
  }

  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void {
    ensureInitialized(FrameContexts.task);
    Communication.sendMessageToParent(
      'messageForParent',
      [message],
      onComplete ? onComplete : getGenericOnCompleteHandler(),
    );
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      Communication.handlers['messageForChild'] = listener;
    }
  }
}
