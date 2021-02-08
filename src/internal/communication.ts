import { validOriginRegExp, version } from './constants';
import { GlobalVars } from './globalVars';
import { Handlers } from './handlers';
import { MessageResponse, MessageRequest, ExtendedWindow, DOMMessageEvent } from './interfaces';

export class Communication {
  public static currentWindow: Window | any;
  public static parentOrigin: string;
  public static parentWindow: Window | any;
  public static childWindow: Window;
  public static childOrigin: string;

  private static parentMessageQueue: MessageRequest[] = [];
  private static childMessageQueue: MessageRequest[] = [];
  private static nextMessageId: number = 0;
  private static callbacks: {
    [id: number]: Function;
  } = {};
  private static messageListener: Function;

  public static initialize(callback: Function, validMessageOrigins: string[] | undefined): void {
    // Listen for messages post to our window
    Communication.messageListener = (evt: DOMMessageEvent): void => Communication.processMessage(evt);

    // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
    // it's the window that opened us (i.e., window.opener)
    Communication.currentWindow = Communication.currentWindow || window;
    Communication.parentWindow =
      Communication.currentWindow.parent !== Communication.currentWindow.self
        ? Communication.currentWindow.parent
        : Communication.currentWindow.opener;

    // Listen to messages from the parent or child frame.
    // Frameless windows will only receive this event from child frames and if validMessageOrigins is passed.
    if (Communication.parentWindow || validMessageOrigins) {
      Communication.currentWindow.addEventListener('message', Communication.messageListener, false);
    }

    if (!Communication.parentWindow) {
      GlobalVars.isFramelessWindow = true;
      // @ts-ignore: window as ExtendedWindow
      (window as ExtendedWindow).onNativeMessage = Communication.handleParentMessage;
    }

    try {
      // Send the initialized message to any origin, because at this point we most likely don't know the origin
      // of the parent window, and this message contains no data that could pose a security risk.
      Communication.parentOrigin = '*';
      Communication.sendMessageToParent('initialize', [version], callback);
    } finally {
      Communication.parentOrigin = null;
    }
  }

  public static uninitialize(): void {
    Communication.currentWindow.removeEventListener('message', Communication.messageListener, false);

    Communication.parentWindow = null;
    Communication.parentOrigin = null;
    Communication.parentMessageQueue = [];
    Communication.childWindow = null;
    Communication.childOrigin = null;
    Communication.childMessageQueue = [];
    Communication.nextMessageId = 0;
    Communication.callbacks = {};
  }

  /**
   * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
   */
  public static sendMessageToParent(actionName: string): void;
  /**
   * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
   */
  public static sendMessageToParent(actionName: string, args: any[]): void;
  /**
   * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
   */
  public static sendMessageToParent(actionName: string, callback: Function): void;
  /**
   * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
   */
  public static sendMessageToParent(actionName: string, args: any[], callback: Function): void;
  public static sendMessageToParent(actionName: string, argsOrCallback?: any[] | Function, callback?: Function): void {
    let args: any[] | undefined;
    if (argsOrCallback instanceof Function) {
      callback = argsOrCallback;
    } else if (argsOrCallback instanceof Array) {
      args = argsOrCallback;
    }

    const targetWindow = Communication.parentWindow;
    const request = Communication.createMessageRequest(actionName, args);
    if (GlobalVars.isFramelessWindow) {
      if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
        (Communication.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
      }
    } else {
      const targetOrigin = Communication.getTargetOrigin(targetWindow);

      // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
      // queue the message and send it after the origin is established
      if (targetWindow && targetOrigin) {
        targetWindow.postMessage(request, targetOrigin);
      } else {
        Communication.getTargetMessageQueue(targetWindow).push(request);
      }
    }

    if (callback) {
      Communication.callbacks[request.id] = callback;
    }
  }

  private static processMessage(evt: DOMMessageEvent): void {
    // Process only if we received a valid message
    if (!evt || !evt.data || typeof evt.data !== 'object') {
      return;
    }

    // Process only if the message is coming from a different window and a valid origin
    // valid origins are either a pre-known
    const messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
    const messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
    if (!Communication.shouldProcessMessage(messageSource, messageOrigin)) {
      return;
    }

    // Update our parent and child relationships based on this message
    Communication.updateRelationships(messageSource, messageOrigin);

    // Handle the message
    if (messageSource === Communication.parentWindow) {
      Communication.handleParentMessage(evt);
    } else if (messageSource === Communication.childWindow) {
      Communication.handleChildMessage(evt);
    }
  }

  /**
   * Validates the message source and origin, if it should be processed
   */
  private static shouldProcessMessage(messageSource: Window, messageOrigin: string): boolean {
    // Process if message source is a different window and if origin is either in
    // Teams' pre-known whitelist or supplied as valid origin by user during initialization
    if (Communication.currentWindow && messageSource === Communication.currentWindow) {
      return false;
    } else if (
      Communication.currentWindow &&
      Communication.currentWindow.location &&
      messageOrigin &&
      messageOrigin === Communication.currentWindow.location.origin
    ) {
      return true;
    } else if (
      validOriginRegExp.test(messageOrigin.toLowerCase()) ||
      (GlobalVars.additionalValidOriginsRegexp &&
        GlobalVars.additionalValidOriginsRegexp.test(messageOrigin.toLowerCase()))
    ) {
      return true;
    }
    return false;
  }

  private static updateRelationships(messageSource: Window, messageOrigin: string): void {
    // Determine whether the source of the message is our parent or child and update our
    // window and origin pointer accordingly
    // For frameless windows (i.e mobile), there is no parent frame, so the message must be from the child.
    if (
      !GlobalVars.isFramelessWindow &&
      (!Communication.parentWindow || Communication.parentWindow.closed || messageSource === Communication.parentWindow)
    ) {
      Communication.parentWindow = messageSource;
      Communication.parentOrigin = messageOrigin;
    } else if (
      !Communication.childWindow ||
      Communication.childWindow.closed ||
      messageSource === Communication.childWindow
    ) {
      Communication.childWindow = messageSource;
      Communication.childOrigin = messageOrigin;
    }

    // Clean up pointers to closed parent and child windows
    if (Communication.parentWindow && Communication.parentWindow.closed) {
      Communication.parentWindow = null;
      Communication.parentOrigin = null;
    }
    if (Communication.childWindow && Communication.childWindow.closed) {
      Communication.childWindow = null;
      Communication.childOrigin = null;
    }

    // If we have any messages in our queue, send them now
    Communication.flushMessageQueue(Communication.parentWindow);
    Communication.flushMessageQueue(Communication.childWindow);
  }

  private static handleParentMessage(evt: DOMMessageEvent): void {
    if ('id' in evt.data && typeof evt.data.id === 'number') {
      // Call any associated Communication.callbacks
      const message = evt.data as MessageResponse;
      const callback = Communication.callbacks[message.id];
      if (callback) {
        callback.apply(null, [...message.args, message.isPartialResponse]);

        // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
        if (!Communication.isPartialResponse(evt)) {
          delete Communication.callbacks[message.id];
        }
      }
    } else if ('func' in evt.data && typeof evt.data.func === 'string') {
      // Delegate the request to the proper handler
      const message = evt.data as MessageRequest;
      Handlers.callHandler(message.func, message.args);
    }
  }

  private static isPartialResponse(evt: DOMMessageEvent): boolean {
    return evt.data.isPartialResponse === true;
  }

  private static handleChildMessage(evt: DOMMessageEvent): void {
    if ('id' in evt.data && 'func' in evt.data) {
      // Try to delegate the request to the proper handler, if defined
      const message = evt.data as MessageRequest;
      const [called, result] = Handlers.callHandler(message.func, message.args);
      if (called && typeof result !== 'undefined') {
        Communication.sendMessageResponseToChild(message.id, Array.isArray(result) ? result : [result]);
      } else {
        // No handler, proxy to parent
        // tslint:disable-next-line:no-any
        Communication.sendMessageToParent(message.func, message.args, (...args: any[]): void => {
          if (Communication.childWindow) {
            const isPartialResponse = args.pop();
            Communication.sendMessageResponseToChild(message.id, args, isPartialResponse);
          }
        });
      }
    }
  }

  private static getTargetMessageQueue(targetWindow: Window): MessageRequest[] {
    return targetWindow === Communication.parentWindow
      ? Communication.parentMessageQueue
      : targetWindow === Communication.childWindow
      ? Communication.childMessageQueue
      : [];
  }

  private static getTargetOrigin(targetWindow: Window): string {
    return targetWindow === Communication.parentWindow
      ? Communication.parentOrigin
      : targetWindow === Communication.childWindow
      ? Communication.childOrigin
      : null;
  }

  private static flushMessageQueue(targetWindow: Window | any): void {
    const targetOrigin = Communication.getTargetOrigin(targetWindow);
    const targetMessageQueue = Communication.getTargetMessageQueue(targetWindow);
    while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
      targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
    }
  }

  public static waitForMessageQueue(targetWindow: Window, callback: () => void): void {
    const messageQueueMonitor = Communication.currentWindow.setInterval(() => {
      if (Communication.getTargetMessageQueue(targetWindow).length === 0) {
        clearInterval(messageQueueMonitor);
        callback();
      }
    }, 100);
  }

  /**
   * Send a response to child for a message request that was from child
   */
  private static sendMessageResponseToChild(
    id: number,
    // tslint:disable-next-line:no-any
    args?: any[],
    isPartialResponse?: boolean,
  ): void {
    const targetWindow = Communication.childWindow;
    const response = Communication.createMessageResponse(id, args, isPartialResponse);
    const targetOrigin = Communication.getTargetOrigin(targetWindow);
    if (targetWindow && targetOrigin) {
      targetWindow.postMessage(response, targetOrigin);
    }
  }

  /**
   * Send a custom message object that can be sent to child window,
   * instead of a response message to a child
   */
  public static sendMessageEventToChild(
    actionName: string,
    // tslint:disable-next-line: no-any
    args?: any[],
  ): void {
    const targetWindow = Communication.childWindow;
    const customEvent = Communication.createMessageEvent(actionName, args);
    const targetOrigin = Communication.getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      targetWindow.postMessage(customEvent, targetOrigin);
    } else {
      Communication.getTargetMessageQueue(targetWindow).push(customEvent);
    }
  }

  // tslint:disable-next-line:no-any
  private static createMessageRequest(func: string, args: any[]): MessageRequest {
    return {
      id: Communication.nextMessageId++,
      func: func,
      args: args || [],
    };
  }

  // tslint:disable-next-line:no-any
  private static createMessageResponse(id: number, args: any[], isPartialResponse: boolean): MessageResponse {
    return {
      id: id,
      args: args || [],
      isPartialResponse,
    };
  }

  /**
   * Creates a message object without any id, used for custom actions being sent to child frame/window
   */
  // tslint:disable-next-line:no-any
  private static createMessageEvent(func: string, args: any[]): MessageRequest {
    return {
      func: func,
      args: args || [],
    };
  }
}
