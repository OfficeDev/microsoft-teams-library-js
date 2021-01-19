import { Communication } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from './interfaces';

export namespace meeting {
  /**
   *
   * Data structure to represent a meeting details.
   */
  export interface IMeetingDetails {
    /**
     * details object
     */
    details: IDetails;
    /**
     * conversation object
     */
    conversation: IConversation;
    /**
     * organizer object
     */
    organizer: IOrganizer;
  }
  export interface IDetails {
    /**
     * event id of the meeting
     */
    id: string;
    /**
     * Scheduled start time of the meeting
     */
    scheduledStartTime: string;
    /**
     * Scheduled end time of the meeting
     */
    scheduledEndTime: string;
    /**
     * url to join the current meeting
     */
    joinUrl?: string;
    /**
     * meeting title name of the meeting
     */
    title?: string;
    /**
     * type of the meeting
     */
    type?: MeetingType;
  }

  export interface IConversation {
    /**
     * conversation id of the meeting
     */
    id: string;
  }

  export interface IOrganizer {
    /**
     * organizer id of the meeting
     */
    id?: string;
    /**
     * tenant id of the meeting
     */
    tenantId?: string;
  }

  export enum MeetingType {
    Unknown = 'Unknown',
    Adhoc = 'Adhoc',
    Scheduled = 'Scheduled',
    Recurring = 'Recurring',
    Broadcast = 'Broadcast',
    MeetNow = 'MeetNow',
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
    Communication.sendMessageToParent('getIncomingClientAudioState', callback);
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
    Communication.sendMessageToParent('toggleIncomingClientAudio', callback);
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
    Communication.sendMessageToParent('meeting.getMeetingDetails', callback);
  }

  /**
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   * @param callback Callback contains 2 parameters, error and authenticationTokenOfAnonymousUser.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * authenticationTokenOfAnonymousUser can either contain a string value, incase of a successful get or null when the get fails
   */
  export function getAuthenticationTokenForAnonymousUser(
    callback: (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get Authentication Token For AnonymousUser] Callback cannot be null');
    }
    ensureInitialized();
    Communication.sendMessageToParent('meeting.getAuthenticationTokenForAnonymousUser', callback);
  }
}
