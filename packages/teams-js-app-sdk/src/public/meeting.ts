import { sendAndHandleSdkError } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @alpha
 */
export namespace meeting {
  /**
   * @privateRemarks
   * Hide from docs
   * Data structure to represent a meeting details.
   *
   * @internal
   */
  export interface IMeetingDetails {
    /**
     * @privateRemarks
     * details object
     */
    details: IDetails;
    /**
     * @privateRemarks
     * conversation object
     */
    conversation: IConversation;
    /**
     * @privateRemarks
     * organizer object
     */
    organizer: IOrganizer;
  }
  /**
   * @privateRemarks
   * Hide from docs
   * Data structure to represent details.
   *
   * @internal
   */
  export interface IDetails {
    /**
     * @privateRemarks
     * Scheduled start time of the meeting
     */
    scheduledStartTime: string;
    /**
     * @privateRemarks
     * Scheduled end time of the meeting
     */
    scheduledEndTime: string;
    /**
     * @privateRemarks
     * url to join the current meeting
     */
    joinUrl?: string;
    /**
     * @privateRemarks
     * meeting title name of the meeting
     */
    title?: string;
    /**
     * @privateRemarks
     * type of the meeting
     */
    type?: MeetingType;
  }

  /**
   * @privateRemarks
   * Hide from docs
   * Data structure to represent a conversation object.
   *
   * @internal
   */
  export interface IConversation {
    /**
     * @privateRemarks
     * conversation id of the meeting
     */
    id: string;
  }

  /**
   * @privateRemarks
   * Hide from docs
   * Data structure to represent an organizer object.
   *
   * @internal
   */
  export interface IOrganizer {
    /**
     * @privateRemarks
     * organizer id of the meeting
     */
    id?: string;
    /**
     * @privateRemarks
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

  export interface IAppContentStageSharingState {
    /**
     * indicates whether app is currently being shared to stage
     */
    isAppSharing: boolean;
  }

  export interface IAppContentStageSharingCapabilities {
    /**
     * indicates whether app has permission to share contents to meeting stage
     */
    doesAppHaveSharePermission: boolean;
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
   *
   * @remarks
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the true/false value, incase of a successful fetch or null when the fetching fails
   *
   * @returns Promise result where true means incoming audio is muted and false means incoming audio is unmuted
   */
  export function getIncomingClientAudioState(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
      resolve(sendAndHandleSdkError('getIncomingClientAudioState'));
    });
  }

  /**
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa
   *
   * @remarks
   * error can either contain an error of type SdkError, incase of an error, or null when toggle is successful
   * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
   *
   * @returns Promise result where true means incoming audio is muted and false means incoming audio is unmuted or rejected promise containing SdkError details
   */
  export function toggleIncomingClientAudio(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
      resolve(sendAndHandleSdkError('toggleIncomingClientAudio'));
    });
  }

  /**
   * @privateRemarks
   * Hide from docs
   * Allows an app to get the meeting details for the meeting
   *
   * @returns Promise containing the meeting details in IMeetingDetails form or rejected promise containing SdkError details
   *
   * @internal
   */
  export function getMeetingDetails(): Promise<IMeetingDetails> {
    return new Promise<IMeetingDetails>(resolve => {
      ensureInitialized(
        FrameContexts.sidePanel,
        FrameContexts.meetingStage,
        FrameContexts.settings,
        FrameContexts.content,
      );
      resolve(sendAndHandleSdkError('meeting.getMeetingDetails'));
    });
  }

  /**
   * @privateRemarks
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   *
   * @returns Promise containing the token or rejected promise containing SdkError details
   *
   * @internal
   */
  export function getAuthenticationTokenForAnonymousUser(): Promise<string> {
    return new Promise<string>(resolve => {
      ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
      resolve(sendAndHandleSdkError('meeting.getAuthenticationTokenForAnonymousUser'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.meeting ? true : false;
  }

  /**
   * Allows an app to get the state of the live stream in the current meeting
   *
   * @returns Promise containing the LiveStreamState value or rejected promise containing SdkError details
   */
  export function getLiveStreamState(): Promise<LiveStreamState> {
    return new Promise<LiveStreamState>(resolve => {
      ensureInitialized();
      resolve(sendAndHandleSdkError('meeting.getLiveStreamState'));
    });
  }

  /**
   * Allows an app to request the live streaming be started at the given streaming url
   *
   * @remarks
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   *
   * @param streamUrl - the url to the stream resource
   * @param streamKey - the key to the stream resource
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   */
  export function requestStartLiveStreaming(streamUrl: string, streamKey?: string): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.requestStartLiveStreaming', streamUrl, streamKey));
    });
  }

  /**
   * Allows an app to request the live streaming be stopped at the given streaming url
   *
   * @remarks
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   *
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   */
  export function requestStopLiveStreaming(): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.requestStopLiveStreaming'));
    });
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
   * @param appContentUrl - appContentUrl is the input URL which needs to be shared on to the stage
   * @returns Promise resolved indicating whether or not the share was successful or rejected with SdkError value
   */
  export function shareAppContentToStage(appContentUrl: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.shareAppContentToStage', appContentUrl));
    });
  }

  /**
   * Provides information related app's in-meeting sharing capabilities
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * @returns Promise resolved with sharing capability details or rejected with SdkError value
   */
  export function getAppContentStageSharingCapabilities(): Promise<IAppContentStageSharingCapabilities> {
    return new Promise<IAppContentStageSharingCapabilities>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingCapabilities'));
    });
  }

  /**
   * Terminates current stage sharing session in meeting
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * @returns Promise resolved indicating whether or not sharing successfully stopped or rejected with SdkError value
   */
  export function stopSharingAppContentToStage(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.stopSharingAppContentToStage'));
    });
  }

  /**
   * Provides information related to current stage sharing state for app
   *
   * @returns Promise resolved to the App Content Stage Sharing State, or rejected with SdkError value
   */
  export function getAppContentStageSharingState(): Promise<IAppContentStageSharingState> {
    return new Promise<IAppContentStageSharingState>(resolve => {
      ensureInitialized(FrameContexts.sidePanel);
      resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingState'));
    });
  }
}
