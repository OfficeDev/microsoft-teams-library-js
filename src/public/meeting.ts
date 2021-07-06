import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace meeting {
  /**
   * @private
   * Hide from docs
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
  /**
   * @private
   * Hide from docs
   * Data structure to represent details.
   */
  export interface IDetails {
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

  /**
   * @private
   * Hide from docs
   * Data structure to represent a conversation object.
   */
  export interface IConversation {
    /**
     * conversation id of the meeting
     */
    id: string;
  }

  /**
   * @private
   * Hide from docs
   * Data structure to represent an organizer object.
   */
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

  export interface LiveStreamState {
    /**
     * indicates whether meeting is streaming
     */
    isStreaming: boolean;

    /**
     * error object in case there is a failure
     */
    error?: {
      /** error code from the streaming service, e.g. IngestionFailure */
      code: string;
      /** detailed error message string */
      message?: string;
    };
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
   * result can either contain the true/false value, incase of a successful fetch or null when the fetching fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function getIncomingClientAudioState(
    callback: (error: SdkError | null, result: boolean | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get incoming client audio state] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('getIncomingClientAudioState', callback);
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
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('toggleIncomingClientAudio', callback);
  }

  /**
   * @private
   * Hide from docs
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
    ensureInitialized(
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
      FrameContexts.settings,
      FrameContexts.content,
    );
    sendMessageToParent('meeting.getMeetingDetails', callback);
  }

  /**
   * @private
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
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.getAuthenticationTokenForAnonymousUser', callback);
  }

  /**
   * Allows an app to get the state of the live stream in the current meeting
   * @param callback Callback contains 2 parameters: error and liveStreamState.
   * error can either contain an error of type SdkError, in case of an error, or null when get is successful
   * liveStreamState can either contain a LiveStreamState value, or null when operation fails
   */
  export function getLiveStreamState(
    callback: (error: SdkError | null, liveStreamState: LiveStreamState | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get live stream state] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    sendMessageToParent('meeting.getLiveStreamState', callback);
  }

  /**
   * Allows an app to request the live streaming be started at the given streaming url
   * @param streamUrl the url to the stream resource
   * @param streamKey the key to the stream resource
   * @param callback Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   */
  export function requestStartLiveStreaming(
    callback: (error: SdkError | null) => void,
    streamUrl: string,
    streamKey?: string,
  ): void {
    if (!callback) {
      throw new Error('[request start live streaming] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    sendMessageToParent('meeting.requestStartLiveStreaming', [streamUrl, streamKey], callback);
  }

  /**
   * Allows an app to request the live streaming be stopped at the given streaming url
   * @param callback Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   */
  export function requestStopLiveStreaming(callback: (error: SdkError | null) => void): void {
    if (!callback) {
      throw new Error('[request stop live streaming] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    sendMessageToParent('meeting.requestStopLiveStreaming', callback);
  }

  /**
   * Registers a handler for changes to the live stream.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the live stream state changes
   */
  export function registerLiveStreamChangedHandler(handler: (liveStreamState: LiveStreamState) => void): void {
    if (!handler) {
      throw new Error('[register live stream changed handler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    registerHandler('meeting.liveStreamChanged', handler);
  }
}
