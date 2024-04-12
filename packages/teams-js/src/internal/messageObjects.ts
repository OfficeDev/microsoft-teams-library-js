/**
 * @internal
 * Limited to Microsoft-internal use
 */
export type MessageID = number | string;

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export type MessageUUID = string;

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MessageRequest {
  id?: MessageID;
  uuid?: MessageUUID;
  func: string;
  timestamp?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
  apiVersionTag?: string;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export interface MessageResponse {
  id: MessageID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args?: any[];
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
  timestamp: number;
}
