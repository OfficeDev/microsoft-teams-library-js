import { sendMessageToParent } from '../internal/communication';
import { doesHandlerExist, registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * Interact with meetings, including retrieving meeting details, getting mic status, and sharing app content.
 * This namespace is used to handle meeting related functionality like
 * get meeting details, get/update state of mic, sharing app content and more.
 */
export namespace meeting {
  /** Error callback function type */
  type errorCallbackFunctionType = (error: SdkError | null, result: boolean | null) => void;
  /** Get live stream state callback function type */
  type getLiveStreamStateCallbackFunctionType = (
    error: SdkError | null,
    liveStreamState: LiveStreamState | null,
  ) => void;
  /** Live stream error callback function type */
  type liveStreamErrorCallbackFunctionType = (error: SdkError | null) => void;
  /** Register live stream changed handler function type */
  type registerLiveStreamChangedHandlerFunctionType = (liveStreamState: LiveStreamState) => void;
  /** Get app content stage sharing capabilities callback function type */
  type getAppContentCallbackFunctionType = (
    error: SdkError | null,
    appContentStageSharingCapabilities: IAppContentStageSharingCapabilities | null,
  ) => void;
  /** Get app content stage sharing state callback function type */
  type getAppContentStageCallbackFunctionType = (
    error: SdkError | null,
    appContentStageSharingState: IAppContentStageSharingState | null,
  ) => void;
  /** Register speaking state change handler function type */
  type registerSpeakingStateChangeHandlerFunctionType = (speakingState: ISpeakingState) => void;
  /**
   * @hidden
   * Data structure to represent meeting details
   *
   * @internal
   * Limited to Microsoft-internal use
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
   * Data structure to represent a conversation object.
   *
   * @internal
   * Limited to Microsoft-internal use
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
   * Data structure to represent an organizer object.
   *
   * @internal
   * Limited to Microsoft-internal use
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

  /** Represents the current live streaming state of a meeting */
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

  /** Represents app permission to share contents to meeting. */
  export interface IAppContentStageSharingCapabilities {
    /**
     * indicates whether app has permission to share contents to meeting stage
     */
    doesAppHaveSharePermission: boolean;
  }

  /** Represents app being shared to stage. */
  export interface IAppContentStageSharingState {
    /**
     * indicates whether app is currently being shared to stage
     */
    isAppSharing: boolean;
  }

  /**
   * Property bag for the speakingState changed event
   *
   */
  export interface ISpeakingState {
    /**
     * Indicates whether one or more participants in a meeting are speaking, or
     * if no participants are speaking
     */
    isSpeakingDetected: boolean;

    /**
     * error object in case there is a failure
     */
    error?: SdkError;
  }

  /**
   * Property bag for the meeting reaction received event
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface MeetingReactionReceivedEventData {
    /**
     * Indicates the type of meeting reaction received
     *
     * @hidden
     * Hide from docs.
     */
    meetingReactionType?: MeetingReactionType;
    /**
     * error object in case there is a failure
     *
     * @hidden
     * Hide from docs.
     */
    error?: SdkError;
  }

  /**
   * Interface for raiseHandState properties
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface IRaiseHandState {
    /** Indicates whether the selfParticipant's hand is raised or not
     *
     * @hidden
     * Hide from docs.
     */

    isHandRaised: boolean;
  }

  /**
   * Property bag for the raiseHandState changed event
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface RaiseHandStateChangedEventData {
    /**
     * entire raiseHandState object for the selfParticipant
     *
     * @hidden
     * Hide from docs.
     */
    raiseHandState: IRaiseHandState;

    /**
     * error object in case there is a failure
     *
     * @hidden
     * Hide from docs.
     */
    error?: SdkError;
  }

  /**
   * Interface for mic state change
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface MicState {
    /**
     * Indicates the mute status of the mic
     */
    isMicMuted: boolean;
  }

  /**
   * Reasons for the app's microphone state to change
   */
  enum MicStateChangeReason {
    HostInitiated,
    AppInitiated,
    AppDeclinedToChange,
    AppFailedToChange,
  }

  /**
   * Interface for RequestAppAudioHandling properties
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface RequestAppAudioHandlingParams {
    /**
     * Indicates whether the app is requesting to start handling audio, or if
     * it's giving audio back to the host
     */
    isAppHandlingAudio: boolean;
    /**
     * Callback for the host to tell the app to change its microphone state
     * @param micState The microphone state for the app to use
     * @returns A promise with the updated microphone state
     */
    micMuteStateChangedCallback: (micState: MicState) => Promise<MicState>;
  }

  /**
   * Different types of meeting reactions that can be sent/received
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
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

  /** Represents the type of a meeting */
  export enum MeetingType {
    /** Used when the meeting type is not known. */
    Unknown = 'Unknown',
    /** Used for ad hoc meetings that are created on the fly. */
    Adhoc = 'Adhoc',
    /** Used for meetings that have been scheduled in advance. */
    Scheduled = 'Scheduled',
    /** Used for meetings that occur on a recurring basis. */
    Recurring = 'Recurring',
    /** Used for live events or webinars. */
    Broadcast = 'Broadcast',
    /** Used for meetings that are created on the fly, but with a more polished experience than ad hoc meetings. */
    MeetNow = 'MeetNow',
  }

  /** Represents the type of a call. */
  export enum CallType {
    /** Represents a call between two people. */
    OneOnOneCall = 'oneOnOneCall',
    /** Represents a call between more than two people. */
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
  export function getIncomingClientAudioState(callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get incoming client audio state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
  export function toggleIncomingClientAudio(callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('toggleIncomingClientAudio', callback);
  }

  /**
   * @hidden
   * Allows an app to get the meeting details for the meeting
   *
   * @param callback - Callback contains 2 parameters, error and meetingDetailsResponse.
   * error can either contain an error of type SdkError, incase of an error, or null when get is successful
   * result can either contain a IMeetingDetailsResponse value, in case of a successful get or null when the get fails
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getMeetingDetails(
    callback: (error: SdkError | null, meetingDetails: IMeetingDetailsResponse | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get meeting details] Callback cannot be null');
    }
    ensureInitialized(
      runtime,
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
   * Limited to Microsoft-internal use
   */
  export function getAuthenticationTokenForAnonymousUser(
    callback: (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[get Authentication Token For AnonymousUser] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage, FrameContexts.task);
    sendMessageToParent('meeting.getAuthenticationTokenForAnonymousUser', callback);
  }

  /**
   * Allows an app to get the state of the live stream in the current meeting
   *
   * @param callback - Callback contains 2 parameters: error and liveStreamState.
   * error can either contain an error of type SdkError, in case of an error, or null when get is successful
   * liveStreamState can either contain a LiveStreamState value, or null when operation fails
   */
  export function getLiveStreamState(callback: getLiveStreamStateCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get live stream state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
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
    callback: liveStreamErrorCallbackFunctionType,
    streamUrl: string,
    streamKey?: string,
  ): void {
    if (!callback) {
      throw new Error('[request start live streaming] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
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
  export function requestStopLiveStreaming(callback: liveStreamErrorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[request stop live streaming] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
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
  export function registerLiveStreamChangedHandler(handler: registerLiveStreamChangedHandlerFunctionType): void {
    if (!handler) {
      throw new Error('[register live stream changed handler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
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
  export function shareAppContentToStage(callback: errorCallbackFunctionType, appContentUrl: string): void {
    if (!callback) {
      throw new Error('[share app content to stage] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
  export function getAppContentStageSharingCapabilities(callback: getAppContentCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get app content stage sharing capabilities] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
  export function stopSharingAppContentToStage(callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[stop sharing app content to stage] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
  export function getAppContentStageSharingState(callback: getAppContentStageCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get app content stage sharing state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.getAppContentStageSharingState', callback);
  }

  /**
   * Registers a handler for changes to paticipant speaking states. This API returns {@link ISpeakingState}, which will have isSpeakingDetected
   * and/or an error object. If any participant is speaking, isSpeakingDetected will be true. If no participants are speaking, isSpeakingDetected
   * will be false. Default value is false. Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the speaking state of any participant changes (start/stop speaking).
   */
  export function registerSpeakingStateChangeHandler(handler: registerSpeakingStateChangeHandlerFunctionType): void {
    if (!handler) {
      throw new Error('[registerSpeakingStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.speakingStateChanged', handler);
  }

  /**
   * Registers a handler for changes to the selfParticipant's (current user's) raiseHandState. If the selfParticipant raises their hand, isHandRaised
   * will be true. By default and if the selfParticipant hand is lowered, isHandRaised will be false. This API will return {@link RaiseHandStateChangedEventData}
   * that will have the raiseHandState or an error object. Only one handler can be registered at a time. A subsequent registration
   * replaces an existing registration.
   *
   * @param handler The handler to invoke when the selfParticipant's (current user's) raiseHandState changes.
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function registerRaiseHandStateChangedHandler(
    handler: (eventData: RaiseHandStateChangedEventData) => void,
  ): void {
    if (!handler) {
      throw new Error('[registerRaiseHandStateChangedHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.raiseHandStateChanged', handler);
  }

  /**
   * Registers a handler for receiving meeting reactions. When the selfParticipant (current user) successfully sends a meeting reaction and it is being rendered on the UI, the meetingReactionType will be populated. Only one handler can be registered
   * at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler The handler to invoke when the selfParticipant (current user) successfully sends a meeting reaction
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function registerMeetingReactionReceivedHandler(
    handler: (eventData: MeetingReactionReceivedEventData) => void,
  ): void {
    if (!handler) {
      throw new Error('[registerMeetingReactionReceivedHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler('meeting.meetingReactionReceived', handler);
  }

  /**
   * Nested namespace for functions to control behavior of the app share button
   *
   * @beta
   */
  export namespace appShareButton {
    /**
     * Property bag for the setVisibilityInfo
     *
     * @beta
     */
    export interface ShareInformation {
      /**
       * boolean flag to set show or hide app share button
       */
      isVisible: boolean;

      /**
       * optional string contentUrl, which will override contentUrl coming from Manifest
       */
      contentUrl?: string;
    }
    /**
     * By default app share button will be hidden and this API will govern the visibility of it.
     *
     * This function can be used to hide/show app share button in meeting,
     * along with contentUrl (overrides contentUrl populated in app manifest)
     * @throws standard Invalid Url error
     * @param shareInformation has two elements, one isVisible boolean flag and another
     * optional string contentUrl, which will override contentUrl coming from Manifest
     * @beta
     */
    export function setOptions(shareInformation: ShareInformation): void {
      ensureInitialized(runtime, FrameContexts.sidePanel);
      if (shareInformation.contentUrl) {
        new URL(shareInformation.contentUrl);
      }
      sendMessageToParent('meeting.appShareButton.setOptions', [shareInformation]);
    }
  }

  /**
   * Have the app handle audio (mic & speaker) and turn off host audio.
   *
   * When {@link RequestAppAudioHandlingParams.isAppHandlingAudio} is true, the host will switch to audioless mode
   *   Registers for mic mute status change events, which are events that the app can receive from the host asking the app to
   *   mute or unmute the microphone.
   *
   * When {@link RequestAppAudioHandlingParams.isAppHandlingAudio} is false, the host will switch out of audioless mode
   *   Unregisters the mic mute status change events so the app will no longer receive these events
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   * @throws Error if {@link RequestAppAudioHandlingParams.micMuteStateChangedCallback} parameter is not defined
   *
   * @param requestAppAudioHandlingParams - {@link RequestAppAudioHandlingParams} object with values for the audio switchover
   * @param callback - Callback with one parameter, the result
   * can either be true (the host is now in audioless mode) or false (the host is not in audioless mode)
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function requestAppAudioHandling(
    requestAppAudioHandlingParams: RequestAppAudioHandlingParams,
    callback: (isHostAudioless: boolean) => void,
  ): void {
    if (!callback) {
      throw new Error('[requestAppAudioHandling] Callback response cannot be null');
    }
    if (!requestAppAudioHandlingParams.micMuteStateChangedCallback) {
      throw new Error('[requestAppAudioHandling] Callback Mic mute state handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);

    if (requestAppAudioHandlingParams.isAppHandlingAudio) {
      startAppAudioHandling(requestAppAudioHandlingParams, callback);
    } else {
      stopAppAudioHandling(requestAppAudioHandlingParams, callback);
    }
  }

  function startAppAudioHandling(
    requestAppAudioHandlingParams: RequestAppAudioHandlingParams,
    callback: (isHostAudioless: boolean) => void,
  ): void {
    const callbackInternalRequest = (error: SdkError | null, isHostAudioless: boolean | null): void => {
      if (error && isHostAudioless != null) {
        throw new Error('[requestAppAudioHandling] Callback response - both parameters cannot be set');
      }
      if (error) {
        throw new Error(`[requestAppAudioHandling] Callback response - SDK error ${error.errorCode} ${error.message}`);
      }
      if (typeof isHostAudioless !== 'boolean') {
        throw new Error('[requestAppAudioHandling] Callback response - isHostAudioless must be a boolean');
      }

      const micStateChangedCallback = async (micState: MicState): Promise<void> => {
        try {
          const newMicState = await requestAppAudioHandlingParams.micMuteStateChangedCallback(micState);

          const micStateDidUpdate = newMicState.isMicMuted === micState.isMicMuted;
          setMicStateWithReason(
            newMicState,
            micStateDidUpdate ? MicStateChangeReason.HostInitiated : MicStateChangeReason.AppDeclinedToChange,
          );
        } catch {
          setMicStateWithReason(micState, MicStateChangeReason.AppFailedToChange);
        }
      };
      registerHandler('meeting.micStateChanged', micStateChangedCallback);

      callback(isHostAudioless);
    };
    sendMessageToParent(
      'meeting.requestAppAudioHandling',
      [requestAppAudioHandlingParams.isAppHandlingAudio],
      callbackInternalRequest,
    );
  }

  function stopAppAudioHandling(
    requestAppAudioHandlingParams: RequestAppAudioHandlingParams,
    callback: (isHostAudioless: boolean) => void,
  ): void {
    const callbackInternalStop = (error: SdkError | null, isHostAudioless: boolean | null): void => {
      if (error && isHostAudioless != null) {
        throw new Error('[requestAppAudioHandling] Callback response - both parameters cannot be set');
      }
      if (error) {
        throw new Error(`[requestAppAudioHandling] Callback response - SDK error ${error.errorCode} ${error.message}`);
      }
      if (typeof isHostAudioless !== 'boolean') {
        throw new Error('[requestAppAudioHandling] Callback response - isHostAudioless must be a boolean');
      }

      if (doesHandlerExist('meeting.micStateChanged')) {
        removeHandler('meeting.micStateChanged');
      }

      callback(isHostAudioless);
    };

    sendMessageToParent(
      'meeting.requestAppAudioHandling',
      [requestAppAudioHandlingParams.isAppHandlingAudio],
      callbackInternalStop,
    );
  }

  /**
   * Notifies the host that the microphone state has changed in the app.
   * @param micState - The new state that the microphone is in
   *   isMicMuted - Boolean to indicate the current mute status of the mic.
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function updateMicState(micState: MicState): void {
    setMicStateWithReason(micState, MicStateChangeReason.AppInitiated);
  }

  function setMicStateWithReason(micState: MicState, reason: MicStateChangeReason): void {
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('meeting.updateMicState', [micState, reason]);
  }
}
