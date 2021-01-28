import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';
export namespace remoteCamera {
  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent patricipant details needed to request control of camera.
   */
  export interface ParticipantInput {
    /**
     * Id of participant.
     */
    id: string;
    /**
     * Display name of participant.
     */
    displayName?: string;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent a patricipant in a meeting.
   */
  export interface Participant extends ParticipantInput {
    isCapable: boolean;
  }

  /**
   * @private
   * Hide from docs
   *
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
   * @private
   * Hide from docs
   *
   * Data structure to hold the array of participants with controllable-cameras in a meeting.
   */
  export interface CapableParticipants {
    participants: Participant[];
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to return error reason when a handler error occurs.
   */
  export interface HandlerFailed {
    handlerError: ErrorReason;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to track the controlled device's state.
   */
  export interface DeviceStateChanged {
    deviceState: DeviceState;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to track the control session status.
   */
  export interface SessionStatusChanged {
    sessionStatus: SessionStatus;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to indicate the current state of the device.
   */
  export interface DeviceState {
    /**
     * All operation are available to apply.
     */
    available: boolean;
    /**
     * Either camera doesnt support to get state or It unable to apply command.
     */
    error: boolean;
    /**
     * Reset max out or already applied. Client Disable Reset.
     */
    reset: boolean;
    /**
     * ZoomIn maxed out.
     */
    zoomIn: boolean;
    /**
     * ZoomOut maxed out.
     */
    zoomOut: boolean;
    /**
     * PanLeft reached max left.
     */
    panLeft: boolean;
    /**
     * PanRight reached max right.
     */
    panRight: boolean;
    /**
     * TiltUp reached top.
     */
    tiltUp: boolean;
    /**
     * TiltDown reached bottom.
     */
    tiltDown: boolean;
  }

  /**
   * @private
   * Hide from docs
   *
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
   * @private
   * Hide from docs
   *
   * Data structure to indicate the status of the current session.
   */
  export interface SessionStatus {
    /**
     * Whether the far-end user is controlling a  device.
     */
    inControl: boolean;
    /**
     * Id of  participant whose device is being controlled.
     */
    id: string;
    /**
     * Reason the  control session was terminated.
     */
    terminatedReason?: SessionTerminatedReason;
  }

  /**
   * @private
   * Hide from docs
   *
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
  }

  /**
   * @private
   * Hide from docs
   *
   * Fetch a list of the participants with controllable-cameras in a meeting.
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the CapableParticipants object, incase of a successful fetch or null when it fails
   * result: object that contains an array of participants with controllable-cameras
   */
  export function getCapableParticipants(callback: (error: SdkError, result: CapableParticipants) => void): void {
    if (!callback) {
      throw new Error('[remoteCamera.getCapableParticipants] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('remoteCamera.getCapableParticipants');
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Request control of a participant's camera.
   * @param participant Participant specifies the participant to send the request for camera control.
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the true/false value, incase of a successful request or null when it fails
   * result: True means request was accepted and false means request was denied
   */
  export function requestControl(
    participant: ParticipantInput,
    callback: (error: SdkError, result: boolean) => void,
  ): void {
    if (!participant) {
      throw new Error('[remoteCamera.requestControl] Participant cannot be null');
    }
    if (!callback) {
      throw new Error('[remoteCamera.requestControl] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('remoteCamera.requestControl', [participant]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Send control command to the participant's camera.
   * @param ControlCommand ControlCommand specifies the command for controling the camera.
   * @param callback Callback to invoke when the command response returns.
   */
  export function sendControlCommand(ControlCommand: ControlCommand, callback: (error: SdkError) => void): void {
    if (!ControlCommand) {
      throw new Error('[remoteCamera.sendControlCommand] ControlCommand cannot be null');
    }
    if (!callback) {
      throw new Error('[remoteCamera.sendControlCommand] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('remoteCamera.sendControlCommand', [ControlCommand]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Terminate the remote  session
   * @param callback Callback to invoke when the command response returns.
   */
  export function terminateSession(callback: (error: SdkError) => void): void {
    if (!callback) {
      throw new Error('[remoteCamera.terminateSession] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('remoteCamera.terminateSession');
    GlobalVars.callbacks[messageId] = callback;
  }

  GlobalVars.handlers['remoteCamera.capableParticipantsChange'] = handleCapableParticipantsChange;
  GlobalVars.handlers['remoteCamera.handlerError'] = handleHandlerError;
  GlobalVars.handlers['remoteCamera.deviceStateChange'] = handleDeviceStateChange;
  GlobalVars.handlers['remoteCamera.sessionStatusChange'] = handleSessionStatusChange;

  /**
   * Registers a handler for change in participants with controllable-cameras.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the list of participants with controllable-cameras changes.
   */
  export function registerOnCapableParticipantsChangeHandler(
    handler: (participantChange: CapableParticipants) => void,
  ): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.capableParticipantsChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['remoteCamera.capableParticipantsChange']);
  }

  function handleCapableParticipantsChange(participantChange: remoteCamera.CapableParticipants): void {
    if (GlobalVars.capableParticipantsChangeHandler) {
      GlobalVars.capableParticipantsChangeHandler(participantChange);
    }
  }

  /**
   * Registers a handler for error.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when there is an error from the camera handler.
   */
  export function registerOnErrorHandler(handler: (error: HandlerFailed) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnErrorHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.errorHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['remoteCamera.handlerError']);
  }

  function handleHandlerError(error: HandlerFailed): void {
    if (GlobalVars.errorHandler) {
      GlobalVars.errorHandler(error);
    }
  }

  /**
   * Registers a handler for device state change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the controlled device changes state.
   */
  export function registerOnDeviceStateChangeHandler(handler: (deviceStateChange: DeviceStateChanged) => void): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.deviceStateChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['remoteCamera.deviceStateChange']);
  }

  function handleDeviceStateChange(deviceStateChange: DeviceStateChanged): void {
    if (GlobalVars.deviceStateChangeHandler) {
      GlobalVars.deviceStateChangeHandler(deviceStateChange);
    }
  }

  /**
   * Registers a handler for session status change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the current session status changes.
   */
  export function registerOnSessionStatusChangeHandler(
    handler: (sessionStatusChange: SessionStatusChanged) => void,
  ): void {
    if (!handler) {
      throw new Error('[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.sessionStatusChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['remoteCamera.sessionStatusChange']);
  }

  function handleSessionStatusChange(sessionStatusChange: SessionStatusChanged): void {
    if (GlobalVars.sessionStatusChangeHandler) {
      GlobalVars.sessionStatusChangeHandler(sessionStatusChange);
    }
  }
}
