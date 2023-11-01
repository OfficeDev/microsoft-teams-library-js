/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */

import { FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { latestRuntimeApiVersion } from '../public/runtime';
import { version } from '../public/version';
import { GlobalVars } from './globalVars';
import { callHandler } from './handlers';
import { DOMMessageEvent, ExtendedWindow } from './interfaces';
import { MessageRequest, MessageRequestWithRequiredProperties, MessageResponse } from './messageObjects';
import { getLogger } from './telemetry';
import { ssrSafeWindow, validateOrigin } from './utils';

const communicationLogger = getLogger('communication');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export class Communication {
  public static currentWindow: Window | any;
  public static parentOrigin: string | null;
  public static parentWindow: Window | any;
  public static childWindow: Window | null;
  public static childOrigin: string | null;
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
  Communication.currentWindow = Communication.currentWindow || ssrSafeWindow();
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
    return sendMessageToParentAsyncWithVersion<[FrameContexts, string, string, string]>('v2', 'initialize', [
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
 * @hidden
 * Send a message to parent and then unwrap result. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendAndUnwrap function
 * and this function will be removed when the project is completed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndUnwrapWithVersion<T>(apiVersion: string, actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsyncWithVersion(apiVersion, actionName, args).then(([result]: [T]) => result);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndUnwrap<T>(actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsync(actionName, args).then(([result]: [T]) => result);
}

/**
 * @hidden
 * Send a message to parent and then handle status and reason. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendAndHandleStatusAndReason function
 * and this function will be removed when the project is completed.
 */
export function sendAndHandleStatusAndReasonWithVersion(
  apiVersion: string,
  actionName: string,
  ...args: any[]
): Promise<void> {
  return sendMessageToParentAsyncWithVersion(apiVersion, actionName, args).then(
    ([wasSuccessful, reason]: [boolean, string]) => {
      if (!wasSuccessful) {
        throw new Error(reason);
      }
    },
  );
}

export function sendAndHandleStatusAndReason(actionName: string, ...args: any[]): Promise<void> {
  return sendMessageToParentAsync(actionName, args).then(([wasSuccessful, reason]: [boolean, string]) => {
    if (!wasSuccessful) {
      throw new Error(reason);
    }
  });
}

/**
 * @hidden
 * Send a message to parent and then handle status and reason with default error. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendAndHandleStatusAndReasonWithDefaultError function
 * and this function will be removed when the project is completed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleStatusAndReasonWithDefaultErrorWithVersion(
  apiVersion: string,
  actionName: string,
  defaultError: string,
  ...args: any[]
): Promise<void> {
  return sendMessageToParentAsyncWithVersion(apiVersion, actionName, args).then(
    ([wasSuccessful, reason]: [boolean, string]) => {
      if (!wasSuccessful) {
        throw new Error(reason ? reason : defaultError);
      }
    },
  );
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
  return sendMessageToParentAsync(actionName, args).then(([wasSuccessful, reason]: [boolean, string]) => {
    if (!wasSuccessful) {
      throw new Error(reason ? reason : defaultError);
    }
  });
}

/**
 * @hidden
 * Send a message to parent and then handle SDK error. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendAndHandleSdkError function
 * and this function will be removed when the project is completed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleSdkErrorWithVersion<T>(
  apiVersion: string,
  actionName: string,
  ...args: any[]
): Promise<T> {
  return sendMessageToParentAsyncWithVersion(apiVersion, actionName, args).then(([error, result]: [SdkError, T]) => {
    if (error) {
      throw error;
    }
    return result;
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
 * Send a message to parent asynchronously. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendMessageToParentAsync function
 * and this function will be removed when the project is completed.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParentAsyncWithVersion<T>(
  apiVersion: string,
  actionName: string,
  args: any[] = undefined,
): Promise<T> {
  return new Promise((resolve) => {
    const request = sendMessageToParentHelper(apiVersion, actionName, args);
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(waitForResponse<T>(request.id));
  });
}

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParentAsync<T>(actionName: string, args: any[] | undefined = undefined): Promise<T> {
  return new Promise((resolve) => {
    const request = sendMessageToParentHelper(
      getApiVersionTag(ApiVersionNumber.V_0, 'testing' as ApiName),
      actionName,
      args,
    );
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
export function sendMessageToParentWithVersion(
  apiVersion: string,
  actionName: string,
  args: any[],
  callback?: Function,
): void;

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParentWithVersion(apiVersion: string, actionName: string, callback?: Function): void;

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersion parameter is added, which provides the ability to send api version number to parent
 * for telemetry work. The code inside of this function will be used to replace sendMessageToParent function
 * and this function will be removed when the project is completed.
 */
export function sendMessageToParentWithVersion(
  apiVersion: string,
  actionName: string,
  argsOrCallback?: any[] | Function,
  callback?: Function,
): void {
  let args: any[] | undefined;
  if (argsOrCallback instanceof Function) {
    callback = argsOrCallback;
  } else if (argsOrCallback instanceof Array) {
    args = argsOrCallback;
  }

  // APIs with v0 represents beta changes haven't been implemented on them
  // Otherwise, minimum version number will be v1
  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const request = sendMessageToParentHelper(apiVersion, actionName, args);
  if (callback) {
    CommunicationPrivate.callbacks[request.id] = callback;
  }
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

<<<<<<< HEAD
  const request = sendMessageToParentHelper(
    getApiVersionTag(ApiVersionNumber.V_0, 'testing' as ApiName),
    actionName,
    args,
  );
=======
  // APIs with v0 represents beta changes haven't been implemented on them
  // Otherwise, minimum version number will be v1
  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const request = sendMessageToParentHelper('v0', actionName, args);
>>>>>>> 22fbc886 (update)
  if (callback) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    CommunicationPrivate.callbacks[request.id] = callback;
  }
}

const sendMessageToParentHelperLogger = communicationLogger.extend('sendMessageToParentHelper');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendMessageToParentHelper(
  apiVersion: string,
  actionName: string,
  args: any[] | undefined,
): MessageRequestWithRequiredProperties {
  const logger = sendMessageToParentHelperLogger;
  const targetWindow = Communication.parentWindow;
  const request = createMessageRequest(apiVersion, actionName, args);

  logger('Message %i information: %o', request.id, { actionName, args });

  if (GlobalVars.isFramelessWindow) {
    if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
      logger('Sending message %i to parent via framelessPostMessage interface', request.id);
      (Communication.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
    }
  } else {
    const targetOrigin = getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      logger('Sending message %i to parent via postMessage', request.id);
      targetWindow.postMessage(request, targetOrigin);
    } else {
      logger('Adding message %i to parent message queue', request.id);
      getTargetMessageQueue(targetWindow).push(request);
    }
  }
  return request;
}

const processMessageLogger = communicationLogger.extend('processMessage');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function processMessage(evt: DOMMessageEvent): void {
  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    processMessageLogger('Unrecognized message format received by app, message being ignored. Message: %o', evt);
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  // valid origins are either a pre-known origin or one specified by the app developer
  // in their call to app.initialize
  const messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
  const messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
  if (!shouldProcessMessage(messageSource, messageOrigin)) {
    processMessageLogger(
      'Message being ignored by app because it is either coming from the current window or a different window with an invalid origin',
    );
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

const shouldProcessMessageLogger = communicationLogger.extend('shouldProcessMessage');

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
    shouldProcessMessageLogger('Should not process message because it is coming from the current window');
    return false;
  } else if (
    Communication.currentWindow &&
    Communication.currentWindow.location &&
    messageOrigin &&
    messageOrigin === Communication.currentWindow.location.origin
  ) {
    return true;
  } else {
    const isOriginValid = validateOrigin(new URL(messageOrigin));
    if (!isOriginValid) {
      shouldProcessMessageLogger('Message has an invalid origin of %s', messageOrigin);
    }
    return isOriginValid;
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
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
    const apiVersionTag = message.apiversiontag;
    const [called, result] = callHandler(message.func, message.args);
    if (called && typeof result !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sendMessageResponseToChild(message.id, Array.isArray(result) ? result : [result]);
    } else {
      // No handler, proxy to parent
      sendMessageToParent(
        message.func,
        message.args,
        (...args: any[]): void => {
          if (Communication.childWindow) {
            const isPartialResponse = args.pop();
            /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
            sendMessageResponseToChild(message.id, args, isPartialResponse);
          }
        },
        apiVersionTag,
      );
    }
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetMessageQueue(targetWindow: Window | null): MessageRequest[] {
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
function getTargetOrigin(targetWindow: Window | null): string | null {
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
    flushMessageQueueLogger('Flushing message %i from ' + target + ' message queue via postMessage.', request?.id);
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
function createMessageRequest(
  apiVersionTag: string,
  func: string,
  args: any[] | undefined,
): MessageRequestWithRequiredProperties {
  return {
    id: CommunicationPrivate.nextMessageId++,
    func: func,
    timestamp: Date.now(),
    args: args || [],
    apiversiontag: apiVersionTag,
  };
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageResponse(id: number, args: any[] | undefined, isPartialResponse?: boolean): MessageResponse {
  return {
    id: id,
    args: args || [],
    isPartialResponse,
  };
}

/**
 * @hidden
 * Creates a message object without any id and api version, used for custom actions being sent to child frame/window
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageEvent(func: string, args?: any[]): MessageRequest {
  return {
    func: func,
    args: args || [],
  };
}
