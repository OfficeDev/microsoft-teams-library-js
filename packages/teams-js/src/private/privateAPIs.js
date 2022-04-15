"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserSettingsChangeHandler = exports.registerCustomHandler = exports.sendCustomEvent = exports.sendCustomMessage = exports.uploadCustomApp = exports.initializePrivateApis = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
/**
 * @internal
 */
function initializePrivateApis() {
    // To maintain backwards compatability, this function cannot be deleted as it is callable
}
exports.initializePrivateApis = initializePrivateApis;
/**
 * @hidden
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 *
 * @internal
 */
function uploadCustomApp(manifestBlob, onComplete) {
    (0, internalAPIs_1.ensureInitialized)();
    (0, communication_1.sendMessageToParent)('uploadCustomApp', [manifestBlob], onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)());
}
exports.uploadCustomApp = uploadCustomApp;
/**
 * @hidden
 * Internal use only
 * Sends a custom action MessageRequest to Teams or parent window
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @param callback - Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 *
 * @internal
 */
function sendCustomMessage(actionName, 
// tslint:disable-next-line:no-any
args, 
// tslint:disable-next-line:no-any
callback) {
    (0, internalAPIs_1.ensureInitialized)();
    (0, communication_1.sendMessageToParent)(actionName, args, callback);
}
exports.sendCustomMessage = sendCustomMessage;
/**
 * @hidden
 * Internal use only
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @returns id of sent message
 *
 * @internal
 */
function sendCustomEvent(actionName, 
// tslint:disable-next-line:no-any
args) {
    (0, internalAPIs_1.ensureInitialized)();
    //validate childWindow
    if (!communication_1.Communication.childWindow) {
        throw new Error('The child window has not yet been initialized or is not present');
    }
    (0, communication_1.sendMessageEventToChild)(actionName, args);
}
exports.sendCustomEvent = sendCustomEvent;
/**
 * @hidden
 * Internal use only
 * Adds a handler for an action sent by a child window or parent window
 *
 * @param actionName - Specifies name of the action message to handle
 * @param customHandler - The callback to invoke when the action message is received. The return value is sent to the child
 *
 * @internal
 */
function registerCustomHandler(actionName, customHandler) {
    var _this = this;
    (0, internalAPIs_1.ensureInitialized)();
    (0, handlers_1.registerHandler)(actionName, function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return customHandler.apply(_this, args);
    });
}
exports.registerCustomHandler = registerCustomHandler;
/**
 * @hidden
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 *
 * @param settingTypes - List of user setting changes to subscribe
 * @param handler - When a subscribed setting is updated this handler is called
 *
 * @internal
 */
function registerUserSettingsChangeHandler(settingTypes, handler) {
    (0, internalAPIs_1.ensureInitialized)();
    (0, handlers_1.registerHandler)('userSettingsChange', handler, true, [settingTypes]);
}
exports.registerUserSettingsChangeHandler = registerUserSettingsChangeHandler;
//# sourceMappingURL=privateAPIs.js.map