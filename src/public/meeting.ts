import { Communication } from '../internal/communication';
import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { SdkError } from './interfaces';

export namespace meeting {
  /**
   *
   * Data structure to represent a meeting details.
   */
  export interface IMeetingDetails {
    /**
     * Scheduled start time of the meeting
     */
    scheduledStartTime: string;
    /**
     * Scheduled end time of the meeting
     */
    scheduledEndTime: string;
    /**
     * meeting title name of the meeting
     */
    meetingTitle?: string;
    /**
     * organizer id of the meeting
     */
    organizerId?: string;
    /**
     * tenant id of the meeting
     */
    tenantId?: string;
    /**
     * url to join the current meeting
     */
    joinUrl?: string;
  }

  /**
   * Allows an app to get the incoming audio speaker setting for the meeting user
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the true/false value, incase of a successful toggle or null when the fetching fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function getIncomingClientAudioState(
    callback: (error: SdkError | null, result: boolean | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get incoming client audio state] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('getIncomingClientAudioState');
    Communication.callbacks[messageId] = callback;
  }

  /**
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when toggle is successful
   * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function toggleIncomingClientAudio(callback: (error: SdkError | null, result: boolean | null) => void): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('toggleIncomingClientAudio');
    Communication.callbacks[messageId] = callback;
  }

  /**
   * Allows an app to get the meeting details for the meeting
   * @param callback Callback contains 2 parameters, error and meetingDetails.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * result can either contain a IMeetingDetails value, incase of a successful get or null when the get fails
   */
  export function getMeetingDetails(
    callback: (error: SdkError | null, meetingDetails: IMeetingDetails | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get meeting details] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('meeting.getMeetingDetails');
    Communication.callbacks[messageId] = callback;
  }
}
