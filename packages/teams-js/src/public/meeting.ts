import { sendAndHandleSdkError, sendMessageToParent } from '../internal/communication';
import { doesHandlerExist, registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { FrameContexts } from './constants';
import { EmailAddress } from './emailAddress';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const meetingTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * Interact with meetings, including retrieving meeting details, getting mic status, and sharing app content.
 * This namespace is used to handle meeting related functionality like
 * get meeting details, get/update state of mic, sharing app content and more.
 *
 * To learn more, visit https://aka.ms/teamsmeetingapps
 */
export namespace meeting {
  /** Error callback function type */
  export type errorCallbackFunctionType = (error: SdkError | null, result: boolean | null) => void;
  /** Get live stream state callback function type */
  export type getLiveStreamStateCallbackFunctionType = (
    error: SdkError | null,
    liveStreamState: LiveStreamState | null,
  ) => void;
  /** Live stream error callback function type */
  export type liveStreamErrorCallbackFunctionType = (error: SdkError | null) => void;
  /** Register live stream changed handler function type */
  export type registerLiveStreamChangedHandlerFunctionType = (liveStreamState: LiveStreamState) => void;
  /** Get app content stage sharing capabilities callback function type */
  export type getAppContentCallbackFunctionType = (
    error: SdkError | null,
    appContentStageSharingCapabilities: IAppContentStageSharingCapabilities | null,
  ) => void;
  /** Get app content stage sharing state callback function type */
  export type getAppContentStageCallbackFunctionType = (
    error: SdkError | null,
    appContentStageSharingState: IAppContentStageSharingState | null,
  ) => void;
  /** Register speaking state change handler function type */
  export type registerSpeakingStateChangeHandlerFunctionType = (speakingState: ISpeakingState) => void;
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
   * Data structure to represent call participant identifiers
   */
  interface ICallParticipantIdentifiers {
    /**
     * Phone number of a caller
     */
    phoneNumber?: string;

    /**
     * Email of a caller
     */
    email?: EmailAddress;
  }

  /**
   * @hidden
   * Hide from docs
   * Data structure to represent call details
   */
  export interface ICallDetails extends IMeetingOrCallDetailsBase<CallType> {
    /**
     * @deprecated please use {@link ICallDetails.originalCallerInfo} instead
     *
     * @hidden
     * Phone number of a PSTN caller or email of a VoIP caller
     */
    originalCaller?: string;

    /**
     * @hidden
     * Object representing the original caller
     */
    originalCallerInfo?: ICallParticipantIdentifiers;

    /**
     * @hidden
     * Identifier for the current call
     */
    callId?: string;

    /**
     * @deprecated please use {@link ICallDetails.dialedEntityInfo} instead
     *
     * @hidden
     * Phone number of a PSTN callee or email of a VoIP callee
     */
    dialedEntity?: never;

    /**
     * @hidden
     * Object representing the entity the caller dialed
     */
    dialedEntityInfo?: never;

    /**
     * @hidden
     * Tracking identifier for grouping related calls
     */
    trackingId?: never;
  }

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
     * event id of the meeting
     */
    id?: string;

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

  /**
   * Represents the current Real-Time Messaging Protocol (RTMP) live streaming state of a meeting.
   *
   * @remarks
   * RTMP is a popular communication protocol for streaming audio, video, and data over the Internet.
   */
  export interface LiveStreamState {
    /**
     * true when the current meeting is being streamed through RTMP, or false if it is not.
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

  /** Defines additional sharing options which can be provided to the {@link shareAppContentToStage} API. */
  export interface IShareAppContentToStageOptions {
    /**
     * The protocol option for sharing app content to the meeting stage. Defaults to `Collaborative`.
     * See {@link SharingProtocol} for more information.
     */
    sharingProtocol?: SharingProtocol;
  }

  /** Represents app permission to share contents to meeting. */
  export interface IAppContentStageSharingCapabilities {
    /**
     * indicates whether app has permission to share contents to meeting stage.
     * true when your `configurableTabs` or `staticTabs` entry's `context` array includes `meetingStage`.
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
     * true when one or more participants in a meeting are speaking, or false if no participants are speaking
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
    /**
     * Callback for the host to tell the app to change its speaker selection
     */
    audioDeviceSelectionChangedCallback?: (selectedDevices: AudioDeviceSelection | SdkError) => void;
  }

  /**
   * Interface for AudioDeviceSelection from host selection.
   * If the speaker or the microphone is undefined or don't have a device label, you can try to find the default devices
   * by using
   * ```ts
   * const devices = await navigator.mediaDevices.enumerateDevices();
   * const defaultSpeaker = devices.find((d) => d.deviceId === 'default' && d.kind === 'audiooutput');
   * const defaultMic = devices.find((d) => d.deviceId === 'default' && d.kind === 'audioinput');
   * ```
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface AudioDeviceSelection {
    speaker?: AudioDeviceInfo;
    microphone?: AudioDeviceInfo;
  }

  /**
   * Interface for AudioDeviceInfo, includes a device label with the same format as {@link MediaDeviceInfo.label}
   *
   * Hosted app can use this label to compare it with the device info fetched from {@link navigator.mediaDevices.enumerateDevices()}.
   * {@link MediaDeviceInfo} has  {@link MediaDeviceInfo.deviceId} as an unique identifier, but that id is also unique to the origin
   * of the calling application, so {@link MediaDeviceInfo.deviceId} cannot be used here as an identifier. Notice there are some cases
   * that devices may have the same device label, but we don't have a better way to solve this, keep this as a known limitation for now.
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export interface AudioDeviceInfo {
    deviceLabel: string;
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

  /**
   * Represents the type of a meeting
   *
   * @hidden
   * Hide from docs.
   *
   * @remarks
   * Teams has several types of meetings to account for different user scenarios and requirements.
   */
  export enum MeetingType {
    /**
     * Used when the meeting type is not known.
     *
     * @remarks
     * This response is not an expected case.
     */
    Unknown = 'Unknown',
    /**
     * Used for group call meeting types.
     *
     * @remarks
     * To test this meeting type in Teams, start a chat with two or more users and click the "Call" button.
     * Note that a group call may return as this or {@link CallType.GroupCall}. These two different response types should be considered as equal.
     */
    Adhoc = 'Adhoc',
    /**
     * Used for single-occurrence meetings that have been scheduled in advance.
     *
     * @remarks
     * To create a meeting of this type in Teams, press the "New meeting" button from the calendar and enter a meeting title.
     * Before saving, ensure that the "Online Meeting" field is checked.
     */
    Scheduled = 'Scheduled',
    /**
     * Used for meetings that occur on a recurring basis.
     *
     * @remarks
     * To create a meeting of this type in Teams, press the "New meeting" button from the calendar, enter a meeting title, and then change the field labeled "Does not repeat" to some other value.
     * Before saving, ensure that the "Online Meeting" field is checked.
     */
    Recurring = 'Recurring',
    /**
     * Used for webinars.
     *
     * @remarks
     * Meeting apps are only supported for those in the "event group" of a webinar, which are those who'll be presenting and producing the webinar.
     * To learn how to create a meeting of this type, visit https://aka.ms/teams/howto/webinars.
     */
    Broadcast = 'Broadcast',
    /**
     * Used for meet now meetings, which are meetings users create on the fly.
     *
     * @remarks
     * To create a meeting of this type, click the "Meet now" button from the calendar in Teams or the "Teams call" button in Outlook.
     */
    MeetNow = 'MeetNow',
  }

  /**
   * Represents the type of a call.
   *
   * @hidden
   * Hide from docs.
   */
  export enum CallType {
    /**
     * Represents a call between two people.
     *
     * @remarks
     * To test this feature, start a chat with one other user and click the "Call" button.
     */
    OneOnOneCall = 'oneOnOneCall',
    /**
     * Represents a call between more than two people.
     *
     * @remarks
     * To test this meeting type in Teams, start a chat with two or more users and click the "Call" button.
     * Note that a group call may return as this or {@link MeetingType.Adhoc}. These two different response types should be considered as equal.
     */
    GroupCall = 'groupCall',
  }

  /**
   * Represents the protocol option for sharing app content to the meeting stage.
   */
  export enum SharingProtocol {
    /**
     * The default protocol for sharing app content to stage. To learn more, visit https://aka.ms/teamsjs/shareAppContentToStage
     */
    Collaborative = 'Collaborative',
    /**
     * A read-only protocol for sharing app content to stage, which uses screen sharing in meetings. If provided, this protocol will open
     * the specified `contentUrl` passed to the {@link shareAppContentToStage} API in a new instance and screen share that instance.
     */
    ScreenShare = 'ScreenShare',
  }

  /**
   * Allows an app to get the incoming audio speaker setting for the meeting user.
   * To learn more, visit https://aka.ms/teamsjs/getIncomingClientAudioState
   *
   * @remarks
   * Use {@link toggleIncomingClientAudio} to toggle the current audio state.
   * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingParticipant.ToggleIncomingAudio.Chat` RSC permission in your app manifest.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
   *
   * @param callback - Callback contains 2 parameters, `error` and `result`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when fetch is successful.
   * `result` will be true when incoming audio is muted and false when incoming audio is unmuted, or null when the request fails.
   */
  export function getIncomingClientAudioState(callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get incoming client audio state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetIncomingClientAudioState),
      'getIncomingClientAudioState',
      callback,
    );
  }

  /**
   * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa.
   * To learn more, visit https://aka.ms/teamsjs/toggleIncomingClientAudio
   *
   * @remarks
   * Use {@link getIncomingClientAudioState} to get the current audio state.
   * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingParticipant.ToggleIncomingAudio.Chat` RSC permission in your app manifest.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
   *
   * @param callback - Callback contains 2 parameters, `error` and `result`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when toggle is successful.
   * `result` will be true when incoming audio is muted and false when incoming audio is unmuted, or null when the toggling fails.
   */
  export function toggleIncomingClientAudio(callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[toggle incoming client audio] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_ToggleIncomingClientAudio),
      'toggleIncomingClientAudio',
      callback,
    );
  }

  /**
   * @throws error if your app manifest does not include the `OnlineMeeting.ReadBasic.Chat` RSC permission.
   * Find the app manifest reference at https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema.
   * Find the RSC reference at https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent.
   *
   * @hidden
   * Allows an app to get the meeting details for the meeting
   *
   * @param callback - Callback contains 2 parameters, `error` and `meetingDetailsResponse`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when get is successful
   * `result` can either contain a {@link IMeetingDetailsResponse} value, in case of a successful get or null when the get fails
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
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetMeetingDetails),
      'meeting.getMeetingDetails',
      callback,
    );
  }

  /**
   * @throws error if your app manifest does not include both the `OnlineMeeting.ReadBasic.Chat` RSC permission
   * and the `OnlineMeetingParticipant.Read.Chat` RSC permission.
   * Find the app manifest reference at https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema.
   * Find the RSC reference at https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent.
   *
   * @throws `not supported on platform` error if your app is run on a host that does not support returning additional meeting details.
   *
   * @hidden
   * Allows an app to get the additional meeting details for the meeting.
   * Some additional details are returned on a best-effort basis. They may not be present for every meeting.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export async function getMeetingDetailsVerbose(): Promise<IMeetingDetailsResponse> {
    ensureInitialized(
      runtime,
      FrameContexts.sidePanel,
      FrameContexts.meetingStage,
      FrameContexts.settings,
      FrameContexts.content,
    );

    let response: IMeetingDetailsResponse;
    try {
      const shouldGetVerboseDetails = true;
      response = (await sendAndHandleSdkError(
        getApiVersionTag(ApiVersionNumber.V_2, ApiName.Meeting_GetMeetingDetailsVerbose),
        'meeting.getMeetingDetails',
        shouldGetVerboseDetails,
      )) as IMeetingDetailsResponse;
    } catch (error) {
      throw new Error(error?.errorCode?.toString());
    }

    if (
      (response.details?.type == CallType.GroupCall || response.details?.type == CallType.OneOnOneCall) &&
      !response.details.originalCallerInfo
    ) {
      throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
    }

    return response;
  }

  /**
   * @hidden
   * Allows an app to get the authentication token for the anonymous or guest user in the meeting
   *
   * @param callback - Callback contains 2 parameters, `error` and `authenticationTokenOfAnonymousUser`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when get is successful
   * `authenticationTokenOfAnonymousUser` can either contain a string value, in case of a successful get or null when the get fails
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
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetAuthenticationTokenForAnonymousUser),
      'meeting.getAuthenticationTokenForAnonymousUser',
      callback,
    );
  }

  /**
   * Allows an app to get the state of the outgoing live stream in the current meeting.
   *
   * @remarks
   * Use {@link requestStartLiveStreaming} or {@link requestStopLiveStreaming} to start/stop a live stream.
   * This API can only be used in the `sidePanel` frame context.
   * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
   *
   * @param callback - Callback contains 2 parameters: `error` and `liveStreamState`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when the request is successful
   * `liveStreamState` can either contain a `LiveStreamState` value, or null when operation fails
   */
  export function getLiveStreamState(callback: getLiveStreamStateCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get live stream state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetLiveStreamState),
      'meeting.getLiveStreamState',
      callback,
    );
  }

  /**
   * Allows an app to ask the local user to begin live streaming the current meeting to the given Real-Time Messaging Protocol (RTMP) stream url.
   * A confirmation dialog will be shown to the local user with options to "Allow" or "Cancel" this request.
   *
   * @remarks
   * Meeting content (e.g., user video, screenshare, audio, etc.) can be externally streamed to any platform that supports the popular RTMP standard.
   * Content broadcasted through RTMP is automatically formatted and cannot be customized.
   * Use {@link getLiveStreamState} or {@link registerLiveStreamChangedHandler} to get updates on the live stream state.
   * This API can only be used in the `sidePanel` frame context.
   * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
   *
   * @param callback - completion callback that contains an `error` parameter, which can be of type `SdkError` in case of an error, or null when operation is successful
   * @param streamUrl - the url to the RTMP stream resource
   * @param streamKey - the key to the RTMP stream resource
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
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RequestStartLiveStreaming),
      'meeting.requestStartLiveStreaming',
      [streamUrl, streamKey],
      callback,
    );
  }

  /**
   * Allows an app to request that live streaming be stopped.
   *
   * @remarks
   * Use {@link getLiveStreamState} or {@link registerLiveStreamChangedHandler} to get updates on the live stream state.
   * This API can only be used in the `sidePanel` frame context.
   * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
   *
   * @param callback - completion callback that contains an error parameter, which can be of type `SdkError` in case of an error, or null when operation is successful
   */
  export function requestStopLiveStreaming(callback: liveStreamErrorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[request stop live streaming] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RequestStopLiveStreaming),
      'meeting.requestStopLiveStreaming',
      callback,
    );
  }

  /**
   * Registers an event handler for state changes to the live stream.
   *
   * @remarks
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * Use {@link requestStartLiveStreaming} or {@link requestStopLiveStreaming} to start/stop a live stream.
   * This API can only be used in the `sidePanel` frame context.
   * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
   *
   * @param handler - The handler to invoke when the live stream state changes
   */
  export function registerLiveStreamChangedHandler(handler: registerLiveStreamChangedHandlerFunctionType): void {
    if (!handler) {
      throw new Error('[register live stream changed handler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    registerHandler(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterLiveStreamChangedHandler),
      'meeting.liveStreamChanged',
      handler,
    );
  }

  /**
   * Allows an app to share a given URL to the meeting stage for all users in the meeting.
   * To learn more, visit https://aka.ms/teamsjs/shareAppContentToStage
   *
   * @remarks
   * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
   * For private scheduled meetings, meet now, or calls, include the `MeetingStage.Write.Chat` RSC permission in your app manifest.
   * For channel meetings, include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   * Use {@link getAppContentStageSharingCapabilities} to determine if the local user is eligible to use this API.
   * Use {@link getAppContentStageSharingState} to determine whether app content is already being shared to the meeting stage.
   *
   * @param callback - Callback contains 2 parameters, `error` and `result`.
   * `error` can either contain an error of type `SdkError`, in case of an error, or null when share is successful
   * `result` can either contain a true value, in case of a successful share or null when the share fails
   * @param appContentUrl - is the input URL to be shared to the meeting stage.
   * the URL origin must be included in your app manifest's `validDomains` field.
   * @param shareOptions - is an object that contains additional sharing options. If omitted, the default
   * sharing protocol will be `Collaborative`. See {@link IShareAppContentToStageOptions} for more information.
   */
  export function shareAppContentToStage(
    callback: errorCallbackFunctionType,
    appContentUrl: string,
    shareOptions: IShareAppContentToStageOptions = { sharingProtocol: SharingProtocol.Collaborative },
  ): void {
    if (!callback) {
      throw new Error('[share app content to stage] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_ShareAppContentToStage),
      'meeting.shareAppContentToStage',
      [appContentUrl, shareOptions],
      callback,
    );
  }

  /**
   * Allows an app to request whether the local user's app version has the required app manifest permissions to share content to meeting stage.
   * To learn more, visit https://aka.ms/teamsjs/getAppContentStageSharingCapabilities
   *
   * @remarks
   * If you are updating your published app to include the share to stage feature, you can use this API to prompt users to update their app if they are using an older version.
   * Your app's `configurableTabs` or `staticTabs` entry's `context` array must include `meetingStage` for `doesAppHaveSharePermission` to be `true` in the `callback` response.
   *
   * @throws error if API is being used outside of `sidePanel` or `meetingStage` frame contexts.
   * @throws error if your app manifest does not include the `MeetingStage.Write.Chat` RSC permission in your app manifest in a private scheduled meeting, meet now, or call --
   * or if it does not include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest in a channel meeting.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   *
   * @param callback - Completion callback contains 2 parameters: `error` and `appContentStageSharingCapabilities`.
   * `error` can either contain an error of type `SdkError` (error indication), or null (non-error indication).
   * `appContentStageSharingCapabilities` will contain an {@link IAppContentStageSharingCapabilities} object if the request succeeds, or null if it failed.
   */
  export function getAppContentStageSharingCapabilities(callback: getAppContentCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get app content stage sharing capabilities] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetAppContentStageSharingCapabilities),
      'meeting.getAppContentStageSharingCapabilities',
      callback,
    );
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
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_StopSharingAppContentToStage),
      'meeting.stopSharingAppContentToStage',
      callback,
    );
  }

  /**
   * Provides information related to current stage sharing state for your app.
   * To learn more, visit https://aka.ms/teamsjs/getAppContentStageSharingState
   *
   * @remarks
   * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
   * For private scheduled meetings, meet now, or calls, include the `MeetingStage.Write.Chat` RSC permission in your app manifest.
   * For channel meetings, include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   *
   * @param callback - Callback contains 2 parameters, `error` and `appContentStageSharingState`.
   * error can either contain an error of type SdkError (error indication), or null (non-error indication)
   * `appContentStageSharingState` can either contain an `IAppContentStageSharingState` object if the request succeeds, or null if it failed
   */
  export function getAppContentStageSharingState(callback: getAppContentStageCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[get app content stage sharing state] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_GetAppContentStageSharingState),
      'meeting.getAppContentStageSharingState',
      callback,
    );
  }

  /**
   * Registers a handler for changes to participant speaking states.
   * To learn more, visit https://aka.ms/teamsjs/registerSpeakingStateChangeHandler
   *
   * @remarks
   * This API returns {@link ISpeakingState}, which will have `isSpeakingDetected` and/or an error object.
   * If any participant is speaking, `isSpeakingDetected` will be true, or false if no participants are speaking.
   * Only one handler can be registered at a time. Subsequent registrations replace existing registrations.
   * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
   * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingIncomingAudio.Detect.Chat` RSC permission in your app manifest.
   * For channel meetings, include the `OnlineMeetingIncomingAudio.Detect.Group` RSC permission in your app manifest.
   * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
   *
   * @param handler The handler to invoke when the speaking state of any participant changes (start/stop speaking).
   */
  export function registerSpeakingStateChangeHandler(handler: registerSpeakingStateChangeHandlerFunctionType): void {
    if (!handler) {
      throw new Error('[registerSpeakingStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
    registerHandler(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterSpeakingStateChangeHandler),
      'meeting.speakingStateChanged',
      handler,
    );
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
    registerHandler(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterRaiseHandStateChangedHandler),
      'meeting.raiseHandStateChanged',
      handler,
    );
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
    registerHandler(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterMeetingReactionReceivedHandler),
      'meeting.meetingReactionReceived',
      handler,
    );
  }

  /**
   * @hidden
   * Hide from docs beacuse it's only used internally as a serialization/deserialization type
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ISerializedJoinMeetingParams {
    joinWebUrl: string;
    source: EventActionSource;
  }

  /**
   * This function is used to join a meeting.
   * This opens a meeting in a new window for the desktop app.
   * In case of a web app, it will close the current app and open the meeting in the same tab.
   * There is currently no support or experience for this on mobile platforms.
   * @param joinMeetingParams This takes {@link JoinMeetingParams} for joining the meeting. If source isn't passed then it is marked as 'Other' by default.
   * @throws error if the meeting join fails, the promise will reject to an object with the error message.
   */
  export function joinMeeting(joinMeetingParams: JoinMeetingParams): Promise<void> {
    if (joinMeetingParams?.joinWebUrl === undefined || joinMeetingParams?.joinWebUrl === null) {
      return Promise.reject(new Error('Invalid joinMeetingParams'));
    }

    ensureInitialized(runtime);

    const serializedJoinMeetingParams: ISerializedJoinMeetingParams = {
      joinWebUrl: joinMeetingParams.joinWebUrl.href,
      source: joinMeetingParams.source || EventActionSource.Other,
    };

    return sendAndHandleSdkError(
      getApiVersionTag(ApiVersionNumber.V_2, ApiName.Meeting_JoinMeeting),
      'meeting.joinMeeting',
      serializedJoinMeetingParams,
    );
  }

  /**
   * Contains information associated with parameters required for joining the Microsoft Teams meetings.
   * More details regarding parameters can be found at:
   * [Online Meeting Base - Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/resources/onlinemeetingbase?view=graph-rest-1.0)
   */
  export interface JoinMeetingParams {
    /** The join URL of the online meeting. */
    joinWebUrl: URL;
    /** The source of the join button click. If not passed, 'Other' is the default value of source. {@link EventActionSource} */
    source?: EventActionSource;
  }

  /** The source of the join button click. */
  export enum EventActionSource {
    /**
     * Source is calendar grid context menu.
     */
    M365CalendarGridContextMenu = 'm365_calendar_grid_context_menu',
    /**
     * Source is calendar grid peek.
     */
    M365CalendarGridPeek = 'm365_calendar_grid_peek',
    /**
     * Source is calendar grid event card join button.
     */
    M365CalendarGridEventCardJoinButton = 'm365_calendar_grid_event_card_join_button',
    /**
     * Source is calendar form ribbon join button.
     */
    M365CalendarFormRibbonJoinButton = 'm365_calendar_form_ribbon_join_button',
    /**
     * Source is calendar form join teams meeting button.
     */
    M365CalendarFormJoinTeamsMeetingButton = 'm365_calendar_form_join_teams_meeting_button',
    /**
     * Other sources.
     */
    Other = 'other',
  }

  /**
   * Nested namespace for functions to control behavior of the app share button
   *
   * @hidden
   * Hide from docs.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export namespace appShareButton {
    /**
     * Property bag for the setVisibilityInfo
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
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
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function setOptions(shareInformation: ShareInformation): void {
      ensureInitialized(runtime, FrameContexts.sidePanel);
      if (shareInformation.contentUrl) {
        new URL(shareInformation.contentUrl);
      }
      sendMessageToParent(
        getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_AppShareButton_SetOptions),
        'meeting.appShareButton.setOptions',
        [shareInformation],
      );
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
      registerHandler(
        getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterMicStateChangeHandler),
        'meeting.micStateChanged',
        micStateChangedCallback,
      );

      const audioDeviceSelectionChangedCallback = (selectedDevicesInHost: AudioDeviceSelection): void => {
        requestAppAudioHandlingParams.audioDeviceSelectionChangedCallback?.(selectedDevicesInHost);
      };
      registerHandler(
        getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RegisterAudioDeviceSelectionChangedHandler),
        'meeting.audioDeviceSelectionChanged',
        audioDeviceSelectionChangedCallback,
      );

      callback(isHostAudioless);
    };
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RequestAppAudioHandling),
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

      if (doesHandlerExist('meeting.audioDeviceSelectionChanged')) {
        removeHandler('meeting.audioDeviceSelectionChanged');
      }

      callback(isHostAudioless);
    };

    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_RequestAppAudioHandling),
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
    sendMessageToParent(
      getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_SetMicStateWithReason),
      'meeting.updateMicState',
      [micState, reason],
    );
  }
}
