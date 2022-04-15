"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sharing = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var interfaces_1 = require("./interfaces");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var sharing;
(function (sharing) {
    sharing.SharingAPIMessages = {
        shareWebContent: 'sharing.shareWebContent',
    };
    function shareWebContent(shareWebContentRequest, callback) {
        // validate the given input (synchronous check)
        try {
            validateNonEmptyContent(shareWebContentRequest);
            validateTypeConsistency(shareWebContentRequest);
            validateContentForSupportedTypes(shareWebContentRequest);
        }
        catch (err) {
            //return the error via callback(v1) or rejected promise(v2)
            var wrappedFunction = function () { return Promise.reject(err); };
            return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(wrappedFunction, callback);
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
        return (0, utils_1.callCallbackWithSdkErrorFromPromiseAndReturnPromise)(shareWebContentHelper, callback, shareWebContentRequest);
    }
    sharing.shareWebContent = shareWebContent;
    function shareWebContentHelper(shareWebContentRequest) {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendAndHandleSdkError)(sharing.SharingAPIMessages.shareWebContent, shareWebContentRequest));
        });
    }
    /**
     * Functions for validating the shareRequest input parameter
     */
    function validateNonEmptyContent(shareRequest) {
        if (!(shareRequest && shareRequest.content && shareRequest.content.length)) {
            var err = {
                errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content is missing',
            };
            throw err;
        }
    }
    function validateTypeConsistency(shareRequest) {
        var err;
        if (shareRequest.content.some(function (item) { return !item.type; })) {
            err = {
                errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content type cannot be undefined',
            };
            throw err;
        }
        if (shareRequest.content.some(function (item) { return item.type !== shareRequest.content[0].type; })) {
            err = {
                errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS,
                message: 'Shared content must be of the same type',
            };
            throw err;
        }
    }
    function validateContentForSupportedTypes(shareRequest) {
        var err;
        if (shareRequest.content[0].type === 'URL') {
            if (shareRequest.content.some(function (item) { return !item.url; })) {
                err = {
                    errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS,
                    message: 'URLs are required for URL content types',
                };
                throw err;
            }
        }
        else {
            err = {
                errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS,
                message: 'Content type is unsupported',
            };
            throw err;
        }
    }
    function isSupported() {
        return runtime_1.runtime.supports.sharing ? true : false;
    }
    sharing.isSupported = isSupported;
})(sharing = exports.sharing || (exports.sharing = {}));
//# sourceMappingURL=sharing.js.map