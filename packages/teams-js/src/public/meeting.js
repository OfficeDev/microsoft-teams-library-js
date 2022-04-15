"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meeting = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var meeting;
(function (meeting) {
    var MeetingType;
    (function (MeetingType) {
        MeetingType["Unknown"] = "Unknown";
        MeetingType["Adhoc"] = "Adhoc";
        MeetingType["Scheduled"] = "Scheduled";
        MeetingType["Recurring"] = "Recurring";
        MeetingType["Broadcast"] = "Broadcast";
        MeetingType["MeetNow"] = "MeetNow";
    })(MeetingType = meeting.MeetingType || (meeting.MeetingType = {}));
    function getIncomingClientAudioState(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getIncomingClientAudioStateHelper, callback);
    }
    meeting.getIncomingClientAudioState = getIncomingClientAudioState;
    function getIncomingClientAudioStateHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('getIncomingClientAudioState'));
        });
    }
    function toggleIncomingClientAudio(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(toggleIncomingClientAudioHelper, callback);
    }
    meeting.toggleIncomingClientAudio = toggleIncomingClientAudio;
    function toggleIncomingClientAudioHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('toggleIncomingClientAudio'));
        });
    }
    function getMeetingDetails(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage, constants_1.FrameContexts.settings, constants_1.FrameContexts.content);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getMeetingDetailsHelper, callback);
    }
    meeting.getMeetingDetails = getMeetingDetails;
    function getMeetingDetailsHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.getMeetingDetails'));
        });
    }
    function getAuthenticationTokenForAnonymousUser(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getAuthenticationTokenForAnonymousUserHelper, callback);
    }
    meeting.getAuthenticationTokenForAnonymousUser = getAuthenticationTokenForAnonymousUser;
    function getAuthenticationTokenForAnonymousUserHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.getAuthenticationTokenForAnonymousUser'));
        });
    }
    function isSupported() {
        return runtime_1.runtime.supports.meeting ? true : false;
    }
    meeting.isSupported = isSupported;
    function getLiveStreamState(callback) {
        (0, internalAPIs_1.ensureInitialized)();
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getLiveStreamStateHelper, callback);
    }
    meeting.getLiveStreamState = getLiveStreamState;
    function getLiveStreamStateHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.getLiveStreamState'));
        });
    }
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
    function requestStartLiveStreaming(param1, param2, param3) {
        var _a, _b;
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        var streamUrl;
        var streamKey;
        var callback;
        if (typeof param1 === 'function') {
            // Legacy code, with callbacks.
            _a = [param1, param2, param3], callback = _a[0], streamUrl = _a[1], streamKey = _a[2];
        }
        else if (typeof param1 === 'string') {
            _b = [param1, param2], streamUrl = _b[0], streamKey = _b[1];
        }
        return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(requestStartLiveStreamingHelper, callback, streamUrl, streamKey);
    }
    meeting.requestStartLiveStreaming = requestStartLiveStreaming;
    function requestStartLiveStreamingHelper(streamUrl, streamKey) {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.requestStartLiveStreaming', streamUrl, streamKey));
        });
    }
    function requestStopLiveStreaming(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(requestStopLiveStreamingHelper, callback);
    }
    meeting.requestStopLiveStreaming = requestStopLiveStreaming;
    function requestStopLiveStreamingHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.requestStopLiveStreaming'));
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
    function registerLiveStreamChangedHandler(handler) {
        if (!handler) {
            throw new Error('[register live stream changed handler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel);
        (0, handlers_1.registerHandler)('meeting.liveStreamChanged', handler);
    }
    meeting.registerLiveStreamChangedHandler = registerLiveStreamChangedHandler;
    /**
     * This function is the overloaded implementation of shareAppContentToStage.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @returns Promise resolved indicating whether or not the share was successful or rejected with SdkError value
     */
    function shareAppContentToStage(param1, param2) {
        var _a;
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        var appContentUrl;
        var callback;
        if (typeof param1 === 'function') {
            // Legacy callback
            _a = [param1, param2], callback = _a[0], appContentUrl = _a[1];
        }
        else {
            appContentUrl = param1;
        }
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(shareAppContentToStageHelper, callback, appContentUrl);
    }
    meeting.shareAppContentToStage = shareAppContentToStage;
    /**
     * @hidden
     * Helper method to generate and return a promise for shareAppContentToStage
     * @param appContentUrl
     * @returns
     */
    function shareAppContentToStageHelper(appContentUrl) {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.shareAppContentToStage', appContentUrl));
        });
    }
    function getAppContentStageSharingCapabilities(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getAppContentStageSharingCapabilitiesHelper, callback);
    }
    meeting.getAppContentStageSharingCapabilities = getAppContentStageSharingCapabilities;
    /**
     * @hidden
     * @returns
     */
    function getAppContentStageSharingCapabilitiesHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.getAppContentStageSharingCapabilities'));
        });
    }
    function stopSharingAppContentToStage(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(stopSharingAppContentToStageHelper, callback);
    }
    meeting.stopSharingAppContentToStage = stopSharingAppContentToStage;
    /**
     * @hidden
     * @returns
     */
    function stopSharingAppContentToStageHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.stopSharingAppContentToStage'));
        });
    }
    function getAppContentStageSharingState(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(getAppContentStageSharingStateHelper, callback);
    }
    meeting.getAppContentStageSharingState = getAppContentStageSharingState;
    function getAppContentStageSharingStateHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)('meeting.getAppContentStageSharingState'));
        });
    }
    /**
     * Registers a handler for changes to paticipant speaking states. If any participant is speaking, isSpeakingDetected
     * will be true. If no participants are speaking, isSpeakingDetected will be false. Only one handler can be registered
     * at a time. A subsequent registration replaces an existing registration.
     * @param handler The handler to invoke when the speaking state of any participant changes (start/stop speaking).
     */
    function registerSpeakingStateChangeHandler(handler) {
        if (!handler) {
            throw new Error('[registerSpeakingStateChangeHandler] Handler cannot be null');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        (0, handlers_1.registerHandler)('meeting.speakingStateChanged', handler);
    }
    meeting.registerSpeakingStateChangeHandler = registerSpeakingStateChangeHandler;
})(meeting = exports.meeting || (exports.meeting = {}));
//# sourceMappingURL=meeting.js.map