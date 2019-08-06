(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("microsoftTeams", [], factory);
	else if(typeof exports === 'object')
		exports["microsoftTeams"] = factory();
	else
		root["microsoftTeams"] = factory();
})(window, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 8);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var GlobalVars = /** @class */ (function () {
    function GlobalVars() {
    }
    GlobalVars.initializeCalled = false;
    GlobalVars.initializeCompleted = false;
    GlobalVars.initializeCallbacks = [];
    GlobalVars.isFramelessWindow = false;
    GlobalVars.parentMessageQueue = [];
    GlobalVars.childMessageQueue = [];
    GlobalVars.nextMessageId = 0;
    GlobalVars.handlers = {};
    GlobalVars.callbacks = {};
    GlobalVars.printCapabilityEnabled = false;
    return GlobalVars;
}());
exports.GlobalVars = GlobalVars;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var publicAPIs_1 = __webpack_require__(4);
var constants_1 = __webpack_require__(2);
var globalVars_1 = __webpack_require__(0);
// ::::::::::::::::::::MicrosoftTeams SDK Internal :::::::::::::::::
globalVars_1.GlobalVars.handlers['themeChange'] = handleThemeChange;
globalVars_1.GlobalVars.handlers['fullScreenChange'] = handleFullScreenChange;
globalVars_1.GlobalVars.handlers['backButtonPress'] = handleBackButtonPress;
globalVars_1.GlobalVars.handlers['beforeUnload'] = handleBeforeUnload;
globalVars_1.GlobalVars.handlers['changeSettings'] = handleChangeSettings;
globalVars_1.GlobalVars.handlers['startConversation'] = handleStartConversation;
globalVars_1.GlobalVars.handlers['closeConversation'] = handleCloseConversation;
function handleStartConversation(subEntityId, conversationId, channelId, entityId) {
    if (globalVars_1.GlobalVars.onStartConversationHandler) {
        globalVars_1.GlobalVars.onStartConversationHandler({
            subEntityId: subEntityId,
            conversationId: conversationId,
            channelId: channelId,
            entityId: entityId,
        });
    }
}
function handleCloseConversation(subEntityId, conversationId, channelId, entityId) {
    if (globalVars_1.GlobalVars.onCloseConversationHandler) {
        globalVars_1.GlobalVars.onCloseConversationHandler({
            subEntityId: subEntityId,
            conversationId: conversationId,
            channelId: channelId,
            entityId: entityId,
        });
    }
}
function handleThemeChange(theme) {
    if (globalVars_1.GlobalVars.themeChangeHandler) {
        globalVars_1.GlobalVars.themeChangeHandler(theme);
    }
    if (globalVars_1.GlobalVars.childWindow) {
        sendMessageRequest(globalVars_1.GlobalVars.childWindow, 'themeChange', [theme]);
    }
}
function handleFullScreenChange(isFullScreen) {
    if (globalVars_1.GlobalVars.fullScreenChangeHandler) {
        globalVars_1.GlobalVars.fullScreenChangeHandler(isFullScreen);
    }
}
function handleBackButtonPress() {
    if (!globalVars_1.GlobalVars.backButtonPressHandler || !globalVars_1.GlobalVars.backButtonPressHandler()) {
        publicAPIs_1.navigateBack();
    }
}
function handleBeforeUnload() {
    var readyToUnload = function () {
        sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'readyToUnload', []);
    };
    if (!globalVars_1.GlobalVars.beforeUnloadHandler || !globalVars_1.GlobalVars.beforeUnloadHandler(readyToUnload)) {
        readyToUnload();
    }
}
function handleChangeSettings() {
    if (globalVars_1.GlobalVars.changeSettingsHandler) {
        globalVars_1.GlobalVars.changeSettingsHandler();
    }
}
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
            throw new Error("This call is not allowed in the '" + globalVars_1.GlobalVars.frameContext + "' context");
        }
    }
}
exports.ensureInitialized = ensureInitialized;
function processMessage(evt) {
    // Process only if we received a valid message
    if (!evt || !evt.data || typeof evt.data !== 'object') {
        return;
    }
    // Process only if the message is coming from a different window and a valid origin
    var messageSource = evt.source || evt.originalEvent.source;
    var messageOrigin = evt.origin || evt.originalEvent.origin;
    if (messageSource === globalVars_1.GlobalVars.currentWindow ||
        (messageOrigin !== globalVars_1.GlobalVars.currentWindow.location.origin && !constants_1.validOriginRegExp.test(messageOrigin.toLowerCase()))) {
        return;
    }
    // Update our parent and child relationships based on this message
    updateRelationships(messageSource, messageOrigin);
    // Handle the message
    if (messageSource === globalVars_1.GlobalVars.parentWindow) {
        handleParentMessage(evt);
    }
    else if (messageSource === globalVars_1.GlobalVars.childWindow) {
        handleChildMessage(evt);
    }
}
exports.processMessage = processMessage;
function updateRelationships(messageSource, messageOrigin) {
    // Determine whether the source of the message is our parent or child and update our
    // window and origin pointer accordingly
    if (!globalVars_1.GlobalVars.parentWindow || messageSource === globalVars_1.GlobalVars.parentWindow) {
        globalVars_1.GlobalVars.parentWindow = messageSource;
        globalVars_1.GlobalVars.parentOrigin = messageOrigin;
    }
    else if (!globalVars_1.GlobalVars.childWindow || messageSource === globalVars_1.GlobalVars.childWindow) {
        globalVars_1.GlobalVars.childWindow = messageSource;
        globalVars_1.GlobalVars.childOrigin = messageOrigin;
    }
    // Clean up pointers to closed parent and child windows
    if (globalVars_1.GlobalVars.parentWindow && globalVars_1.GlobalVars.parentWindow.closed) {
        globalVars_1.GlobalVars.parentWindow = null;
        globalVars_1.GlobalVars.parentOrigin = null;
    }
    if (globalVars_1.GlobalVars.childWindow && globalVars_1.GlobalVars.childWindow.closed) {
        globalVars_1.GlobalVars.childWindow = null;
        globalVars_1.GlobalVars.childOrigin = null;
    }
    // If we have any messages in our queue, send them now
    flushMessageQueue(globalVars_1.GlobalVars.parentWindow);
    flushMessageQueue(globalVars_1.GlobalVars.childWindow);
}
function handleParentMessage(evt) {
    if ('id' in evt.data) {
        // Call any associated GlobalVars.callbacks
        var message = evt.data;
        var callback = globalVars_1.GlobalVars.callbacks[message.id];
        if (callback) {
            callback.apply(null, message.args);
            // Remove the callback to ensure that the callback is called only once and to free up memory.
            delete globalVars_1.GlobalVars.callbacks[message.id];
        }
    }
    else if ('func' in evt.data) {
        // Delegate the request to the proper handler
        var message = evt.data;
        var handler = globalVars_1.GlobalVars.handlers[message.func];
        if (handler) {
            // We don't expect any handler to respond at this point
            handler.apply(this, message.args);
        }
    }
}
exports.handleParentMessage = handleParentMessage;
function handleChildMessage(evt) {
    if ('id' in evt.data && 'func' in evt.data) {
        // Try to delegate the request to the proper handler
        var message_1 = evt.data;
        var handler = globalVars_1.GlobalVars.handlers[message_1.func];
        if (handler) {
            var result = handler.apply(this, message_1.args);
            if (result) {
                sendMessageResponse(globalVars_1.GlobalVars.childWindow, message_1.id, Array.isArray(result) ? result : [result]);
            }
        }
        else {
            // Proxy to parent
            var messageId = sendMessageRequest(globalVars_1.GlobalVars.parentWindow, message_1.func, message_1.args);
            // tslint:disable-next-line:no-any
            globalVars_1.GlobalVars.callbacks[messageId] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (globalVars_1.GlobalVars.childWindow) {
                    sendMessageResponse(globalVars_1.GlobalVars.childWindow, message_1.id, args);
                }
            };
        }
    }
}
function getTargetMessageQueue(targetWindow) {
    return targetWindow === globalVars_1.GlobalVars.parentWindow
        ? globalVars_1.GlobalVars.parentMessageQueue
        : targetWindow === globalVars_1.GlobalVars.childWindow
            ? globalVars_1.GlobalVars.childMessageQueue
            : [];
}
function getTargetOrigin(targetWindow) {
    return targetWindow === globalVars_1.GlobalVars.parentWindow
        ? globalVars_1.GlobalVars.parentOrigin
        : targetWindow === globalVars_1.GlobalVars.childWindow
            ? globalVars_1.GlobalVars.childOrigin
            : null;
}
function flushMessageQueue(targetWindow) {
    var targetOrigin = getTargetOrigin(targetWindow);
    var targetMessageQueue = getTargetMessageQueue(targetWindow);
    while (targetWindow && targetOrigin && targetMessageQueue.length > 0) {
        targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
    }
}
function waitForMessageQueue(targetWindow, callback) {
    var messageQueueMonitor = globalVars_1.GlobalVars.currentWindow.setInterval(function () {
        if (getTargetMessageQueue(targetWindow).length === 0) {
            clearInterval(messageQueueMonitor);
            callback();
        }
    }, 100);
}
exports.waitForMessageQueue = waitForMessageQueue;
function sendMessageRequest(targetWindow, actionName, 
// tslint:disable-next-line: no-any
args) {
    var request = createMessageRequest(actionName, args);
    if (globalVars_1.GlobalVars.isFramelessWindow) {
        if (globalVars_1.GlobalVars.currentWindow && globalVars_1.GlobalVars.currentWindow.nativeInterface) {
            globalVars_1.GlobalVars.currentWindow.nativeInterface.framelessPostMessage(JSON.stringify(request));
        }
    }
    else {
        var targetOrigin = getTargetOrigin(targetWindow);
        // If the target window isn't closed and we already know its origin, send the message right away; otherwise,
        // queue the message and send it after the origin is established
        if (targetWindow && targetOrigin) {
            targetWindow.postMessage(request, targetOrigin);
        }
        else {
            getTargetMessageQueue(targetWindow).push(request);
        }
    }
    return request.id;
}
exports.sendMessageRequest = sendMessageRequest;
function sendMessageResponse(targetWindow, id, 
// tslint:disable-next-line:no-any
args) {
    var response = createMessageResponse(id, args);
    var targetOrigin = getTargetOrigin(targetWindow);
    if (targetWindow && targetOrigin) {
        targetWindow.postMessage(response, targetOrigin);
    }
}
// tslint:disable-next-line:no-any
function createMessageRequest(func, args) {
    return {
        id: globalVars_1.GlobalVars.nextMessageId++,
        func: func,
        args: args || [],
    };
}
// tslint:disable-next-line:no-any
function createMessageResponse(id, args) {
    return {
        id: id,
        args: args || [],
    };
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = __webpack_require__(3);
exports.version = '1.5.0';
exports.validOrigins = [
    'https://teams.microsoft.com',
    'https://teams.microsoft.us',
    'https://gov.teams.microsoft.us',
    'https://dod.teams.microsoft.us',
    'https://int.teams.microsoft.com',
    'https://devspaces.skype.com',
    'https://ssauth.skype.com',
    'http://dev.local',
    'http://dev.local:8080',
    'https://msft.spoppe.com',
    'https://*.sharepoint.com',
    'https://*.sharepoint-df.com',
    'https://*.sharepointonline.com',
    'https://outlook.office.com',
    'https://outlook-sdf.office.com',
];
// Ensure these declarations stay in sync with the framework.
exports.frameContexts = {
    settings: 'settings',
    content: 'content',
    authentication: 'authentication',
    remove: 'remove',
    task: 'task',
};
exports.validOriginRegExp = utils_1.generateRegExpFromUrls(exports.validOrigins);


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// This will return a reg expression a given url
function generateRegExpFromUrl(url) {
    var urlRegExpPart = '^';
    var urlParts = url.split('.');
    for (var j = 0; j < urlParts.length; j++) {
        urlRegExpPart += (j > 0 ? '[.]' : '') + urlParts[j].replace('*', '[^/^.]+');
    }
    urlRegExpPart += '$';
    return urlRegExpPart;
}
// This will return a reg expression for list of url
function generateRegExpFromUrls(urls) {
    var urlRegExp = '';
    for (var i = 0; i < urls.length; i++) {
        urlRegExp += (i === 0 ? '' : '|') + generateRegExpFromUrl(urls[i]);
    }
    return new RegExp(urlRegExp);
}
exports.generateRegExpFromUrls = generateRegExpFromUrls;
function getGenericOnCompleteHandler(errorMessage) {
    return function (success, reason) {
        if (!success) {
            throw new Error(errorMessage ? errorMessage : reason);
        }
    };
}
exports.getGenericOnCompleteHandler = getGenericOnCompleteHandler;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var settings_1 = __webpack_require__(5);
var utils_1 = __webpack_require__(3);
var logs_1 = __webpack_require__(6);
// ::::::::::::::::::::::: MicrosoftTeams SDK public API ::::::::::::::::::::
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
function initialize(callback) {
    // Independent components might not know whether the SDK is initialized so might call it to be safe.
    // Just no-op if that happens to make it easier to use.
    if (!globalVars_1.GlobalVars.initializeCalled) {
        globalVars_1.GlobalVars.initializeCalled = true;
        // Listen for messages post to our window
        var messageListener_1 = function (evt) { return internalAPIs_1.processMessage(evt); };
        // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
        // it's the window that opened us (i.e., window.opener)
        globalVars_1.GlobalVars.currentWindow = globalVars_1.GlobalVars.currentWindow || window;
        globalVars_1.GlobalVars.parentWindow =
            globalVars_1.GlobalVars.currentWindow.parent !== globalVars_1.GlobalVars.currentWindow.self
                ? globalVars_1.GlobalVars.currentWindow.parent
                : globalVars_1.GlobalVars.currentWindow.opener;
        if (!globalVars_1.GlobalVars.parentWindow) {
            globalVars_1.GlobalVars.isFramelessWindow = true;
            window.onNativeMessage = internalAPIs_1.handleParentMessage;
        }
        else {
            // For iFrame scenario, add listener to listen 'message'
            globalVars_1.GlobalVars.currentWindow.addEventListener('message', messageListener_1, false);
        }
        try {
            // Send the initialized message to any origin, because at this point we most likely don't know the origin
            // of the parent window, and this message contains no data that could pose a security risk.
            globalVars_1.GlobalVars.parentOrigin = '*';
            var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'initialize', [constants_1.version]);
            globalVars_1.GlobalVars.callbacks[messageId] = function (context, clientType) {
                globalVars_1.GlobalVars.frameContext = context;
                globalVars_1.GlobalVars.hostClientType = clientType;
                // Notify all waiting callers that the initialization has completed
                globalVars_1.GlobalVars.initializeCallbacks.forEach(function (initCallback) { return initCallback(); });
                globalVars_1.GlobalVars.initializeCallbacks = [];
                globalVars_1.GlobalVars.initializeCompleted = true;
            };
        }
        finally {
            globalVars_1.GlobalVars.parentOrigin = null;
        }
        // Undocumented function used to clear state between unit tests
        this._uninitialize = function () {
            if (globalVars_1.GlobalVars.frameContext) {
                registerOnThemeChangeHandler(null);
                registerFullScreenHandler(null);
                registerBackButtonHandler(null);
                registerBeforeUnloadHandler(null);
                logs_1.logs.registerGetLogHandler(null);
            }
            if (globalVars_1.GlobalVars.frameContext === constants_1.frameContexts.settings) {
                settings_1.settings.registerOnSaveHandler(null);
            }
            if (globalVars_1.GlobalVars.frameContext === constants_1.frameContexts.remove) {
                settings_1.settings.registerOnRemoveHandler(null);
            }
            if (!globalVars_1.GlobalVars.isFramelessWindow) {
                globalVars_1.GlobalVars.currentWindow.removeEventListener('message', messageListener_1, false);
            }
            globalVars_1.GlobalVars.initializeCalled = false;
            globalVars_1.GlobalVars.initializeCompleted = false;
            globalVars_1.GlobalVars.initializeCallbacks = [];
            globalVars_1.GlobalVars.parentWindow = null;
            globalVars_1.GlobalVars.parentOrigin = null;
            globalVars_1.GlobalVars.parentMessageQueue = [];
            globalVars_1.GlobalVars.childWindow = null;
            globalVars_1.GlobalVars.childOrigin = null;
            globalVars_1.GlobalVars.childMessageQueue = [];
            globalVars_1.GlobalVars.nextMessageId = 0;
            globalVars_1.GlobalVars.callbacks = {};
            globalVars_1.GlobalVars.frameContext = null;
            globalVars_1.GlobalVars.hostClientType = null;
            globalVars_1.GlobalVars.isFramelessWindow = false;
        };
    }
    // Handle the callback if specified:
    // 1. If initialization has already completed then just call it right away
    // 2. If initialization hasn't completed then add it to the array of callbacks
    //    that should be invoked once initialization does complete
    if (callback) {
        globalVars_1.GlobalVars.initializeCompleted ? callback() : globalVars_1.GlobalVars.initializeCallbacks.push(callback);
    }
}
exports.initialize = initialize;
/**
 * @private
 * Hide from docs.
 * ------
 * Undocumented function used to set a mock window for unit tests
 */
function _initialize(hostWindow) {
    globalVars_1.GlobalVars.currentWindow = hostWindow;
}
exports._initialize = _initialize;
/**
 * @private
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 */
function _uninitialize() { }
exports._uninitialize = _uninitialize;
/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
function enablePrintCapability() {
    if (!globalVars_1.GlobalVars.printCapabilityEnabled) {
        globalVars_1.GlobalVars.printCapabilityEnabled = true;
        internalAPIs_1.ensureInitialized();
        // adding ctrl+P and cmd+P handler
        document.addEventListener('keydown', function (event) {
            if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
                print();
                event.cancelBubble = true;
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        });
    }
}
exports.enablePrintCapability = enablePrintCapability;
/**
 * default print handler
 */
function print() {
    window.print();
}
exports.print = print;
/**
 * Retrieves the current context the frame is running in.
 * @param callback The callback to invoke when the {@link Context} object is retrieved.
 */
function getContext(callback) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getContext');
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getContext = getContext;
/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
function registerOnThemeChangeHandler(handler) {
    internalAPIs_1.ensureInitialized();
    globalVars_1.GlobalVars.themeChangeHandler = handler;
    handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['themeChange']);
}
exports.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
function registerFullScreenHandler(handler) {
    internalAPIs_1.ensureInitialized();
    globalVars_1.GlobalVars.fullScreenChangeHandler = handler;
    handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['fullScreen']);
}
exports.registerFullScreenHandler = registerFullScreenHandler;
/**
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 * @param handler The handler to invoke when the user presses their Team client's back button.
 */
function registerBackButtonHandler(handler) {
    internalAPIs_1.ensureInitialized();
    globalVars_1.GlobalVars.backButtonPressHandler = handler;
    handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['backButton']);
}
exports.registerBackButtonHandler = registerBackButtonHandler;
/**
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
function navigateBack(onComplete) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'navigateBack', []);
    var errorMessage = 'Back navigation is not supported in the current client or context.';
    globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler(errorMessage);
}
exports.navigateBack = navigateBack;
/**
 * @private
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
function registerBeforeUnloadHandler(handler) {
    internalAPIs_1.ensureInitialized();
    globalVars_1.GlobalVars.beforeUnloadHandler = handler;
    handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['beforeUnload']);
}
exports.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
function registerChangeSettingsHandler(handler) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    globalVars_1.GlobalVars.changeSettingsHandler = handler;
    handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['changeSettings']);
}
exports.registerChangeSettingsHandler = registerChangeSettingsHandler;
/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
function navigateCrossDomain(url, onComplete) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.settings, constants_1.frameContexts.remove, constants_1.frameContexts.task);
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'navigateCrossDomain', [url]);
    var errorMessage = 'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
    globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler(errorMessage);
}
exports.navigateCrossDomain = navigateCrossDomain;
/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
function getTabInstances(callback, tabInstanceParameters) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getTabInstances', [tabInstanceParameters]);
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getTabInstances = getTabInstances;
/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
function getMruTabInstances(callback, tabInstanceParameters) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getMruTabInstances', [tabInstanceParameters]);
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getMruTabInstances = getMruTabInstances;
/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
function shareDeepLink(deepLinkParameters) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'shareDeepLink', [
        deepLinkParameters.subEntityId,
        deepLinkParameters.subEntityLabel,
        deepLinkParameters.subEntityWebUrl,
    ]);
}
exports.shareDeepLink = shareDeepLink;
/**
 * execute deep link API.
 * @param deepLink deep link.
 */
function executeDeepLink(deepLink, onComplete) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.task);
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'executeDeepLink', [deepLink]);
    globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler();
}
exports.executeDeepLink = executeDeepLink;
/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
function navigateToTab(tabInstance, onComplete) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'navigateToTab', [tabInstance]);
    var errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
    globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler(errorMessage);
}
exports.navigateToTab = navigateToTab;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(3);
/**
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
var settings;
(function (settings) {
    var saveHandler;
    var removeHandler;
    globalVars_1.GlobalVars.handlers['settings.save'] = handleSave;
    globalVars_1.GlobalVars.handlers['settings.remove'] = handleRemove;
    /**
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     * @param validityState Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.settings, constants_1.frameContexts.remove);
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.setValidityState', [validityState]);
    }
    settings.setValidityState = setValidityState;
    /**
     * Gets the settings for the current instance.
     * @param callback The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.settings, constants_1.frameContexts.remove);
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.getSettings');
        globalVars_1.GlobalVars.callbacks[messageId] = callback;
    }
    settings.getSettings = getSettings;
    /**
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     * @param settings The desired settings for this instance.
     */
    function setSettings(instanceSettings, onComplete) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.settings);
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.setSettings', [instanceSettings]);
        globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler();
    }
    settings.setSettings = setSettings;
    /**
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler The handler to invoke when the user selects the save button.
     */
    function registerOnSaveHandler(handler) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.settings);
        saveHandler = handler;
        handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['save']);
    }
    settings.registerOnSaveHandler = registerOnSaveHandler;
    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user selects the remove button.
     */
    function registerOnRemoveHandler(handler) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.remove);
        removeHandler = handler;
        handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['remove']);
    }
    settings.registerOnRemoveHandler = registerOnRemoveHandler;
    function handleSave(result) {
        var saveEvent = new SaveEventImpl(result);
        if (saveHandler) {
            saveHandler(saveEvent);
        }
        else {
            // If no handler is registered, we assume success.
            saveEvent.notifySuccess();
        }
    }
    /**
     * @private
     * Hide from docs, since this class is not directly used.
     */
    var SaveEventImpl = /** @class */ (function () {
        function SaveEventImpl(result) {
            this.notified = false;
            this.result = result ? result : {};
        }
        SaveEventImpl.prototype.notifySuccess = function () {
            this.ensureNotNotified();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.save.success');
            this.notified = true;
        };
        SaveEventImpl.prototype.notifyFailure = function (reason) {
            this.ensureNotNotified();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.save.failure', [reason]);
            this.notified = true;
        };
        SaveEventImpl.prototype.ensureNotNotified = function () {
            if (this.notified) {
                throw new Error('The SaveEvent may only notify success or failure once.');
            }
        };
        return SaveEventImpl;
    }());
    function handleRemove() {
        var removeEvent = new RemoveEventImpl();
        if (removeHandler) {
            removeHandler(removeEvent);
        }
        else {
            // If no handler is registered, we assume success.
            removeEvent.notifySuccess();
        }
    }
    /**
     * @private
     * Hide from docs, since this class is not directly used.
     */
    var RemoveEventImpl = /** @class */ (function () {
        function RemoveEventImpl() {
            this.notified = false;
        }
        RemoveEventImpl.prototype.notifySuccess = function () {
            this.ensureNotNotified();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.remove.success');
            this.notified = true;
        };
        RemoveEventImpl.prototype.notifyFailure = function (reason) {
            this.ensureNotNotified();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'settings.remove.failure', [reason]);
            this.notified = true;
        };
        RemoveEventImpl.prototype.ensureNotNotified = function () {
            if (this.notified) {
                throw new Error('The removeEvent may only notify success or failure once.');
            }
        };
        return RemoveEventImpl;
    }());
})(settings = exports.settings || (exports.settings = {}));


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
/**
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * @private
 * Hide from docs
 */
var logs;
(function (logs) {
    globalVars_1.GlobalVars.handlers['log.request'] = handleGetLogRequest;
    function handleGetLogRequest() {
        if (globalVars_1.GlobalVars.getLogHandler) {
            var log = globalVars_1.GlobalVars.getLogHandler();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'log.receive', [log]);
        }
    }
    /**
     * @private
     * Hide from docs
     * ------
     * Registers a handler for getting app log
     * @param handler The handler to invoke to get the app log
     */
    function registerGetLogHandler(handler) {
        internalAPIs_1.ensureInitialized();
        globalVars_1.GlobalVars.getLogHandler = handler;
        handler && internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'registerHandler', ['log.request']);
    }
    logs.registerGetLogHandler = registerGetLogHandler;
})(logs = exports.logs || (exports.logs = {}));


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(3);
var ChildAppWindow = /** @class */ (function () {
    function ChildAppWindow() {
    }
    ChildAppWindow.prototype.postMessage = function (message, onComplete) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'messageForChild', [message]);
        globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler();
    };
    ChildAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            globalVars_1.GlobalVars.handlers['messageForParent'] = listener;
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
        enumerable: true,
        configurable: true
    });
    ParentAppWindow.prototype.postMessage = function (message, onComplete) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.task);
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'messageForParent', [message]);
        globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler();
    };
    ParentAppWindow.prototype.addEventListener = function (type, listener) {
        if (type === 'message') {
            globalVars_1.GlobalVars.handlers['messageForChild'] = listener;
        }
    };
    return ParentAppWindow;
}());
exports.ParentAppWindow = ParentAppWindow;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(9));
__export(__webpack_require__(14));


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var bot_1 = __webpack_require__(10);
exports.bot = bot_1.bot;
var menus_1 = __webpack_require__(11);
exports.menus = menus_1.menus;
var logs_1 = __webpack_require__(6);
exports.logs = logs_1.logs;
var privateAPIs_1 = __webpack_require__(12);
exports.enterFullscreen = privateAPIs_1.enterFullscreen;
exports.exitFullscreen = privateAPIs_1.exitFullscreen;
exports.getChatMembers = privateAPIs_1.getChatMembers;
exports.getConfigSetting = privateAPIs_1.getConfigSetting;
exports.getUserJoinedTeams = privateAPIs_1.getUserJoinedTeams;
exports.openFilePreview = privateAPIs_1.openFilePreview;
exports.sendCustomMessage = privateAPIs_1.sendCustomMessage;
exports.showNotification = privateAPIs_1.showNotification;
exports.uploadCustomApp = privateAPIs_1.uploadCustomApp;
var conversations_1 = __webpack_require__(13);
exports.conversations = conversations_1.conversations;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var globalVars_1 = __webpack_require__(0);
var internalAPIs_1 = __webpack_require__(1);
/**
 * @private
 * Namespace to interact with bots using the SDK.
 */
var bot;
(function (bot) {
    /**
     * @private
     * Hide from docs until release.
     * ------
     * Sends query to bot in order to retrieve data.
     * @param botRequest query to send to bot.
     * @param onSuccess callback to invoke when data is retrieved from bot
     * @param onError callback to invoke should an error occur
     */
    function sendQuery(botRequest, onSuccess, onError) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'bot.executeQuery', [botRequest]);
        globalVars_1.GlobalVars.callbacks[messageId] = function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        };
    }
    bot.sendQuery = sendQuery;
    /**
     * @private
     * Hide from docs until release.
     * -----
     * Retrieves list of support commands from bot
     * @param onSuccess callback to invoke when data is retrieved from bot
     * @param onError callback to invoke should an error occur
     */
    function getSupportedCommands(onSuccess, onError) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'bot.getSupportedCommands');
        globalVars_1.GlobalVars.callbacks[messageId] = function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        };
    }
    bot.getSupportedCommands = getSupportedCommands;
    /**
     * @private
     * Hide from docs until release.
     * -----
     * Authenticates a user for json tab
     * @param authRequest callback to invoke when data is retrieved from bot
     * @param onSuccess callback to invoke when user is authenticated
     * @param onError callback to invoke should an error occur
     */
    function authenticate(authRequest, onSuccess, onError) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'bot.authenticate', [authRequest]);
        globalVars_1.GlobalVars.callbacks[messageId] = function (success, response) {
            if (success) {
                onSuccess(response);
            }
            else {
                onError(response);
            }
        };
    }
    bot.authenticate = authenticate;
    var ResponseType;
    (function (ResponseType) {
        ResponseType["Results"] = "Results";
        ResponseType["Auth"] = "Auth";
    })(ResponseType = bot.ResponseType || (bot.ResponseType = {}));
})(bot = exports.bot || (exports.bot = {}));


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 *
 * @private
 * Hide from docs until feature is complete
 */
var menus;
(function (menus) {
    /**
     * Represents information about menu item for Action Menu and Navigation Bar Menu.
     */
    var MenuItem = /** @class */ (function () {
        function MenuItem() {
            /**
             * State of the menu item
             */
            this.enabled = true;
        }
        return MenuItem;
    }());
    menus.MenuItem = MenuItem;
    /**
     * Represents information about type of list to display in Navigation Bar Menu.
     */
    var MenuListType;
    (function (MenuListType) {
        MenuListType["dropDown"] = "dropDown";
        MenuListType["popOver"] = "popOver";
    })(MenuListType = menus.MenuListType || (menus.MenuListType = {}));
    var navBarMenuItemPressHandler;
    globalVars_1.GlobalVars.handlers['navBarMenuItemPress'] = handleNavBarMenuItemPress;
    var actionMenuItemPressHandler;
    globalVars_1.GlobalVars.handlers['actionMenuItemPress'] = handleActionMenuItemPress;
    var viewConfigItemPressHandler;
    globalVars_1.GlobalVars.handlers['setModuleView'] = handleViewConfigItemPress;
    /**
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     * @param viewConfig List of view configurations. Minimum 1 value is required.
     * @param handler The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig, handler) {
        internalAPIs_1.ensureInitialized();
        viewConfigItemPressHandler = handler;
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'setUpViews', [viewConfig]);
    }
    menus.setUpViews = setUpViews;
    function handleViewConfigItemPress(id) {
        if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
            internalAPIs_1.ensureInitialized();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'viewConfigItemPress', [id]);
        }
    }
    /**
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items, handler) {
        internalAPIs_1.ensureInitialized();
        navBarMenuItemPressHandler = handler;
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'setNavBarMenu', [items]);
    }
    menus.setNavBarMenu = setNavBarMenu;
    function handleNavBarMenuItemPress(id) {
        if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
            internalAPIs_1.ensureInitialized();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'handleNavBarMenuItemPress', [id]);
        }
    }
    /**
     * Used to show Action Menu.
     * @param params Parameters for Menu Parameters
     * @param handler The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params, handler) {
        internalAPIs_1.ensureInitialized();
        actionMenuItemPressHandler = handler;
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'showActionMenu', [params]);
    }
    menus.showActionMenu = showActionMenu;
    function handleActionMenuItemPress(id) {
        if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
            internalAPIs_1.ensureInitialized();
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'handleActionMenuItemPress', [id]);
        }
    }
})(menus = exports.menus || (exports.menus = {}));


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(3);
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
function getUserJoinedTeams(callback, teamInstanceParameters) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getUserJoinedTeams', [teamInstanceParameters]);
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getUserJoinedTeams = getUserJoinedTeams;
/**
 * @private
 * Hide from docs
 * ------
 * Place the tab into full-screen mode.
 */
function enterFullscreen() {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'enterFullscreen', []);
}
exports.enterFullscreen = enterFullscreen;
/**
 * @private
 * Hide from docs
 * ------
 * Reverts the tab into normal-screen mode.
 */
function exitFullscreen() {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'exitFullscreen', []);
}
exports.exitFullscreen = exitFullscreen;
/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
function openFilePreview(filePreviewParameters) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    var params = [
        filePreviewParameters.entityId,
        filePreviewParameters.title,
        filePreviewParameters.description,
        filePreviewParameters.type,
        filePreviewParameters.objectUrl,
        filePreviewParameters.downloadUrl,
        filePreviewParameters.webPreviewUrl,
        filePreviewParameters.webEditUrl,
        filePreviewParameters.baseUrl,
        filePreviewParameters.editFile,
        filePreviewParameters.subEntityId,
    ];
    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'openFilePreview', params);
}
exports.openFilePreview = openFilePreview;
/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
function showNotification(showNotificationParameters) {
    internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
    var params = [showNotificationParameters.message, showNotificationParameters.notificationType];
    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'showNotification', params);
}
exports.showNotification = showNotification;
/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
function uploadCustomApp(manifestBlob, onComplete) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'uploadCustomApp', [manifestBlob]);
    globalVars_1.GlobalVars.callbacks[messageId] = onComplete ? onComplete : utils_1.getGenericOnCompleteHandler();
}
exports.uploadCustomApp = uploadCustomApp;
/**
 * @private
 * Internal use only
 * Sends a custom action message to Teams.
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
function sendCustomMessage(actionName, 
// tslint:disable-next-line:no-any
args) {
    internalAPIs_1.ensureInitialized();
    return internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, actionName, args);
}
exports.sendCustomMessage = sendCustomMessage;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
function getChatMembers(callback) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getChatMembers');
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getChatMembers = getChatMembers;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to get the configuration setting value
 * @param callback The callback to invoke when the value is retrieved.
 * @param key The key for the config setting
 */
function getConfigSetting(callback, key) {
    internalAPIs_1.ensureInitialized();
    var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'getConfigSetting', [key]);
    globalVars_1.GlobalVars.callbacks[messageId] = callback;
}
exports.getConfigSetting = getConfigSetting;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
/**
 * Namespace to interact with the conversational subEntities inside the tab
 */
var conversations;
(function (conversations) {
    /**
     * @private
     * Hide from docs
     * --------------
     * Allows the user to start or continue a conversation with each subentity inside the tab
     */
    function openConversation(openConversationRequest) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'conversations.openConversation', [
            {
                title: openConversationRequest.title,
                subEntityId: openConversationRequest.subEntityId,
                conversationId: openConversationRequest.conversationId,
                channelId: openConversationRequest.channelId,
                entityId: openConversationRequest.entityId,
            },
        ]);
        globalVars_1.GlobalVars.onCloseConversationHandler = openConversationRequest.onCloseConversation;
        globalVars_1.GlobalVars.onStartConversationHandler = openConversationRequest.onStartConversation;
        globalVars_1.GlobalVars.callbacks[messageId] = function (status, reason) {
            if (!status) {
                throw new Error(reason);
            }
        };
    }
    conversations.openConversation = openConversation;
    /**
     * @private
     * Hide from docs
     * --------------
     * Allows the user to close the conversation in the right pane
     */
    function closeConversation() {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'conversations.closeConversation');
        globalVars_1.GlobalVars.onCloseConversationHandler = null;
        globalVars_1.GlobalVars.onStartConversationHandler = null;
    }
    conversations.closeConversation = closeConversation;
})(conversations = exports.conversations || (exports.conversations = {}));


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var appInitialization_1 = __webpack_require__(15);
exports.appInitialization = appInitialization_1.appInitialization;
var authentication_1 = __webpack_require__(16);
exports.authentication = authentication_1.authentication;
var publicAPIs_1 = __webpack_require__(4);
exports.enablePrintCapability = publicAPIs_1.enablePrintCapability;
exports.executeDeepLink = publicAPIs_1.executeDeepLink;
exports.getContext = publicAPIs_1.getContext;
exports.getMruTabInstances = publicAPIs_1.getMruTabInstances;
exports.getTabInstances = publicAPIs_1.getTabInstances;
exports.initialize = publicAPIs_1.initialize;
exports.navigateBack = publicAPIs_1.navigateBack;
exports.navigateCrossDomain = publicAPIs_1.navigateCrossDomain;
exports.navigateToTab = publicAPIs_1.navigateToTab;
exports.print = publicAPIs_1.print;
exports.registerBackButtonHandler = publicAPIs_1.registerBackButtonHandler;
exports.registerBeforeUnloadHandler = publicAPIs_1.registerBeforeUnloadHandler;
exports.registerChangeSettingsHandler = publicAPIs_1.registerChangeSettingsHandler;
exports.registerFullScreenHandler = publicAPIs_1.registerFullScreenHandler;
exports.registerOnThemeChangeHandler = publicAPIs_1.registerOnThemeChangeHandler;
exports.shareDeepLink = publicAPIs_1.shareDeepLink;
var settings_1 = __webpack_require__(5);
exports.settings = settings_1.settings;
var tasks_1 = __webpack_require__(17);
exports.tasks = tasks_1.tasks;
var appWindow_1 = __webpack_require__(7);
exports.ChildAppWindow = appWindow_1.ChildAppWindow;
exports.ParentAppWindow = appWindow_1.ParentAppWindow;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var appInitialization;
(function (appInitialization) {
    /**
     * To notify app loaded to hide loading indicator
     */
    function notifyAppLoaded() {
        internalAPIs_1.ensureInitialized();
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'appInitialization.appLoaded', [constants_1.version]);
    }
    appInitialization.notifyAppLoaded = notifyAppLoaded;
    /**
     * To notify app Initialization successs and ready for user interaction
     */
    function notifySuccess() {
        internalAPIs_1.ensureInitialized();
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'appInitialization.success', [constants_1.version]);
    }
    appInitialization.notifySuccess = notifySuccess;
    /**
     * To notify app Initialization failed
     */
    function notifyFailure(appInitializationFailedRequest) {
        internalAPIs_1.ensureInitialized();
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'appInitialization.failure', [
            appInitializationFailedRequest.reason,
            appInitializationFailedRequest.message,
        ]);
    }
    appInitialization.notifyFailure = notifyFailure;
})(appInitialization = exports.appInitialization || (exports.appInitialization = {}));


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
var authentication;
(function (authentication) {
    var authParams;
    var authWindowMonitor;
    globalVars_1.GlobalVars.handlers['authentication.authenticate.success'] = handleSuccess;
    globalVars_1.GlobalVars.handlers['authentication.authenticate.failure'] = handleFailure;
    /**
     * Registers the authentication GlobalVars.handlers
     * @param authenticateParameters A set of values that configure the authentication pop-up.
     */
    function registerAuthenticationHandlers(authenticateParameters) {
        authParams = authenticateParameters;
    }
    authentication.registerAuthenticationHandlers = registerAuthenticationHandlers;
    /**
     * Initiates an authentication request, which opens a new window with the specified settings.
     */
    function authenticate(authenticateParameters) {
        var authenticateParams = authenticateParameters !== undefined ? authenticateParameters : authParams;
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.settings, constants_1.frameContexts.remove, constants_1.frameContexts.task);
        if (globalVars_1.GlobalVars.hostClientType === "desktop" /* desktop */ ||
            globalVars_1.GlobalVars.hostClientType === "android" /* android */ ||
            globalVars_1.GlobalVars.hostClientType === "ios" /* ios */ ||
            globalVars_1.GlobalVars.hostClientType === "rigel" /* rigel */) {
            // Convert any relative URLs into absolute URLs before sending them over to the parent window.
            var link = document.createElement('a');
            link.href = authenticateParams.url;
            // Ask the parent window to open an authentication window with the parameters provided by the caller.
            var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'authentication.authenticate', [
                link.href,
                authenticateParams.width,
                authenticateParams.height,
            ]);
            globalVars_1.GlobalVars.callbacks[messageId] = function (success, response) {
                if (success) {
                    authenticateParams.successCallback(response);
                }
                else {
                    authenticateParams.failureCallback(response);
                }
            };
        }
        else {
            // Open an authentication window with the parameters provided by the caller.
            openAuthenticationWindow(authenticateParams);
        }
    }
    authentication.authenticate = authenticate;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests an Azure AD token to be issued on behalf of the app. The token is acquired from the cache
     * if it is not expired. Otherwise a request is sent to Azure AD to obtain a new token.
     * @param authTokenRequest A set of values that configure the token request.
     */
    function getAuthToken(authTokenRequest) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'authentication.getAuthToken', [
            authTokenRequest.resources,
        ]);
        globalVars_1.GlobalVars.callbacks[messageId] = function (success, result) {
            if (success) {
                authTokenRequest.successCallback(result);
            }
            else {
                authTokenRequest.failureCallback(result);
            }
        };
    }
    authentication.getAuthToken = getAuthToken;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests the decoded Azure AD user identity on behalf of the app.
     */
    function getUser(userRequest) {
        internalAPIs_1.ensureInitialized();
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'authentication.getUser');
        globalVars_1.GlobalVars.callbacks[messageId] = function (success, result) {
            if (success) {
                userRequest.successCallback(result);
            }
            else {
                userRequest.failureCallback(result);
            }
        };
    }
    authentication.getUser = getUser;
    function closeAuthenticationWindow() {
        // Stop monitoring the authentication window
        stopAuthenticationWindowMonitor();
        // Try to close the authentication window and clear all properties associated with it
        try {
            if (globalVars_1.GlobalVars.childWindow) {
                globalVars_1.GlobalVars.childWindow.close();
            }
        }
        finally {
            globalVars_1.GlobalVars.childWindow = null;
            globalVars_1.GlobalVars.childOrigin = null;
        }
    }
    function openAuthenticationWindow(authenticateParameters) {
        authParams = authenticateParameters;
        // Close the previously opened window if we have one
        closeAuthenticationWindow();
        // Start with a sensible default size
        var width = authParams.width || 600;
        var height = authParams.height || 400;
        // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
        width = Math.min(width, globalVars_1.GlobalVars.currentWindow.outerWidth - 400);
        height = Math.min(height, globalVars_1.GlobalVars.currentWindow.outerHeight - 200);
        // Convert any relative URLs into absolute URLs before sending them over to the parent window
        var link = document.createElement('a');
        link.href = authParams.url;
        // We are running in the browser, so we need to center the new window ourselves
        var left = typeof globalVars_1.GlobalVars.currentWindow.screenLeft !== 'undefined'
            ? globalVars_1.GlobalVars.currentWindow.screenLeft
            : globalVars_1.GlobalVars.currentWindow.screenX;
        var top = typeof globalVars_1.GlobalVars.currentWindow.screenTop !== 'undefined'
            ? globalVars_1.GlobalVars.currentWindow.screenTop
            : globalVars_1.GlobalVars.currentWindow.screenY;
        left += globalVars_1.GlobalVars.currentWindow.outerWidth / 2 - width / 2;
        top += globalVars_1.GlobalVars.currentWindow.outerHeight / 2 - height / 2;
        // Open a child window with a desired set of standard browser features
        globalVars_1.GlobalVars.childWindow = globalVars_1.GlobalVars.currentWindow.open(link.href, '_blank', 'toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=' +
            top +
            ', left=' +
            left +
            ', width=' +
            width +
            ', height=' +
            height);
        if (globalVars_1.GlobalVars.childWindow) {
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
        delete globalVars_1.GlobalVars.handlers['initialize'];
        delete globalVars_1.GlobalVars.handlers['navigateCrossDomain'];
    }
    function startAuthenticationWindowMonitor() {
        // Stop the previous window monitor if one is running
        stopAuthenticationWindowMonitor();
        // Create an interval loop that
        // - Notifies the caller of failure if it detects that the authentication window is closed
        // - Keeps pinging the authentication window while it is open to re-establish
        //   contact with any pages along the authentication flow that need to communicate
        //   with us
        authWindowMonitor = globalVars_1.GlobalVars.currentWindow.setInterval(function () {
            if (!globalVars_1.GlobalVars.childWindow || globalVars_1.GlobalVars.childWindow.closed) {
                handleFailure('CancelledByUser');
            }
            else {
                var savedChildOrigin = globalVars_1.GlobalVars.childOrigin;
                try {
                    globalVars_1.GlobalVars.childOrigin = '*';
                    internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.childWindow, 'ping');
                }
                finally {
                    globalVars_1.GlobalVars.childOrigin = savedChildOrigin;
                }
            }
        }, 100);
        // Set up an initialize-message handler that gives the authentication window its frame context
        globalVars_1.GlobalVars.handlers['initialize'] = function () {
            return [constants_1.frameContexts.authentication, globalVars_1.GlobalVars.hostClientType];
        };
        // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
        // in the authentication window. We could at some point choose to implement this method via a call to
        // authenticationWindow.location.href = url; however, we would first need to figure out how to
        // validate the URL against the tab's list of valid domains.
        globalVars_1.GlobalVars.handlers['navigateCrossDomain'] = function () {
            return false;
        };
    }
    /**
     * Notifies the frame that initiated this authentication request that the request was successful.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifySuccess(result, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'result', result);
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.authentication);
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'authentication.authenticate.success', [result]);
        // Wait for the message to be sent before closing the window
        internalAPIs_1.waitForMessageQueue(globalVars_1.GlobalVars.parentWindow, function () { return setTimeout(function () { return globalVars_1.GlobalVars.currentWindow.close(); }, 200); });
    }
    authentication.notifySuccess = notifySuccess;
    /**
     * Notifies the frame that initiated this authentication request that the request failed.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifyFailure(reason, callbackUrl) {
        redirectIfWin32Outlook(callbackUrl, 'reason', reason);
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.authentication);
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'authentication.authenticate.failure', [reason]);
        // Wait for the message to be sent before closing the window
        internalAPIs_1.waitForMessageQueue(globalVars_1.GlobalVars.parentWindow, function () { return setTimeout(function () { return globalVars_1.GlobalVars.currentWindow.close(); }, 200); });
    }
    authentication.notifyFailure = notifyFailure;
    function handleSuccess(result) {
        try {
            if (authParams && authParams.successCallback) {
                authParams.successCallback(result);
            }
        }
        finally {
            authParams = null;
            closeAuthenticationWindow();
        }
    }
    function handleFailure(reason) {
        try {
            if (authParams && authParams.failureCallback) {
                authParams.failureCallback(reason);
            }
        }
        finally {
            authParams = null;
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
                    globalVars_1.GlobalVars.currentWindow.location.assign(updateUrlParameter(link.href, 'authSuccess', ''));
                }
                if (key && key === 'reason') {
                    if (value) {
                        link.href = updateUrlParameter(link.href, 'reason', value);
                    }
                    globalVars_1.GlobalVars.currentWindow.location.assign(updateUrlParameter(link.href, 'authFailure', ''));
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


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var internalAPIs_1 = __webpack_require__(1);
var globalVars_1 = __webpack_require__(0);
var constants_1 = __webpack_require__(2);
var appWindow_1 = __webpack_require__(7);
/**
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
var tasks;
(function (tasks) {
    /**
     * Allows an app to open the task module.
     * @param taskInfo An object containing the parameters of the task module
     * @param submitHandler Handler to call when the task module is completed
     */
    function startTask(taskInfo, submitHandler) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content);
        var messageId = internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'tasks.startTask', [taskInfo]);
        globalVars_1.GlobalVars.callbacks[messageId] = submitHandler;
        return new appWindow_1.ChildAppWindow();
    }
    tasks.startTask = startTask;
    /**
     * Update height/width task info properties.
     * @param taskInfo An object containing width and height properties
     */
    function updateTask(taskInfo) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.task);
        var width = taskInfo.width, height = taskInfo.height, extra = __rest(taskInfo, ["width", "height"]);
        if (!Object.keys(extra).length) {
            internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'tasks.updateTask', [taskInfo]);
        }
        else {
            throw new Error('updateTask requires a taskInfo argument containing only width and height');
        }
    }
    tasks.updateTask = updateTask;
    /**
     * Submit the task module.
     * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submitTask(result, appIds) {
        internalAPIs_1.ensureInitialized(constants_1.frameContexts.content, constants_1.frameContexts.task);
        // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
        internalAPIs_1.sendMessageRequest(globalVars_1.GlobalVars.parentWindow, 'tasks.completeTask', [
            result,
            Array.isArray(appIds) ? appIds : [appIds],
        ]);
    }
    tasks.submitTask = submitTask;
})(tasks = exports.tasks || (exports.tasks = {}));


/***/ })
/******/ ]);
});
//# sourceMappingURL=MicrosoftTeams.js.map