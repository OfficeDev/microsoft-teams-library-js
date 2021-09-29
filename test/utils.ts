import * as microsoftTeams1 from '../src/public/publicAPIs';
import { GlobalVars } from '../src/internal/globalVars';
import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';
import { DOMMessageEvent, ExtendedWindow } from '../src/internal/interfaces';
export interface MessageRequest {
  id: number;
  func: string;
  args?: any[]; // tslint:disable-line:no-any
  timestamp?: number;
  isPartialResponse?: boolean;
}

export interface MessageResponse {
  id: number;
  args?: any[]; // tslint:disable-line:no-any
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
    let that = this;
    this.messages = [];
    this.childMessages = [];

    this.parentWindow = {
      postMessage: function(message: MessageRequest, targetOrigin: string): void {
        if (message.func === 'initialize') {
          expect(targetOrigin).toEqual('*');
        } else {
          expect(targetOrigin).toEqual(that.validOrigin);
        }
        that.messages.push(message);
      },
    } as Window;

    this.mockWindow = {
      outerWidth: 1024,
      outerHeight: 768,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {
        if (type === 'message') {
          that.processMessage = listener;
        }
      },
      removeEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {
        if (type === 'message') {
          that.processMessage = null;
        }
      },
      location: {
        origin: that.tabOrigin,
        href: that.validOrigin,
        assign: function(url: string): void {
          return;
        },
      },
      parent: this.parentWindow,
      nativeInterface: {
        framelessPostMessage: function(message: string): void {
          that.messages.push(JSON.parse(message));
        },
      },
      self: null as Window,
      open: function(url: string, name: string, specs: string): Window {
        return that.childWindow as Window;
      },
      close: function(): void {
        return;
      },
      setInterval: (handler: Function, timeout: number): number => setInterval(handler, timeout),
    };
    this.mockWindow.self = this.mockWindow as Window;

    this.childWindow = {
      postMessage: function(message: MessageRequest, targetOrigin: string): void {
        that.childMessages.push(message);
      },
      close: function(): void {
        return;
      },
      closed: false,
    };
  }

  public processMessage: (ev: MessageEvent) => void;

  public initializeWithContext = (
    frameContext: string,
    hostClientType?: string,
    callback?: () => void,
    validMessageOrigins?: string[],
  ): void => {
    microsoftTeams1._initialize(this.mockWindow);
    microsoftTeams1.initialize(callback, validMessageOrigins);

    const initMessage = this.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    this.respondToMessage(initMessage, frameContext, hostClientType);
    expect(GlobalVars.clientSupportedSDKVersion).toEqual(defaultSDKVersionForCompatCheck);
  };

  public initializeAsFrameless = (callback?: () => void, validMessageOrigins?: string[]): void => {
    this.mockWindow.parent = null;
    microsoftTeams1.initialize(callback, validMessageOrigins);
  };

  public findMessageByFunc = (func: string): MessageRequest => {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].func === func) {
        return this.messages[i];
      }
    }
    return null;
  };

  public findMessageInChildByFunc = (func: string): MessageRequest => {
    if (this.childMessages && this.childMessages.length) {
      for (let i = 0; i < this.childMessages.length; i++) {
        if (this.childMessages[i].func === func) {
          return this.childMessages[i];
        }
      }
    }
    return null;
  };

  // tslint:disable-next-line:no-any
  public respondToMessage = (message: MessageRequest, ...args: any[]): void => {
    this.processMessage({
      origin: this.validOrigin,
      source: this.mockWindow.parent,
      data: {
        id: message.id,
        args: args,
      } as MessageResponse,
    } as MessageEvent);
  };

  public respondToNativeMessage = (message: MessageRequest, isPartialResponse: boolean, ...args: any[]): void => {
    // @ts-ignore: window as ExtendedWindow
    (window as ExtendedWindow).onNativeMessage({
      data: {
        id: message.id,
        args: args,
        isPartialResponse,
      } as MessageResponse,
    } as DOMMessageEvent);
  };

  // tslint:disable-next-line:no-any
  public sendMessage = (func: string, ...args: any[]): void => {
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
  public setClientSupportedSDKVersion = (version: string) => {
    GlobalVars.clientSupportedSDKVersion = version;
  };
}
