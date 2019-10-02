import * as microsoftTeams1 from '../src/public/publicAPIs';
export interface MessageRequest {
  id: number;
  func: string;
  args?: any[]; // tslint:disable-line:no-any
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

  public constructor() {
    let that = this;
    this.messages = [];
    this.childMessages = [];
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
      parent: {
        postMessage: function(message: MessageRequest, targetOrigin: string): void {
          if (message.func === 'initialize') {
            expect(targetOrigin).toEqual('*');
          } else {
            expect(targetOrigin).toEqual(that.validOrigin);
          }
          that.messages.push(message);
        },
      } as Window,
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

  public initializeWithContext = (frameContext: string, hostClientType?: string): void => {
    microsoftTeams1._initialize(this.mockWindow);
    microsoftTeams1.initialize();

    const initMessage = this.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();

    this.respondToMessage(initMessage, frameContext, hostClientType);
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
    if(this.childMessages && this.childMessages.length){
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
}
