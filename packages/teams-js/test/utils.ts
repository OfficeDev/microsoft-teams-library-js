import { validOriginsFallback as validOrigins } from '../src/internal/constants';
import { defaultSDKVersionForCompatCheck } from '../src/internal/constants';
import { GlobalVars } from '../src/internal/globalVars';
import { DOMMessageEvent, ExtendedWindow } from '../src/internal/interfaces';
import { MessageID, MessageResponse, MessageUUID, SerializedMessageRequest } from '../src/internal/messageObjects';
import { NestedAppAuthRequest } from '../src/internal/nestedAppAuthUtils';
import { HostClientType } from '../src/public';
import { app } from '../src/public/app';
import { applyRuntimeConfig, IBaseRuntime, setUnitializedRuntime } from '../src/public/runtime';

export interface MessageRequest {
  id?: MessageID;
  func: string;
  uuid?: MessageUUID;
  args?: unknown[];
  timestamp?: number;
  isPartialResponse?: boolean;
}

function deserializeMessageRequest(serializedMessage: SerializedMessageRequest): MessageRequest {
  const message = {
    ...serializedMessage,
    uuid: serializedMessage.uuid ? new MessageUUID(serializedMessage.uuid) : undefined,
  };
  return message;
}

function getMessageUUIDString(message: MessageRequest): string | undefined {
  const messageUuid = message.uuid ? message.uuid.getUuidValue() : undefined;
  return messageUuid;
}

export class Utils {
  public tabOrigin = 'https://example.com';

  public validOrigin = 'https://teams.microsoft.com';

  public mockWindow;

  // A list of this.messages the library sends to the app.
  public messages: MessageRequest[] = [];

  // A list of this.messages the library sends to the top window.
  public topMessages: MessageRequest[] = [];

  // A list of this.messages the library sends to the auth popup.
  public childMessages: MessageRequest[] = [];

  public childWindow;
  public parentWindow: Window;
  public topWindow: Window;

  public constructor() {
    this.messages = [];
    this.childMessages = [];

    this.parentWindow = {
      postMessage: (serializedMessage: SerializedMessageRequest, targetOrigin: string): void => {
        if (serializedMessage.func === 'initialize' && targetOrigin !== '*') {
          throw new Error('initialize messages to parent window must have a targetOrigin of *');
        } else if (serializedMessage.func !== 'initialize' && targetOrigin !== this.validOrigin) {
          throw new Error(`messages to parent window must have a targetOrigin of ${this.validOrigin}`);
        }
        const message: MessageRequest = deserializeMessageRequest(serializedMessage);

        this.messages.push(message);
      },
    } as Window;

    this.topWindow = {
      postMessage: (serializedMessage: SerializedMessageRequest, targetOrigin: string): void => {
        if (serializedMessage.func === 'initialize' && targetOrigin !== '*') {
          throw new Error('initialize messages to parent window must have a targetOrigin of *');
        } else if (serializedMessage.func !== 'initialize' && targetOrigin !== this.validOrigin) {
          throw new Error(`messages to parent window must have a targetOrigin of ${this.validOrigin}`);
        }
        const message: MessageRequest = deserializeMessageRequest(serializedMessage);
        this.topMessages.push(message);
      },
    } as Window;

    this.mockWindow = {
      outerWidth: 1024,
      outerHeight: 768,
      screenLeft: 0,
      screenTop: 0,
      addEventListener: (type: string, listener: (ev: MessageEvent) => Promise<void>): void => {
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
      top: this.parentWindow,
      opener: undefined,
      nativeInterface: {
        framelessPostMessage: (serializedMessage: string): void => {
          const parsedMessage: SerializedMessageRequest = JSON.parse(serializedMessage);
          const message: MessageRequest = deserializeMessageRequest(parsedMessage);
          this.messages.push(message);
        },
      },
      self: null as unknown as Window,
      open: (): Window => {
        return this.childWindow as Window;
      },
      close: function (): void {
        return;
      },
      /* For setInterval, we are intentionally not allowing the TimerHandler type since it allows for either Function or string and string
         would be insecure (it would be tantamount to allowing eval, which is insecure and not needed here). For our testing usage, there's
         no need to allow strings.
         We then are intentionally using Function (and not something more specific) since setInterval can use accept any type of function
         and we are intentionally mocking the standard setInterval behavior here. As such, the ban-types rule is being intentionally disabled here. */
      /* eslint-disable-next-line @typescript-eslint/ban-types */
      setInterval: (handler: Function, timeout: number): number => setInterval(handler, timeout),
    };
    this.mockWindow.self = this.mockWindow as Window;

    this.childWindow = {
      postMessage: (serializedMessage: SerializedMessageRequest): void => {
        const message: MessageRequest = deserializeMessageRequest(serializedMessage);
        this.childMessages.push(message);
      },
      close: function (): void {
        return;
      },
      closed: false,
    };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        ok: true,
        json: async () => {
          return { validOrigins };
        },
      } as Response),
    );
  }

  public processMessage: null | ((ev: MessageEvent) => Promise<void>);

  public initializeWithContext = async (
    frameContext: string,
    hostClientType: string = HostClientType.web,
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

  /**
   * This function is used to find a message by function name.
   * @param {string} func - The name of the function.
   * @param {number | undefined} k - There could be multiple functions with that name,
   * use this as a zero-based index to return the kth one. Default is 0, will return the first match.
   * @returns {MessageRequest | null} The found message.
   */
  public findMessageByFunc = (func: string, k = 0): MessageRequest | null => {
    let countOfMatchedMessages = 0;
    for (const message of this.messages) {
      if (message.func === func) {
        if (countOfMatchedMessages === k) {
          return message;
        }
        countOfMatchedMessages++;
      }
    }
    return null;
  };

  /**
   * This function is used to find a message by the action name provided to the send* functions. Usually the action name is the
   * name of the function being called..
   * @param actionName - The action name used in the sent message
   * @param k - In the case where you expect there are multiple messages sent with the same action name,
   * use this as a zero-based index to return the kth one. Default is 0 (will return the first match).
   * @returns {MessageRequest} The found message
   * @throws {Error} If the message is not found
   */
  public findMessageByActionName(actionName: string, k: number = 0): MessageRequest {
    const message = this.findMessageByFunc(actionName, k);
    if (!message) {
      throw new Error(`Message with action name ${actionName} not found`);
    }

    return message;
  }

  public findInitializeMessageOrThrow = (): MessageRequest => {
    const initMessage = this.findMessageByFunc('initialize');
    if (!initMessage) {
      throw new Error('initialize message not found');
    }
    return initMessage;
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

  public respondToMessage = async (
    message: MessageRequest | NestedAppAuthRequest,
    ...args: unknown[]
  ): Promise<void> => {
    return this.respondToMessageWithPorts(message, args);
  };

  public respondToMessageWithPorts = async (
    message: MessageRequest | NestedAppAuthRequest,
    args: unknown[] = [],
    ports: MessagePort[] = [],
  ): Promise<void> => {
    if (this.processMessage === null) {
      throw Error(
        `Cannot respond to message ${message.id} because processMessage function has not been set and is null`,
      );
    } else if (this.processMessage === undefined) {
      const domEvent = {
        data: {
          id: message.id,
          uuid: getMessageUUIDString(message),
          args: args,
        } as MessageResponse,
        ports,
      } as DOMMessageEvent;
      (this.mockWindow as unknown as ExtendedWindow).onNativeMessage(domEvent);
    } else {
      await this.processMessage({
        origin: this.validOrigin,
        source: this.mockWindow.parent,
        data: {
          id: message.id,
          uuid: getMessageUUIDString(message),
          args: args,
        } as MessageResponse,
        ports,
      } as unknown as MessageEvent);
    }
  };

  public respondToMessageAsOpener = async (message: MessageRequest, ...args: unknown[]): Promise<void> => {
    if (this.processMessage === null) {
      throw Error(
        `Cannot respond to message ${message.id} because processMessage function has not been set and is null`,
      );
    }

    await this.processMessage({
      origin: this.validOrigin,
      source: this.mockWindow.opener,
      data: {
        id: message.id,
        uuid: getMessageUUIDString(message),
        args: args,
      } as MessageResponse,
    } as MessageEvent);
  };

  public respondToNativeMessage = (message: MessageRequest, isPartialResponse: boolean, ...args: unknown[]): void => {
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage({
      data: {
        id: message.id,
        uuid: getMessageUUIDString(message),
        args: args,
        isPartialResponse,
      } as MessageResponse,
    } as DOMMessageEvent);
  };

  public respondToNativeMessageWithPorts = (
    message: MessageRequest,
    isPartialResponse: boolean,
    args: unknown[],
    ports: MessagePort[],
  ): void => {
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage({
      data: {
        id: message.id,
        uuid: getMessageUUIDString(message),
        args: args,
        isPartialResponse,
      } as MessageResponse,
      ports,
    } as DOMMessageEvent);
  };

  public sendMessage = async (func: string, ...args: unknown[]): Promise<void> => {
    if (this.processMessage === null) {
      throw Error(
        `Cannot send message calling function ${func} because processMessage function has not been set and is null`,
      );
    }

    await this.processMessage({
      origin: this.validOrigin,
      source: this.mockWindow.parent,
      data: {
        func: func,
        args: args,
      },
    } as MessageEvent);
  };

  public respondToFramelessMessage = (event: DOMMessageEvent): void => {
    (this.mockWindow as unknown as ExtendedWindow).onNativeMessage(event);
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
  public setRuntimeConfig = (runtimeConfig: IBaseRuntime): void => {
    applyRuntimeConfig(runtimeConfig);
  };

  /**
   * Sets runtime to uninitialized state
   */
  public uninitializeRuntimeConfig = (): void => {
    setUnitializedRuntime();
  };

  /**
   * Uses setImmediate to wait for all resolved Promises on the chain to finish executing.
   * @returns A Promise that will be fulfilled when all other Promises have cleared from the microtask queue.
   */
  public flushPromises = (): Promise<number> => new Promise((resolve) => setTimeout(resolve));
}
