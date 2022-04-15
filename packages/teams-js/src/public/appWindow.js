"use strict";
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParentAppWindow = exports.ChildAppWindow = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var ChildAppWindow = /** @class */ (function () {
    function ChildAppWindow() {
    }
    /**
     * Send a message to the ChildAppWindow.
     *
     * @param message - The message to send
     * @param onComplete - The callback to know if the postMessage has been success/failed.
     */
    ChildAppWindow.prototype.postMessage = function (message, onComplete) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, communication_1.sendMessageToParent)('messageForChild', [message], onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)());
    };
    /**
     * Add a listener that will be called when an event is received from the ChildAppWindow.
     *
     * @param type - The event to listen to. Currently the only supported type is 'message'.
     * @param listener - The listener that will be called
     */
    ChildAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            (0, handlers_1.registerHandler)('messageForParent', listener);
        }
    };
    return ChildAppWindow;
}());
exports.ChildAppWindow = ChildAppWindow;
var ParentAppWindow = /** @class */ (function () {
    function ParentAppWindow() {
    }
    Object.defineProperty(ParentAppWindow, "Instance", {
        get: function () {
            // Do you need arguments? Make it a regular method instead.
            return this._instance || (this._instance = new this());
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Send a message to the ParentAppWindow.
     *
     * @param message - The message to send
     * @param onComplete - The callback to know if the postMessage has been success/failed.
     */
    ParentAppWindow.prototype.postMessage = function (message, onComplete) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.task);
        (0, communication_1.sendMessageToParent)('messageForParent', [message], onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)());
    };
    /**
     * Add a listener that will be called when an event is received from the ParentAppWindow.
     *
     * @param type - The event to listen to. Currently the only supported type is 'message'.
     * @param listener - The listener that will be called
     */
    ParentAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            (0, handlers_1.registerHandler)('messageForChild', listener);
        }
    };
    return ParentAppWindow;
}());
exports.ParentAppWindow = ParentAppWindow;
//# sourceMappingURL=appWindow.js.map