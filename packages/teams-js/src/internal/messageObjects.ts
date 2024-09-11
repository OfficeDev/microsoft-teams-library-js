import { UUID as MessageUUID } from './uuidObject';

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * MessageIDs represent the legacy number id used for processing MessageRequests and MessageResponses
 */
export type MessageID = number;

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MessageRequest {
  id?: MessageID;
  uuid?: MessageUUID;
  func: string;
  timestamp?: number;
  monotonicTimestamp?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  apiVersionTag?: string;
  isPartialResponse?: boolean;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface SerializedMessageRequest {
  id?: MessageID;
  uuidAsString?: string;
  func: string;
  timestamp?: number;
  monotonicTimestamp?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  apiVersionTag?: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface SerializedMessageResponse {
  id: MessageID;
  uuidAsString?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  timestamp?: number;
  isPartialResponse?: boolean; // If the message is partial, then there will be more future responses for the given message ID.
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MessageResponse {
  id: MessageID;
  uuid?: MessageUUID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  timestamp?: number;
  isPartialResponse?: boolean; // If the message is partial, then there will be more future responses for the given message ID.
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * For reasons that are unclear at this time, some MessageRequest objects can exist without an id or timestamp, even though
 * many parts of code assume that they are defined.
 * To enable type-safety in some scenarios, this new interface can be used where these properties are required. Because it
 * derives from the original interface, objects of this type can be user interchangeably with the original interface.
 * As the required messaging scenarios are better understood, the interfaces will eventually be updated and
 * merged. However, it's a journey.
 */
export interface MessageRequestWithRequiredProperties extends MessageRequest {
  id: MessageID;
  uuid: MessageUUID;
  /** Deprecated field, is still here for backwards compatibility */
  timestamp: number;
  monotonicTimestamp: number;
}

export const serializeMessageRequest = (message: MessageRequest): SerializedMessageRequest => {
  const { uuid, ...restOfMessage } = message;
  const uuidAsString = uuid?.toString();
  const request: SerializedMessageRequest = {
    ...restOfMessage,
    uuidAsString: uuidAsString,
  };
  return request;
};

export const deserializeMessageRequest = (message: SerializedMessageRequest): MessageRequest => {
  const { uuidAsString, ...restOfMessage } = message;
  const request: MessageRequest = {
    ...restOfMessage,
    uuid: uuidAsString ? new MessageUUID(uuidAsString) : undefined,
  };
  return request;
};

export const deserializeMessageResponse = (serializedResponse: SerializedMessageResponse): MessageResponse => {
  const { uuidAsString, ...restOfResponse } = serializedResponse;
  const messageResponse: MessageResponse = {
    ...restOfResponse,
    uuid: uuidAsString ? new MessageUUID(uuidAsString) : undefined,
  };
  return messageResponse;
};

export const serializeMessageResponse = (response: MessageResponse): SerializedMessageResponse => {
  const { uuid, ...restOfResponse } = response;
  const uuidAsString = uuid?.toString();
  const messageResponse: SerializedMessageResponse = {
    ...restOfResponse,
    uuidAsString: uuidAsString,
  };
  return messageResponse;
};
