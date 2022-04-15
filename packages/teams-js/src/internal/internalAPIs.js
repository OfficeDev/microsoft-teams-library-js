"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAdditionalValidOrigins = exports.throwExceptionIfMobileApiIsNotSupported = exports.isHostClientMobile = exports.isCurrentSDKVersionAtLeast = exports.ensureInitialized = void 0;
var constants_1 = require("../public/constants");
var interfaces_1 = require("../public/interfaces");
var constants_2 = require("./constants");
var globalVars_1 = require("./globalVars");
var utils_1 = require("./utils");
/** @internal */
function ensureInitialized() {
    var expectedFrameContexts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expectedFrameContexts[_i] = arguments[_i];
    }
    if (!globalVars_1.GlobalVars.initializeCalled) {
        throw new Error('The library has not yet been initialized');
    }
    if (globalVars_1.GlobalVars.frameContext && expectedFrameContexts && expectedFrameContexts.length > 0) {
        var found = false;
        for (var i = 0; i < expectedFrameContexts.length; i++) {
            if (expectedFrameContexts[i] === globalVars_1.GlobalVars.frameContext) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error("This call is only allowed in following contexts: " + JSON.stringify(expectedFrameContexts) + ". " +
                ("Current context: \"" + globalVars_1.GlobalVars.frameContext + "\"."));
        }
    }
}
exports.ensureInitialized = ensureInitialized;
/**
 * @hidden
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 *
 * @param requiredVersion - SDK version required by the API
 *
 * @internal
 */
function isCurrentSDKVersionAtLeast(requiredVersion) {
    if (requiredVersion === void 0) { requiredVersion = constants_2.defaultSDKVersionForCompatCheck; }
    var value = (0, utils_1.compareSDKVersions)(globalVars_1.GlobalVars.clientSupportedSDKVersion, requiredVersion);
    if (isNaN(value)) {
        return false;
    }
    return value >= 0;
}
exports.isCurrentSDKVersionAtLeast = isCurrentSDKVersionAtLeast;
/**
 * @hidden
 * Helper function to identify if host client is either android or ios
 *
 * @internal
 */
function isHostClientMobile() {
    return globalVars_1.GlobalVars.hostClientType == constants_1.HostClientType.android || globalVars_1.GlobalVars.hostClientType == constants_1.HostClientType.ios;
}
exports.isHostClientMobile = isHostClientMobile;
/**
 * @hidden
 * Helper function which indicates if current API is supported on mobile or not.
 * @throws SdkError if host client is not android/ios or if the requiredVersion is not
 *          supported by platform or not. Null is returned in case of success.
 *
 * @internal
 */
function throwExceptionIfMobileApiIsNotSupported(requiredVersion) {
    if (requiredVersion === void 0) { requiredVersion = constants_2.defaultSDKVersionForCompatCheck; }
    if (!isHostClientMobile()) {
        var notSupportedError = { errorCode: interfaces_1.ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
        throw notSupportedError;
    }
    else if (!isCurrentSDKVersionAtLeast(requiredVersion)) {
        var oldPlatformError = { errorCode: interfaces_1.ErrorCode.OLD_PLATFORM };
        throw oldPlatformError;
    }
}
exports.throwExceptionIfMobileApiIsNotSupported = throwExceptionIfMobileApiIsNotSupported;
/**
 * @hidden
 * Processes the valid origins specifuied by the user, de-duplicates and converts them into a regexp
 * which is used later for message source/origin validation
 *
 * @internal
 */
function processAdditionalValidOrigins(validMessageOrigins) {
    var combinedOriginUrls = globalVars_1.GlobalVars.additionalValidOrigins.concat(validMessageOrigins.filter(function (_origin) {
        return typeof _origin === 'string' && constants_2.userOriginUrlValidationRegExp.test(_origin);
    }));
    var dedupUrls = {};
    combinedOriginUrls = combinedOriginUrls.filter(function (_originUrl) {
        if (dedupUrls[_originUrl]) {
            return false;
        }
        dedupUrls[_originUrl] = true;
        return true;
    });
    globalVars_1.GlobalVars.additionalValidOrigins = combinedOriginUrls;
}
exports.processAdditionalValidOrigins = processAdditionalValidOrigins;
//# sourceMappingURL=internalAPIs.js.map