import { UUID as MessageUUID } from '../public/uuidObject';
import { MessageRequest, SerializedMessageRequest, serializeMessageRequest } from './messageObjects';
import { getLogger } from './telemetry';

interface MessageWithUUIDOrID {
  uuidAsString?: string;
  uuid?: MessageUUID;
  id?: number | undefined;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function getMessageIdsAsLogString(message: MessageWithUUIDOrID): string {
  if (message.uuidAsString !== undefined) {
    return `${message.uuidAsString} (legacy id: ${message.id})`;
  }
  if (message.uuid !== undefined) {
    return `${message.uuid.toString()} (legacy id: ${message.id})`;
  }
  return `legacy id: ${message.id} (no uuid)`;
}

const flushMessageQueueLogger = getLogger('flushMessageQueue');

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export function flushMessageQueue(
  targetWindow: Window | null,
  targetOrigin: string | null,
  targetMessageQueue: MessageRequest[],
  target: 'top' | 'parent' | 'child',
): void {
  if (!targetWindow || !targetOrigin || targetMessageQueue.length === 0) {
    return;
  }
  while (targetMessageQueue.length > 0) {
    const messageRequest = targetMessageQueue.shift();
    if (messageRequest) {
      const request: SerializedMessageRequest = serializeMessageRequest(messageRequest);
      flushMessageQueueLogger(
        'Flushing message %s from %s message queue via postMessage.',
        getMessageIdsAsLogString(request),
        target,
      );

      targetWindow.postMessage(request, targetOrigin);
    }
  }
}
