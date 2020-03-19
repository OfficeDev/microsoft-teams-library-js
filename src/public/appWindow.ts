import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { frameContexts } from '../internal/constants';
import { getGenericOnCompleteHandler } from '../internal/utils';

export interface IAppWindow {
  postMessage(message): void;
  addEventListener(type: string, listener: Function): void;
}

export class ChildAppWindow implements IAppWindow {
  public postMessage(message: any, onComplete?: (status: boolean, reason?: string) => void): void {
    ensureInitialized();
    const messageId = sendMessageRequestToParent('messageForChild', [message]);
    GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      GlobalVars.handlers['messageForParent'] = listener;
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
    ensureInitialized(frameContexts.task);
    const messageId = sendMessageRequestToParent('messageForParent', [message]);

    GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
  }

  public addEventListener(type: string, listener: (message: any) => void): void {
    if (type === 'message') {
      GlobalVars.handlers['messageForChild'] = listener;
    }
  }
}
