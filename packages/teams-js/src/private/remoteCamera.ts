import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { runtime } from '../public/runtime';

export namespace remoteCamera {
  /**
   * @hidden
   * Hide from docs
   * ------
   * Data structure to represent patricipant details needed to request control of camera.
   */
  export interface Participant {
    /**
     * @hidden
     * Id of participant.
     */
    id: string;
    /**
     * @hidden
     * Display name of participant.
     */
    displayName?: string;
    /**
     * @hidden
     * Active indicates whether the participant's device is actively being controlled.
     */
    active?: boolean;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Enum used to indicate possible camera control commands.
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
   * Hide from docs
   * ------
   * Data structure to indicate the current state of the device.
   */
  export interface DeviceState {
    /**
     * @hidden
     * All operation are available to apply.
     */
    available: boolean;
    /**
     * @hidden
     * Either camera doesnt support to get state or It unable to apply command.
     */
    error: boolean;
    /**
     * @hidden
     * Reset max out or already applied. Client Disable Reset.
     */
    reset: boolean;
    /**
     * @hidden
     * ZoomIn maxed out.
     */
    zoomIn: boolean;
    /**
     * @hidden
     * ZoomOut maxed out.
     */
    zoomOut: boolean;
    /**
     * @hidden
     * PanLeft reached max left.
     */
    panLeft: boolean;
    /**
     * @hidden
     * PanRight reached max right.
     */
    panRight: boolean;
    /**
     * @hidden
     * TiltUp reached top.
     */
    tiltUp: boolean;
    /**
     * @hidden
     * TiltDown reached bottom.
     */
    tiltDown: boolean;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Enum used to indicate the reason for the error.
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
   * Hide from docs
   * ------
   * Data structure to indicate the status of the current session.
   */
  export interface SessionStatus {
    /**
     * @hidden
     * Whether the far-end user is controlling a  device.
     */
    inControl: boolean;
    /**
     * @hidden
     * Reason the  control session was terminated.
     */
    terminatedReason?: SessionTerminatedReason;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Enum used to indicate the reason the session was terminated.
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
   * Hide from docs
   * ------
   * Fetch a list of the participants with controllable-cameras in a meeting.
   *
   * @param callback - Callback contains 2 parameters, error and participants.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * participants can either contain an array of Participant objects, incase of a successful fetch or null when it fails
   * participants: object that contains an array of participants with controllable-cameras
   */
  export function getCapableParticipants(
    callback: (error: SdkError | null, participants: Participant[] | null) => void,
  ): void {
    if (!callback) {
      throw new Error('[remoteCamera.getCapableParticipants] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.getCapableParticipants', callback);
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Request control of a participant's camera.
   *
   * @param participant - Participant specifies the participant to send the request for camera control.
   * @param callback - Callback contains 2 parameters, error and requestResponse.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * requestResponse can either contain the true/false value, incase of a successful request or null when it fails
   * requestResponse: True means request was accepted and false means request was denied
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
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.requestControl', [participant], callback);
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Send control command to the participant's camera.
   *
   * @param ControlCommand - ControlCommand specifies the command for controling the camera.
   * @param callback - Callback to invoke when the command response returns.
   */
  export function sendControlCommand(ControlCommand: ControlCommand, callback: (error: SdkError | null) => void): void {
    if (!ControlCommand) {
      throw new Error('[remoteCamera.sendControlCommand] ControlCommand cannot be null');
    }
    if (!callback) {
      throw new Error('[remoteCamera.sendControlCommand] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('remoteCamera.sendControlCommand', [ControlCommand], callback);
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Terminate the remote  session
   *
   * @param callback - Callback to invoke when the command response returns.
   */
  export function terminateSession(callback: (error: SdkError | null) => void): void {
    if (!callback) {
      throw new Error('[remoteCamera.terminateSession] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
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
   */
  export function registerOnCapableParticipantsChangeHandler(
    handler: (participantChange: Participant[]) => void,
  ): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
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
   */
  export function registerOnErrorHandler(handler: (error: ErrorReason) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnErrorHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
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
   */
  export function registerOnDeviceStateChangeHandler(handler: (deviceStateChange: DeviceState) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
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
   */
  export function registerOnSessionStatusChangeHandler(handler: (sessionStatusChange: SessionStatus) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null');
    }
    ensureInitialized(FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('remoteCamera.sessionStatusChange', handler);
  }

  export function isSupported(): boolean {
    return runtime.supports.remoteCamera ? true : false;
  }
}
