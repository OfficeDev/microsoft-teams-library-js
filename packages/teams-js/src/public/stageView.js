"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stageView = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
/**
 * Namespace to interact with the stage view specific part of the SDK.
 */
var stageView;
(function (stageView) {
    function open(stageViewParams, callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        if (!stageViewParams) {
            throw new Error('[stageView.open] Stage view params cannot be null');
        }
        var wrappedFunction = function () {
            return new Promise(function (resolve) { return resolve((0, communication_1.sendAndHandleSdkError)('stageView.open', stageViewParams)); });
        };
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    stageView.open = open;
})(stageView = exports.stageView || (exports.stageView = {}));
//# sourceMappingURL=stageView.js.map