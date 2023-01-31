/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { latestRuntimeApiVersion } from '../public/runtime';
import { version } from '../public/version';
import { GlobalVars } from './globalVars';
import { callHandler } from './handlers';
import { DOMMessageEvent, ExtendedWindow, MessageRequest, MessageResponse } from './interfaces';
import { getLogger } from './telemetry';
import { validateOrigin } from './utils';

const communicationLogger = getLogger('communication');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export class Communication {
  public static currentWindow: Window | any;
  public static parentOrigin: string;
  public static parentWindow: Window | any;
  public static childWindow: Window;
  public static childOrigin: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
class CommunicationPrivate {
  public static parentMessageQueue: MessageRequest[] = [];
  public static childMessageQueue: MessageRequest[] = [];
  public static nextMessageId = 0;
  public static callbacks: {
    [id: number]: Function; // (arg1, arg2, ...etc) => void
  } = {};
  public static promiseCallbacks: {
    [id: number]: Function; // (args[]) => void
  } = {};
  public static messageListener: Function;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
interface InitializeResponse {
  context: FrameContexts;
  clientType: string;
  runtimeConfig: string;
  clientSupportedSDKVersion: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function initializeCommunication(validMessageOrigins: string[] | undefined): Promise<InitializeResponse> {
  // Listen for messages post to our window
  CommunicationPrivate.messageListener = (evt: DOMMessageEvent): void => processMessage(evt);

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
    Communication.currentWindow.addEventListener('message', CommunicationPrivate.messageListener, false);
  }

  if (!Communication.parentWindow) {
    const extendedWindow = Communication.currentWindow as unknown as ExtendedWindow;
    if (extendedWindow.nativeInterface) {
      GlobalVars.isFramelessWindow = true;
      extendedWindow.onNativeMessage = handleParentMessage;
    } else {
      // at this point we weren't able to find a parent to talk to, no way initialization will succeed
      return Promise.reject(new Error('Initialization Failed. No Parent window found.'));
    }
  }

  try {
    // Send the initialized message to any origin, because at this point we most likely don't know the origin
    // of the parent window, and this message contains no data that could pose a security risk.
    Communication.parentOrigin = '*';
    return sendMessageToParentAsync<[FrameContexts, string, string, string]>('initialize', [
      version,
      latestRuntimeApiVersion,
    ]).then(
      ([context, clientType, runtimeConfig, clientSupportedSDKVersion]: [FrameContexts, string, string, string]) => {
        return { context, clientType, runtimeConfig, clientSupportedSDKVersion };
      },
    );
  } finally {
    Communication.parentOrigin = null;
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function uninitializeCommunication(): void {
  if (Communication.currentWindow) {
    Communication.currentWindow.removeEventListener('message', CommunicationPrivate.messageListener, false);
  }

  Communication.currentWindow = null;
  Communication.parentWindow = null;
  Communication.parentOrigin = null;
  Communication.childWindow = null;
  Communication.childOrigin = null;
  CommunicationPrivate.parentMessageQueue = [];
  CommunicationPrivate.childMessageQueue = [];
  CommunicationPrivate.nextMessageId = 0;
  CommunicationPrivate.callbacks = {};
  CommunicationPrivate.promiseCallbacks = {};
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndUnwrap<T>(actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsync(actionName, args).then(([result]: [T]) => result);
}

export function sendAndHandleStatusAndReason(actionName: string, ...args: any[]): Promise<void> {
  return sendMessageToParentAsync(actionName, args).then(([status, reason]: [boolean, string]) => {
    if (!status) {
      throw new Error(reason);
    }
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleStatusAndReasonWithDefaultError(
  actionName: string,
  defaultError: string,
  ...args: any[]
): Promise<void> {
  return sendMessageToParentAsync(actionName, args).then(([status, reason]: [boolean, string]) => {
    if (!status) {
      throw new Error(reason ? reason : defaultError);
    }
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleSdkError<T>(actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsync(actionName, args).then(([error, result]: [SdkError, T]) => {
    if (error) {
      throw error;
    }
    return result;
  });
}

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParentAsync<T>(actionName: string, args: any[] = undefined): Promise<T> {
  return new Promise((resolve) => {
    const request = sendMessageToParentHelper(actionName, args);
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(waitForResponse<T>(request.id));
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function waitForResponse<T>(requestId: number): Promise<T> {
  return new Promise<T>((resolve) => {
    CommunicationPrivate.promiseCallbacks[requestId] = resolve;
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(actionName: string, callback?: Function): void;

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(actionName: string, args: any[], callback?: Function): void;

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(actionName: string, argsOrCallback?: any[] | Function, callback?: Function): void {
  let args: any[] | undefined;
  if (argsOrCallback instanceof Function) {
    callback = argsOrCallback;
  } else if (argsOrCallback instanceof Array) {
    args = argsOrCallback;
  }

  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const request = sendMessageToParentHelper(actionName, args);
  if (callback) {
    CommunicationPrivate.callbacks[request.id] = callback;
  }
}

const sendMessageToParentHelperLogger = communicationLogger.extend('sendMessageToParentHelper');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendMessageToParentHelper(actionName: string, args: any[]): MessageRequest {
  const logger = sendMessageToParentHelperLogger;

  const targetWindow = Communication.parentWindow;
  const request = createMessageRequest(actionName, args);

  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  logger('Message %i information: %o', request.id, { actionName, args });

  if (GlobalVars.isFramelessWindow) {
    if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      logger('Sending message %i to parent via framelessPostMessage interface', request.id);
      (Communication.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
    }
  } else {
    const targetOrigin = getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      logger('Sending message %i to parent via postMessage', request.id);
      targetWindow.postMessage(request, targetOrigin);
    } else {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      logger('Adding message %i to parent message queue', request.id);
      getTargetMessageQueue(targetWindow).push(request);
    }
  }
  return request;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function processMessage(evt: DOMMessageEvent): void {
  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  // valid origins are either a pre-known
  const messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
  const messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
  if (!shouldProcessMessage(messageSource, messageOrigin)) {
    return;
  }

  // Update our parent and child relationships based on this message
  updateRelationships(messageSource, messageOrigin);

  // Handle the message
  if (messageSource === Communication.parentWindow) {
    handleParentMessage(evt);
  } else if (messageSource === Communication.childWindow) {
    handleChildMessage(evt);
  }
}

/**
 * @hidden
 * Validates the message source and origin, if it should be processed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function shouldProcessMessage(messageSource: Window, messageOrigin: string): boolean {
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
  } else {
    return validateOrigin(new URL(messageOrigin));
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function updateRelationships(messageSource: Window, messageOrigin: string): void {
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
  flushMessageQueue(Communication.parentWindow);
  flushMessageQueue(Communication.childWindow);
}

const handleParentMessageLogger = communicationLogger.extend('handleParentMessage');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleParentMessage(evt: DOMMessageEvent): void {
  const logger = handleParentMessageLogger;

  if ('id' in evt.data && typeof evt.data.id === 'number') {
    // Call any associated Communication.callbacks
    const message = evt.data as MessageResponse;
    const callback = CommunicationPrivate.callbacks[message.id];
    logger('Received a response from parent for message %i', message.id);
    if (callback) {
      logger('Invoking the registered callback for message %i with arguments %o', message.id, message.args);
      callback.apply(null, [...message.args, message.isPartialResponse]);

      // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
      if (!isPartialResponse(evt)) {
        logger('Removing registered callback for message %i', message.id);
        delete CommunicationPrivate.callbacks[message.id];
      }
    }
    const promiseCallback = CommunicationPrivate.promiseCallbacks[message.id];
    if (promiseCallback) {
      logger('Invoking the registered promise callback for message %i with arguments %o', message.id, message.args);
      promiseCallback(message.args);

      logger('Removing registered promise callback for message %i', message.id);
      delete CommunicationPrivate.promiseCallbacks[message.id];
    }
  } else if ('func' in evt.data && typeof evt.data.func === 'string') {
    // Delegate the request to the proper handler
    const message = evt.data as MessageRequest;
    logger('Received an action message %s from parent', message.func);
    callHandler(message.func, message.args);
  } else {
    logger('Received an unknown message: %O', evt);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function isPartialResponse(evt: DOMMessageEvent): boolean {
  return evt.data.isPartialResponse === true;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleChildMessage(evt: DOMMessageEvent): void {
  if ('id' in evt.data && 'func' in evt.data) {
    // Try to delegate the request to the proper handler, if defined
    const message = evt.data as MessageRequest;
    const [called, result] = callHandler(message.func, message.args);
    if (called && typeof result !== 'undefined') {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      sendMessageResponseToChild(message.id, Array.isArray(result) ? result : [result]);
    } else {
      // No handler, proxy to parent
      sendMessageToParent(message.func, message.args, (...args: any[]): void => {
        if (Communication.childWindow) {
          const isPartialResponse = args.pop();
          /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
          sendMessageResponseToChild(message.id, args, isPartialResponse);
        }
      });
    }
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetMessageQueue(targetWindow: Window): MessageRequest[] {
  return targetWindow === Communication.parentWindow
    ? CommunicationPrivate.parentMessageQueue
    : targetWindow === Communication.childWindow
    ? CommunicationPrivate.childMessageQueue
    : [];
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetOrigin(targetWindow: Window): string {
  return targetWindow === Communication.parentWindow
    ? Communication.parentOrigin
    : targetWindow === Communication.childWindow
    ? Communication.childOrigin
    : null;
}

const flushMessageQueueLogger = communicationLogger.extend('flushMessageQueue');
/**
 * @internal
 * Limited to Microsoft-internal use
 */
function flushMessageQueue(targetWindow: Window | any): void {
  const targetOrigin = getTargetOrigin(targetWindow);
  const targetMessageQueue = getTargetMessageQueue(targetWindow);
  const target = targetWindow == Communication.parentWindow ? 'parent' : 'child';
  while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
    const request = targetMessageQueue.shift();
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    flushMessageQueueLogger('Flushing message %i from ' + target + ' message queue via postMessage.', request.id);
    targetWindow.postMessage(request, targetOrigin);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function waitForMessageQueue(targetWindow: Window, callback: () => void): void {
  const messageQueueMonitor = Communication.currentWindow.setInterval(() => {
    if (getTargetMessageQueue(targetWindow).length === 0) {
      clearInterval(messageQueueMonitor);
      callback();
    }
  }, 100);
}

/**
 * @hidden
 * Send a response to child for a message request that was from child
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function sendMessageResponseToChild(id: number, args?: any[], isPartialResponse?: boolean): void {
  const targetWindow = Communication.childWindow;
  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const response = createMessageResponse(id, args, isPartialResponse);
  const targetOrigin = getTargetOrigin(targetWindow);
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(response, targetOrigin);
  }
}

/**
 * @hidden
 * Send a custom message object that can be sent to child window,
 * instead of a response message to a child
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageEventToChild(actionName: string, args?: any[]): void {
  const targetWindow = Communication.childWindow;
  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const customEvent = createMessageEvent(actionName, args);
  const targetOrigin = getTargetOrigin(targetWindow);

  // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
  // queue the message and send it after the origin is established
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(customEvent, targetOrigin);
  } else {
    getTargetMessageQueue(targetWindow).push(customEvent);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageRequest(func: string, args: any[]): MessageRequest {
  return {
    id: CommunicationPrivate.nextMessageId++,
    func: func,
    timestamp: Date.now(),
    args: args || [],
  };
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageResponse(id: number, args: any[], isPartialResponse: boolean): MessageResponse {
  return {
    id: id,
    args: args || [],
    isPartialResponse,
  };
}

/**
 * @hidden
 * Creates a message object without any id, used for custom actions being sent to child frame/window
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageEvent(func: string, args: any[]): MessageRequest {
  return {
    func: func,
    args: args || [],
  };
}
