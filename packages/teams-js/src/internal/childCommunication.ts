/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { UUID as MessageUUID } from '../public/uuidObject';
import { flushMessageQueue, getMessageIdsAsLogString } from './communicationUtils';
import { callHandler } from './handlers';
import { DOMMessageEvent } from './interfaces';
import {
  deserializeMessageRequest,
  MessageID,
  MessageRequest,
  MessageRequestWithRequiredProperties,
  MessageResponse,
  SerializedMessageRequest,
  serializeMessageResponse,
} from './messageObjects';
import { ApiName, ApiVersionNumber, getApiVersionTag } from './telemetry';
import { getLogger } from './telemetry';

const communicationLogger = getLogger('childProxyingCommunication');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
class ChildCommunication {
  public static window: Window | null;
  public static origin: string | null;
  public static messageQueue: MessageRequest[] = [];
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function uninitializeChildCommunication(): void {
  ChildCommunication.window = null;
  ChildCommunication.origin = null;
  ChildCommunication.messageQueue = [];
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function shouldEventBeRelayedToChild(): boolean {
  return !!ChildCommunication.window;
}

type SendMessageToParentHelper = (
  apiVersionTag: string,
  func: string,
  args?: any[],
  isProxiedFromChild?: boolean,
) => MessageRequestWithRequiredProperties;

type SetCallbackForRequest = (uuid: MessageUUID, callback: Function) => void;

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function shouldMessageBeProxiedToParent(messageSource: Window, messageOrigin: string): boolean {
  if (!ChildCommunication.window || ChildCommunication.window.closed || messageSource === ChildCommunication.window) {
    ChildCommunication.window = messageSource;
    ChildCommunication.origin = messageOrigin;
  }

  // Clean up pointers to child windows
  if (ChildCommunication.window && ChildCommunication.window.closed) {
    ChildCommunication.window = null;
    ChildCommunication.origin = null;
    return false;
  }

  return ChildCommunication.window === messageSource;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export async function proxyChildMessageToParent(
  evt: DOMMessageEvent,
  messageSource: Window,
  sendMessageToParentHelper: SendMessageToParentHelper,
  setCallbackForRequest: SetCallbackForRequest,
): Promise<void> {
  // Do not do anything if message source does not match child window
  if (ChildCommunication.window !== messageSource) {
    return;
  }

  // If we have any messages in our queue, send them now
  flushMessageQueue(ChildCommunication.window, ChildCommunication.origin, ChildCommunication.messageQueue, 'child');

  // Handle the message
  handleIncomingMessageFromChild(evt, sendMessageToParentHelper, setCallbackForRequest);
}

const handleIncomingMessageFromChildLogger = communicationLogger.extend('handleIncomingMessageFromChild');

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function handleIncomingMessageFromChild(
  evt: DOMMessageEvent,
  sendMessageToParentHelper: SendMessageToParentHelper,
  setCallbackForRequest: SetCallbackForRequest,
): void {
  if (evt.data.id === undefined || evt.data.func === undefined) {
    return;
  }

  // Try to delegate the request to the proper handler, if defined
  const message = deserializeMessageRequest(evt.data as SerializedMessageRequest);
  const [called, result] = callHandler(message.func, message.args);

  // If a handler was called and returned a value, send the response back to the child
  if (called && typeof result !== 'undefined') {
    handleIncomingMessageFromChildLogger(
      'Handler called in response to message %s from child. Returning response from handler to child, action: %s.',
      getMessageIdsAsLogString(message),
      message.func,
    );

    sendMessageResponseToChild(message.id!, message.uuid, Array.isArray(result) ? result : [result]);
    return;
  }

  // No handler, proxy to parent
  handleIncomingMessageFromChildLogger(
    'No handler for message %s from child found; relaying message on to parent, action: %s. Relayed message will have a new id.',
    getMessageIdsAsLogString(message),
    message.func,
  );

  sendChildMessageToParent(message, sendMessageToParentHelper, setCallbackForRequest);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function sendChildMessageToParent(
  message: MessageRequest,
  sendMessageToParentHelper: SendMessageToParentHelper,
  setCallbackForRequest: SetCallbackForRequest,
): void {
  const request = sendMessageToParentHelper(
    getApiVersionTag(ApiVersionNumber.V_2, ApiName.Tasks_StartTask),
    message.func,
    message.args,
    true, // Tags message as proxied from child
  );
  setCallbackForRequest(request.uuid, (...args: any[]): void => {
    if (ChildCommunication.window) {
      const isPartialResponse = args.pop();
      handleIncomingMessageFromChildLogger(
        'Message from parent being relayed to child, id: %s',
        getMessageIdsAsLogString(message),
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      sendMessageResponseToChild(message.id, message.uuid, args, isPartialResponse);
    }
  });
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
  const targetWindow = ChildCommunication.window;
  const response = createMessageResponse(id, uuid, args, isPartialResponse);
  const serializedResponse = serializeMessageResponse(response);
  const targetOrigin = ChildCommunication.origin;
  if (targetWindow && targetOrigin) {
    handleIncomingMessageFromChildLogger(
      'Sending message %s to %s via postMessage, args = %o',
      getMessageIdsAsLogString(serializedResponse),
      'child',
      serializedResponse.args,
    );
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
  const targetWindow = ChildCommunication.window;
  /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
  const customEvent = createMessageEvent(actionName, args);
  const targetOrigin = ChildCommunication.origin;

  // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
  // queue the message and send it after the origin is established
  if (targetWindow && targetOrigin) {
    targetWindow.postMessage(customEvent, targetOrigin);
  } else {
    ChildCommunication.messageQueue.push(customEvent);
  }
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
function createMessageResponse(
  id: MessageID,
  uuid?: MessageUUID,
  args?: unknown[] | undefined,
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
function createMessageEvent(func: string, args?: unknown[]): MessageRequest {
  return {
    func: func,
    args: args || [],
  };
}
