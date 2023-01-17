import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';
import { GlobalVars } from '../src/internal/globalVars';
import { DOMMessageEvent, ExtendedWindow, MessageRequest, MessageResponse } from '../src/internal/interfaces';
import { app } from '../src/public/app';
import { applyRuntimeConfig, IBaseRuntime, setUnitializedRuntime } from '../src/public/runtime';

export class FramelessPostMocks {
  public tabOrigin = 'https://example.com';

  public validOrigin = 'https://teams.microsoft.com';

  public mockWindow;

  // A list of framelessPostMessages
  public messages: MessageRequest[] = [];

  public constructor() {
    this.messages = [];
    this.mockWindow = {
      outerWidth: 1024,
      outerHeight: 768,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: (): void => {
        /* mock does not support event listeners */
      },
      removeEventListener: (): void => {
        /* mock does not support event listeners */
      },
      nativeInterface: {
        framelessPostMessage: (message: string): void => {
          const msg = JSON.parse(message);
          this.messages.push(msg);
        },
      },
      location: {
        origin: this.tabOrigin,
        href: this.validOrigin,
        assign: function (): void {
          return;
        },
      },
      /* For setInterval, we are intentionally not allowing the TimerHandler type since it allows for either Function or string and string
         would be insecure (it would be tantamount to allowing eval, which is insecure and not needed here). For our testing usage, there's
         no need to allow strings.
         We then are intentionally using Function (and not something more specific) since setInterval can use accept any type of function
         and we are intentionally mocking the standard setInterval behavior here. As such, the ban-types rule is being intentionally disabled here. */
      /* eslint-disable-next-line @typescript-eslint/ban-types */
      setInterval: (handler: Function, timeout?: number, ...args: unknown[]): number =>
        setInterval(handler, timeout, args),
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
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */ /* If initMessage is null it will fail the expect call, so it's okay to just assume it's not */
    const initMessage: MessageRequest = this.findMessageByFunc('initialize')!;
    expect(initMessage).not.toBeNull();
    this.respondToInitMessage(initMessage, frameContext, hostClientType);
    await initPromise;
    expect(GlobalVars.clientSupportedSDKVersion).toEqual(defaultSDKVersionForCompatCheck);
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
  public setRuntimeConfig = (runtime: IBaseRuntime): void => {
    applyRuntimeConfig(runtime);
  };

  /**
   * To be called to reset runtime config to unitialized state
   */
  public uninitializeRuntimeConfig = (): void => {
    setUnitializedRuntime();
  };

  public findMessageByFunc = (func: string): MessageRequest | null => {
    for (let i = 0; i < this.messages.length; i++) {
      if (this.messages[i].func === func) {
        return this.messages[i];
      }
    }
    return null;
  };

  private respondToInitMessage = (message: MessageRequest, ...args: unknown[]): void => {
    const domEvent = {
      data: {
        id: message.id,
        args: args,
      } as MessageResponse,
    } as DOMMessageEvent;
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage(domEvent);
  };

  public respondToMessage = (event: DOMMessageEvent): void => {
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage(event);
  };
}
