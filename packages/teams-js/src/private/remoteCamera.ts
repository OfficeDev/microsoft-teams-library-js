import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace remoteCamera {
  /**
   * @hidden
   * Data structure to represent patricipant details needed to request control of camera.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface Participant {
    /**
     * @hidden
     * Id of participant.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    id: string;
    /**
     * @hidden
     * Display name of participant.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    displayName?: string;
    /**
     * @hidden
     * Active indicates whether the participant's device is actively being controlled.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    active?: boolean;
  }

  /**
   * @hidden
   * Enum used to indicate possible camera control commands.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ControlCommand {
    Reset = 'Reset',
    ZoomIn = 'ZoomIn',
    ZoomOut = 'ZoomOut',
    PanLeft = 'PanLeft',
    PanRight = 'PanRight',
    TiltUp = 'TiltUp',
    TiltDown = 'TiltDown',
  }

  /**
   * @hidden
   * Data structure to indicate the current state of the device.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface DeviceState {
    /**
     * @hidden
     * All operation are available to apply.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    available: boolean;
    /**
     * @hidden
     * Either camera doesnt support to get state or It unable to apply command.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    error: boolean;
    /**
     * @hidden
     * Reset max out or already applied. Client Disable Reset.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    reset: boolean;
    /**
     * @hidden
     * ZoomIn maxed out.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    zoomIn: boolean;
    /**
     * @hidden
     * ZoomOut maxed out.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    zoomOut: boolean;
    /**
     * @hidden
     * PanLeft reached max left.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    panLeft: boolean;
    /**
     * @hidden
     * PanRight reached max right.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    panRight: boolean;
    /**
     * @hidden
     * TiltUp reached top.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    tiltUp: boolean;
    /**
     * @hidden
     * TiltDown reached bottom.
     *
     * @internal Limited to Microsoft-internal use
     */
    tiltDown: boolean;
  }

  /**
   * @hidden
   * Enum used to indicate the reason for the error.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ErrorReason {
    CommandResetError,
    CommandZoomInError,
    CommandZoomOutError,
    CommandPanLeftError,
    CommandPanRightError,
    CommandTiltUpError,
    CommandTiltDownError,
    SendDataError,
  }

  /**
   * @hidden
   * Data structure to indicate the status of the current session.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface SessionStatus {
    /**
     * @hidden
     * Whether the far-end user is controlling a  device.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    inControl: boolean;
    /**
     * @hidden
     * Reason the  control session was terminated.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    terminatedReason?: SessionTerminatedReason;
  }

  /**
   * @hidden
   * Enum used to indicate the reason the session was terminated.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum SessionTerminatedReason {
    None,
    ControlDenied,
    ControlNoResponse,
    ControlBusy,
    AckTimeout,
    ControlTerminated,
    ControllerTerminated,
    DataChannelError,
    ControllerCancelled,
    ControlDisabled,
    ControlTerminatedToAllowOtherController,
  }

  /**
   * @hidden
   * Fetch a list of the participants with controllable-cameras in a meeting.
   *
   * @param callback - Callback contains 2 parameters, error and participants.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * participants can either contain an array of Participant objects, incase of a successful fetch or null when it fails
   * participants: object that contains an array of participants with controllable-cameras
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getCapableParticipants(
    callback: (error: SdkError | null, participants: Participant[] | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[remoteCamera.getCapableParticipants] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.getCapableParticipants', callback);
  }

  /**
   * @hidden
   * Request control of a participant's camera.
   *
   * @param participant - Participant specifies the participant to send the request for camera control.
   * @param callback - Callback contains 2 parameters, error and requestResponse.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * requestResponse can either contain the true/false value, incase of a successful request or null when it fails
   * requestResponse: True means request was accepted and false means request was denied
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function requestControl(
    participant: Participant,
    callback: (error: SdkError | null, requestResponse: boolean | null) => void,
  ): void {
    if (!participant) {
      throw new Error('[remoteCamera.requestControl] Participant cannot be null');
    }
    if (!callback) {
      throw new Error('[remoteCamera.requestControl] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.requestControl', [participant], callback);
  }

  /**
   * @hidden
   * Send control command to the participant's camera.
   *
   * @param ControlCommand - ControlCommand specifies the command for controling the camera.
   * @param callback - Callback to invoke when the command response returns.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function sendControlCommand(ControlCommand: ControlCommand, callback: (error: SdkError | null) => void): void {
    if (!ControlCommand) {
      throw new Error('[remoteCamera.sendControlCommand] ControlCommand cannot be null');
    }
    if (!callback) {
      throw new Error('[remoteCamera.sendControlCommand] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.sendControlCommand', [ControlCommand], callback);
  }

  /**
   * @hidden
   * Terminate the remote  session
   *
   * @param callback - Callback to invoke when the command response returns.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function terminateSession(callback: (error: SdkError | null) => void): void {
    if (!callback) {
      throw new Error('[remoteCamera.terminateSession] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.terminateSession', callback);
  }

  /**
   * @hidden
   * Registers a handler for change in participants with controllable-cameras.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the list of participants with controllable-cameras changes.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerOnCapableParticipantsChangeHandler(
    handler: (participantChange: Participant[]) => void,
  ): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('remoteCamera.capableParticipantsChange', handler);
  }

  /**
   * @hidden
   * Registers a handler for error.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when there is an error from the camera handler.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerOnErrorHandler(handler: (error: ErrorReason) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnErrorHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('remoteCamera.handlerError', handler);
  }

  /**
   * @hidden
   * Registers a handler for device state change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the controlled device changes state.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerOnDeviceStateChangeHandler(handler: (deviceStateChange: DeviceState) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('remoteCamera.deviceStateChange', handler);
  }

  /**
   * @hidden
   * Registers a handler for session status change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the current session status changes.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerOnSessionStatusChangeHandler(handler: (sessionStatusChange: SessionStatus) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('remoteCamera.sessionStatusChange', handler);
  }

  /**
   * @hidden
   *
   * Checks if the remoteCamera capability is supported by the host
   * @returns boolean to represent whether the remoteCamera capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.remoteCamera ? true : false;
  }
}
