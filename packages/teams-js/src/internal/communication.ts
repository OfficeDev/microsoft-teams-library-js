/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */

import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { latestRuntimeApiVersion } from '../public/runtime';
import { version } from '../public/version';
import { GlobalVars } from './globalVars';
import { callHandler } from './handlers';
import { DOMMessageEvent, ExtendedWindow } from './interfaces';
import {
  MessageID,
  MessageRequest,
  MessageRequestWithRequiredProperties,
  MessageResponse,
  MessageUUID,
} from './messageObjects';
import {
  NestedAppAuthMessageEventNames,
  NestedAppAuthRequest,
  ParsedNestedAppAuthMessageData,
  tryPolyfillWithNestedAppAuthBridge,
} from './nestedAppAuthUtils';
import { getLogger, isFollowingApiVersionTagFormat } from './telemetry';
import { ssrSafeWindow } from './utils';
import { validateOrigin } from './validOrigins';

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
  public static topWindow: Window | any;
  public static topOrigin: string | null;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
class CommunicationPrivate {
  public static parentMessageQueue: MessageRequest[] = [];
  public static childMessageQueue: MessageRequest[] = [];
  public static topMessageQueue: MessageRequest[] = [];
  public static nextMessageId = 0;
  public static callbacks: Map<MessageUUID, Function> = new Map();
  public static promiseCallbacks: Map<MessageUUID, Function> = new Map();
  public static portCallbacks: Map<MessageUUID, (port?: MessagePort, args?: unknown[]) => void> = new Map();
  public static messageListener: Function;
  public static legacyMessageIdsToUuidMap: {
    [legacyId: number]: MessageUUID;
  } = {};
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
export function initializeCommunication(
  validMessageOrigins: string[] | undefined,
  apiVersionTag: string,
): Promise<InitializeResponse> {
  // Listen for messages post to our window
  CommunicationPrivate.messageListener = async (evt: DOMMessageEvent): Promise<void> => await processMessage(evt);

  // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
  // it's the window that opened us (i.e., window.opener)
  Communication.currentWindow = Communication.currentWindow || ssrSafeWindow();
  Communication.parentWindow =
    Communication.currentWindow.parent !== Communication.currentWindow.self
      ? Communication.currentWindow.parent
      : Communication.currentWindow.opener;
  Communication.topWindow = Communication.currentWindow.top;

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
    return sendMessageToParentAsync<[FrameContexts, string, string, string]>(apiVersionTag, 'initialize', [
      version,
      latestRuntimeApiVersion,
    ]).then(
      ([context, clientType, runtimeConfig, clientSupportedSDKVersion]: [FrameContexts, string, string, string]) => {
        tryPolyfillWithNestedAppAuthBridge(clientSupportedSDKVersion, Communication.currentWindow, {
          onMessage: processAuthBridgeMessage,
          sendPostMessage: sendNestedAuthRequestToTopWindow,
        });
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
  CommunicationPrivate.callbacks.clear();
  CommunicationPrivate.promiseCallbacks.clear();
  CommunicationPrivate.portCallbacks.clear();
  CommunicationPrivate.legacyMessageIdsToUuidMap = {};
}

/**
 * @hidden
 * Send a message to parent and then unwrap result. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndUnwrap<T>(apiVersionTag: string, actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsync(apiVersionTag, actionName, args).then(([result]: [T]) => result);
}

/**
 * @hidden
 * Send a message to parent and then handle status and reason. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 */
export function sendAndHandleStatusAndReason(apiVersionTag: string, actionName: string, ...args: any[]): Promise<void> {
  return sendMessageToParentAsync(apiVersionTag, actionName, args).then(
    ([wasSuccessful, reason]: [boolean, string]) => {
      if (!wasSuccessful) {
        throw new Error(reason);
      }
    },
  );
}

/**
 * @hidden
 * Send a message to parent and then handle status and reason with default error. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleStatusAndReasonWithDefaultError(
  apiVersionTag: string,
  actionName: string,
  defaultError: string,
  ...args: any[]
): Promise<void> {
  return sendMessageToParentAsync(apiVersionTag, actionName, args).then(
    ([wasSuccessful, reason]: [boolean, string]) => {
      if (!wasSuccessful) {
        throw new Error(reason ? reason : defaultError);
      }
    },
  );
}

/**
 * @hidden
 * Send a message to parent and then handle SDK error. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendAndHandleSdkError<T>(apiVersionTag: string, actionName: string, ...args: any[]): Promise<T> {
  return sendMessageToParentAsync(apiVersionTag, actionName, args).then(([error, result]: [SdkError, T]) => {
    if (error) {
      throw error;
    }
    return result;
  });
}

/**
 * @hidden
 * Send a message to parent asynchronously. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParentAsync<T>(
  apiVersionTag: string,
  actionName: string,
  args: any[] | undefined = undefined,
): Promise<T> {
  if (!isFollowingApiVersionTagFormat(apiVersionTag)) {
    throw Error(
      `apiVersionTag: ${apiVersionTag} passed in doesn't follow the pattern starting with 'v' followed by digits, then underscore with words, please check.`,
    );
  }

  return new Promise((resolve) => {
    const request = sendMessageToParentHelper(apiVersionTag, actionName, args);
    resolve(waitForResponse<T>(request.uuid));
  });
}

/**
 * @hidden
 * Send a message to parent requesting a MessageChannel Port.
 * @internal
 * Limited to Microsoft-internal use
 */
export function requestPortFromParentWithVersion(
  apiVersionTag: string,
  actionName: string,
  args: any[] | undefined = undefined,
): Promise<MessagePort> {
  if (!isFollowingApiVersionTagFormat(apiVersionTag)) {
    throw Error(
      `apiVersionTag: ${apiVersionTag} passed in doesn't follow the pattern starting with 'v' followed by digits, then underscore with words, please check.`,
    );
  }
  const request = sendMessageToParentHelper(apiVersionTag, actionName, args);
  return waitForPort(request.uuid);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function waitForPort(requestId: MessageUUID): Promise<MessagePort> {
  return new Promise<MessagePort>((resolve, reject) => {
    CommunicationPrivate.portCallbacks.set(requestId, (port: MessagePort | undefined, args?: unknown[]) => {
      if (port instanceof MessagePort) {
        resolve(port);
      } else {
        // First arg is the error message, if present
        reject(args && args.length > 0 ? args[0] : new Error('Host responded without port or error details.'));
      }
    });
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function waitForResponse<T>(requestId: MessageUUID): Promise<T> {
  return new Promise<T>((resolve) => {
    CommunicationPrivate.promiseCallbacks.set(requestId, resolve);
  });
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(apiVersionTag: string, actionName: string, callback?: Function): void;

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(
  apiVersionTag: string,
  actionName: string,
  args: any[] | undefined,
  callback?: Function,
): void;

/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 * Additional apiVersionTag parameter is added, which provides the ability to send api version number to parent
 * for telemetry work.
 *
 */
export function sendMessageToParent(
  apiVersionTag: string,
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

  if (!isFollowingApiVersionTagFormat(apiVersionTag)) {
    throw Error(
      `apiVersionTag: ${apiVersionTag} passed in doesn't follow the pattern starting with 'v' followed by digits, then underscore with words, please check.`,
    );
  }

  const request = sendMessageToParentHelper(apiVersionTag, actionName, args);
  if (callback) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    CommunicationPrivate.callbacks.set(request.uuid, callback);
  }
}

const sendNestedAuthRequestToTopWindowLogger = communicationLogger.extend('sendNestedAuthRequestToTopWindow');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendNestedAuthRequestToTopWindow(message: string): NestedAppAuthRequest {
  const logger = sendNestedAuthRequestToTopWindowLogger;

  const targetWindow = Communication.topWindow;
  const request = createNestedAppAuthRequest(message);

  logger('Message %i information: %o', request.uuid, { actionName: request.func });

  return sendRequestToTargetWindowHelper(targetWindow, request) as NestedAppAuthRequest;
}

const sendRequestToTargetWindowHelperLogger = communicationLogger.extend('sendRequestToTargetWindowHelper');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendRequestToTargetWindowHelper(
  targetWindow: Window,
  request: MessageRequestWithRequiredProperties | NestedAppAuthRequest,
): MessageRequestWithRequiredProperties | NestedAppAuthRequest {
  const logger = sendRequestToTargetWindowHelperLogger;
  const targetWindowName = getTargetName(targetWindow);

  if (GlobalVars.isFramelessWindow) {
    if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
      logger(`Sending message %i to ${targetWindowName} via framelessPostMessage interface`, request.uuid);
      (Communication.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
    }
  } else {
    const targetOrigin = getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      logger(`Sending message %i to ${targetWindowName} via postMessage`, request.uuid);
      targetWindow.postMessage(request, targetOrigin);
    } else {
      logger(`Adding message %i to ${targetWindowName} message queue`, request.uuid);
      getTargetMessageQueue(targetWindow).push(request);
    }
  }
  return request;
}

const sendMessageToParentHelperLogger = communicationLogger.extend('sendMessageToParentHelper');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendMessageToParentHelper(
  apiVersionTag: string,
  actionName: string,
  args: any[] | undefined,
): MessageRequestWithRequiredProperties {
  const logger = sendMessageToParentHelperLogger;

  const targetWindow = Communication.parentWindow;
  const request = createMessageRequest(apiVersionTag, actionName, args);

  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  logger('Message %i information: %o', request.uuid, { actionName, args });

  return sendRequestToTargetWindowHelper(targetWindow, request);
}

const processMessageLogger = communicationLogger.extend('processMessage');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
async function processMessage(evt: DOMMessageEvent): Promise<void> {
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

  return shouldProcessMessage(messageSource, messageOrigin).then((result) => {
    if (!result) {
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
  });
}

const processAuthBridgeMessageLogger = communicationLogger.extend('processAuthBridgeMessage');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function processAuthBridgeMessage(evt: MessageEvent, onMessageReceived: (response: string) => void): void {
  const logger = processAuthBridgeMessageLogger;

  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    logger('Unrecognized message format received by app, message being ignored. Message: %o', evt);
    return;
  }

  const { args } = evt.data as MessageResponse;
  const [, message] = args ?? [];
  const parsedData: ParsedNestedAppAuthMessageData = (() => {
    try {
      return JSON.parse(message);
    } catch (e) {
      return null;
    }
  })();

  // Validate that it is a valid auth bridge response message
  if (
    !parsedData ||
    typeof parsedData !== 'object' ||
    parsedData.messageType !== NestedAppAuthMessageEventNames.Response
  ) {
    logger('Unrecognized data format received by app, message being ignored. Message: %o', evt);
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  // valid origins are either a pre-known origin or one specified by the app developer
  // in their call to app.initialize
  const messageSource = evt.source || (evt as unknown as DOMMessageEvent)?.originalEvent?.source;
  const messageOrigin = evt.origin || (evt as unknown as DOMMessageEvent)?.originalEvent?.origin;
  if (!messageSource) {
    logger('Message being ignored by app because it is coming for a target that is null');
    return;
  }

  if (!shouldProcessMessage(messageSource, messageOrigin)) {
    logger(
      'Message being ignored by app because it is either coming from the current window or a different window with an invalid origin',
    );
    return;
  }

  /**
   * In most cases, top level window and the parent window will be same.
   * If they're not, perform the necessary updates for the top level window.
   *
   * Top window logic to flush messages is kept independent so that we don't affect
   * any of the code for the existing communication channel.
   */
  if (!Communication.topWindow || Communication.topWindow.closed || messageSource === Communication.topWindow) {
    Communication.topWindow = messageSource;
    Communication.topOrigin = messageOrigin;
  }

  // Clean up pointers to closed parent and child windows
  if (Communication.topWindow && Communication.topWindow.closed) {
    Communication.topWindow = null;
    Communication.topOrigin = null;
  }

  flushMessageQueue(Communication.topWindow);

  // Return the response to the registered callback
  onMessageReceived(message);
}

const shouldProcessMessageLogger = communicationLogger.extend('shouldProcessMessage');

/**
 * @hidden
 * Validates the message source and origin, if it should be processed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
async function shouldProcessMessage(messageSource: Window, messageOrigin: string): Promise<boolean> {
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
    const isOriginValid = await validateOrigin(new URL(messageOrigin));
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

// /**
//  * @internal
//  * Limited to Microsoft-internal use
//  */
// function retrieveCallbackByMessageUUID(
//   map: Map<MessageUUID, Function>,
//   responseUUID: MessageUUID,
// ): Function | undefined {
//   const callback = [...map].find(([key, value]) => {
//     return key.getUuidValue === responseUUID.getUuidValue;
//   });

//   if (callback) {
//     return callback[1];
//   }
//   return undefined;
// }
/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleParentMessage(evt: DOMMessageEvent): void {
  const logger = handleParentMessageLogger;

  if ('id' in evt.data && typeof evt.data.id === 'number') {
    // Call any associated Communication.callbacks
    const message = evt.data as MessageResponse;
    const callbackId = message.uuid
      ? new MessageUUID(message.uuid)
      : CommunicationPrivate.legacyMessageIdsToUuidMap[message.id];
    const callback = CommunicationPrivate.callbacks.get(callbackId);
    logger('Received a response from parent for message %i', callbackId);
    if (callback) {
      logger('Invoking the registered callback for message %i with arguments %o', callbackId, message.args);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      callback.apply(null, [...message.args, message.isPartialResponse]);

      // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
      if (!isPartialResponse(evt)) {
        logger('Removing registered callback for message %i', callbackId);
        CommunicationPrivate.callbacks.delete(callbackId);
        delete CommunicationPrivate.legacyMessageIdsToUuidMap[message.id];
      }
    }
    const promiseCallback = CommunicationPrivate.promiseCallbacks.get(callbackId);
    if (promiseCallback) {
      logger('Invoking the registered promise callback for message %i with arguments %o', callbackId, message.args);
      promiseCallback(message.args);

      logger('Removing registered promise callback for message %i', callbackId);
      CommunicationPrivate.promiseCallbacks.delete(callbackId);
      delete CommunicationPrivate.legacyMessageIdsToUuidMap[message.id];
    }
    const portCallback = CommunicationPrivate.portCallbacks.get(callbackId);
    if (portCallback) {
      logger('Invoking the registered port callback for message %i with arguments %o', callbackId, message.args);
      let port: MessagePort | undefined;
      if (evt.ports && evt.ports[0] instanceof MessagePort) {
        port = evt.ports[0];
      }
      portCallback(port, message.args);

      logger('Removing registered port callback for message %i', callbackId);
      CommunicationPrivate.portCallbacks.delete(callbackId);
      delete CommunicationPrivate.legacyMessageIdsToUuidMap[message.id];
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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sendMessageResponseToChild(message.id, Array.isArray(result) ? result : [result]);
    } else {
      // No handler, proxy to parent
      sendMessageToParent(
        getApiVersionTag(ApiVersionNumber.V_2, ApiName.Tasks_StartTask),
        message.func,
        message.args,
        (...args: any[]): void => {
          if (Communication.childWindow) {
            const isPartialResponse = args.pop();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sendMessageResponseToChild(message.id, args, isPartialResponse);
          }
        },
      );
    }
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Checks if the top window and the parent window are different.
 *
 * @returns {boolean} Returns true if the top window and the parent window are different, false otherwise.
 */
function areTopAndParentWindowsDistinct(): boolean {
  return Communication.topWindow !== Communication.parentWindow;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetMessageQueue(targetWindow: Window | null): MessageRequest[] {
  if (targetWindow === Communication.topWindow && areTopAndParentWindowsDistinct()) {
    return CommunicationPrivate.topMessageQueue;
  } else if (targetWindow === Communication.parentWindow) {
    return CommunicationPrivate.parentMessageQueue;
  } else if (targetWindow === Communication.childWindow) {
    return CommunicationPrivate.childMessageQueue;
  } else {
    return [];
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetOrigin(targetWindow: Window | null): string | null {
  if (targetWindow === Communication.topWindow && areTopAndParentWindowsDistinct()) {
    return Communication.topOrigin;
  } else if (targetWindow === Communication.parentWindow) {
    return Communication.parentOrigin;
  } else if (targetWindow === Communication.childWindow) {
    return Communication.childOrigin;
  } else {
    return null;
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function getTargetName(targetWindow: Window | null): string | null {
  if (targetWindow === Communication.topWindow && areTopAndParentWindowsDistinct()) {
    return 'top';
  } else if (targetWindow === Communication.parentWindow) {
    return 'parent';
  } else if (targetWindow === Communication.childWindow) {
    return 'child';
  } else {
    return null;
  }
}

const flushMessageQueueLogger = communicationLogger.extend('flushMessageQueue');
/**
 * @internal
 * Limited to Microsoft-internal use
 */
function flushMessageQueue(targetWindow: Window | any): void {
  const targetOrigin = getTargetOrigin(targetWindow);
  const targetMessageQueue = getTargetMessageQueue(targetWindow);
  const target = getTargetName(targetWindow);

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
  let messageQueueMonitor: ReturnType<typeof setInterval>;
  /* const cannot be used to declare messageQueueMonitor here because of the JS temporal dead zone. In order for messageQueueMonitor to be referenced inside setInterval,
     it has to be defined before the setInterval call. */
  /* eslint-disable-next-line prefer-const */
  messageQueueMonitor = Communication.currentWindow.setInterval(() => {
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
function sendMessageResponseToChild(id: MessageID, args?: any[], isPartialResponse?: boolean): void {
  const targetWindow = Communication.childWindow;
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
  const messageId: MessageID = CommunicationPrivate.nextMessageId++;
  const messageUuid: MessageUUID = new MessageUUID();
  CommunicationPrivate.legacyMessageIdsToUuidMap[messageId] = messageUuid;
  return {
    id: messageId,
    uuid: messageUuid,
    func: func,
    timestamp: Date.now(),
    args: args || [],
    apiVersionTag: apiVersionTag,
  };
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Creates a nested app authentication request.
 *
 * @param {string} message - The message to be included in the request. This is typically a stringified JSON object containing the details of the authentication request.
 * The reason for using a string is to allow complex data structures to be sent as a message while avoiding potential issues with object serialization and deserialization.
 *
 * @returns {NestedAppAuthRequest} Returns a NestedAppAuthRequest object with a unique id, the function name set to 'nestedAppAuthRequest', the current timestamp, an empty args array, and the provided message as data.
 */
function createNestedAppAuthRequest(message: string): NestedAppAuthRequest {
  const messageId: MessageID = CommunicationPrivate.nextMessageId++;
  const messageUuid: MessageUUID = new MessageUUID();
  CommunicationPrivate.legacyMessageIdsToUuidMap[messageId] = messageUuid;
  return {
    id: messageId,
    uuid: messageUuid,
    func: 'nestedAppAuth.execute',
    timestamp: Date.now(),
    // Since this is a nested app auth request, we don't need to send any args.
    // We avoid overloading the args array with the message to avoid potential issues processing of these messages on the hubSDK.
    args: [],
    data: message,
  };
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageResponse(id: MessageID, args: any[] | undefined, isPartialResponse?: boolean): MessageResponse {
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
