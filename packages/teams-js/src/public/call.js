"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.call = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var call;
(function (call) {
    var CallModalities;
    (function (CallModalities) {
        CallModalities["Unknown"] = "unknown";
        CallModalities["Audio"] = "audio";
        CallModalities["Video"] = "video";
        CallModalities["VideoBasedScreenSharing"] = "videoBasedScreenSharing";
        CallModalities["Data"] = "data";
    })(CallModalities = call.CallModalities || (call.CallModalities = {}));
    /**
     * Starts a call with other users
     *
     * @param startCallParams - Parameters for the call
     * @returns If the call is accepted
     */
    function startCall(startCallParams) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            if (!isSupported()) {
                throw new Error('Not supported');
            }
            return (0, communication_1.sendMessageToParent)('call.startCall', [startCallParams], resolve);
        });
    }
    call.startCall = startCall;
    function isSupported() {
        return runtime_1.runtime.supports.call ? true : false;
    }
    call.isSupported = isSupported;
})(call = exports.call || (exports.call = {}));
//# sourceMappingURL=call.js.map