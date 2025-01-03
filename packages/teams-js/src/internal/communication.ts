/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable strict-null-checks/all */

import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from '../public/constants';
import { ErrorCode, isSdkError, SdkError } from '../public/interfaces';
import { latestRuntimeApiVersion } from '../public/runtime';
import { ISerializable, isSerializable } from '../public/serializable.interface';
import { version } from '../public/version';
import { GlobalVars } from './globalVars';
import { callHandler } from './handlers';
import HostToAppMessageDelayTelemetry from './hostToAppTelemetry';
import { DOMMessageEvent, ExtendedWindow } from './interfaces';
import {
  deserializeMessageRequest,
  deserializeMessageResponse,
  MessageID,
  MessageRequest,
  MessageRequestWithRequiredProperties,
  MessageResponse,
  SerializedMessageRequest,
  SerializedMessageResponse,
  serializeMessageRequest,
  serializeMessageResponse,
} from './messageObjects';
import {
  NestedAppAuthMessageEventNames,
  NestedAppAuthRequest,
  ParsedNestedAppAuthMessageData,
  tryPolyfillWithNestedAppAuthBridge,
} from './nestedAppAuthUtils';
import { ResponseHandler, SimpleType } from './responseHandler';
import { getLogger, isFollowingApiVersionTagFormat } from './telemetry';
import { getCurrentTimestamp, ssrSafeWindow } from './utils';
import { UUID as MessageUUID } from './uuidObject';
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
  public static promiseCallbacks: Map<MessageUUID, (value?: unknown) => void> = new Map();
  public static portCallbacks: Map<MessageUUID, (port?: MessagePort, args?: unknown[]) => void> = new Map();
  public static messageListener: Function;
  public static legacyMessageIdsToUuidMap: {
    [legacyId: MessageID]: MessageUUID;
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
  CommunicationPrivate.messageListener = (evt: DOMMessageEvent): Promise<void> => processIncomingMessage(evt);

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
      extendedWindow.onNativeMessage = handleIncomingMessageFromParent;
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
      validMessageOrigins,
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
  HostToAppMessageDelayTelemetry.clearMessages();
}

/**
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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
 * @deprecated This function will no longer be exported in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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

function serializeItemArray(items: (SimpleType | ISerializable)[]): (SimpleType | object)[] {
  return items.map((item) => {
    if (isSerializable(item)) {
      return item.serialize();
    } else {
      return item;
    }
  });
}

/**
 * Call a function in the host and receive a response. If the host returns an {@link SdkError} instead of a normal response, this function will throw a new Error containing the SdkError's information
 *
 * @param functionName The function name to call in the host.
 * @param args A collection of data to pass to the host. This data must be an array of either simple types or objects that implement {@link ISerializable}.
 * @param responseHandler When the host responds, this handler will validate and deserialize the response.
 * @param apiVersionTag A unique tag used to identify the API version for telemetry purposes. This should be set using {@link getApiVersionTag}, which should be passed a unique string identifying the function being called by the app developer as well as a version number that is incremented whenever meaningful changes are made to that function.
 * @param isResponseAReportableError This optional property can be used to override the default ErrorChecking this function uses to decide whether to throw the host response as a new Error. Specify this if your function needs to do any logic verifying that the object received is an error that goes beyond the logic found in {@link isSdkError}.
 *
 * @returns The response received from the host after deserialization.
 *
 * @throws An Error containing the SdkError information ({@link SdkError.errorCode} and {@link SdkError.message}) if the host returns an SdkError, or an Error if the response from the host is an unexpected format.
 */
export async function callFunctionInHostAndHandleResponse<
  SerializedReturnValueFromHost,
  DeserializedReturnValueFromHost,
>(
  functionName: string,
  args: (SimpleType | ISerializable)[],
  responseHandler: ResponseHandler<SerializedReturnValueFromHost, DeserializedReturnValueFromHost>,
  apiVersionTag: string,
  isResponseAReportableError?: (response: unknown) => response is { errorCode: number | string; message?: string },
): Promise<DeserializedReturnValueFromHost> {
  const serializedArguments = serializeItemArray(args);
  const [response] = await sendMessageToParentAsync<[SerializedReturnValueFromHost | SdkError]>(
    apiVersionTag,
    functionName,
    serializedArguments,
  );

  if (
    (isResponseAReportableError && isResponseAReportableError(response)) ||
    (!isResponseAReportableError && isSdkError(response))
  ) {
    throw new Error(`${response.errorCode}, message: ${response.message ?? 'None'}`);
  } else if (!responseHandler.validate(response as SerializedReturnValueFromHost)) {
    throw new Error(`${ErrorCode.INTERNAL_ERROR}, message: Invalid response from host - ${JSON.stringify(response)}`);
  } else {
    return responseHandler.deserialize(response as SerializedReturnValueFromHost);
  }
}

/**
 * Call a function in the host that receives either an {@link SdkError} or undefined as a response. If the host returns an {@link SdkError} this function will throw a new Error containing the SdkError's information.
 *
 * @param functionName The function name to call in the host.
 * @param args A collection of data to pass to the host. This data must be an array of either simple types or objects that implement {@link ISerializable}.
 * @param apiVersionTag A unique tag used to identify the API version for telemetry purposes. This should be set using {@link getApiVersionTag}, which should be passed a unique string identifying the function being called by the app developer as well as a version number that is incremented whenever meaningful changes are made to that function.
 * @param isResponseAReportableError This optional property can be used to override the default ErrorChecking this function uses to decide whether to throw the host response as a new Error. Specify this is your function needs to do any logic verifying that the object received is an error that goes beyond the logic found in {@link isSdkError}.
 *
 * @throws An Error containing the SdkError information ({@link SdkError.errorCode} and {@link SdkError.message}) if the host returns an SdkError, or an Error if the response from the host is an unexpected format.
 */
export async function callFunctionInHost(
  functionName: string,
  args: (SimpleType | ISerializable)[],
  apiVersionTag: string,
  isResponseAReportableError?: (response: unknown) => response is { errorCode: number | string; message?: string },
): Promise<void> {
  const serializedArguments = serializeItemArray(args);
  const [response] = await sendMessageToParentAsync<[SdkError]>(apiVersionTag, functionName, serializedArguments);

  if (
    (isResponseAReportableError && isResponseAReportableError(response)) ||
    (!isResponseAReportableError && isSdkError(response))
  ) {
    throw new Error(`${response.errorCode}, message: ${response.message ?? 'None'}`);
  } else if (response !== undefined) {
    // If we receive a response from the host that is not a recognized error type it is an invalid response
    throw new Error(`${ErrorCode.INTERNAL_ERROR}, message: Invalid response from host`);
  }
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
function waitForPort(requestUuid: MessageUUID): Promise<MessagePort> {
  return new Promise<MessagePort>((resolve, reject) => {
    CommunicationPrivate.portCallbacks.set(requestUuid, (port: MessagePort | undefined, args?: unknown[]) => {
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
function waitForResponse<T>(requestUuid: MessageUUID): Promise<T> {
  return new Promise<T>((resolve) => {
    CommunicationPrivate.promiseCallbacks.set(requestUuid, resolve);
  });
}

/**
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendMessageToParent(apiVersionTag: string, actionName: string, callback?: Function): void;

/**
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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
 * @deprecated This function is deprecated and will be removed in a future release. Please use {@link callFunctionInHostAndHandleResponse} or {@link callFunctionInHost} instead.
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

  logger('Message %s information: %o', getMessageIdsAsLogString(request), {
    actionName: request.func,
  });

  return sendRequestToTargetWindowHelper(targetWindow, request) as NestedAppAuthRequest;
}

const sendRequestToTargetWindowHelperLogger = communicationLogger.extend('sendRequestToTargetWindowHelper');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendRequestToTargetWindowHelper(
  targetWindow: Window,
  messageRequest: MessageRequestWithRequiredProperties | NestedAppAuthRequest,
): MessageRequestWithRequiredProperties | NestedAppAuthRequest {
  const logger = sendRequestToTargetWindowHelperLogger;
  const targetWindowName = getTargetName(targetWindow);
  const request: SerializedMessageRequest = serializeMessageRequest(messageRequest);

  if (GlobalVars.isFramelessWindow) {
    if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
      logger(
        'Sending message %s to %s via framelessPostMessage interface',
        getMessageIdsAsLogString(request),
        targetWindowName,
      );
      (Communication.currentWindow as ExtendedWindow).nativeInterface.framelessPostMessage(JSON.stringify(request));
    }
  } else {
    const targetOrigin = getTargetOrigin(targetWindow);

    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
      logger('Sending message %s to %s via postMessage', getMessageIdsAsLogString(request), targetWindowName);
      targetWindow.postMessage(request, targetOrigin);
    } else {
      logger('Adding message %s to %s message queue', getMessageIdsAsLogString(request), targetWindowName);
      getTargetMessageQueue(targetWindow).push(messageRequest);
    }
  }
  return messageRequest;
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
  HostToAppMessageDelayTelemetry.storeCallbackInformation(request.uuid, {
    name: actionName,
    calledAt: request.timestamp,
  });

  logger('Message %s information: %o', getMessageIdsAsLogString(request), { actionName, args });

  return sendRequestToTargetWindowHelper(targetWindow, request);
}

const processIncomingMessageLogger = communicationLogger.extend('processIncomingMessage');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
async function processIncomingMessage(evt: DOMMessageEvent): Promise<void> {
  // Process only if we received a valid message
  if (!evt || !evt.data || typeof evt.data !== 'object') {
    processIncomingMessageLogger(
      'Unrecognized message format received by app, message being ignored. Message: %o',
      evt,
    );
    return;
  }

  // Process only if the message is coming from a different window and a valid origin
  // valid origins are either a pre-known origin or one specified by the app developer
  // in their call to app.initialize
  const messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
  const messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);

  return shouldProcessIncomingMessage(messageSource, messageOrigin).then((result) => {
    if (!result) {
      processIncomingMessageLogger(
        'Message being ignored by app because it is either coming from the current window or a different window with an invalid origin, message: %o, source: %o, origin: %o',
        evt,
        messageSource,
        messageOrigin,
      );
      return;
    }
    // Update our parent and child relationships based on this message
    updateRelationships(messageSource, messageOrigin);
    // Handle the message
    if (messageSource === Communication.parentWindow) {
      handleIncomingMessageFromParent(evt);
    } else if (messageSource === Communication.childWindow) {
      handleIncomingMessageFromChild(evt);
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

  const { args } = evt.data as SerializedMessageResponse;
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

  if (!shouldProcessIncomingMessage(messageSource, messageOrigin)) {
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

const shouldProcessIncomingMessageLogger = communicationLogger.extend('shouldProcessIncomingMessage');

/**
 * @hidden
 * Validates the message source and origin, if it should be processed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
async function shouldProcessIncomingMessage(messageSource: Window, messageOrigin: string): Promise<boolean> {
  // Process if message source is a different window and if origin is either in
  // Teams' pre-known whitelist or supplied as valid origin by user during initialization
  if (Communication.currentWindow && messageSource === Communication.currentWindow) {
    shouldProcessIncomingMessageLogger('Should not process message because it is coming from the current window');
    return false;
  } else if (
    Communication.currentWindow &&
    Communication.currentWindow.location &&
    messageOrigin &&
    messageOrigin === Communication.currentWindow.location.origin
  ) {
    return true;
  } else {
    let messageOriginURL: URL;
    try {
      messageOriginURL = new URL(messageOrigin);
    } catch (_) {
      shouldProcessIncomingMessageLogger('Message has an invalid origin of %s', messageOrigin);
      return false;
    }

    const isOriginValid = await validateOrigin(messageOriginURL);
    if (!isOriginValid) {
      shouldProcessIncomingMessageLogger('Message has an invalid origin of %s', messageOrigin);
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

const handleIncomingMessageFromParentLogger = communicationLogger.extend('handleIncomingMessageFromParent');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function retrieveMessageUUIDFromResponse(response: MessageResponse): MessageUUID | undefined {
  const logger = handleIncomingMessageFromParentLogger;
  if (response.uuid) {
    const responseUUID = response.uuid;
    const callbackUUID = retrieveMessageUUIDFromCallback(CommunicationPrivate.callbacks, responseUUID);
    if (callbackUUID) {
      return callbackUUID;
    }
    const promiseCallbackUUID = retrieveMessageUUIDFromCallback(CommunicationPrivate.promiseCallbacks, responseUUID);
    if (promiseCallbackUUID) {
      return promiseCallbackUUID;
    }
    const portCallbackUUID = retrieveMessageUUIDFromCallback(CommunicationPrivate.portCallbacks, responseUUID);
    if (portCallbackUUID) {
      return portCallbackUUID;
    }
  } else {
    return CommunicationPrivate.legacyMessageIdsToUuidMap[response.id];
  }
  logger('Received message %s that failed to produce a callbackId', getMessageIdsAsLogString(response));
  return undefined;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * This function is used to compare a new MessageUUID object value to the key values in the specified callback and retrieving that key
 * We use this because two objects with the same value are not considered equivalent therefore we can't use the new MessageUUID object
 * as a key to retrieve the value associated with it and should use this function instead.
 */
function retrieveMessageUUIDFromCallback(
  map: Map<MessageUUID, Function>,
  responseUUID?: MessageUUID,
): MessageUUID | undefined {
  if (responseUUID) {
    const callback = [...map].find(([key, _value]) => {
      return key.toString() === responseUUID.toString();
    });

    if (callback) {
      return callback[0];
    }
  }
  return undefined;
}
/**
 * @internal
 * Limited to Microsoft-internal use
 */
function removeMessageHandlers(message: MessageResponse, map: Map<MessageUUID, Function>): void {
  const callbackId = retrieveMessageUUIDFromCallback(map, message.uuid);
  if (callbackId) {
    map.delete(callbackId);
  }
  if (!message.uuid) {
    delete CommunicationPrivate.legacyMessageIdsToUuidMap[message.id];
  } else {
    //If we are here, then the parent is capable of sending UUIDs, therefore free up memory
    CommunicationPrivate.legacyMessageIdsToUuidMap = {};
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleIncomingMessageFromParent(evt: DOMMessageEvent): void {
  const logger = handleIncomingMessageFromParentLogger;
  const timeWhenMessageArrived = getCurrentTimestamp();

  if ('id' in evt.data && typeof evt.data.id === 'number') {
    // Call any associated Communication.callbacks
    const serializedResponse = evt.data as SerializedMessageResponse;
    const message: MessageResponse = deserializeMessageResponse(serializedResponse);
    const callbackId = retrieveMessageUUIDFromResponse(message);
    if (callbackId) {
      const callback = CommunicationPrivate.callbacks.get(callbackId);
      logger('Received a response from parent for message %s', callbackId.toString());
      HostToAppMessageDelayTelemetry.handlePerformanceMetrics(callbackId, message, logger, timeWhenMessageArrived);
      if (callback) {
        logger(
          'Invoking the registered callback for message %s with arguments %o',
          callbackId.toString(),
          message.args,
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        callback.apply(null, [...message.args, message.isPartialResponse]);

        // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
        if (!isPartialResponse(evt)) {
          logger('Removing registered callback for message %s', callbackId.toString());
          removeMessageHandlers(message, CommunicationPrivate.callbacks);
        }
      }
      const promiseCallback = CommunicationPrivate.promiseCallbacks.get(callbackId);
      if (promiseCallback) {
        logger(
          'Invoking the registered promise callback for message %s with arguments %o',
          callbackId.toString(),
          message.args,
        );
        promiseCallback(message.args);

        logger('Removing registered promise callback for message %s', callbackId.toString());
        removeMessageHandlers(message, CommunicationPrivate.promiseCallbacks);
      }
      const portCallback = CommunicationPrivate.portCallbacks.get(callbackId);
      if (portCallback) {
        logger(
          'Invoking the registered port callback for message %s with arguments %o',
          callbackId.toString(),
          message.args,
        );
        let port: MessagePort | undefined;
        if (evt.ports && evt.ports[0] instanceof MessagePort) {
          port = evt.ports[0];
        }
        portCallback(port, message.args);

        logger('Removing registered port callback for message %s', callbackId.toString());
        removeMessageHandlers(message, CommunicationPrivate.portCallbacks);
      }
      if (message.uuid) {
        CommunicationPrivate.legacyMessageIdsToUuidMap = {};
      }
    }
  } else if ('func' in evt.data && typeof evt.data.func === 'string') {
    // Delegate the request to the proper handler
    const message = evt.data as MessageRequest;
    HostToAppMessageDelayTelemetry.handleOneWayPerformanceMetrics(message, logger, timeWhenMessageArrived);
    logger('Received a message from parent %s, action: "%s"', getMessageIdsAsLogString(message), message.func);
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

const handleIncomingMessageFromChildLogger = communicationLogger.extend('handleIncomingMessageFromChild');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleIncomingMessageFromChild(evt: DOMMessageEvent): void {
  if ('id' in evt.data && 'func' in evt.data) {
    // Try to delegate the request to the proper handler, if defined
    const message = deserializeMessageRequest(evt.data as SerializedMessageRequest);
    const [called, result] = callHandler(message.func, message.args);
    if (called && typeof result !== 'undefined') {
      handleIncomingMessageFromChildLogger(
        'Returning message %s from child back to child, action: %s.',
        getMessageIdsAsLogString(message),
        message.func,
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sendMessageResponseToChild(message.id, message.uuid, Array.isArray(result) ? result : [result]);
    } else {
      // No handler, proxy to parent

      handleIncomingMessageFromChildLogger(
        'Relaying message %s from child to parent, action: %s. Relayed message will have a new id.',
        getMessageIdsAsLogString(message),
        message.func,
      );

      sendMessageToParent(
        getApiVersionTag(ApiVersionNumber.V_2, ApiName.Tasks_StartTask),
        message.func,
        message.args,
        (...args: any[]): void => {
          if (Communication.childWindow) {
            const isPartialResponse = args.pop();
            handleIncomingMessageFromChildLogger(
              'Message from parent being relayed to child, id: %s',
              getMessageIdsAsLogString(message),
            );
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sendMessageResponseToChild(message.id, message.uuid, args, isPartialResponse);
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
    const messageRequest = targetMessageQueue.shift();
    if (messageRequest) {
      const request: SerializedMessageRequest = serializeMessageRequest(messageRequest);

      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      flushMessageQueueLogger(
        'Flushing message %s from %s message queue via postMessage.',
        getMessageIdsAsLogString(request),
        target,
      );

      targetWindow.postMessage(request, targetOrigin);
    }
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
function sendMessageResponseToChild(
  id: MessageID,
  uuid?: MessageUUID,
  args?: any[],
  isPartialResponse?: boolean,
): void {
  const targetWindow = Communication.childWindow;
  const response = createMessageResponse(id, uuid, args, isPartialResponse);
  const serializedResponse = serializeMessageResponse(response);
  const targetOrigin = getTargetOrigin(targetWindow);
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(serializedResponse, targetOrigin);
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
    monotonicTimestamp: getCurrentTimestamp(),
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
    monotonicTimestamp: getCurrentTimestamp(),
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
function createMessageResponse(
  id: MessageID,
  uuid?: MessageUUID,
  args?: any[] | undefined,
  isPartialResponse?: boolean,
): MessageResponse {
  return {
    id: id,
    uuid: uuid,
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

function getMessageIdsAsLogString(
  message:
    | SerializedMessageRequest
    | SerializedMessageResponse
    | MessageRequestWithRequiredProperties
    | MessageRequest
    | MessageResponse
    | NestedAppAuthRequest,
): string {
  if ('uuidAsString' in message) {
    return `${message.uuidAsString} (legacy id: ${message.id})`;
  } else if ('uuid' in message && message.uuid !== undefined) {
    return `${message.uuid.toString()} (legacy id: ${message.id})`;
  } else {
    return `legacy id: ${message.id} (no uuid)`;
  }
}
