"use strict";
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
exports.sendMessageEventToChild = exports.waitForMessageQueue = exports.shouldProcessMessage = exports.processMessage = exports.sendMessageToParent = exports.sendMessageToParentAsync = exports.sendAndHandleSdkError = exports.sendAndHandleStatusAndReasonWithDefaultError = exports.sendAndHandleStatusAndReason = exports.sendAndUnwrap = exports.uninitializeCommunication = exports.initializeCommunication = exports.Communication = void 0;
var constants_1 = require("./constants");
var globalVars_1 = require("./globalVars");
var handlers_1 = require("./handlers");
var telemetry_1 = require("./telemetry");
var utils_1 = require("./utils");
var communicationLogger = (0, telemetry_1.getLogger)('communication');
/**@internal */
var Communication = /** @class */ (function () {
    function Communication() {
    }
    return Communication;
}());
exports.Communication = Communication;
/**@internal */
var CommunicationPrivate = /** @class */ (function () {
    function CommunicationPrivate() {
    }
    CommunicationPrivate.parentMessageQueue = [];
    CommunicationPrivate.childMessageQueue = [];
    CommunicationPrivate.nextMessageId = 0;
    CommunicationPrivate.callbacks = {};
    CommunicationPrivate.promiseCallbacks = {};
    return CommunicationPrivate;
}());
/**@internal */
function initializeCommunication(validMessageOrigins) {
    // Listen for messages post to our window
    CommunicationPrivate.messageListener = function (evt) { return processMessage(evt); };
    // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
    // it's the window that opened us (i.e., window.opener)
    Communication.currentWindow = Communication.currentWindow || window;
    Communication.parentWindow =
        Communication.currentWindow.parent !== Communication.currentWindow.self
            ? Communication.currentWindow.parent
            : Communication.currentWindow.opener;
    // Listen to messages from the parent or child frame.
    // Frameless windows will only receive this event from child frames and if validMessageOrigins is passed.
    if (Communication.parentWindow || validMessageOrigins) {
        Communication.currentWindow.addEventListener('message', CommunicationPrivate.messageListener, false);
    }
    if (!Communication.parentWindow) {
        var extendedWindow = Communication.currentWindow;
        if (extendedWindow.nativeInterface) {
            globalVars_1.GlobalVars.isFramelessWindow = true;
            extendedWindow.onNativeMessage = handleParentMessage;
        }
        else {
            // at this point we weren't able to find a parent to talk to, no way initialization will succeed
            return Promise.reject(new Error('Initialization Failed. No Parent window found.'));
        }
    }
    try {
        // Send the initialized message to any origin, because at this point we most likely don't know the origin
        // of the parent window, and this message contains no data that could pose a security risk.
        Communication.parentOrigin = '*';
        return sendMessageToParentAsync('initialize', [constants_1.version]).then(function (_a) {
            var context = _a[0], clientType = _a[1], runtimeConfig = _a[2], clientSupportedSDKVersion = _a[3];
            return { context: context, clientType: clientType, runtimeConfig: runtimeConfig, clientSupportedSDKVersion: clientSupportedSDKVersion };
        });
    }
    finally {
        Communication.parentOrigin = null;
    }
}
exports.initializeCommunication = initializeCommunication;
/**@internal */
function uninitializeCommunication() {
    Communication.currentWindow.removeEventListener('message', CommunicationPrivate.messageListener, false);
    Communication.parentWindow = null;
    Communication.parentOrigin = null;
    Communication.childWindow = null;
    Communication.childOrigin = null;
    CommunicationPrivate.parentMessageQueue = [];
    CommunicationPrivate.childMessageQueue = [];
    CommunicationPrivate.nextMessageId = 0;
    CommunicationPrivate.callbacks = {};
}
exports.uninitializeCommunication = uninitializeCommunication;
/**@internal */
function sendAndUnwrap(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var result = _a[0];
        return result;
    });
}
exports.sendAndUnwrap = sendAndUnwrap;
function sendAndHandleStatusAndReason(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var status = _a[0], reason = _a[1];
        if (!status) {
            throw new Error(reason);
        }
    });
}
exports.sendAndHandleStatusAndReason = sendAndHandleStatusAndReason;
/**@internal */
function sendAndHandleStatusAndReasonWithDefaultError(actionName, defaultError) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var status = _a[0], reason = _a[1];
        if (!status) {
            throw new Error(reason ? reason : defaultError);
        }
    });
}
exports.sendAndHandleStatusAndReasonWithDefaultError = sendAndHandleStatusAndReasonWithDefaultError;
/**@internal */
function sendAndHandleSdkError(actionName) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return sendMessageToParentAsync(actionName, args).then(function (_a) {
        var error = _a[0], result = _a[1];
        if (error) {
            throw error;
        }
        return result;
    });
}
exports.sendAndHandleSdkError = sendAndHandleSdkError;
/**
 * @hidden
 * Send a message to parent. Uses nativeInterface on mobile to communicate with parent context
 *
 * @internal
 */
function sendMessageToParentAsync(actionName, args) {
    if (args === void 0) { args = undefined; }
    return new Promise(function (resolve) {
        var request = sendMessageToParentHelper(actionName, args);
        resolve(waitForResponse(request.id));
    });
}
exports.sendMessageToParentAsync = sendMessageToParentAsync;
/**@internal */
function waitForResponse(requestId) {
    return new Promise(function (resolve) {
        CommunicationPrivate.promiseCallbacks[requestId] = resolve;
    });
}
/**@internal */
function sendMessageToParent(actionName, argsOrCallback, callback) {
    var args;
    if (argsOrCallback instanceof Function) {
        callback = argsOrCallback;
    }
    else if (argsOrCallback instanceof Array) {
        args = argsOrCallback;
    }
    var request = sendMessageToParentHelper(actionName, args);
    if (callback) {
        CommunicationPrivate.callbacks[request.id] = callback;
    }
}
exports.sendMessageToParent = sendMessageToParent;
var sendMessageToParentHelperLogger = communicationLogger.extend('sendMessageToParentHelper');
/**@internal */
function sendMessageToParentHelper(actionName, args) {
    var logger = sendMessageToParentHelperLogger;
    var targetWindow = Communication.parentWindow;
    var request = createMessageRequest(actionName, args);
    logger('Message %i information: %o', request.id, { actionName: actionName, args: args });
    if (globalVars_1.GlobalVars.isFramelessWindow) {
        if (Communication.currentWindow && Communication.currentWindow.nativeInterface) {
            logger('Sending message %i to parent via framelessPostMessage interface', request.id);
            Communication.currentWindow.nativeInterface.framelessPostMessage(JSON.stringify(request));
        }
    }
    else {
        var targetOrigin = getTargetOrigin(targetWindow);
        // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
        // queue the message and send it after the origin is established
        if (targetWindow && targetOrigin) {
            logger('Sending message %i to parent via postMessage', request.id);
            targetWindow.postMessage(request, targetOrigin);
        }
        else {
            logger('Adding message %i to parent message queue', request.id);
            getTargetMessageQueue(targetWindow).push(request);
        }
    }
    return request;
}
/**@internal */
function processMessage(evt) {
    // Process only if we received a valid message
    if (!evt || !evt.data || typeof evt.data !== 'object') {
        return;
    }
    // Process only if the message is coming from a different window and a valid origin
    // valid origins are either a pre-known
    var messageSource = evt.source || (evt.originalEvent && evt.originalEvent.source);
    var messageOrigin = evt.origin || (evt.originalEvent && evt.originalEvent.origin);
    if (!shouldProcessMessage(messageSource, messageOrigin)) {
        return;
    }
    // Update our parent and child relationships based on this message
    updateRelationships(messageSource, messageOrigin);
    // Handle the message
    if (messageSource === Communication.parentWindow) {
        handleParentMessage(evt);
    }
    else if (messageSource === Communication.childWindow) {
        handleChildMessage(evt);
    }
}
exports.processMessage = processMessage;
/**
 * @hidden
 * Validates the message source and origin, if it should be processed
 *
 * @internal
 */
function shouldProcessMessage(messageSource, messageOrigin) {
    // Process if message source is a different window and if origin is either in
    // Teams' pre-known whitelist or supplied as valid origin by user during initialization
    if (Communication.currentWindow && messageSource === Communication.currentWindow) {
        return false;
    }
    else if (Communication.currentWindow &&
        Communication.currentWindow.location &&
        messageOrigin &&
        messageOrigin === Communication.currentWindow.location.origin) {
        return true;
    }
    else {
        return (0, utils_1.validateOrigin)(new URL(messageOrigin));
    }
}
exports.shouldProcessMessage = shouldProcessMessage;
/**@internal */
function updateRelationships(messageSource, messageOrigin) {
    // Determine whether the source of the message is our parent or child and update our
    // window and origin pointer accordingly
    // For frameless windows (i.e mobile), there is no parent frame, so the message must be from the child.
    if (!globalVars_1.GlobalVars.isFramelessWindow &&
        (!Communication.parentWindow || Communication.parentWindow.closed || messageSource === Communication.parentWindow)) {
        Communication.parentWindow = messageSource;
        Communication.parentOrigin = messageOrigin;
    }
    else if (!Communication.childWindow ||
        Communication.childWindow.closed ||
        messageSource === Communication.childWindow) {
        Communication.childWindow = messageSource;
        Communication.childOrigin = messageOrigin;
    }
    // Clean up pointers to closed parent and child windows
    if (Communication.parentWindow && Communication.parentWindow.closed) {
        Communication.parentWindow = null;
        Communication.parentOrigin = null;
    }
    if (Communication.childWindow && Communication.childWindow.closed) {
        Communication.childWindow = null;
        Communication.childOrigin = null;
    }
    // If we have any messages in our queue, send them now
    flushMessageQueue(Communication.parentWindow);
    flushMessageQueue(Communication.childWindow);
}
var handleParentMessageLogger = communicationLogger.extend('handleParentMessage');
/**@internal */
function handleParentMessage(evt) {
    var logger = handleParentMessageLogger;
    if ('id' in evt.data && typeof evt.data.id === 'number') {
        // Call any associated Communication.callbacks
        var message = evt.data;
        var callback = CommunicationPrivate.callbacks[message.id];
        logger('Received a response from parent for message %i', message.id);
        if (callback) {
            logger('Invoking the registered callback for message %i with arguments %o', message.id, message.args);
            callback.apply(null, __spreadArray(__spreadArray([], message.args, true), [message.isPartialResponse], false));
            // Remove the callback to ensure that the callback is called only once and to free up memory if response is a complete response
            if (!isPartialResponse(evt)) {
                logger('Removing registered callback for message %i', message.id);
                delete CommunicationPrivate.callbacks[message.id];
            }
        }
        var promiseCallback = CommunicationPrivate.promiseCallbacks[message.id];
        if (promiseCallback) {
            logger('Invoking the registered promise callback for message %i with arguments %o', message.id, message.args);
            promiseCallback(message.args);
            logger('Removing registered promise callback for message %i', message.id);
            delete CommunicationPrivate.promiseCallbacks[message.id];
        }
    }
    else if ('func' in evt.data && typeof evt.data.func === 'string') {
        // Delegate the request to the proper handler
        var message = evt.data;
        logger('Received an action message %s from parent', message.func);
        (0, handlers_1.callHandler)(message.func, message.args);
    }
    else {
        logger('Received an unknown message: %O', evt);
    }
}
/**@internal */
function isPartialResponse(evt) {
    return evt.data.isPartialResponse === true;
}
/**@internal */
function handleChildMessage(evt) {
    if ('id' in evt.data && 'func' in evt.data) {
        // Try to delegate the request to the proper handler, if defined
        var message_1 = evt.data;
        var _a = (0, handlers_1.callHandler)(message_1.func, message_1.args), called = _a[0], result = _a[1];
        if (called && typeof result !== 'undefined') {
            sendMessageResponseToChild(message_1.id, Array.isArray(result) ? result : [result]);
        }
        else {
            // No handler, proxy to parent
            // tslint:disable-next-line:no-any
            sendMessageToParent(message_1.func, message_1.args, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (Communication.childWindow) {
                    var isPartialResponse_1 = args.pop();
                    sendMessageResponseToChild(message_1.id, args, isPartialResponse_1);
                }
            });
        }
    }
}
/**@internal */
function getTargetMessageQueue(targetWindow) {
    return targetWindow === Communication.parentWindow
        ? CommunicationPrivate.parentMessageQueue
        : targetWindow === Communication.childWindow
            ? CommunicationPrivate.childMessageQueue
            : [];
}
/**@internal */
function getTargetOrigin(targetWindow) {
    return targetWindow === Communication.parentWindow
        ? Communication.parentOrigin
        : targetWindow === Communication.childWindow
            ? Communication.childOrigin
            : null;
}
var flushMessageQueueLogger = communicationLogger.extend('flushMessageQueue');
/**@internal */
function flushMessageQueue(targetWindow) {
    var targetOrigin = getTargetOrigin(targetWindow);
    var targetMessageQueue = getTargetMessageQueue(targetWindow);
    var target = targetWindow == Communication.parentWindow ? 'parent' : 'child';
    while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
        var request = targetMessageQueue.shift();
        flushMessageQueueLogger('Flushing message %i from ' + target + ' message queue via postMessage.', request.id);
        targetWindow.postMessage(request, targetOrigin);
    }
}
/**@internal */
function waitForMessageQueue(targetWindow, callback) {
    var messageQueueMonitor = Communication.currentWindow.setInterval(function () {
        if (getTargetMessageQueue(targetWindow).length === 0) {
            clearInterval(messageQueueMonitor);
            callback();
        }
    }, 100);
}
exports.waitForMessageQueue = waitForMessageQueue;
/**
 * @hidden
 * Send a response to child for a message request that was from child
 *
 * @internal
 */
function sendMessageResponseToChild(id, 
// tslint:disable-next-line:no-any
args, isPartialResponse) {
    var targetWindow = Communication.childWindow;
    var response = createMessageResponse(id, args, isPartialResponse);
    var targetOrigin = getTargetOrigin(targetWindow);
    if (targetWindow && targetOrigin) {
        targetWindow.postMessage(response, targetOrigin);
    }
}
/**
 * @hidden
 * Send a custom message object that can be sent to child window,
 * instead of a response message to a child
 *
 * @internal
 */
function sendMessageEventToChild(actionName, 
// tslint:disable-next-line: no-any
args) {
    var targetWindow = Communication.childWindow;
    var customEvent = createMessageEvent(actionName, args);
    var targetOrigin = getTargetOrigin(targetWindow);
    // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
    // queue the message and send it after the origin is established
    if (targetWindow && targetOrigin) {
        targetWindow.postMessage(customEvent, targetOrigin);
    }
    else {
        getTargetMessageQueue(targetWindow).push(customEvent);
    }
}
exports.sendMessageEventToChild = sendMessageEventToChild;
/**@internal */
// tslint:disable-next-line:no-any
function createMessageRequest(func, args) {
    return {
        id: CommunicationPrivate.nextMessageId++,
        func: func,
        timestamp: Date.now(),
        args: args || [],
    };
}
/**@internal */
// tslint:disable-next-line:no-any
function createMessageResponse(id, args, isPartialResponse) {
    return {
        id: id,
        args: args || [],
        isPartialResponse: isPartialResponse,
    };
}
/**
 * @hidden
 * Creates a message object without any id, used for custom actions being sent to child frame/window
 *
 * @internal
 */
// tslint:disable-next-line:no-any
function createMessageEvent(func, args) {
    return {
        func: func,
        args: args || [],
    };
}
//# sourceMappingURL=communication.js.map