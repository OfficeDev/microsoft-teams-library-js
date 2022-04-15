"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeamsAppLink = exports.runWithTimeout = exports.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise = exports.callCallbackWithSdkErrorFromPromiseAndReturnPromise = exports.callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise = exports.callCallbackWithErrorOrResultFromPromiseAndReturnPromise = exports.deepFreeze = exports.generateGUID = exports.compareSDKVersions = exports.getGenericOnCompleteHandler = exports.validateOrigin = void 0;
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
var uuid = require("uuid");
var globalVars_1 = require("../internal/globalVars");
var constants_1 = require("./constants");
/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 */
function validateHostAgainstPattern(pattern, host) {
    if (pattern.substring(0, 2) === '*.') {
        var suffix = pattern.substring(1);
        if (host.length > suffix.length &&
            host.split('.').length === suffix.split('.').length &&
            host.substring(host.length - suffix.length) === suffix) {
            return true;
        }
    }
    else if (pattern === host) {
        return true;
    }
    return false;
}
/**@internal */
function validateOrigin(messageOrigin) {
    // Check whether the url is in the pre-known allowlist or supplied by user
    if (messageOrigin.protocol !== 'https:') {
        return false;
    }
    var messageOriginHost = messageOrigin.host;
    if (constants_1.validOrigins.some(function (pattern) { return validateHostAgainstPattern(pattern, messageOriginHost); })) {
        return true;
    }
    for (var _i = 0, _a = globalVars_1.GlobalVars.additionalValidOrigins; _i < _a.length; _i++) {
        var domainOrPattern = _a[_i];
        var pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
        if (validateHostAgainstPattern(pattern, messageOriginHost)) {
            return true;
        }
    }
    return false;
}
exports.validateOrigin = validateOrigin;
/**@internal */
function getGenericOnCompleteHandler(errorMessage) {
    return function (success, reason) {
        if (!success) {
            throw new Error(errorMessage ? errorMessage : reason);
        }
    };
}
exports.getGenericOnCompleteHandler = getGenericOnCompleteHandler;
/**
 * @hidden
 * Compares SDK versions.
 *
 * @param v1 - first version
 * @param v2 - second version
 * @returns NaN in case inputs are not in right format
 *         -1 if v1 < v2
 *          1 if v1 > v2
 *          0 otherwise
 * @example
 *    compareSDKVersions('1.2', '1.2.0') returns 0
 *    compareSDKVersions('1.2a', '1.2b') returns NaN
 *    compareSDKVersions('1.2', '1.3') returns -1
 *    compareSDKVersions('2.0', '1.3.2') returns 1
 *    compareSDKVersions('2.0', 2.0) returns NaN
 *
 * @internal
 */
function compareSDKVersions(v1, v2) {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') {
        return NaN;
    }
    var v1parts = v1.split('.');
    var v2parts = v2.split('.');
    function isValidPart(x) {
        // input has to have one or more digits
        // For ex - returns true for '11', false for '1a1', false for 'a', false for '2b'
        return /^\d+$/.test(x);
    }
    if (!v1parts.every(isValidPart) || !v2parts.every(isValidPart)) {
        return NaN;
    }
    // Make length of both parts equal
    while (v1parts.length < v2parts.length) {
        v1parts.push('0');
    }
    while (v2parts.length < v1parts.length) {
        v2parts.push('0');
    }
    for (var i = 0; i < v1parts.length; ++i) {
        if (Number(v1parts[i]) == Number(v2parts[i])) {
            continue;
        }
        else if (Number(v1parts[i]) > Number(v2parts[i])) {
            return 1;
        }
        else {
            return -1;
        }
    }
    return 0;
}
exports.compareSDKVersions = compareSDKVersions;
/**
 * @hidden
 * Generates a GUID
 *
 * @internal
 */
function generateGUID() {
    return uuid.v4();
}
exports.generateGUID = generateGUID;
function deepFreeze(obj) {
    Object.keys(obj).forEach(function (prop) {
        if (typeof obj[prop] === 'object') {
            deepFreeze(obj[prop]);
        }
    });
    return Object.freeze(obj);
}
exports.deepFreeze = deepFreeze;
/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 */
function callCallbackWithErrorOrResultFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function (result) {
        if (callback) {
            callback(undefined, result);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e);
        }
    });
    return p;
}
exports.callCallbackWithErrorOrResultFromPromiseAndReturnPromise = callCallbackWithErrorOrResultFromPromiseAndReturnPromise;
/**
 * This utility function is used when the return type of the promise is usually void and
 * the result in the callback is a boolean type (true for success and false for error)
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 * @internal
 */
function callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function () {
        if (callback) {
            callback(undefined, true);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e, false);
        }
    });
    return p;
}
exports.callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise = callCallbackWithErrorOrBooleanFromPromiseAndReturnPromise;
/**
 * This utility function is called when the callback has only Error/SdkError as the primary argument.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 * @internal
 */
function callCallbackWithSdkErrorFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function () {
        if (callback) {
            callback(null);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e);
        }
    });
    return p;
}
exports.callCallbackWithSdkErrorFromPromiseAndReturnPromise = callCallbackWithSdkErrorFromPromiseAndReturnPromise;
/**
 * This utility function is used when the result of the promise is same as the result in the callback.
 * @param funcHelper
 * @param callback
 * @param args
 * @returns
 *
 * @internal
 */
function callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise(funcHelper, callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var args = [];
    for (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var _i = 2; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i < arguments.length; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _i++) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args[_i - 2] = arguments[_i];
    }
    var p = funcHelper.apply(void 0, args);
    p.then(function (result) {
        if (callback) {
            callback(null, result);
        }
    }).catch(function (e) {
        if (callback) {
            callback(e, null);
        }
    });
    return p;
}
exports.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise = callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise;
/**
 * A helper function to add a timeout to an asynchronous operation.
 *
 * @param action Action to wrap the timeout around
 * @param timeoutInMs Timeout period in milliseconds
 * @param timeoutError Error to reject the promise with if timeout elapses before the action completed
 * @returns A promise which resolves to the result of provided action or rejects with a provided timeout error
 * if the initial action didn't complete within provided timeout.
 *
 * @internal
 */
function runWithTimeout(action, timeoutInMs, timeoutError) {
    return new Promise(function (resolve, reject) {
        var timeoutHandle = setTimeout(reject, timeoutInMs, timeoutError);
        action()
            .then(function (result) {
            clearTimeout(timeoutHandle);
            resolve(result);
        })
            .catch(function (error) {
            clearTimeout(timeoutHandle);
            reject(error);
        });
    });
}
exports.runWithTimeout = runWithTimeout;
function createTeamsAppLink(params) {
    var url = new URL('https://teams.microsoft.com/l/entity/' +
        encodeURIComponent(params.appId) +
        '/' +
        encodeURIComponent(params.pageId));
    if (params.webUrl) {
        url.searchParams.append('webUrl', params.webUrl);
    }
    if (params.channelId || params.subPageId) {
        url.searchParams.append('context', JSON.stringify({ channelId: params.channelId, subEntityId: params.subPageId }));
    }
    return url.toString();
}
exports.createTeamsAppLink = createTeamsAppLink;
//# sourceMappingURL=utils.js.map