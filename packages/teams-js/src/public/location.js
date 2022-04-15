"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.location = void 0;
var communication_1 = require("../internal/communication");
var constants_1 = require("../internal/constants");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_2 = require("./constants");
var interfaces_1 = require("./interfaces");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var location;
(function (location_1) {
    function getLocation(props, callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(getLocationHelper, callback, props);
    }
    location_1.getLocation = getLocation;
    function getLocationHelper(props) {
        return new Promise(function (resolve) {
            if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.locationAPIsRequiredVersion)) {
                throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
            }
            if (!props) {
                throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
            }
            resolve((0, communication_1.sendAndHandleSdkError)('location.getLocation', props));
        });
    }
    function showLocation(location, callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.task);
        return (0, utils_1.callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise)(showLocationHelper, callback, location);
    }
    location_1.showLocation = showLocation;
    function showLocationHelper(location) {
        return new Promise(function (resolve) {
            if (!(0, internalAPIs_1.isCurrentSDKVersionAtLeast)(constants_1.locationAPIsRequiredVersion)) {
                throw { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
            }
            if (!location) {
                throw { errorCode: interfaces_1.ErrorCode.INVALID_ARGUMENTS };
            }
            resolve((0, communication_1.sendAndHandleSdkError)('location.showLocation', location));
        });
    }
    location_1.showLocationHelper = showLocationHelper;
    function isSupported() {
        return runtime_1.runtime.supports.location ? true : false;
    }
    location_1.isSupported = isSupported;
})(location = exports.location || (exports.location = {}));
//# sourceMappingURL=location.js.map