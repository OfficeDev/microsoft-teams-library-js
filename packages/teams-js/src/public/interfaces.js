"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = exports.FileOpenPreference = void 0;
/**
 * Allowed user file open preferences
 */
var FileOpenPreference;
(function (FileOpenPreference) {
    FileOpenPreference["Inline"] = "inline";
    FileOpenPreference["Desktop"] = "desktop";
    FileOpenPreference["Web"] = "web";
})(FileOpenPreference = exports.FileOpenPreference || (exports.FileOpenPreference = {}));
var ErrorCode;
(function (ErrorCode) {
    /**
     * API not supported in the current platform.
     */
    ErrorCode[ErrorCode["NOT_SUPPORTED_ON_PLATFORM"] = 100] = "NOT_SUPPORTED_ON_PLATFORM";
    /**
     * Internal error encountered while performing the required operation.
     */
    ErrorCode[ErrorCode["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
    /**
     * API is not supported in the current context
     */
    ErrorCode[ErrorCode["NOT_SUPPORTED_IN_CURRENT_CONTEXT"] = 501] = "NOT_SUPPORTED_IN_CURRENT_CONTEXT";
    /**
    Permissions denied by user
    */
    ErrorCode[ErrorCode["PERMISSION_DENIED"] = 1000] = "PERMISSION_DENIED";
    /**
     * Network issue
     */
    ErrorCode[ErrorCode["NETWORK_ERROR"] = 2000] = "NETWORK_ERROR";
    /**
     * Underlying hardware doesn't support the capability
     */
    ErrorCode[ErrorCode["NO_HW_SUPPORT"] = 3000] = "NO_HW_SUPPORT";
    /**
     * One or more arguments are invalid
     */
    ErrorCode[ErrorCode["INVALID_ARGUMENTS"] = 4000] = "INVALID_ARGUMENTS";
    /**
     * User is not authorized for this operation
     */
    ErrorCode[ErrorCode["UNAUTHORIZED_USER_OPERATION"] = 5000] = "UNAUTHORIZED_USER_OPERATION";
    /**
     * Could not complete the operation due to insufficient resources
     */
    ErrorCode[ErrorCode["INSUFFICIENT_RESOURCES"] = 6000] = "INSUFFICIENT_RESOURCES";
    /**
     * Platform throttled the request because of API was invoked too frequently
     */
    ErrorCode[ErrorCode["THROTTLE"] = 7000] = "THROTTLE";
    /**
     * User aborted the operation
     */
    ErrorCode[ErrorCode["USER_ABORT"] = 8000] = "USER_ABORT";
    /**
     * Could not complete the operation in the given time interval
     */
    ErrorCode[ErrorCode["OPERATION_TIMED_OUT"] = 8001] = "OPERATION_TIMED_OUT";
    /**
     * Platform code is old and doesn't implement this API
     */
    ErrorCode[ErrorCode["OLD_PLATFORM"] = 9000] = "OLD_PLATFORM";
    /**
     * The file specified was not found on the given location
     */
    ErrorCode[ErrorCode["FILE_NOT_FOUND"] = 404] = "FILE_NOT_FOUND";
    /**
     * The return value is too big and has exceeded our size boundries
     */
    ErrorCode[ErrorCode["SIZE_EXCEEDED"] = 10000] = "SIZE_EXCEEDED";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
//# sourceMappingURL=interfaces.js.map