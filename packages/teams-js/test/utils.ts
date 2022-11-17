import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';
import { GlobalVars } from '../src/internal/globalVars';
import { DOMMessageEvent, ExtendedWindow, MessageResponse } from '../src/internal/interfaces';
import { app } from '../src/public/app';
import { applyRuntimeConfig, IRuntime } from '../src/public/runtime';

export interface MessageRequest {
  id: number;
  func: string;
  args?: unknown[];
  timestamp?: number;
  isPartialResponse?: boolean;
}

export class Utils {
  public tabOrigin = 'https://example.com';

  public validOrigin = 'https://teams.microsoft.com';

  public mockWindow;

  // A list of this.messages the library sends to the app.
  public messages: MessageRequest[] = [];

  // A list of this.messages the library sends to the auth popup.
  public childMessages: MessageRequest[] = [];

  public childWindow;
  public parentWindow: Window;

  public constructor() {
    this.messages = [];
    this.childMessages = [];

    this.parentWindow = {
      postMessage: (message: MessageRequest, targetOrigin: string): void => {
        if (message.func === 'initialize' && targetOrigin !== '*') {
          throw new Error('initialize messages to parent window must have a targetOrigin of *');
        } else if (message.func !== 'initialize' && targetOrigin !== this.validOrigin) {
          throw new Error(`messages to parent window must have a targetOrigin of ${this.validOrigin}`);
        }
        this.messages.push(message);
      },
    } as Window;

    this.mockWindow = {
      outerWidth: 1024,
      outerHeight: 768,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: (type: string, listener: (ev: MessageEvent) => void): void => {
        if (type === 'message') {
          this.processMessage = listener;
        }
      },
      removeEventListener: (type: string): void => {
        if (type === 'message') {
          this.processMessage = null;
        }
      },
      location: {
        origin: this.tabOrigin,
        href: this.validOrigin,
        assign: function (): void {
          return;
        },
      },
      parent: this.parentWindow,
      nativeInterface: {
        framelessPostMessage: (message: string): void => {
          this.messages.push(JSON.parse(message));
        },
      },
      self: null as unknown as Window,
      open: (): Window => {
        return this.childWindow as Window;
      },
      close: function (): void {
        return;
      },
      setInterval: (handler: TimerHandler, timeout: number): number => setInterval(handler, timeout),
    };
    this.mockWindow.self = this.mockWindow as Window;

    this.childWindow = {
      postMessage: (message: MessageRequest): void => {
        this.childMessages.push(message);
      },
      close: function (): void {
        return;
      },
      closed: false,
    };
  }

  public processMessage: null | ((ev: MessageEvent) => void);

  public initializeWithContext = async (
    frameContext: string,
    hostClientType?: string,
    validMessageOrigins?: string[],
  ): Promise<void> => {
    app._initialize(this.mockWindow);
    const promise = app.initialize(validMessageOrigins);

    const initMessage = this.findMessageByFunc('initialize');
    if (initMessage === null) {
      throw new Error('initMessage must not be null');
    }

    this.respondToMessage(initMessage, frameContext, hostClientType);
    await promise;
    if (GlobalVars.clientSupportedSDKVersion !== defaultSDKVersionForCompatCheck) {
      throw new Error(
        `clientSupportedSDKVersion(${GlobalVars.clientSupportedSDKVersion}) and defaultSDKVersionForCompatCheck (${defaultSDKVersionForCompatCheck}) do not match`,
      );
    }
  };

  public initializeAsFrameless = (validMessageOrigins?: string[]): Promise<void> => {
    this.mockWindow.parent = null;
    return app.initialize(validMessageOrigins);
  };

  public findMessageByFunc = (func: string): MessageRequest | null => {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].func === func) {
        return this.messages[i];
      }
    }
    return null;
  };

  public findMessageInChildByFunc = (func: string): MessageRequest | null => {
    if (this.childMessages && this.childMessages.length) {
      for (let i = 0; i < this.childMessages.length; i++) {
        if (this.childMessages[i].func === func) {
          return this.childMessages[i];
        }
      }
    }
    return null;
  };

  public respondToMessage = (message: MessageRequest, ...args: unknown[]): void => {
    if (this.processMessage === null) {
      throw Error(
        `Cannot respond to message ${message.id} because processMessage function has not been set and is null`,
      );
    }

    this.processMessage({
      origin: this.validOrigin,
      source: this.mockWindow.parent,
      data: {
        id: message.id,
        args: args,
      } as MessageResponse,
    } as MessageEvent);
  };

  public respondToNativeMessage = (message: MessageRequest, isPartialResponse: boolean, ...args: unknown[]): void => {
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage({
      data: {
        id: message.id,
        args: args,
        isPartialResponse,
      } as MessageResponse,
    } as DOMMessageEvent);
  };

  public sendMessage = (func: string, ...args: unknown[]): void => {
    if (this.processMessage === null) {
      throw Error(
        `Cannot send message calling function ${func} because processMessage function has not been set and is null`,
      );
    }

    this.processMessage({
      origin: this.validOrigin,
      source: this.mockWindow.parent,
      data: {
        func: func,
        args: args,
      },
    } as MessageEvent);
  };

  /**
   * To be called after initializeWithContext to set the clientSupportedSDKVersion
   */
  public setClientSupportedSDKVersion = (version: string): void => {
    GlobalVars.clientSupportedSDKVersion = version;
  };

  /**
   * To be called after initializeWithContext to set the runtimeConfig
   */
  public setRuntimeConfig = (runtime: IRuntime): void => {
    applyRuntimeConfig(runtime);
  };

  /**
   * Uses setImmediate to wait for all resolved Promises on the chain to finish executing.
   * @returns A Promise that will be fulfilled when all other Promises have cleared from the microtask queue.
   */
  public flushPromises = (): Promise<number> => new Promise((resolve) => setTimeout(resolve));
}
