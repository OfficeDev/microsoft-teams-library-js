"use strict";
/* eslint-disable @typescript-eslint/ban-types */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerBeforeUnloadHandler = exports.registerOnLoadHandler = exports.handleThemeChange = exports.registerOnThemeChangeHandler = exports.removeHandler = exports.registerHandler = exports.callHandler = exports.initializeHandlers = void 0;
var pages_1 = require("../public/pages");
var communication_1 = require("./communication");
var telemetry_1 = require("./telemetry");
var handlersLogger = (0, telemetry_1.getLogger)('handlers');
/** @internal */
var HandlersPrivate = /** @class */ (function () {
    function HandlersPrivate() {
    }
    HandlersPrivate.handlers = {};
    return HandlersPrivate;
}());
/** @internal */
function initializeHandlers() {
    // ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
    HandlersPrivate.handlers['themeChange'] = handleThemeChange;
    HandlersPrivate.handlers['load'] = handleLoad;
    HandlersPrivate.handlers['beforeUnload'] = handleBeforeUnload;
    pages_1.pages.backStack._initialize();
}
exports.initializeHandlers = initializeHandlers;
var callHandlerLogger = handlersLogger.extend('callHandler');
/** @internal */
function callHandler(name, args) {
    var handler = HandlersPrivate.handlers[name];
    if (handler) {
        callHandlerLogger('Invoking the registered handler for message %s with arguments %o', name, args);
        var result = handler.apply(this, args);
        return [true, result];
    }
    else {
        callHandlerLogger('Handler for action message %s not found.', name);
        return [false, undefined];
    }
}
exports.callHandler = callHandler;
/** @internal */
function registerHandler(name, handler, sendMessage, args) {
    if (sendMessage === void 0) { sendMessage = true; }
    if (args === void 0) { args = []; }
    if (handler) {
        HandlersPrivate.handlers[name] = handler;
        sendMessage && (0, communication_1.sendMessageToParent)('registerHandler', __spreadArray([name], args, true));
    }
    else {
        delete HandlersPrivate.handlers[name];
    }
}
exports.registerHandler = registerHandler;
/** @internal */
function removeHandler(name) {
    delete HandlersPrivate.handlers[name];
}
exports.removeHandler = removeHandler;
/** @internal */
function registerOnThemeChangeHandler(handler) {
    HandlersPrivate.themeChangeHandler = handler;
    handler && (0, communication_1.sendMessageToParent)('registerHandler', ['themeChange']);
}
exports.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
/** @internal */
function handleThemeChange(theme) {
    if (HandlersPrivate.themeChangeHandler) {
        HandlersPrivate.themeChangeHandler(theme);
    }
    if (communication_1.Communication.childWindow) {
        (0, communication_1.sendMessageEventToChild)('themeChange', [theme]);
    }
}
exports.handleThemeChange = handleThemeChange;
/** @internal */
function registerOnLoadHandler(handler) {
    HandlersPrivate.loadHandler = handler;
    handler && (0, communication_1.sendMessageToParent)('registerHandler', ['load']);
}
exports.registerOnLoadHandler = registerOnLoadHandler;
/** @internal */
function handleLoad(context) {
    if (HandlersPrivate.loadHandler) {
        HandlersPrivate.loadHandler(context);
    }
    if (communication_1.Communication.childWindow) {
        (0, communication_1.sendMessageEventToChild)('load', [context]);
    }
}
/** @internal */
function registerBeforeUnloadHandler(handler) {
    HandlersPrivate.beforeUnloadHandler = handler;
    handler && (0, communication_1.sendMessageToParent)('registerHandler', ['beforeUnload']);
}
exports.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
/** @internal */
function handleBeforeUnload() {
    var readyToUnload = function () {
        (0, communication_1.sendMessageToParent)('readyToUnload', []);
    };
    if (!HandlersPrivate.beforeUnloadHandler || !HandlersPrivate.beforeUnloadHandler(readyToUnload)) {
        readyToUnload();
    }
}
//# sourceMappingURL=handlers.js.map