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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(1));


/***/ }),
/* 1 */
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
var version = "1.4.2";
var validOrigins = [
    "https://teams.microsoft.com",
    "https://teams.microsoft.us",
    "https://gov.teams.microsoft.us",
    "https://dod.teams.microsoft.us",
    "https://int.teams.microsoft.com",
    "https://devspaces.skype.com",
    "https://ssauth.skype.com",
    "http://dev.local",
    "http://dev.local:8080",
    "https://msft.spoppe.com",
    "https://*.sharepoint.com",
    "https://*.sharepoint-df.com",
    "https://*.sharepointonline.com",
    "https://outlook.office.com",
    "https://outlook-sdf.office.com"
];
// This will return a reg expression a given url
function generateRegExpFromUrl(url) {
    var urlRegExpPart = "^";
    var urlParts = url.split(".");
    for (var j = 0; j < urlParts.length; j++) {
        urlRegExpPart += (j > 0 ? "[.]" : "") + urlParts[j].replace("*", "[^/^.]+");
    }
    urlRegExpPart += "$";
    return urlRegExpPart;
}
// This will return a reg expression for list of url
function generateRegExpFromUrls(urls) {
    var urlRegExp = "";
    for (var i = 0; i < urls.length; i++) {
        urlRegExp += (i === 0 ? "" : "|") + generateRegExpFromUrl(urls[i]);
    }
    return new RegExp(urlRegExp);
}
var validOriginRegExp = generateRegExpFromUrls(validOrigins);
var handlers = {};
// Ensure these declarations stay in sync with the framework.
var frameContexts = {
    settings: "settings",
    content: "content",
    authentication: "authentication",
    remove: "remove",
    task: "task"
};
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
    handlers["navBarMenuItemPress"] = handleNavBarMenuItemPress;
    var actionMenuItemPressHandler;
    handlers["actionMenuItemPress"] = handleActionMenuItemPress;
    var viewConfigItemPressHandler;
    handlers["setModuleView"] = handleViewConfigItemPress;
    /**
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     * @param viewConfig List of view configurations. Minimum 1 value is required.
     * @param handler The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig, handler) {
        ensureInitialized();
        viewConfigItemPressHandler = handler;
        sendMessageRequest(parentWindow, "setUpViews", [viewConfig]);
    }
    menus.setUpViews = setUpViews;
    function handleViewConfigItemPress(id) {
        if (!viewConfigItemPressHandler || !viewConfigItemPressHandler(id)) {
            ensureInitialized();
            sendMessageRequest(parentWindow, "viewConfigItemPress", [id]);
        }
    }
    /**
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items, handler) {
        ensureInitialized();
        navBarMenuItemPressHandler = handler;
        sendMessageRequest(parentWindow, "setNavBarMenu", [items]);
    }
    menus.setNavBarMenu = setNavBarMenu;
    function handleNavBarMenuItemPress(id) {
        if (!navBarMenuItemPressHandler || !navBarMenuItemPressHandler(id)) {
            ensureInitialized();
            sendMessageRequest(parentWindow, "handleNavBarMenuItemPress", [id]);
        }
    }
    /**
     * Used to show Action Menu.
     * @param params Parameters for Menu Parameters
     * @param handler The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params, handler) {
        ensureInitialized();
        actionMenuItemPressHandler = handler;
        sendMessageRequest(parentWindow, "showActionMenu", [params]);
    }
    menus.showActionMenu = showActionMenu;
    function handleActionMenuItemPress(id) {
        if (!actionMenuItemPressHandler || !actionMenuItemPressHandler(id)) {
            ensureInitialized();
            sendMessageRequest(parentWindow, "handleActionMenuItemPress", [id]);
        }
    }
})(menus = exports.menus || (exports.menus = {}));
// This indicates whether initialize was called (started).
// It does not indicate whether initialization is complete. That can be inferred by whether parentOrigin is set.
var initializeCalled = false;
var isFramelessWindow = false;
var currentWindow;
var parentWindow;
var parentOrigin;
var parentMessageQueue = [];
var childWindow;
var childOrigin;
var childMessageQueue = [];
var nextMessageId = 0;
var callbacks = {};
var frameContext;
var hostClientType;
var printCapabilityEnabled = false;
var themeChangeHandler;
handlers["themeChange"] = handleThemeChange;
var fullScreenChangeHandler;
handlers["fullScreenChange"] = handleFullScreenChange;
var backButtonPressHandler;
handlers["backButtonPress"] = handleBackButtonPress;
var beforeUnloadHandler;
handlers["beforeUnload"] = handleBeforeUnload;
var changeSettingsHandler;
handlers["changeSettings"] = handleChangeSettings;
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
function initialize(hostWindow) {
    if (hostWindow === void 0) { hostWindow = window; }
    if (initializeCalled) {
        // Independent components might not know whether the SDK is initialized so might call it to be safe.
        // Just no-op if that happens to make it easier to use.
        return;
    }
    initializeCalled = true;
    // Undocumented field used to mock the window for unit tests
    currentWindow = hostWindow;
    // Listen for messages post to our window
    var messageListener = function (evt) { return processMessage(evt); };
    // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
    // it's the window that opened us (i.e., window.opener)
    parentWindow =
        currentWindow.parent !== currentWindow.self
            ? currentWindow.parent
            : currentWindow.opener;
    if (!parentWindow) {
        isFramelessWindow = true;
        window.onNativeMessage = handleParentMessage;
    }
    else {
        // For iFrame scenario, add listener to listen 'message'
        currentWindow.addEventListener("message", messageListener, false);
    }
    try {
        // Send the initialized message to any origin, because at this point we most likely don't know the origin
        // of the parent window, and this message contains no data that could pose a security risk.
        parentOrigin = "*";
        var messageId = sendMessageRequest(parentWindow, "initialize", [version]);
        callbacks[messageId] = function (context, clientType) {
            frameContext = context;
            hostClientType = clientType;
        };
    }
    finally {
        parentOrigin = null;
    }
    // Undocumented function used to clear state between unit tests
    this._uninitialize = function () {
        if (frameContext) {
            registerOnThemeChangeHandler(null);
            registerFullScreenHandler(null);
            registerBackButtonHandler(null);
            registerBeforeUnloadHandler(null);
        }
        if (frameContext === frameContexts.settings) {
            settings.registerOnSaveHandler(null);
        }
        if (frameContext === frameContexts.remove) {
            settings.registerOnRemoveHandler(null);
        }
        if (!isFramelessWindow) {
            currentWindow.removeEventListener("message", messageListener, false);
        }
        initializeCalled = false;
        parentWindow = null;
        parentOrigin = null;
        parentMessageQueue = [];
        childWindow = null;
        childOrigin = null;
        childMessageQueue = [];
        nextMessageId = 0;
        callbacks = {};
        frameContext = null;
        hostClientType = null;
        isFramelessWindow = false;
    };
}
exports.initialize = initialize;
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
function _uninitialize() { }
exports._uninitialize = _uninitialize;
/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
function enablePrintCapability() {
    if (!printCapabilityEnabled) {
        printCapabilityEnabled = true;
        ensureInitialized();
        // adding ctrl+P and cmd+P handler
        document.addEventListener("keydown", function (event) {
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
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "getContext");
    callbacks[messageId] = callback;
}
exports.getContext = getContext;
/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
function registerOnThemeChangeHandler(handler) {
    ensureInitialized();
    themeChangeHandler = handler;
    handler &&
        sendMessageRequest(parentWindow, "registerHandler", ["themeChange"]);
}
exports.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
function handleThemeChange(theme) {
    if (themeChangeHandler) {
        themeChangeHandler(theme);
    }
    if (childWindow) {
        sendMessageRequest(childWindow, "themeChange", [theme]);
    }
}
/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
function registerFullScreenHandler(handler) {
    ensureInitialized();
    fullScreenChangeHandler = handler;
    handler &&
        sendMessageRequest(parentWindow, "registerHandler", ["fullScreen"]);
}
exports.registerFullScreenHandler = registerFullScreenHandler;
function handleFullScreenChange(isFullScreen) {
    if (fullScreenChangeHandler) {
        fullScreenChangeHandler(isFullScreen);
    }
}
/**
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 * @param handler The handler to invoke when the user presses their Team client's back button.
 */
function registerBackButtonHandler(handler) {
    ensureInitialized();
    backButtonPressHandler = handler;
    handler &&
        sendMessageRequest(parentWindow, "registerHandler", ["backButton"]);
}
exports.registerBackButtonHandler = registerBackButtonHandler;
function handleBackButtonPress() {
    if (!backButtonPressHandler || !backButtonPressHandler()) {
        navigateBack();
    }
}
/**
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
function navigateBack() {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "navigateBack", []);
    callbacks[messageId] = function (success) {
        if (!success) {
            throw new Error("Back navigation is not supported in the current client or context.");
        }
    };
}
exports.navigateBack = navigateBack;
/**
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
function registerBeforeUnloadHandler(handler) {
    ensureInitialized();
    beforeUnloadHandler = handler;
    handler &&
        sendMessageRequest(parentWindow, "registerHandler", ["beforeUnload"]);
}
exports.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
function handleBeforeUnload() {
    var readyToUnload = function () {
        sendMessageRequest(parentWindow, "readyToUnload", []);
    };
    if (!beforeUnloadHandler || !beforeUnloadHandler(readyToUnload)) {
        readyToUnload();
    }
}
/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
function registerChangeSettingsHandler(handler) {
    ensureInitialized(frameContexts.content);
    changeSettingsHandler = handler;
    handler && sendMessageRequest(parentWindow, "registerHandler", ["changeSettings"]);
}
exports.registerChangeSettingsHandler = registerChangeSettingsHandler;
function handleChangeSettings() {
    if (changeSettingsHandler) {
        changeSettingsHandler();
    }
}
/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
function navigateCrossDomain(url) {
    ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove, frameContexts.task);
    var messageId = sendMessageRequest(parentWindow, "navigateCrossDomain", [
        url
    ]);
    callbacks[messageId] = function (success) {
        if (!success) {
            throw new Error("Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
        }
    };
}
exports.navigateCrossDomain = navigateCrossDomain;
/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
function getTabInstances(callback, tabInstanceParameters) {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "getTabInstances", [
        tabInstanceParameters
    ]);
    callbacks[messageId] = callback;
}
exports.getTabInstances = getTabInstances;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
function getUserJoinedTeams(callback, teamInstanceParameters) {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "getUserJoinedTeams", [
        teamInstanceParameters
    ]);
    callbacks[messageId] = callback;
}
exports.getUserJoinedTeams = getUserJoinedTeams;
/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
function getMruTabInstances(callback, tabInstanceParameters) {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "getMruTabInstances", [
        tabInstanceParameters
    ]);
    callbacks[messageId] = callback;
}
exports.getMruTabInstances = getMruTabInstances;
/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
function shareDeepLink(deepLinkParameters) {
    ensureInitialized(frameContexts.content);
    sendMessageRequest(parentWindow, "shareDeepLink", [
        deepLinkParameters.subEntityId,
        deepLinkParameters.subEntityLabel,
        deepLinkParameters.subEntityWebUrl
    ]);
}
exports.shareDeepLink = shareDeepLink;
/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
function openFilePreview(filePreviewParameters) {
    ensureInitialized(frameContexts.content);
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
        filePreviewParameters.subEntityId
    ];
    sendMessageRequest(parentWindow, "openFilePreview", params);
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
    ensureInitialized(frameContexts.content);
    var params = [
        showNotificationParameters.message,
        showNotificationParameters.notificationType
    ];
    sendMessageRequest(parentWindow, "showNotification", params);
}
exports.showNotification = showNotification;
/**
 * @private
 * Hide from docs.
 * ------
 * execute deep link API.
 * @param deepLink deep link.
 */
function executeDeepLink(deepLink) {
    ensureInitialized(frameContexts.content);
    var messageId = sendMessageRequest(parentWindow, "executeDeepLink", [
        deepLink
    ]);
    callbacks[messageId] = function (success, result) {
        if (!success) {
            throw new Error(result);
        }
    };
}
exports.executeDeepLink = executeDeepLink;
/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
function uploadCustomApp(manifestBlob) {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "uploadCustomApp", [
        manifestBlob
    ]);
    callbacks[messageId] = function (success, result) {
        if (!success) {
            throw new Error(result);
        }
    };
}
exports.uploadCustomApp = uploadCustomApp;
/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
function navigateToTab(tabInstance) {
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "navigateToTab", [
        tabInstance
    ]);
    callbacks[messageId] = function (success) {
        if (!success) {
            throw new Error("Invalid internalTabInstanceId and/or channelId were/was provided");
        }
    };
}
exports.navigateToTab = navigateToTab;
/**
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
var settings;
(function (settings) {
    var saveHandler;
    var removeHandler;
    handlers["settings.save"] = handleSave;
    handlers["settings.remove"] = handleRemove;
    /**
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     * @param validityState Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState) {
        ensureInitialized(frameContexts.settings, frameContexts.remove);
        sendMessageRequest(parentWindow, "settings.setValidityState", [
            validityState
        ]);
    }
    settings.setValidityState = setValidityState;
    /**
     * Gets the settings for the current instance.
     * @param callback The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback) {
        ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);
        var messageId = sendMessageRequest(parentWindow, "settings.getSettings");
        callbacks[messageId] = callback;
    }
    settings.getSettings = getSettings;
    /**
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     * @param settings The desired settings for this instance.
     */
    function setSettings(instanceSettings) {
        ensureInitialized(frameContexts.content, frameContexts.settings);
        var messageId = sendMessageRequest(parentWindow, "settings.setSettings", [
            instanceSettings
        ]);
        callbacks[messageId] = function (success, result) {
            if (!success) {
                throw new Error(result);
            }
        };
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
        ensureInitialized(frameContexts.settings);
        saveHandler = handler;
        handler && sendMessageRequest(parentWindow, "registerHandler", ["save"]);
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
        ensureInitialized(frameContexts.remove);
        removeHandler = handler;
        handler && sendMessageRequest(parentWindow, "registerHandler", ["remove"]);
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
            sendMessageRequest(parentWindow, "settings.save.success");
            this.notified = true;
        };
        SaveEventImpl.prototype.notifyFailure = function (reason) {
            this.ensureNotNotified();
            sendMessageRequest(parentWindow, "settings.save.failure", [reason]);
            this.notified = true;
        };
        SaveEventImpl.prototype.ensureNotNotified = function () {
            if (this.notified) {
                throw new Error("The SaveEvent may only notify success or failure once.");
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
            sendMessageRequest(parentWindow, "settings.remove.success");
            this.notified = true;
        };
        RemoveEventImpl.prototype.notifyFailure = function (reason) {
            this.ensureNotNotified();
            sendMessageRequest(parentWindow, "settings.remove.failure", [reason]);
            this.notified = true;
        };
        RemoveEventImpl.prototype.ensureNotNotified = function () {
            if (this.notified) {
                throw new Error("The removeEvent may only notify success or failure once.");
            }
        };
        return RemoveEventImpl;
    }());
})(settings = exports.settings || (exports.settings = {}));
/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
var authentication;
(function (authentication) {
    var authParams;
    var authWindowMonitor;
    handlers["authentication.authenticate.success"] = handleSuccess;
    handlers["authentication.authenticate.failure"] = handleFailure;
    /**
     * Registers the authentication handlers
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
        var authenticateParams = authenticateParameters !== undefined
            ? authenticateParameters
            : authParams;
        ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove, frameContexts.task);
        if (hostClientType === "desktop" /* desktop */ ||
            hostClientType === "android" /* android */ ||
            hostClientType === "ios" /* ios */) {
            // Convert any relative URLs into absolute URLs before sending them over to the parent window.
            var link = document.createElement("a");
            link.href = authenticateParams.url;
            // Ask the parent window to open an authentication window with the parameters provided by the caller.
            var messageId = sendMessageRequest(parentWindow, "authentication.authenticate", [link.href, authenticateParams.width, authenticateParams.height]);
            callbacks[messageId] = function (success, response) {
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
        ensureInitialized();
        var messageId = sendMessageRequest(parentWindow, "authentication.getAuthToken", [authTokenRequest.resources]);
        callbacks[messageId] = function (success, result) {
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
        ensureInitialized();
        var messageId = sendMessageRequest(parentWindow, "authentication.getUser");
        callbacks[messageId] = function (success, result) {
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
            if (childWindow) {
                childWindow.close();
            }
        }
        finally {
            childWindow = null;
            childOrigin = null;
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
        width = Math.min(width, currentWindow.outerWidth - 400);
        height = Math.min(height, currentWindow.outerHeight - 200);
        // Convert any relative URLs into absolute URLs before sending them over to the parent window
        var link = document.createElement("a");
        link.href = authParams.url;
        // We are running in the browser, so we need to center the new window ourselves
        var left = typeof currentWindow.screenLeft !== "undefined"
            ? currentWindow.screenLeft
            : currentWindow.screenX;
        var top = typeof currentWindow.screenTop !== "undefined"
            ? currentWindow.screenTop
            : currentWindow.screenY;
        left += currentWindow.outerWidth / 2 - width / 2;
        top += currentWindow.outerHeight / 2 - height / 2;
        // Open a child window with a desired set of standard browser features
        childWindow = currentWindow.open(link.href, "_blank", "toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=" +
            top +
            ", left=" +
            left +
            ", width=" +
            width +
            ", height=" +
            height);
        if (childWindow) {
            // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
            startAuthenticationWindowMonitor();
        }
        else {
            // If we failed to open the window, fail the authentication flow
            handleFailure("FailedToOpenWindow");
        }
    }
    function stopAuthenticationWindowMonitor() {
        if (authWindowMonitor) {
            clearInterval(authWindowMonitor);
            authWindowMonitor = 0;
        }
        delete handlers["initialize"];
        delete handlers["navigateCrossDomain"];
    }
    function startAuthenticationWindowMonitor() {
        // Stop the previous window monitor if one is running
        stopAuthenticationWindowMonitor();
        // Create an interval loop that
        // - Notifies the caller of failure if it detects that the authentication window is closed
        // - Keeps pinging the authentication window while it is open to re-establish
        //   contact with any pages along the authentication flow that need to communicate
        //   with us
        authWindowMonitor = currentWindow.setInterval(function () {
            if (!childWindow || childWindow.closed) {
                handleFailure("CancelledByUser");
            }
            else {
                var savedChildOrigin = childOrigin;
                try {
                    childOrigin = "*";
                    sendMessageRequest(childWindow, "ping");
                }
                finally {
                    childOrigin = savedChildOrigin;
                }
            }
        }, 100);
        // Set up an initialize-message handler that gives the authentication window its frame context
        handlers["initialize"] = function () {
            return [frameContexts.authentication, hostClientType];
        };
        // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
        // in the authentication window. We could at some point choose to implement this method via a call to
        // authenticationWindow.location.href = url; however, we would first need to figure out how to
        // validate the URL against the tab's list of valid domains.
        handlers["navigateCrossDomain"] = function (url) {
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
        redirectIfWin32Outlook(callbackUrl, "result", result);
        ensureInitialized(frameContexts.authentication);
        sendMessageRequest(parentWindow, "authentication.authenticate.success", [
            result
        ]);
        // Wait for the message to be sent before closing the window
        waitForMessageQueue(parentWindow, function () {
            return setTimeout(function () { return currentWindow.close(); }, 200);
        });
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
        redirectIfWin32Outlook(callbackUrl, "reason", reason);
        ensureInitialized(frameContexts.authentication);
        sendMessageRequest(parentWindow, "authentication.authenticate.failure", [
            reason
        ]);
        // Wait for the message to be sent before closing the window
        waitForMessageQueue(parentWindow, function () {
            return setTimeout(function () { return currentWindow.close(); }, 200);
        });
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
            var link = document.createElement("a");
            link.href = decodeURIComponent(callbackUrl);
            if (link.host &&
                link.host !== window.location.host &&
                link.host === "outlook.office.com" &&
                link.search.indexOf("client_type=Win32_Outlook") > -1) {
                if (key && key === "result") {
                    if (value) {
                        link.href = updateUrlParameter(link.href, "result", value);
                    }
                    currentWindow.location.assign(updateUrlParameter(link.href, "authSuccess", ""));
                }
                if (key && key === "reason") {
                    if (value) {
                        link.href = updateUrlParameter(link.href, "reason", value);
                    }
                    currentWindow.location.assign(updateUrlParameter(link.href, "authFailure", ""));
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
        var i = uri.indexOf("#");
        var hash = i === -1 ? "#" : uri.substr(i);
        hash = hash + "&" + key + (value !== "" ? "=" + value : "");
        uri = i === -1 ? uri : uri.substr(0, i);
        return uri + hash;
    }
})(authentication = exports.authentication || (exports.authentication = {}));
function ensureInitialized() {
    var expectedFrameContexts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        expectedFrameContexts[_i] = arguments[_i];
    }
    if (!initializeCalled) {
        throw new Error("The library has not yet been initialized");
    }
    if (frameContext &&
        expectedFrameContexts &&
        expectedFrameContexts.length > 0) {
        var found = false;
        for (var i = 0; i < expectedFrameContexts.length; i++) {
            if (expectedFrameContexts[i] === frameContext) {
                found = true;
                break;
            }
        }
        if (!found) {
            throw new Error("This call is not allowed in the '" + frameContext + "' context");
        }
    }
}
function processMessage(evt) {
    // Process only if we received a valid message
    if (!evt || !evt.data || typeof evt.data !== "object") {
        return;
    }
    // Process only if the message is coming from a different window and a valid origin
    var messageSource = evt.source || evt.originalEvent.source;
    var messageOrigin = evt.origin || evt.originalEvent.origin;
    if (messageSource === currentWindow ||
        (messageOrigin !== currentWindow.location.origin &&
            !validOriginRegExp.test(messageOrigin.toLowerCase()))) {
        return;
    }
    // Update our parent and child relationships based on this message
    updateRelationships(messageSource, messageOrigin);
    // Handle the message
    if (messageSource === parentWindow) {
        handleParentMessage(evt);
    }
    else if (messageSource === childWindow) {
        handleChildMessage(evt);
    }
}
function updateRelationships(messageSource, messageOrigin) {
    // Determine whether the source of the message is our parent or child and update our
    // window and origin pointer accordingly
    if (!parentWindow || messageSource === parentWindow) {
        parentWindow = messageSource;
        parentOrigin = messageOrigin;
    }
    else if (!childWindow || messageSource === childWindow) {
        childWindow = messageSource;
        childOrigin = messageOrigin;
    }
    // Clean up pointers to closed parent and child windows
    if (parentWindow && parentWindow.closed) {
        parentWindow = null;
        parentOrigin = null;
    }
    if (childWindow && childWindow.closed) {
        childWindow = null;
        childOrigin = null;
    }
    // If we have any messages in our queue, send them now
    flushMessageQueue(parentWindow);
    flushMessageQueue(childWindow);
}
function handleParentMessage(evt) {
    if ("id" in evt.data) {
        // Call any associated callbacks
        var message = evt.data;
        var callback = callbacks[message.id];
        if (callback) {
            callback.apply(null, message.args);
            // Remove the callback to ensure that the callback is called only once and to free up memory.
            delete callbacks[message.id];
        }
    }
    else if ("func" in evt.data) {
        // Delegate the request to the proper handler
        var message = evt.data;
        var handler = handlers[message.func];
        if (handler) {
            // We don't expect any handler to respond at this point
            handler.apply(this, message.args);
        }
    }
}
function handleChildMessage(evt) {
    if ("id" in evt.data && "func" in evt.data) {
        // Try to delegate the request to the proper handler
        var message_1 = evt.data;
        var handler = handlers[message_1.func];
        if (handler) {
            var result = handler.apply(this, message_1.args);
            if (result) {
                sendMessageResponse(childWindow, message_1.id, Array.isArray(result) ? result : [result]);
            }
        }
        else {
            // Proxy to parent
            var messageId = sendMessageRequest(parentWindow, message_1.func, message_1.args);
            // tslint:disable-next-line:no-any
            callbacks[messageId] = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (childWindow) {
                    sendMessageResponse(childWindow, message_1.id, args);
                }
            };
        }
    }
}
function getTargetMessageQueue(targetWindow) {
    return targetWindow === parentWindow
        ? parentMessageQueue
        : targetWindow === childWindow
            ? childMessageQueue
            : [];
}
function getTargetOrigin(targetWindow) {
    return targetWindow === parentWindow
        ? parentOrigin
        : targetWindow === childWindow
            ? childOrigin
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
    var messageQueueMonitor = currentWindow.setInterval(function () {
        if (getTargetMessageQueue(targetWindow).length === 0) {
            clearInterval(messageQueueMonitor);
            callback();
        }
    }, 100);
}
function sendMessageRequest(targetWindow, actionName, 
// tslint:disable-next-line: no-any
args) {
    var request = createMessageRequest(actionName, args);
    if (isFramelessWindow) {
        if (currentWindow && currentWindow.nativeInterface) {
            currentWindow.nativeInterface.framelessPostMessage(JSON.stringify(request));
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
    ensureInitialized();
    return sendMessageRequest(parentWindow, actionName, args);
}
exports.sendCustomMessage = sendCustomMessage;
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
        id: nextMessageId++,
        func: func,
        args: args || []
    };
}
// tslint:disable-next-line:no-any
function createMessageResponse(id, args) {
    return {
        id: id,
        args: args || []
    };
}
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
        ensureInitialized(frameContexts.content);
        var messageId = sendMessageRequest(parentWindow, "tasks.startTask", [
            taskInfo
        ]);
        callbacks[messageId] = submitHandler;
    }
    tasks.startTask = startTask;
    /**
     * Update height/width task info properties.
     * @param taskInfo An object containing width and height properties
     */
    function updateTask(taskInfo) {
        ensureInitialized(frameContexts.content, frameContexts.task);
        var width = taskInfo.width, height = taskInfo.height, extra = __rest(taskInfo, ["width", "height"]);
        if (!Object.keys(extra).length) {
            sendMessageRequest(parentWindow, "tasks.updateTask", [taskInfo]);
        }
        else {
            throw new Error("updateTask requires a taskInfo argument containing only width and height");
        }
    }
    tasks.updateTask = updateTask;
    /**
     * Submit the task module.
     * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submitTask(result, appIds) {
        ensureInitialized(frameContexts.content, frameContexts.task);
        // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
        sendMessageRequest(parentWindow, "tasks.completeTask", [
            result,
            Array.isArray(appIds) ? appIds : [appIds]
        ]);
    }
    tasks.submitTask = submitTask;
})(tasks = exports.tasks || (exports.tasks = {}));
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
    ensureInitialized();
    var messageId = sendMessageRequest(parentWindow, "getChatMembers");
    callbacks[messageId] = callback;
}
exports.getChatMembers = getChatMembers;


/***/ })
/******/ ]);
});
//# sourceMappingURL=MicrosoftTeams.js.map