/**
 * @hidden
 * @internal
 * @beta
 * @module
 * Limited to Microsoft-internal use
 *
 * This capability allows an app to associate apps with a host entity, such as a Teams channel or chat, and configure them as needed.
 */

import { ensureInitialized } from '../../internal/internalAPIs';
import { runtime } from '../../public/runtime';
import * as tab from './tab';

export enum AppTypes {
  edu = 'EDU',
}

/**
 * Id of the teams entity like channel, chat
 */
interface TeamsEntityId {
  threadId: string;
}

/**
 * Id of message in which channel meeting is created
 */
export interface TeamsChannelMeetingEntityIds extends TeamsEntityId {
  parentMessageId: string;
}

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * Additional parameters associated with a meeting
 */
export interface TeamsExtraMeetingInputs {
  /**
   * True if Apps will be installed to a Townhall meeting
   */
  isTownhall: boolean;
  /**
   * True if apps will be installed to streaming thread
   */
  isStreamingThread: boolean;
}

/**
 * Id of the host entity
 */
export type HostEntityIds = TeamsEntityId | TeamsChannelMeetingEntityIds;

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * Checks if the hostEntity capability is supported by the host
 * @returns boolean to represent whether the hostEntity capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.hostEntity ? true : false;
}

export { tab };
