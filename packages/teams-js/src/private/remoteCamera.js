"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remoteCamera = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("../public/constants");
var runtime_1 = require("../public/runtime");
/**
 * @alpha
 */
var remoteCamera;
(function (remoteCamera) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate possible camera control commands.
     */
    var ControlCommand;
    (function (ControlCommand) {
        ControlCommand["Reset"] = "Reset";
        ControlCommand["ZoomIn"] = "ZoomIn";
        ControlCommand["ZoomOut"] = "ZoomOut";
        ControlCommand["PanLeft"] = "PanLeft";
        ControlCommand["PanRight"] = "PanRight";
        ControlCommand["TiltUp"] = "TiltUp";
        ControlCommand["TiltDown"] = "TiltDown";
    })(ControlCommand = remoteCamera.ControlCommand || (remoteCamera.ControlCommand = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate the reason for the error.
     */
    var ErrorReason;
    (function (ErrorReason) {
        ErrorReason[ErrorReason["CommandResetError"] = 0] = "CommandResetError";
        ErrorReason[ErrorReason["CommandZoomInError"] = 1] = "CommandZoomInError";
        ErrorReason[ErrorReason["CommandZoomOutError"] = 2] = "CommandZoomOutError";
        ErrorReason[ErrorReason["CommandPanLeftError"] = 3] = "CommandPanLeftError";
        ErrorReason[ErrorReason["CommandPanRightError"] = 4] = "CommandPanRightError";
        ErrorReason[ErrorReason["CommandTiltUpError"] = 5] = "CommandTiltUpError";
        ErrorReason[ErrorReason["CommandTiltDownError"] = 6] = "CommandTiltDownError";
        ErrorReason[ErrorReason["SendDataError"] = 7] = "SendDataError";
    })(ErrorReason = remoteCamera.ErrorReason || (remoteCamera.ErrorReason = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Enum used to indicate the reason the session was terminated.
     */
    var SessionTerminatedReason;
    (function (SessionTerminatedReason) {
        SessionTerminatedReason[SessionTerminatedReason["None"] = 0] = "None";
        SessionTerminatedReason[SessionTerminatedReason["ControlDenied"] = 1] = "ControlDenied";
        SessionTerminatedReason[SessionTerminatedReason["ControlNoResponse"] = 2] = "ControlNoResponse";
        SessionTerminatedReason[SessionTerminatedReason["ControlBusy"] = 3] = "ControlBusy";
        SessionTerminatedReason[SessionTerminatedReason["AckTimeout"] = 4] = "AckTimeout";
        SessionTerminatedReason[SessionTerminatedReason["ControlTerminated"] = 5] = "ControlTerminated";
        SessionTerminatedReason[SessionTerminatedReason["ControllerTerminated"] = 6] = "ControllerTerminated";
        SessionTerminatedReason[SessionTerminatedReason["DataChannelError"] = 7] = "DataChannelError";
        SessionTerminatedReason[SessionTerminatedReason["ControllerCancelled"] = 8] = "ControllerCancelled";
        SessionTerminatedReason[SessionTerminatedReason["ControlDisabled"] = 9] = "ControlDisabled";
        SessionTerminatedReason[SessionTerminatedReason["ControlTerminatedToAllowOtherController"] = 10] = "ControlTerminatedToAllowOtherController";
    })(SessionTerminatedReason = remoteCamera.SessionTerminatedReason || (remoteCamera.SessionTerminatedReason = {}));
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
    function getCapableParticipants(callback) {
        if (!callback) {
            throw new Error('[remoteCamera.getCapableParticipants] Callback cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, communication_1.sendMessageToParent)('remoteCamera.getCapableParticipants', callback);
    }
    remoteCamera.getCapableParticipants = getCapableParticipants;
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
    function requestControl(participant, callback) {
        if (!participant) {
            throw new Error('[remoteCamera.requestControl] Participant cannot be null');
        }
        if (!callback) {
            throw new Error('[remoteCamera.requestControl] Callback cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, communication_1.sendMessageToParent)('remoteCamera.requestControl', [participant], callback);
    }
    remoteCamera.requestControl = requestControl;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Send control command to the participant's camera.
     *
     * @param ControlCommand - ControlCommand specifies the command for controling the camera.
     * @param callback - Callback to invoke when the command response returns.
     */
    function sendControlCommand(ControlCommand, callback) {
        if (!ControlCommand) {
            throw new Error('[remoteCamera.sendControlCommand] ControlCommand cannot be null');
        }
        if (!callback) {
            throw new Error('[remoteCamera.sendControlCommand] Callback cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, communication_1.sendMessageToParent)('remoteCamera.sendControlCommand', [ControlCommand], callback);
    }
    remoteCamera.sendControlCommand = sendControlCommand;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Terminate the remote  session
     *
     * @param callback - Callback to invoke when the command response returns.
     */
    function terminateSession(callback) {
        if (!callback) {
            throw new Error('[remoteCamera.terminateSession] Callback cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, communication_1.sendMessageToParent)('remoteCamera.terminateSession', callback);
    }
    remoteCamera.terminateSession = terminateSession;
    /**
     * @hidden
     * Registers a handler for change in participants with controllable-cameras.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the list of participants with controllable-cameras changes.
     */
    function registerOnCapableParticipantsChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnCapableParticipantsChangeHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('remoteCamera.capableParticipantsChange', handler);
    }
    remoteCamera.registerOnCapableParticipantsChangeHandler = registerOnCapableParticipantsChangeHandler;
    /**
     * @hidden
     * Registers a handler for error.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when there is an error from the camera handler.
     */
    function registerOnErrorHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnErrorHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('remoteCamera.handlerError', handler);
    }
    remoteCamera.registerOnErrorHandler = registerOnErrorHandler;
    /**
     * @hidden
     * Registers a handler for device state change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the controlled device changes state.
     */
    function registerOnDeviceStateChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnDeviceStateChangeHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('remoteCamera.deviceStateChange', handler);
    }
    remoteCamera.registerOnDeviceStateChangeHandler = registerOnDeviceStateChangeHandler;
    /**
     * @hidden
     * Registers a handler for session status change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the current session status changes.
     */
    function registerOnSessionStatusChangeHandler(handler) {
        if (!handler) {
            throw new Error('[remoteCamera.registerOnSessionStatusChangeHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('remoteCamera.sessionStatusChange', handler);
    }
    remoteCamera.registerOnSessionStatusChangeHandler = registerOnSessionStatusChangeHandler;
    function isSupported() {
        return runtime_1.runtime.supports.remoteCamera ? true : false;
    }
    remoteCamera.isSupported = isSupported;
})(remoteCamera = exports.remoteCamera || (exports.remoteCamera = {}));
//# sourceMappingURL=remoteCamera.js.map