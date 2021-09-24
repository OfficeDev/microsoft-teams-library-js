import * as microsoftTeams1 from '../src/public/publicAPIs';
import { ExtendedWindow, MessageRequest, MessageResponse, DOMMessageEvent } from '../src/internal/interfaces';
import { GlobalVars } from '../src/internal/globalVars';
import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';

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
      addEventListener: function (type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {
      },
      removeEventListener: function (type: string, listener: (ev: MessageEvent) => void, useCapture?: boolean): void {
      },
      nativeInterface : {
        framelessPostMessage: function(message: string): void {
          let msg = JSON.parse(message);
          that.messages.push(msg);
        },
      },
      location: {
        origin: that.tabOrigin,
        href: that.validOrigin,
        assign: function (url: string): void {
          return;
        },
      }
    };
    this.mockWindow.self = this.mockWindow as ExtendedWindow;
  }

  public initializeWithContext = (frameContext: string, hostClientType?: string, callback?: () => void, validMessageOrigins?: string[]): void => {
    microsoftTeams1._initialize(this.mockWindow);
    microsoftTeams1.initialize(callback, validMessageOrigins);
    expect(GlobalVars.isFramelessWindow).toBeTruthy();
    const initMessage = this.findMessageByFunc('initialize');
    expect(initMessage).not.toBeNull();
    this.respondToInitMessage(initMessage, frameContext, hostClientType);
    expect(GlobalVars.clientSupportedSDKVersion).toEqual(defaultSDKVersionForCompatCheck);
  };

  /**
   * To be called after initializeWithContext to set the clientSupportedSDKVersion
   */
  public setClientSupportedSDKVersion = (version: string) => {
    GlobalVars.clientSupportedSDKVersion = version;
  }

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
    // @ts-ignore: window as ExtendedWindow
    (window as ExtendedWindow).onNativeMessage(domEvent);
  };

  public respondToMessage = (event: DOMMessageEvent): void => {
    // @ts-ignore: window as ExtendedWindow
    (window as ExtendedWindow).onNativeMessage(event);
  }
}