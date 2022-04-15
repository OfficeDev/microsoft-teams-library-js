"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pages = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var app_1 = require("./app");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * Navigation specific part of the SDK.
 *
 * @beta
 */
var pages;
(function (pages) {
    /**
     * Return focus to the host. Will move focus forward or backward based on where the app container falls in
     * the F6/Tab accessiblity loop in the host.
     * @param navigateForward - Determines the direction to focus in host.
     */
    function returnFocus(navigateForward) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        (0, communication_1.sendMessageToParent)('returnFocus', [navigateForward]);
    }
    pages.returnFocus = returnFocus;
    /**
     * @hidden
     * Registers a handler when focus needs to be passed from teams to the place of choice on app.
     *
     * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
     *
     * @internal
     */
    function registerFocusEnterHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, handlers_1.registerHandler)('focusEnter', handler);
    }
    pages.registerFocusEnterHandler = registerFocusEnterHandler;
    function setCurrentFrame(frameInfo) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        (0, communication_1.sendMessageToParent)('setFrameContext', [frameInfo]);
    }
    pages.setCurrentFrame = setCurrentFrame;
    function initializeWithFrameContext(frameInfo, callback, validMessageOrigins) {
        app_1.app.initialize(validMessageOrigins).then(function () { return callback && callback(); });
        setCurrentFrame(frameInfo);
    }
    pages.initializeWithFrameContext = initializeWithFrameContext;
    /**
     * Gets the config for the current instance.
     * @returns Promise that resolves with the {@link InstanceConfig} object.
     */
    function getConfig() {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.settings, constants_1.FrameContexts.remove, constants_1.FrameContexts.sidePanel);
            resolve((0, communication_1.sendAndUnwrap)('settings.getSettings'));
        });
    }
    pages.getConfig = getConfig;
    /**
     * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
     * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
     * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
     * than the current one in a way that keeps the app informed of the change and allows the SDK to
     * continue working.
     * @param url - The URL to navigate the frame to.
     * @returns Promise that resolves when the navigation has completed.
     */
    function navigateCrossDomain(url) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.remove, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
            var errorMessage = 'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
            resolve((0, communication_1.sendAndHandleStatusAndReasonWithDefaultError)('navigateCrossDomain', errorMessage, url));
        });
    }
    pages.navigateCrossDomain = navigateCrossDomain;
    /**
     * Navigate to the given App ID and Page ID, with optional parameters for a WebURL (if the app cannot
     * be navigated to, such as if it is not installed), Channel ID (for apps installed as a channel tab), and
     * Sub-page ID (for navigating to specific content within the page). This is equivalent to navigating to
     * a deep link with the above data, but does not require the app to build a URL or worry about different
     * deep link formats for different hosts.
     * @param params Parameters for the navigation
     * @returns a promise that will resolve if the navigation was successful
     */
    function navigateToApp(params) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
            if (runtime_1.runtime.isLegacyTeams) {
                resolve((0, communication_1.sendAndHandleStatusAndReason)('executeDeepLink', (0, utils_1.createTeamsAppLink)(params)));
            }
            else {
                resolve((0, communication_1.sendAndHandleStatusAndReason)('pages.navigateToApp', params));
            }
        });
    }
    pages.navigateToApp = navigateToApp;
    /**
     * Shares a deep link that a user can use to navigate back to a specific state in this page.
     *
     * @param deepLinkParameters - ID and label for the link and fallback URL.
     */
    function shareDeepLink(deepLinkParameters) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.meetingStage);
        (0, communication_1.sendMessageToParent)('shareDeepLink', [
            deepLinkParameters.subEntityId,
            deepLinkParameters.subEntityLabel,
            deepLinkParameters.subEntityWebUrl,
        ]);
    }
    pages.shareDeepLink = shareDeepLink;
    /**
     * Registers a handler for changes from or to full-screen view for a tab.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
     */
    function registerFullScreenHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, handlers_1.registerHandler)('fullScreenChange', handler);
    }
    pages.registerFullScreenHandler = registerFullScreenHandler;
    /**
     * Checks if page capability is supported currently
     */
    function isSupported() {
        return runtime_1.runtime.supports.pages ? true : false;
    }
    pages.isSupported = isSupported;
    /**
     * Namespace to interact with the teams specific part of the SDK.
     */
    var tabs;
    (function (tabs) {
        /**
         * Navigates the hosted app to the specified tab instance.
         * @param tabInstance The tab instance to navigate to.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateToTab(tabInstance) {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)();
                var errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
                resolve((0, communication_1.sendAndHandleStatusAndReasonWithDefaultError)('navigateToTab', errorMessage, tabInstance));
            });
        }
        tabs.navigateToTab = navigateToTab;
        /**
         * Allows an app to retrieve for this user tabs that are owned by this app.
         * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
         * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
         * @returns Promise that resolves with the {@link TabInformation}.
         */
        function getTabInstances(tabInstanceParameters) {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)();
                resolve((0, communication_1.sendAndUnwrap)('getTabInstances', tabInstanceParameters));
            });
        }
        tabs.getTabInstances = getTabInstances;
        /**
         * Allows an app to retrieve the most recently used tabs for this user.
         * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
         * @returns Promise that resolves with the {@link TabInformation}.
         */
        function getMruTabInstances(tabInstanceParameters) {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)();
                resolve((0, communication_1.sendAndUnwrap)('getMruTabInstances', tabInstanceParameters));
            });
        }
        tabs.getMruTabInstances = getMruTabInstances;
        /**
         * Checks if pages.tabs capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.pages ? (runtime_1.runtime.supports.pages.tabs ? true : false) : false;
        }
        tabs.isSupported = isSupported;
    })(tabs = pages.tabs || (pages.tabs = {}));
    /**
     * Namespace to interact with the config-specific part of the SDK.
     * This object is usable only on the config frame.
     */
    var config;
    (function (config) {
        var saveHandler;
        var removeHandler;
        function initialize() {
            (0, handlers_1.registerHandler)('settings.save', handleSave, false);
            (0, handlers_1.registerHandler)('settings.remove', handleRemove, false);
        }
        config.initialize = initialize;
        /**
         * Sets the validity state for the config.
         * The initial value is false, so the user cannot save the config until this is called with true.
         * @param validityState Indicates whether the save or remove button is enabled for the user.
         */
        function setValidityState(validityState) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.settings, constants_1.FrameContexts.remove);
            (0, communication_1.sendMessageToParent)('settings.setValidityState', [validityState]);
        }
        config.setValidityState = setValidityState;
        /**
         * Sets the config for the current instance.
         * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
         * @param instanceConfig The desired config for this instance.
         * @returns Promise that resolves when the operation has completed.
         */
        function setConfig(instanceConfig) {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.settings, constants_1.FrameContexts.sidePanel);
                resolve((0, communication_1.sendAndHandleStatusAndReason)('settings.setSettings', instanceConfig));
            });
        }
        config.setConfig = setConfig;
        /**
         * Registers a handler for when the user attempts to save the settings. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler The handler to invoke when the user selects the save button.
         */
        function registerOnSaveHandler(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.settings);
            saveHandler = handler;
            handler && (0, communication_1.sendMessageToParent)('registerHandler', ['save']);
        }
        config.registerOnSaveHandler = registerOnSaveHandler;
        /**
         * Registers a handler for user attempts to remove content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to indicate whether to proceed with the removal.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the remove button.
         */
        function registerOnRemoveHandler(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.remove, constants_1.FrameContexts.settings);
            removeHandler = handler;
            handler && (0, communication_1.sendMessageToParent)('registerHandler', ['remove']);
        }
        config.registerOnRemoveHandler = registerOnRemoveHandler;
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
         * Registers a handler for when the user reconfigurated tab
         * @param handler The handler to invoke when the user click on Settings.
         */
        function registerChangeConfigHandler(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, handlers_1.registerHandler)('changeSettings', handler);
        }
        config.registerChangeConfigHandler = registerChangeConfigHandler;
        /**
         * @hidden
         * Hide from docs, since this class is not directly used.
         */
        var SaveEventImpl = /** @class */ (function () {
            function SaveEventImpl(result) {
                this.notified = false;
                this.result = result ? result : {};
            }
            SaveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                (0, communication_1.sendMessageToParent)('settings.save.success');
                this.notified = true;
            };
            SaveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                (0, communication_1.sendMessageToParent)('settings.save.failure', [reason]);
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
         * @hidden
         * Hide from docs, since this class is not directly used.
         */
        var RemoveEventImpl = /** @class */ (function () {
            function RemoveEventImpl() {
                this.notified = false;
            }
            RemoveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                (0, communication_1.sendMessageToParent)('settings.remove.success');
                this.notified = true;
            };
            RemoveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                (0, communication_1.sendMessageToParent)('settings.remove.failure', [reason]);
                this.notified = true;
            };
            RemoveEventImpl.prototype.ensureNotNotified = function () {
                if (this.notified) {
                    throw new Error('The removeEvent may only notify success or failure once.');
                }
            };
            return RemoveEventImpl;
        }());
        /**
         * Checks if pages.config capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.pages ? (runtime_1.runtime.supports.pages.config ? true : false) : false;
        }
        config.isSupported = isSupported;
    })(config = pages.config || (pages.config = {}));
    /**
     * Namespace to interact with the back-stack part of the SDK.
     */
    var backStack;
    (function (backStack) {
        var backButtonPressHandler;
        function _initialize() {
            (0, handlers_1.registerHandler)('backButtonPress', handleBackButtonPress, false);
        }
        backStack._initialize = _initialize;
        /**
         * Navigates back in the hosted app. See registerBackButtonHandler for more information on when
         * it's appropriate to use this method.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateBack() {
            return new Promise(function (resolve) {
                (0, internalAPIs_1.ensureInitialized)();
                var errorMessage = 'Back navigation is not supported in the current client or context.';
                resolve((0, communication_1.sendAndHandleStatusAndReasonWithDefaultError)('navigateBack', errorMessage));
            });
        }
        backStack.navigateBack = navigateBack;
        /**
         * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
         * navigation stack should use this handler to navigate the user back within their frame. If an app finds
         * that after running its back button handler it cannot handle the event it should call the navigateBack
         * method to ask the Teams client to handle it instead.
         * @param handler The handler to invoke when the user presses their Team client's back button.
         */
        function registerBackButtonHandler(handler) {
            backButtonPressHandler = handler;
            handler && (0, communication_1.sendMessageToParent)('registerHandler', ['backButton']);
        }
        backStack.registerBackButtonHandler = registerBackButtonHandler;
        function handleBackButtonPress() {
            if (!backButtonPressHandler || !backButtonPressHandler()) {
                navigateBack();
            }
        }
        /**
         * Checks if pages.backStack capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.pages ? (runtime_1.runtime.supports.pages.backStack ? true : false) : false;
        }
        backStack.isSupported = isSupported;
    })(backStack = pages.backStack || (pages.backStack = {}));
    var fullTrust;
    (function (fullTrust) {
        /**
         * @hidden
         * Hide from docs
         * ------
         * Place the tab into full-screen mode.
         */
        function enterFullscreen() {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, communication_1.sendMessageToParent)('enterFullscreen', []);
        }
        fullTrust.enterFullscreen = enterFullscreen;
        /**
         * @hidden
         * Hide from docs
         * ------
         * Reverts the tab into normal-screen mode.
         */
        function exitFullscreen() {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, communication_1.sendMessageToParent)('exitFullscreen', []);
        }
        fullTrust.exitFullscreen = exitFullscreen;
        /**
         * Checks if pages.fullTrust capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.pages ? (runtime_1.runtime.supports.pages.fullTrust ? true : false) : false;
        }
        fullTrust.isSupported = isSupported;
    })(fullTrust = pages.fullTrust || (pages.fullTrust = {}));
    /**
     * Namespace to interact with the app button part of the SDK.
     */
    var appButton;
    (function (appButton) {
        /**
         * Registers a handler for clicking the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
         */
        function onClick(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, handlers_1.registerHandler)('appButtonClick', handler);
        }
        appButton.onClick = onClick;
        /**
         * Registers a handler for entering hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
         */
        function onHoverEnter(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, handlers_1.registerHandler)('appButtonHoverEnter', handler);
        }
        appButton.onHoverEnter = onHoverEnter;
        /**
         * Registers a handler for exiting hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
         */
        function onHoverLeave(handler) {
            (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
            (0, handlers_1.registerHandler)('appButtonHoverLeave', handler);
        }
        appButton.onHoverLeave = onHoverLeave;
        /**
         * Checks if pages.appButton capability is supported currently
         */
        function isSupported() {
            return runtime_1.runtime.supports.pages ? (runtime_1.runtime.supports.pages.appButton ? true : false) : false;
        }
        appButton.isSupported = isSupported;
    })(appButton = pages.appButton || (pages.appButton = {}));
})(pages = exports.pages || (exports.pages = {}));
//# sourceMappingURL=pages.js.map