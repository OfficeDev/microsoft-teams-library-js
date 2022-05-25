import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { SdkError } from './interfaces';

export namespace meeting {
  /**
   * @hidden
   * Hide from docs
   * Data structure to represent a meeting details
   *
   * @internal
   */
  export interface IMeetingDetailsResponse {
    /**
     * @hidden
     * details object
     */
    details: IMeetingDetails | ICallDetails;

    /**
     * @hidden
     * conversation object
     */
    conversation: IConversation;

    /**
     * @hidden
     * organizer object
     */
    organizer: IOrganizer;
  }

  /**
   * @hidden
   * Hide from docs
   * Base data structure to represent a meeting or call detail
   */
  export interface IMeetingOrCallDetailsBase<T> {
    /**
     * @hidden
     * Scheduled start time of the meeting or start time of the call
     */
    scheduledStartTime: string;

    /**
     * @hidden
     * url to join the current meeting or call
     */
    joinUrl?: string;

    /**
     * @hidden
     * type of the meeting or call
     */
    type?: T;
  }

  /**
   * @hidden
   * Hide from docs
   * Data structure to represent call details
   */
  export type ICallDetails = IMeetingOrCallDetailsBase<CallType>;

  /**
   * @hidden
   * Hide from docs
   * Data structure to represent meeting details.
   */
  export interface IMeetingDetails extends IMeetingOrCallDetailsBase<MeetingType> {
    /**
     * @hidden
     * Scheduled end time of the meeting
     */
    scheduledEndTime: string;

    /**
     * @hidden
     * meeting title name of the meeting
     */
    title?: string;
  }

  /**
   * @hidden
   * Hide from docs
   * Data structure to represent a conversation object.
   *
   * @internal
   */
  export interface IConversation {
    /**
     * @hidden
     * conversation id of the meeting
     */
    id: string;
  }

  /**
   * @hidden
   * Hide from docs
   * Data structure to represent an organizer object.
   *
   * @internal
   */
  export interface IOrganizer {
    /**
     * @hidden
     * organizer id of the meeting
     */
    id?: string;
    /**
     * @hidden
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

  export interface IAppContentStageSharingCapabilities {
    /**
     * indicates whether app has permission to share contents to meeting stage
     */
    doesAppHaveSharePermission: boolean;
  }

  export interface IAppContentStageSharingState {
    /**
     * indicates whether app is currently being shared to stage
     */
    isAppSharing: boolean;
  }

  export interface ISpeakingState {
    /**
     * Indicates whether one or more participants in a meeting are speaking, or
     * if no participants are speaking
     */
    isSpeakingDetected: boolean;
  }

  /**
   * Property bag for the meeting reaction received event
   *
   * @beta
   */
  export interface MeetingReactionReceivedEventData {
    /**
     * Indicates the type of meeting reaction received
     */
    meetingReactionType?: MeetingReactionType;
    /**
     * error object in case there is a failure
     */
    error?: SdkError;
  }

  /**
   * Interface for raiseHandState properties
   *
   * @beta
   */
  export interface IRaiseHandState {
    /** Indicates whether the selfParticipant's hand is raised or not*/
    isHandRaised: boolean;
  }

  /**
   * Property bag for the raiseHandState changed event
   *
   * @beta
   */
  export interface RaiseHandStateChangedEventData {
    /**
     * entire raiseHandState object for the selfParticipant
     */
    raiseHandState: IRaiseHandState;

    /**
     * error object in case there is a failure
     */
    error?: SdkError;
  }

  /**
   * Different types of meeting reactions that can be sent/received
   *
   * @beta
   */
  export enum MeetingReactionType {
    like = 'like',
    heart = 'heart',
    laugh = 'laugh',
    surprised = 'surprised',
    applause = 'applause',
  }

  export enum MeetingType {
    Unknown = 'Unknown',
    Adhoc = 'Adhoc',
    Scheduled = 'Scheduled',
    Recurring = 'Recurring',
    Broadcast = 'Broadcast',
    MeetNow = 'MeetNow',
  }

  export enum CallType {
    OneOnOneCall = 'oneOnOneCall',
    GroupCall = 'groupCall',
  }

  /**
   * Allows an app to get the incoming audio speaker setting for the meeting user
   *
   * @param callback - Callback contains 2 parameters, error and result.
   *
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
   *
   * @param callback - Callback contains 2 parameters, error and result.
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
   * @hidden
   * Hide from docs
   *
   * Allows an app to get the meeting details for the meeting
   *
   * @param callback - Callback contains 2 parameters, error and meetingDetailsResponse.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * result can either contain a IMeetingDetailsResponse value, in case of a successful get or null when the get fails
   *
   * @internal
   */
  export function getMeetingDetails(
    callback: (error: SdkError | null, meetingDetails: IMeetingDetailsResponse | null) => void,
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
   * @hidden
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   *
   * @param callback - Callback contains 2 parameters, error and authenticationTokenOfAnonymousUser.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * authenticationTokenOfAnonymousUser can either contain a string value, incase of a successful get or null when the get fails
   *
   * @internal
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
   *
   * @param callback - Callback contains 2 parameters: error and liveStreamState.
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
   *
   * @remarks
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   *
   * @param streamUrl - the url to the stream resource
   * @param streamKey - the key to the stream resource
   * @param callback - Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
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
   *
   * @remarks
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   *
   * @param callback - Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
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
   *
   * @remarks
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the live stream state changes
   */
  export function registerLiveStreamChangedHandler(handler: (liveStreamState: LiveStreamState) => void): void {
    if (!handler) {
      throw new Error('[register live stream changed handler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    registerHandler('meeting.liveStreamChanged', handler);
  }

  /**
   * Allows an app to share contents in the meeting
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when share is successful
   * result can either contain a true value, incase of a successful share or null when the share fails
   * @param appContentUrl - is the input URL which needs to be shared on to the stage
   */
  export function shareAppContentToStage(
    callback: (error: SdkError | null, result: boolean | null) => void,
    appContentUrl: string,
  ): void {
    if (!callback) {
      throw new Error('[share app content to stage] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.shareAppContentToStage', [appContentUrl], callback);
  }

  /**
   * Provides information related app's in-meeting sharing capabilities
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * appContentStageSharingCapabilities can either contain an IAppContentStageSharingCapabilities object
   * (indication of successful retrieval), or null (indication of failed retrieval)
   */
  export function getAppContentStageSharingCapabilities(
    callback: (
      error: SdkError | null,
      appContentStageSharingCapabilities: IAppContentStageSharingCapabilities | null,
    ) => void,
  ): void {
    if (!callback) {
      throw new Error('[get app content stage sharing capabilities] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.getAppContentStageSharingCapabilities', callback);
  }

  /**
   * @hidden
   * Hide from docs.
   * Terminates current stage sharing session in meeting
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * result can either contain a true boolean value (successful termination), or null (unsuccessful fetch)
   */
  export function stopSharingAppContentToStage(
    callback: (error: SdkError | null, result: boolean | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[stop sharing app content to stage] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.stopSharingAppContentToStage', callback);
  }

  /**
   * Provides information related to current stage sharing state for app
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * appContentStageSharingState can either contain an IAppContentStageSharingState object
   * (indication of successful retrieval), or null (indication of failed retrieval)
   */
  export function getAppContentStageSharingState(
    callback: (error: SdkError | null, appContentStageSharingState: IAppContentStageSharingState | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get app content stage sharing state] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.getAppContentStageSharingState', callback);
  }

  /**
   * Registers a handler for changes to paticipant speaking states. If any participant is speaking, isSpeakingDetected
   * will be true. If no participants are speaking, isSpeakingDetected will be false. Only one handler can be registered
   * at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the speaking state of any participant changes (start/stop speaking).
   */
  export function registerSpeakingStateChangeHandler(handler: (speakingState: ISpeakingState) => void): void {
    if (!handler) {
      throw new Error('[registerSpeakingStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.speakingStateChanged', handler);
  }

  /**
   * Registers a handler for changes to the selfParticipant's (current user's) raiseHandState. If the selfParticipant raises their hand, isHandRaised
   * will be true. By default and if the selfParticipant hand is lowered, isHandRaised will be false. This API will return {@link RaiseHandStateChangedEvent}
   * that will have the raiseHandState or an error object. Only one handler can be registered at a time. A subsequent registration
   * replaces an existing registration.
   *
   * @param handler The handler to invoke when the selfParticipant's (current user's) raiseHandState changes.
   *
   * @beta
   */
  export function registerRaiseHandStateChangedHandler(
    handler: (eventData: RaiseHandStateChangedEventData) => void,
  ): void {
    if (!handler) {
      throw new Error('[registerRaiseHandStateChangedHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.raiseHandStateChanged', handler);
  }

  /**
   * Registers a handler for receiving meeting reactions. When the selfParticipant (current user) successfully sends a meeting reaction and it is being rendered on the UI, the meetingReactionType will be populated. Only one handler can be registered
   * at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the selfParticipant (current user) successfully sends a meeting reaction
   *
   * @beta
   */
  export function registerMeetingReactionReceivedHandler(
    handler: (eventData: MeetingReactionReceivedEventData) => void,
  ): void {
    if (!handler) {
      throw new Error('[registerMeetingReactionReceivedHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.meetingReactionReceived', handler);
  }
}
