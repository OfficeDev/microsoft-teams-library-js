import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { SdkError } from '../public/interfaces';
export namespace ptzExtension {
  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent patricipant details needed to request control of PTZ camera.
   */
  export interface PtzParticipantInput {
    /**
     * Id of PTZ Participant.
     */
    id: string;
    /**
     * Display name of PTZ participant.
     */
    displayName?: string;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to represent a patricipant in a meeting.
   */
  export interface Participant extends PtzParticipantInput {
    isPtzCapable: boolean;
  }

  /**
   * @private
   * Hide from docs
   *
   * Enum used to indicate possible PTZ control commands.
   */
  export enum PtzControlCommand {
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
   * Data structure to hold the array of ptz-capable participants in a meeting.
   */
  export interface PtzCapableParticipants {
    participants: Participant[];
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to return error reason when a PTZ handler error occurs.
   */
  export interface PtzHandlerFailed {
    ptzHandlerError: PtzErrorReason;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to track the controlled PTZ device's state.
   */
  export interface PtzRemoteControlDeviceStateChanged {
    deviceState: PtzControlDeviceState;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to track the PTZ control session status.
   */
  export interface PtzSessionStatusChanged {
    sessionStatus: PtzSessionStatus;
  }

  /**
   * @private
   * Hide from docs
   *
   * Data structure to indicate the current state of the PTZ device, true if device is in corresponding state.
   */
  export interface PtzControlDeviceState {
    available: boolean;
    error: boolean;
    reset: boolean;
    zoomIn: boolean;
    zoomOut: boolean;
    panLeft: boolean;
    panRight: boolean;
    tiltUp: boolean;
    tiltDown: boolean;
  }

  /**
   * @private
   * Hide from docs
   *
   * Enum used to indicate the reason the error the PTZ handler encountered.
   */
  export enum PtzErrorReason {
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
   * Data structure to indicate the status of the current PTZ session.
   */
  export interface PtzSessionStatus {
    /**
     * Whether the far-end user is controlling a PTZ device.
     */
    inControl: boolean;
    /**
     * Id of PTZ participant whose device is being controlled.
     */
    id: string;
    /**
     * Reason the PTZ control session was terminated.
     */
    terminatedReason?: PtzSessionTerminatedReason;
  }

  /**
   * @private
   * Hide from docs
   *
   * Enum used to indicate the reason the PTZ session was terminated.
   */
  export enum PtzSessionTerminatedReason {
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
   * Fetch the ptz capable participants in a meeting.
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the PtzCapableParticipants object, incase of a successful fetch or null when it fails
   * result: object that contains an array of ptz-capable participants
   */
  export function getCapableParticipants(callback: (error: SdkError, result: PtzCapableParticipants) => void): void {
    if (!callback) {
      throw new Error('[ptzExtension.getCapableParticipants] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('ptzExtension.getCapableParticipants');
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Request remote control of a participant's ptz camera
   * @param participant Participant specifies the near-end participant object, for which the far-end is requesting control.
   * @param callback Callback contains 2 parameters, error and result.
   * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
   * result can either contain the true/false value, incase of a successful request or null when it fails
   * result: True means request was accepted and false means request was denied
   */
  export function requestRemoteCameraControl(
    participant: PtzParticipantInput,
    callback: (error: SdkError, result: boolean) => void,
  ): void {
    if (!participant) {
      throw new Error('[ptzExtension.requestRemoteCameraControl] Participant cannot be null');
    }
    if (!callback) {
      throw new Error('[ptzExtension.requestRemoteCameraControl] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('ptzExtension.requestRemoteCameraControl', [participant]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Send remote ptz custom command to control the near-end's PTZ camera
   * @param ptzControlCommand PtzControlCommand specifies the command for controling the PTZ camera
   * @param callback Callback to invoke when the command response returns.
   */
  export function sendRemoteCustomCommand(
    ptzControlCommand: PtzControlCommand,
    callback: (error: SdkError) => void,
  ): void {
    if (!ptzControlCommand) {
      throw new Error('[ptzExtension.sendRemoteCustomCommand] PtzControlCommand cannot be null');
    }
    if (!callback) {
      throw new Error('[ptzExtension.sendRemoteCustomCommand] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('ptzExtension.sendRemoteCustomCommand', [ptzControlCommand]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * @private
   * Hide from docs
   *
   * Terminate the remote PTZ session
   * @param callback Callback to invoke when the command response returns.
   */
  export function terminateRemoteSession(callback: (error: SdkError) => void): void {
    if (!callback) {
      throw new Error('[ptzExtension.terminateRemoteSession] Callback cannot be null');
    }
    ensureInitialized();
    const messageId = sendMessageRequestToParent('ptzExtension.terminateRemoteSession');
    GlobalVars.callbacks[messageId] = callback;
  }

  GlobalVars.handlers['ptzCapableParticipantsChange'] = handlePtzCapableParticipantsChange;
  GlobalVars.handlers['ptzHandlerError'] = handlePtzHandlerError;
  GlobalVars.handlers['ptzControlDeviceStateChange'] = handlePtzControlDeviceStateChange;
  GlobalVars.handlers['ptzSessionStatusChange'] = handlePtzSessionStatusChange;
  /**
   * Registers a handler for change in PTZ-capable participants.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the list of PTZ-capable participants changes.
   */
  export function registerOnCapableParticipantsChangeHandler(
    handler: (participantChange: PtzCapableParticipants) => void,
  ): void {
    if (!handler) {
      throw new Error('[ptzExtension.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.ptzCapableParticipantsChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['ptzCapableParticipantsChange']);
  }

  function handlePtzCapableParticipantsChange(participantChange: ptzExtension.PtzCapableParticipants): void {
    if (GlobalVars.ptzCapableParticipantsChangeHandler) {
      GlobalVars.ptzCapableParticipantsChangeHandler(participantChange);
    }
  }

  /**
   * Registers a handler for error in the PTZ handler.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when there is an error from the PTZ side.
   */
  export function registerOnPtzErrorHandler(handler: (error: PtzHandlerFailed) => void): void {
    if (!handler) {
      throw new Error('[ptzExtension.registerOnPtzErrorHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.ptzErrorHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['ptzHandlerError']);
  }

  function handlePtzHandlerError(error: PtzHandlerFailed): void {
    if (GlobalVars.ptzErrorHandler) {
      GlobalVars.ptzErrorHandler(error);
    }
  }

  /**
   * Registers a handler for PTZ device state change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the controlled PTZ device changes state.
   */
  export function registerOnControlDeviceStateChangeHandler(
    handler: (deviceStateChange: PtzRemoteControlDeviceStateChanged) => void,
  ): void {
    if (!handler) {
      throw new Error('[ptzExtension.registerOnControlDeviceStateChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.ptzControlDeviceStateChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['ptzControlDeviceStateChange']);
  }

  function handlePtzControlDeviceStateChange(deviceStateChange: PtzRemoteControlDeviceStateChanged): void {
    if (GlobalVars.ptzControlDeviceStateChangeHandler) {
      GlobalVars.ptzControlDeviceStateChangeHandler(deviceStateChange);
    }
  }

  /**
   * Registers a handler for PTZ session status change.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the current PTZ session status changes.
   */
  export function registerOnSessionStatusChangeHandler(
    handler: (sessionStatusChange: PtzSessionStatusChanged) => void,
  ): void {
    if (!handler) {
      throw new Error('[ptzExtension.registerOnSessionStatusChangeHandler] Handler cannot be null');
    }
    ensureInitialized();
    GlobalVars.ptzSessionStatusChangeHandler = handler;
    handler && sendMessageRequestToParent('registerHandler', ['ptzSessionStatusChange']);
  }

  function handlePtzSessionStatusChange(sessionStatusChange: PtzSessionStatusChanged): void {
    if (GlobalVars.ptzSessionStatusChangeHandler) {
      GlobalVars.ptzSessionStatusChangeHandler(sessionStatusChange);
    }
  }
}
