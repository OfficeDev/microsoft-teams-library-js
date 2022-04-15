"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
var communication_1 = require("../internal/communication");
var globalVars_1 = require("../internal/globalVars");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var constants_1 = require("./constants");
/**
 * Namespace to interact with the authentication-specific part of the SDK.
 *
 * This object is used for starting or completing authentication flows.
 *
 * @beta
 */
var authentication;
(function (authentication) {
    var authHandlers;
    var authWindowMonitor;
    function initialize() {
        (0, handlers_1.registerHandler)('authentication.authenticate.success', handleSuccess, false);
        (0, handlers_1.registerHandler)('authentication.authenticate.failure', handleFailure, false);
    }
    authentication.initialize = initialize;
    var authParams;
    /**
     * @deprecated
     * As of 2.0.0-beta.1.
     *
     * Registers the authentication Communication.handlers
     *
     * @param authenticateParameters - A set of values that configure the authentication pop-up.
     */
    function registerAuthenticationHandlers(authenticateParameters) {
        authParams = authenticateParameters;
    }
    authentication.registerAuthenticationHandlers = registerAuthenticationHandlers;
    function authenticate(authenticateParameters) {
        var isDifferentParamsInCall = authenticateParameters !== undefined;
        var authenticateParams = isDifferentParamsInCall ? authenticateParameters : authParams;
        if (!authenticateParams) {
            throw new Error('No parameters are provided for authentication');
        }
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.remove, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
        return authenticateHelper(authenticateParams)
            .then(function (value) {
            try {
                if (authenticateParams && authenticateParams.successCallback) {
                    authenticateParams.successCallback(value);
                    return '';
                }
                return value;
            }
            finally {
                if (!isDifferentParamsInCall) {
                    authParams = null;
                }
            }
        })
            .catch(function (err) {
            try {
                if (authenticateParams && authenticateParams.failureCallback) {
                    authenticateParams.failureCallback(err.message);
                    return '';
                }
                throw err;
            }
            finally {
                if (!isDifferentParamsInCall) {
                    authParams = null;
                }
            }
        });
    }
    authentication.authenticate = authenticate;
    function authenticateHelper(authenticateParameters) {
        return new Promise(function (resolve, reject) {
            if (globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.desktop ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.android ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.ios ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.rigel ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.teamsRoomsWindows ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.teamsRoomsAndroid ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.teamsPhones ||
                globalVars_1.GlobalVars.hostClientType === constants_1.HostClientType.teamsDisplays) {
                // Convert any relative URLs into absolute URLs before sending them over to the parent window.
                var link = document.createElement('a');
                link.href = authenticateParameters.url;
                // Ask the parent window to open an authentication window with the parameters provided by the caller.
                resolve((0, communication_1.sendMessageToParentAsync)('authentication.authenticate', [
                    link.href,
                    authenticateParameters.width,
                    authenticateParameters.height,
                    authenticateParameters.isExternal,
                ]).then(function (_a) {
                    var success = _a[0], response = _a[1];
                    if (success) {
                        return response;
                    }
                    else {
                        throw new Error(response);
                    }
                }));
            }
            else {
                // Open an authentication window with the parameters provided by the caller.
                authHandlers = {
                    success: resolve,
                    fail: reject,
                };
                openAuthenticationWindow(authenticateParameters);
            }
        });
    }
    function getAuthToken(authTokenRequest) {
        (0, internalAPIs_1.ensureInitialized)();
        return getAuthTokenHelper(authTokenRequest)
            .then(function (value) {
            if (authTokenRequest && authTokenRequest.successCallback) {
                authTokenRequest.successCallback(value);
                return '';
            }
            return value;
        })
            .catch(function (err) {
            if (authTokenRequest && authTokenRequest.failureCallback) {
                authTokenRequest.failureCallback(err.message);
                return '';
            }
            throw err;
        });
    }
    authentication.getAuthToken = getAuthToken;
    function getAuthTokenHelper(authTokenRequest) {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendMessageToParentAsync)('authentication.getAuthToken', [
                authTokenRequest === null || authTokenRequest === void 0 ? void 0 : authTokenRequest.resources,
                authTokenRequest === null || authTokenRequest === void 0 ? void 0 : authTokenRequest.claims,
                authTokenRequest === null || authTokenRequest === void 0 ? void 0 : authTokenRequest.silent,
            ]));
        }).then(function (_a) {
            var success = _a[0], result = _a[1];
            if (success) {
                return result;
            }
            else {
                throw new Error(result);
            }
        });
    }
    function getUser(userRequest) {
        (0, internalAPIs_1.ensureInitialized)();
        return getUserHelper()
            .then(function (value) {
            if (userRequest && userRequest.successCallback) {
                userRequest.successCallback(value);
                return null;
            }
            return value;
        })
            .catch(function (err) {
            if (userRequest && userRequest.failureCallback) {
                userRequest.failureCallback(err.message);
                return null;
            }
            throw err;
        });
    }
    authentication.getUser = getUser;
    function getUserHelper() {
        return new Promise(function (resolve) {
            resolve((0, communication_1.sendMessageToParentAsync)('authentication.getUser'));
        }).then(function (_a) {
            var success = _a[0], result = _a[1];
            if (success) {
                return result;
            }
            else {
                throw new Error(result);
            }
        });
    }
    function closeAuthenticationWindow() {
        // Stop monitoring the authentication window
        stopAuthenticationWindowMonitor();
        // Try to close the authentication window and clear all properties associated with it
        try {
            if (communication_1.Communication.childWindow) {
                communication_1.Communication.childWindow.close();
            }
        }
        finally {
            communication_1.Communication.childWindow = null;
            communication_1.Communication.childOrigin = null;
        }
    }
    function openAuthenticationWindow(authenticateParameters) {
        // Close the previously opened window if we have one
        closeAuthenticationWindow();
        // Start with a sensible default size
        var width = authenticateParameters.width || 600;
        var height = authenticateParameters.height || 400;
        // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
        width = Math.min(width, communication_1.Communication.currentWindow.outerWidth - 400);
        height = Math.min(height, communication_1.Communication.currentWindow.outerHeight - 200);
        // Convert any relative URLs into absolute URLs before sending them over to the parent window
        var link = document.createElement('a');
        link.href = authenticateParameters.url.replace('{oauthRedirectMethod}', 'web');
        // We are running in the browser, so we need to center the new window ourselves
        var left = typeof communication_1.Communication.currentWindow.screenLeft !== 'undefined'
            ? communication_1.Communication.currentWindow.screenLeft
            : communication_1.Communication.currentWindow.screenX;
        var top = typeof communication_1.Communication.currentWindow.screenTop !== 'undefined'
            ? communication_1.Communication.currentWindow.screenTop
            : communication_1.Communication.currentWindow.screenY;
        left += communication_1.Communication.currentWindow.outerWidth / 2 - width / 2;
        top += communication_1.Communication.currentWindow.outerHeight / 2 - height / 2;
        // Open a child window with a desired set of standard browser features
        communication_1.Communication.childWindow = communication_1.Communication.currentWindow.open(link.href, '_blank', 'toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=' +
            top +
            ', left=' +
            left +
            ', width=' +
            width +
            ', height=' +
            height);
        if (communication_1.Communication.childWindow) {
            // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
            startAuthenticationWindowMonitor();
        }
        else {
            // If we failed to open the window, fail the authentication flow
            handleFailure('FailedToOpenWindow');
        }
    }
    function stopAuthenticationWindowMonitor() {
        if (authWindowMonitor) {
            clearInterval(authWindowMonitor);
            authWindowMonitor = 0;
        }
        (0, handlers_1.removeHandler)('initialize');
        (0, handlers_1.removeHandler)('navigateCrossDomain');
    }
    function startAuthenticationWindowMonitor() {
        // Stop the previous window monitor if one is running
        stopAuthenticationWindowMonitor();
        // Create an interval loop that
        // - Notifies the caller of failure if it detects that the authentication window is closed
        // - Keeps pinging the authentication window while it is open to re-establish
        //   contact with any pages along the authentication flow that need to communicate
        //   with us
        authWindowMonitor = communication_1.Communication.currentWindow.setInterval(function () {
            if (!communication_1.Communication.childWindow || communication_1.Communication.childWindow.closed) {
                handleFailure('CancelledByUser');
            }
            else {
                var savedChildOrigin = communication_1.Communication.childOrigin;
                try {
                    communication_1.Communication.childOrigin = '*';
                    (0, communication_1.sendMessageEventToChild)('ping');
                }
                finally {
                    communication_1.Communication.childOrigin = savedChildOrigin;
                }
            }
        }, 100);
        // Set up an initialize-message handler that gives the authentication window its frame context
        (0, handlers_1.registerHandler)('initialize', function () {
            return [constants_1.FrameContexts.authentication, globalVars_1.GlobalVars.hostClientType];
        });
        // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
        // in the authentication window. We could at some point choose to implement this method via a call to
        // authenticationWindow.location.href = url; however, we would first need to figure out how to
        // validate the URL against the tab's list of valid domains.
        (0, handlers_1.registerHandler)('navigateCrossDomain', function () {
            return false;
        });
    }
    /**
     * Notifies the frame that initiated this authentication request that the request was successful.
     *
     * @remarks
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     *
     * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifySuccess(result, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'result', result);
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.authentication);
        (0, communication_1.sendMessageToParent)('authentication.authenticate.success', [result]);
        // Wait for the message to be sent before closing the window
        (0, communication_1.waitForMessageQueue)(communication_1.Communication.parentWindow, function () { return setTimeout(function () { return communication_1.Communication.currentWindow.close(); }, 200); });
    }
    authentication.notifySuccess = notifySuccess;
    /**
     * Notifies the frame that initiated this authentication request that the request failed.
     *
     * @remarks
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     *
     * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifyFailure(reason, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'reason', reason);
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.authentication);
        (0, communication_1.sendMessageToParent)('authentication.authenticate.failure', [reason]);
        // Wait for the message to be sent before closing the window
        (0, communication_1.waitForMessageQueue)(communication_1.Communication.parentWindow, function () { return setTimeout(function () { return communication_1.Communication.currentWindow.close(); }, 200); });
    }
    authentication.notifyFailure = notifyFailure;
    function handleSuccess(result) {
        try {
            if (authHandlers) {
                authHandlers.success(result);
            }
        }
        finally {
            authHandlers = null;
            closeAuthenticationWindow();
        }
    }
    function handleFailure(reason) {
        try {
            if (authHandlers) {
                authHandlers.fail(new Error(reason));
            }
        }
        finally {
            authHandlers = null;
            closeAuthenticationWindow();
        }
    }
    /**
     * Validates that the callbackUrl param is a valid connector url, appends the result/reason and authSuccess/authFailure as URL fragments and redirects the window
     * @param callbackUrl - the connectors url to redirect to
     * @param key - "result" in case of success and "reason" in case of failure
     * @param value - the value of the passed result/reason parameter
     */
    function redirectIfWin32Outlook(callbackUrl, key, value) {
        if (callbackUrl) {
            var link = document.createElement('a');
            link.href = decodeURIComponent(callbackUrl);
            if (link.host &&
                link.host !== window.location.host &&
                link.host === 'outlook.office.com' &&
                link.search.indexOf('client_type=Win32_Outlook') > -1) {
                if (key && key === 'result') {
                    if (value) {
                        link.href = updateUrlParameter(link.href, 'result', value);
                    }
                    communication_1.Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authSuccess', ''));
                }
                if (key && key === 'reason') {
                    if (value) {
                        link.href = updateUrlParameter(link.href, 'reason', value);
                    }
                    communication_1.Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authFailure', ''));
                }
            }
        }
    }
    /**
     * Appends either result or reason as a fragment to the 'callbackUrl'
     * @param uri - the url to modify
     * @param key - the fragment key
     * @param value - the fragment value
     */
    function updateUrlParameter(uri, key, value) {
        var i = uri.indexOf('#');
        var hash = i === -1 ? '#' : uri.substr(i);
        hash = hash + '&' + key + (value !== '' ? '=' + value : '');
        uri = i === -1 ? uri : uri.substr(0, i);
        return uri + hash;
    }
})(authentication = exports.authentication || (exports.authentication = {}));
//# sourceMappingURL=authentication.js.map