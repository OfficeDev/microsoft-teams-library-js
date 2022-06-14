import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';
import { GlobalVars } from '../src/internal/globalVars';
import { DOMMessageEvent, ExtendedWindow, MessageRequest, MessageResponse } from '../src/internal/interfaces';
import { app } from '../src/public/app';

export class FramelessPostMocks {
  public tabOrigin = 'https://example.com';

  public validOrigin = 'https://teams.microsoft.com';

  public mockWindow;

  // A list of framelessPostMessages
  public messages: MessageRequest[] = [];

  public constructor() {
    let that = this;
    this.messages = [];
    this.mockWindow = {
      outerWidth: 1024,
      outerHeight: 768,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {},
      removeEventListener: function(type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {},
      nativeInterface: {
        framelessPostMessage: function(message: string): void {
          let msg = JSON.parse(message);
          that.messages.push(msg);
        },
      },
      location: {
        origin: that.tabOrigin,
        href: that.validOrigin,
        assign: function(url: string): void {
          return;
        },
      },
      setInterval: (handler: Function, timeout: number): number => setInterval(handler, timeout),
    };
    this.mockWindow.self = this.mockWindow as ExtendedWindow;
  }

  public initializeWithContext = async (
    frameContext: string,
    hostClientType?: string,
    validMessageOrigins?: string[],
  ): Promise<void> => {
    app._initialize(this.mockWindow);
    const initPromise = app.initialize(validMessageOrigins);
    expect(GlobalVars.isFramelessWindow).toBeTruthy();
    const initMessage = this.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    this.respondToInitMessage(initMessage, frameContext, hostClientType);
    await initPromise;
    expect(GlobalVars.clientSupportedSDKVersion).toEqual(defaultSDKVersionForCompatCheck);
  };

  /**
   * To be called after initializeWithContext to set the clientSupportedSDKVersion
   */
  public setClientSupportedSDKVersion = (version: string) => {
    GlobalVars.clientSupportedSDKVersion = version;
  };

  public findMessageByFunc = (func: string): MessageRequest => {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].func === func) {
        return this.messages[i];
      }
    }
    return null;
  };

  // tslint:disable-next-line:no-any
  private respondToInitMessage = (message: MessageRequest, ...args: any[]): void => {
    let domEvent = {
      data: {
        id: message.id,
        args: args,
      } as MessageResponse,
    } as DOMMessageEvent;
    ((this.mockWindow as unknown) as ExtendedWindow).onNativeMessage(domEvent);
  };

  public respondToMessage = (event: DOMMessageEvent): void => {
    ((this.mockWindow as unknown) as ExtendedWindow).onNativeMessage(event);
  };
}
