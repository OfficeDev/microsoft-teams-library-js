import { sendAndHandleSdkError } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import {
  callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
} from '../internal/utils';
import { FrameContexts } from './constants';
import { SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * @alpha
 */
export namespace meeting {
  /**
   * @hidden
   * Hide from docs
   * Data structure to represent a meeting details.
   *
   * @internal
   */
  export interface IMeetingDetails {
    /**
     * @hidden
     * details object
     */
    details: IDetails;
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
   * Data structure to represent details.
   *
   * @internal
   */
  export interface IDetails {
    /**
     * @hidden
     * Scheduled start time of the meeting
     */
    scheduledStartTime: string;
    /**
     * @hidden
     * Scheduled end time of the meeting
     */
    scheduledEndTime: string;
    /**
     * @hidden
     * url to join the current meeting
     */
    joinUrl?: string;
    /**
     * @hidden
     * meeting title name of the meeting
     */
    title?: string;
    /**
     * @hidden
     * type of the meeting
     */
    type?: MeetingType;
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
  export function getIncomingClientAudioState(): Promise<boolean>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getIncomingClientAudioState meeting.getIncomingClientAudioState(): Promise\<boolean\>} instead.
   *
   * Allows an app to get the incoming audio speaker setting for the meeting user
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the true/false value, incase of a successful fetch or null when the fetching fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function getIncomingClientAudioState(callback: (error: SdkError | null, result: boolean | null) => void): void;
  export function getIncomingClientAudioState(
    callback?: (error: SdkError | null, result: boolean | null) => void,
  ): Promise<boolean> {
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<boolean>(
      getIncomingClientAudioStateHelper,
      callback,
    );
  }

  function getIncomingClientAudioStateHelper(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
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
  export function toggleIncomingClientAudio(): Promise<boolean>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.toggleIncomingClientAudio meeting.toggleIncomingClientAudio(): Promise\<boolean\>} instead.
   *
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when toggle is successful
   * result can either contain the true/false value, incase of a successful toggle or null when the toggling fails
   * result: True means incoming audio is muted and false means incoming audio is unmuted
   */
  export function toggleIncomingClientAudio(callback: (error: SdkError | null, result: boolean | null) => void): void;
  export function toggleIncomingClientAudio(
    callback?: (error: SdkError | null, result: boolean | null) => void,
  ): Promise<boolean> {
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<boolean>(
      toggleIncomingClientAudioHelper,
      callback,
    );
  }

  function toggleIncomingClientAudioHelper(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('toggleIncomingClientAudio'));
    });
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Allows an app to get the meeting details for the meeting
   *
   * @returns Promise containing the meeting details in IMeetingDetails form or rejected promise containing SdkError details
   *
   * @internal
   */
  export function getMeetingDetails(): Promise<IMeetingDetails>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getMeetingDetails meeting.getMeetingDetails(): Promise\<IMeetingDetails\>} instead.
   *
   * @hidden
   * Hide from docs
   *
   * Allows an app to get the meeting details for the meeting
   *
   * @param callback - Callback contains 2 parameters, error and meetingDetails.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * result can either contain a IMeetingDetails value, incase of a successful get or null when the get fails
   *
   * @internal
   */
  export function getMeetingDetails(
    callback: (error: SdkError | null, meetingDetails: IMeetingDetails | null) => void,
  ): void;
  export function getMeetingDetails(
    callback?: (error: SdkError | null, meetingDetails: IMeetingDetails | null) => void,
  ): Promise<IMeetingDetails> {
    ensureInitialized(
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
      FrameContexts.settings,
      FrameContexts.content,
    );
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<IMeetingDetails>(
      getMeetingDetailsHelper,
      callback,
    );
  }

  function getMeetingDetailsHelper(): Promise<IMeetingDetails> {
    return new Promise<IMeetingDetails>(resolve => {
      resolve(sendAndHandleSdkError('meeting.getMeetingDetails'));
    });
  }

  /**
   * @hidden
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   *
   * @returns Promise containing the token or rejected promise containing SdkError details
   *
   * @internal
   */
  export function getAuthenticationTokenForAnonymousUser(): Promise<string>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getAuthenticationTokenForAnonymousUser meeting.getAuthenticationTokenForAnonymousUser(): Promise\<string\>} instead.
   *
   * @hidden
   * Hide from docs
   *
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   * @param callback - Callback contains 2 parameters, error and authenticationTokenOfAnonymousUser.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * authenticationTokenOfAnonymousUser can either contain a string value, incase of a successful get or null when the get fails
   *
   * @internal
   */
  export function getAuthenticationTokenForAnonymousUser(
    callback: (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null) => void,
  ): void;
  export function getAuthenticationTokenForAnonymousUser(
    callback?: (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null) => void,
  ): Promise<string> {
    ensureInitialized(FrameContexts.sidePanel, FrameContexts.meetingStage);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<string>(
      getAuthenticationTokenForAnonymousUserHelper,
      callback,
    );
  }

  function getAuthenticationTokenForAnonymousUserHelper(): Promise<string> {
    return new Promise<string>(resolve => {
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
  export function getLiveStreamState(): Promise<LiveStreamState>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getLiveStreamState meeting.getLiveStreamState(): Promise\<LiveStreamState\>} instead.
   *
   * Allows an app to get the state of the live stream in the current meeting
   *
   * @param callback - Callback contains 2 parameters: error and liveStreamState.
   * error can either contain an error of type SdkError, in case of an error, or null when get is successful
   * liveStreamState can either contain a LiveStreamState value, or null when operation fails
   */
  export function getLiveStreamState(
    callback: (error: SdkError | null, liveStreamState: LiveStreamState | null) => void,
  ): void;
  export function getLiveStreamState(
    callback?: (error: SdkError | null, liveStreamState: LiveStreamState | null) => void,
  ): Promise<LiveStreamState> {
    ensureInitialized();
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<LiveStreamState>(
      getLiveStreamStateHelper,
      callback,
    );
  }

  function getLiveStreamStateHelper(): Promise<LiveStreamState> {
    return new Promise<LiveStreamState>(resolve => {
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
  export function requestStartLiveStreaming(streamUrl: string, streamKey?: string): Promise<void>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.requestStartLiveStreaming meeting.requestStartLiveStreaming(streamUrl: string, streamKey?: string): Promise\<void\>} instead.
   *
   * Allows an app to request the live streaming be started at the given streaming url
   *
   * @param streamUrl - The url to the stream resource
   * @param streamKey - The key to the stream resource
   * @param callback - Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
   *
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   */
  export function requestStartLiveStreaming(
    callback: (error: SdkError | null) => void,
    streamUrl: string,
    streamKey?: string,
  ): Promise<void>;
  /**
   * @hidden
   * This function is the overloaded implementation of requestStartLiveStreaming.
   * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
   * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
   * @param param1
   * @param param2
   * @param param3
   * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
   */
  export function requestStartLiveStreaming(
    param1: string | ((error: SdkError | null) => void),
    param2?: string,
    param3?: string,
  ): Promise<void> {
    ensureInitialized(FrameContexts.sidePanel);
    let streamUrl: string;
    let streamKey: string;
    let callback: (error: SdkError | null) => void;
    if (typeof param1 === 'function') {
      // Legacy code, with callbacks.
      [callback, streamUrl, streamKey] = [param1, param2, param3];
    } else if (typeof param1 === 'string') {
      [streamUrl, streamKey] = [param1, param2];
    }
    return callCallbackWithSdkErrorFromPromiseAndReturnPromise(
      requestStartLiveStreamingHelper,
      callback,
      streamUrl,
      streamKey,
    );
  }

  function requestStartLiveStreamingHelper(streamUrl: string, streamKey?: string): Promise<void> {
    return new Promise<void>(resolve => {
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
  export function requestStopLiveStreaming(): Promise<void>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.requestStopLiveStreaming meeting.requestStopLiveStreaming(): Promise\<void\>} instead.
   *
   * Allows an app to request the live streaming be stopped at the given streaming url
   * @param callback - Callback contains error parameter which can be of type SdkError in case of an error, or null when operation is successful
   *
   * Use getLiveStreamState or registerLiveStreamChangedHandler to get updates on the live stream state
   */
  export function requestStopLiveStreaming(callback: (error: SdkError | null) => void): void;
  export function requestStopLiveStreaming(callback?: (error: SdkError | null) => void): Promise<void> {
    ensureInitialized(FrameContexts.sidePanel);
    return callCallbackWithSdkErrorFromPromiseAndReturnPromise(requestStopLiveStreamingHelper, callback);
  }

  function requestStopLiveStreamingHelper(): Promise<void> {
    return new Promise<void>(resolve => {
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
   * @hidden
   * Allows an app to share contents in the meeting
   *
   * @param appContentUrl - appContentUrl is the input URL which needs to be shared on to the stage
   * @returns Promise resolved indicating whether or not the share was successful or rejected with SdkError value
   */
  export function shareAppContentToStage(appContentUrl: string): Promise<boolean>;
  /**
   * @hidden
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.shareAppContentToStage meeting.shareAppContentToStage(appContentUrl: string): Promise\<boolean\>} instead.
   *
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
  ): void;
  /**
   * @hidden
   * This function is the overloaded implementation of shareAppContentToStage.
   * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
   * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
   * @param param1
   * @param param2
   * @returns Promise resolved indicating whether or not the share was successful or rejected with SdkError value
   */
  export function shareAppContentToStage(
    param1: string | ((error: SdkError | null, result: boolean | null) => void),
    param2?: string,
  ): Promise<boolean> {
    ensureInitialized(FrameContexts.sidePanel);
    let appContentUrl: string;
    let callback: (error: SdkError | null, result: boolean | null) => void;
    if (typeof param1 === 'function') {
      // Legacy callback
      [callback, appContentUrl] = [param1, param2];
    } else {
      appContentUrl = param1;
    }
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<boolean>(
      shareAppContentToStageHelper,
      callback,
      appContentUrl,
    );
  }

  /**
   * @hidden
   * Helper method to generate and return a promise for shareAppContentToStage
   * @param appContentUrl
   * @returns
   */
  function shareAppContentToStageHelper(appContentUrl: string): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('meeting.shareAppContentToStage', appContentUrl));
    });
  }

  /**
   * @hidden
   * Provides information related to app's in-meeting sharing capabilities
   *
   * @returns Promise resolved with sharing capability details or rejected with SdkError value
   */
  export function getAppContentStageSharingCapabilities(): Promise<IAppContentStageSharingCapabilities>;
  /**
   * @hidden
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getAppContentStageSharingCapabilities meeting.getAppContentStageSharingCapabilities(): Promise\<IAppContentStageSharingCapabilities\>} instead.
   *
   * Provides information related to app's in-meeting sharing capabilities
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
  ): void;
  export function getAppContentStageSharingCapabilities(
    callback?: (
      error: SdkError | null,
      appContentStageSharingCapabilities: IAppContentStageSharingCapabilities | null,
    ) => void,
  ): Promise<IAppContentStageSharingCapabilities> {
    ensureInitialized(FrameContexts.sidePanel);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<IAppContentStageSharingCapabilities>(
      getAppContentStageSharingCapabilitiesHelper,
      callback,
    );
  }

  /**
   * @hidden
   * @returns
   */
  function getAppContentStageSharingCapabilitiesHelper(): Promise<IAppContentStageSharingCapabilities> {
    return new Promise<IAppContentStageSharingCapabilities>(resolve => {
      resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingCapabilities'));
    });
  }

  /**
   * @hidden
   * Hide from docs.
   * ------------------------------------------
   * Terminates current stage sharing session in meeting
   *
   * @returns Promise resolved indicating whether or not sharing successfully stopped or rejected with SdkError value
   */
  export function stopSharingAppContentToStage(): Promise<boolean>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.stopSharingAppContentToStage meeting.stopSharingAppContentToStage(): Promise\<boolean\>} instead.
   *
   * @hidden
   * Hide from docs.
   * ------------------------------------------
   * Terminates current stage sharing session in meeting
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * result can either contain a true boolean value (successful termination), or null (unsuccessful fetch)
   * @internal
   */
  export function stopSharingAppContentToStage(
    callback: (error: SdkError | null, result: boolean | null) => void,
  ): void;
  export function stopSharingAppContentToStage(
    callback?: (error: SdkError | null, result: boolean | null) => void,
  ): Promise<boolean> {
    ensureInitialized(FrameContexts.sidePanel);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<boolean>(
      stopSharingAppContentToStageHelper,
      callback,
    );
  }

  /**
   * @hidden
   * @returns
   */
  function stopSharingAppContentToStageHelper(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('meeting.stopSharingAppContentToStage'));
    });
  }

  /**
   * Provides information related to current stage sharing state for app
   *
   * @returns Promise resolved to the App Content Stage Sharing State, or rejected with SdkError value
   */
  export function getAppContentStageSharingState(): Promise<IAppContentStageSharingState>;
  /**
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link meeting.getAppContentStageSharingState meeting.getAppContentStageSharingState(): Promise\<IAppContentStageSharingState\>} instead.
   *
   * Provides information related to current stage sharing state for app
   * @param callback - Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * appContentStageSharingState can either contain an IAppContentStageSharingState object
   * (indication of successful retrieval), or null (indication of failed retrieval)
   */
  export function getAppContentStageSharingState(
    callback: (error: SdkError | null, appContentStageSharingState: IAppContentStageSharingState | null) => void,
  ): void;
  export function getAppContentStageSharingState(
    callback?: (error: SdkError | null, appContentStageSharingState: IAppContentStageSharingState | null) => void,
  ): Promise<IAppContentStageSharingState> {
    ensureInitialized(FrameContexts.sidePanel);
    return callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise<IAppContentStageSharingState>(
      getAppContentStageSharingStateHelper,
      callback,
    );
  }

  function getAppContentStageSharingStateHelper(): Promise<IAppContentStageSharingState> {
    return new Promise<IAppContentStageSharingState>(resolve => {
      resolve(sendAndHandleSdkError('meeting.getAppContentStageSharingState'));
    });
  }
}
