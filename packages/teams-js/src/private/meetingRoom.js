"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingRoom = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var runtime_1 = require("../public/runtime");
/**
 * @alpha
 */
var meetingRoom;
(function (meetingRoom) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Fetch the meeting room info that paired with current client.
     *
     * @returns Promise resolved with meeting room info or rejected with SdkError value
     */
    function getPairedMeetingRoomInfo() {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)();
            resolve((0, communication_1.sendAndHandleSdkError)('meetingRoom.getPairedMeetingRoomInfo'));
        });
    }
    meetingRoom.getPairedMeetingRoomInfo = getPairedMeetingRoomInfo;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Send a command to paired meeting room.
     *
     * @param commandName The command name.
     * @returns Promise resolved upon completion or rejected with SdkError value
     */
    function sendCommandToPairedMeetingRoom(commandName) {
        return new Promise(function (resolve) {
            if (!commandName || commandName.length == 0) {
                throw new Error('[meetingRoom.sendCommandToPairedMeetingRoom] Command name cannot be null or empty');
            }
            (0, internalAPIs_1.ensureInitialized)();
            resolve((0, communication_1.sendAndHandleSdkError)('meetingRoom.sendCommandToPairedMeetingRoom', commandName));
        });
    }
    meetingRoom.sendCommandToPairedMeetingRoom = sendCommandToPairedMeetingRoom;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Registers a handler for meeting room capabilities update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the capabilities of meeting room update.
     */
    function registerMeetingRoomCapabilitiesUpdateHandler(handler) {
        if (!handler) {
            throw new Error('[meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)();
        (0, handlers_1.registerHandler)('meetingRoom.meetingRoomCapabilitiesUpdate', function (capabilities) {
            (0, internalAPIs_1.ensureInitialized)();
            handler(capabilities);
        });
    }
    meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler = registerMeetingRoomCapabilitiesUpdateHandler;
    /**
     * @hidden
     * Hide from docs
     * Registers a handler for meeting room states update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the states of meeting room update.
     */
    function registerMeetingRoomStatesUpdateHandler(handler) {
        if (!handler) {
            throw new Error('[meetingRoom.registerMeetingRoomStatesUpdateHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)();
        (0, handlers_1.registerHandler)('meetingRoom.meetingRoomStatesUpdate', function (states) {
            (0, internalAPIs_1.ensureInitialized)();
            handler(states);
        });
    }
    meetingRoom.registerMeetingRoomStatesUpdateHandler = registerMeetingRoomStatesUpdateHandler;
    function isSupported() {
        return runtime_1.runtime.supports.meetingRoom ? true : false;
    }
    meetingRoom.isSupported = isSupported;
})(meetingRoom = exports.meetingRoom || (exports.meetingRoom = {}));
//# sourceMappingURL=meetingRoom.js.map