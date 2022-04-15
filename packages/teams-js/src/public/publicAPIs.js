"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeWithFrameContext = exports.setFrameContext = exports.executeDeepLink = exports.shareDeepLink = exports.getMruTabInstances = exports.getTabInstances = exports.registerEnterSettingsHandler = exports.registerFocusEnterHandler = exports.registerBeforeUnloadHandler = exports.registerOnLoadHandler = exports.registerBackButtonHandler = exports.registerAppButtonHoverLeaveHandler = exports.registerAppButtonHoverEnterHandler = exports.registerAppButtonClickHandler = exports.registerFullScreenHandler = exports.registerOnThemeChangeHandler = exports.getContext = exports.print = exports.enablePrintCapability = exports._uninitialize = exports._initialize = exports.initialize = void 0;
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var app_1 = require("./app");
var constants_1 = require("./constants");
var pages_1 = require("./pages");
var teamsAPIs_1 = require("./teamsAPIs");
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app.initialize app.initialize(validMessageOrigins?: string[]): Promise\<void\>} instead.
 *
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback - Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins - Optionally specify a list of cross frame message origins. There must have
 * https: protocol otherwise they will be ignored. Example: https://www.example.com
 */
function initialize(callback, validMessageOrigins) {
    app_1.app.initialize(validMessageOrigins).then(function () {
        if (callback) {
            callback();
        }
    });
}
exports.initialize = initialize;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app._initialize app._initialize(hostWindow: any): void} instead.
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to set a mock window for unit tests
 *
 * @internal
 */
// eslint-disable-next-line
function _initialize(hostWindow) {
    app_1.app._initialize(hostWindow);
}
exports._initialize = _initialize;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app._uninitialize app._uninitialize(): void} instead.
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 *
 * @internal
 */
function _uninitialize() {
    app_1.app._uninitialize();
}
exports._uninitialize = _uninitialize;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link teamsCore.enablePrintCapability teamsCore.enablePrintCapability(): void} instead.
 *
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
function enablePrintCapability() {
    teamsAPIs_1.teamsCore.enablePrintCapability();
}
exports.enablePrintCapability = enablePrintCapability;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link teamsCore.print teamsCore.print(): void} instead.
 *
 * Default print handler
 */
function print() {
    teamsAPIs_1.teamsCore.print();
}
exports.print = print;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app.getContext app.getContext(): Promise\<app.Context\>} instead.
 *
 * Retrieves the current context the frame is running in.
 *
 * @param callback - The callback to invoke when the {@link Context} object is retrieved.
 */
function getContext(callback) {
    (0, internalAPIs_1.ensureInitialized)();
    app_1.app.getContext().then(function (context) {
        if (callback) {
            callback(transformAppContextToLegacyContext(context));
        }
    });
}
exports.getContext = getContext;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app.registerOnThemeChangeHandler app.registerOnThemeChangeHandler(handler: (theme: string) => void): void} instead.
 *
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
function registerOnThemeChangeHandler(handler) {
    app_1.app.registerOnThemeChangeHandler(handler);
}
exports.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.registerFullScreenHandler pages.registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void} instead.
 *
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
function registerFullScreenHandler(handler) {
    pages_1.pages.registerFullScreenHandler(handler);
}
exports.registerFullScreenHandler = registerFullScreenHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.appButton.onClick pages.appButton.onClick(handler: () => void): void} instead.
 *
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
function registerAppButtonClickHandler(handler) {
    pages_1.pages.appButton.onClick(handler);
}
exports.registerAppButtonClickHandler = registerAppButtonClickHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.appButton.onHoverEnter pages.appButton.onHoverEnter(handler: () => void): void} instead.
 *
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
function registerAppButtonHoverEnterHandler(handler) {
    pages_1.pages.appButton.onHoverEnter(handler);
}
exports.registerAppButtonHoverEnterHandler = registerAppButtonHoverEnterHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.appButton.onHoverLeave pages.appButton.onHoverLeave(handler: () => void): void} instead.
 *
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 *
 */
function registerAppButtonHoverLeaveHandler(handler) {
    pages_1.pages.appButton.onHoverLeave(handler);
}
exports.registerAppButtonHoverLeaveHandler = registerAppButtonHoverLeaveHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.backStack.registerBackButtonHandler pages.backStack.registerBackButtonHandler(handler: () => boolean): void} instead.
 *
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 *
 * @param handler - The handler to invoke when the user presses their Team client's back button.
 */
function registerBackButtonHandler(handler) {
    pages_1.pages.backStack.registerBackButtonHandler(handler);
}
exports.registerBackButtonHandler = registerBackButtonHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link teamsCore.registerOnLoadHandler teamsCore.registerOnLoadHandler(handler: (context: LoadContext) => void): void} instead.
 *
 * @hidden
 * Registers a handler to be called when the page has been requested to load.
 *
 * @param handler - The handler to invoke when the page is loaded.
 */
function registerOnLoadHandler(handler) {
    teamsAPIs_1.teamsCore.registerOnLoadHandler(handler);
}
exports.registerOnLoadHandler = registerOnLoadHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link teamsCore.registerBeforeUnloadHandler teamsCore.registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void} instead.
 *
 * @hidden
 * Registers a handler to be called before the page is unloaded.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
function registerBeforeUnloadHandler(handler) {
    teamsAPIs_1.teamsCore.registerBeforeUnloadHandler(handler);
}
exports.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.3, please use {@link pages.registerFocusEnterHandler pages.registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void} instead.
 *
 * @hidden
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 *
 * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
function registerFocusEnterHandler(handler) {
    pages_1.pages.registerFocusEnterHandler(handler);
}
exports.registerFocusEnterHandler = registerFocusEnterHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.config.registerChangeConfigHandler pages.config.registerChangeConfigHandler(handler: () => void): void} instead.
 *
 * Registers a handler for when the user reconfigurated tab.
 *
 * @param handler - The handler to invoke when the user click on Settings.
 */
function registerEnterSettingsHandler(handler) {
    pages_1.pages.config.registerChangeConfigHandler(handler);
}
exports.registerEnterSettingsHandler = registerEnterSettingsHandler;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.tabs.getTabInstances pages.tabs.getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 *
 * @param callback - The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
function getTabInstances(callback, tabInstanceParameters) {
    (0, internalAPIs_1.ensureInitialized)();
    pages_1.pages.tabs.getTabInstances(tabInstanceParameters).then(function (tabInfo) {
        callback(tabInfo);
    });
}
exports.getTabInstances = getTabInstances;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.tabs.getMruTabInstances pages.tabs.getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve the most recently used tabs for this user.
 *
 * @param callback - The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Ignored, kept for future use
 */
function getMruTabInstances(callback, tabInstanceParameters) {
    (0, internalAPIs_1.ensureInitialized)();
    pages_1.pages.tabs.getMruTabInstances(tabInstanceParameters).then(function (tabInfo) {
        callback(tabInfo);
    });
}
exports.getMruTabInstances = getMruTabInstances;
/**
 * @deprecated
 * As of 2.0.0-beta.3, please use {@link pages.shareDeepLink pages.shareDeepLink(deepLinkParameters: DeepLinkParameters): void} instead.
 *
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
function shareDeepLink(deepLinkParameters) {
    pages_1.pages.shareDeepLink(deepLinkParameters);
}
exports.shareDeepLink = shareDeepLink;
/**
 * @deprecated
 * As of 2.0.0-beta.3, please use {@link app.openLink core.openLink(deepLink: string): Promise\<void\>} instead.
 *
 * Execute deep link API.
 *
 * @param deepLink - deep link.
 */
function executeDeepLink(deepLink, onComplete) {
    (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
    onComplete = onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)();
    app_1.app
        .openLink(deepLink)
        .then(function () {
        onComplete(true);
    })
        .catch(function (err) {
        onComplete(false, err.message);
    });
}
exports.executeDeepLink = executeDeepLink;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.setCurrentFrame pages.setCurrentFrame(frameInfo: FrameInfo): void} instead.
 *
 * Set the current Frame Context
 *
 * @param frameContext - FrameContext information to be set
 */
function setFrameContext(frameContext) {
    pages_1.pages.setCurrentFrame(frameContext);
}
exports.setFrameContext = setFrameContext;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.initializeWithFrameContext pages.initializeWithFrameContext(frameInfo: FrameInfo, callback?: () => void, validMessageOrigins?: string[],): void} instead.
 *
 * Initilize with FrameContext
 *
 * @param frameContext - FrameContext information to be set
 * @param callback - The optional callback to be invoked be invoked after initilizing the frame context
 * @param validMessageOrigins -  Optionally specify a list of cross frame message origins.
 * They must have https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
function initializeWithFrameContext(frameContext, callback, validMessageOrigins) {
    pages_1.pages.initializeWithFrameContext(frameContext, callback, validMessageOrigins);
}
exports.initializeWithFrameContext = initializeWithFrameContext;
/**
 * Transforms the app.Context object received to TeamsJS Context
 */
function transformAppContextToLegacyContext(appContext) {
    var context = {
        // app
        locale: appContext.app.locale,
        appSessionId: appContext.app.sessionId,
        theme: appContext.app.theme,
        appIconPosition: appContext.app.iconPositionVertical,
        osLocaleInfo: appContext.app.osLocaleInfo,
        parentMessageId: appContext.app.parentMessageId,
        userClickTime: appContext.app.userClickTime,
        userFileOpenPreference: appContext.app.userFileOpenPreference,
        appLaunchId: appContext.app.appLaunchId,
        // app.host
        hostClientType: appContext.app.host.clientType,
        sessionId: appContext.app.host.sessionId,
        ringId: appContext.app.host.ringId,
        // page
        entityId: appContext.page.id,
        frameContext: appContext.page.frameContext,
        subEntityId: appContext.page.subPageId,
        isFullScreen: appContext.page.isFullScreen,
        isMultiWindow: appContext.page.isMultiWindow,
        sourceOrigin: appContext.page.sourceOrigin,
        // user
        userObjectId: appContext.user !== undefined ? appContext.user.id : undefined,
        isCallingAllowed: appContext.user !== undefined ? appContext.user.isCallingAllowed : undefined,
        isPSTNCallingAllowed: appContext.user !== undefined ? appContext.user.isPSTNCallingAllowed : undefined,
        userLicenseType: appContext.user !== undefined ? appContext.user.licenseType : undefined,
        loginHint: appContext.user !== undefined ? appContext.user.loginHint : undefined,
        userPrincipalName: appContext.user !== undefined ? appContext.user.userPrincipalName : undefined,
        // user.tenant
        tid: appContext.user !== undefined
            ? appContext.user.tenant !== undefined
                ? appContext.user.tenant.id
                : undefined
            : undefined,
        tenantSKU: appContext.user !== undefined
            ? appContext.user.tenant !== undefined
                ? appContext.user.tenant.teamsSku
                : undefined
            : undefined,
        // channel
        channelId: appContext.channel !== undefined ? appContext.channel.id : undefined,
        channelName: appContext.channel !== undefined ? appContext.channel.displayName : undefined,
        channelRelativeUrl: appContext.channel !== undefined ? appContext.channel.relativeUrl : undefined,
        channelType: appContext.channel !== undefined ? appContext.channel.membershipType : undefined,
        defaultOneNoteSectionId: appContext.channel !== undefined ? appContext.channel.defaultOneNoteSectionId : undefined,
        hostTeamGroupId: appContext.channel !== undefined ? appContext.channel.ownerGroupId : undefined,
        hostTeamTenantId: appContext.channel !== undefined ? appContext.channel.ownerTenantId : undefined,
        // chat
        chatId: appContext.chat !== undefined ? appContext.chat.id : undefined,
        // meeting
        meetingId: appContext.meeting !== undefined ? appContext.meeting.id : undefined,
        // sharepoint
        sharepoint: appContext.sharepoint,
        // team
        teamId: appContext.team !== undefined ? appContext.team.internalId : undefined,
        teamName: appContext.team !== undefined ? appContext.team.displayName : undefined,
        teamType: appContext.team !== undefined ? appContext.team.type : undefined,
        groupId: appContext.team !== undefined ? appContext.team.groupId : undefined,
        teamTemplateId: appContext.team !== undefined ? appContext.team.templateId : undefined,
        isTeamArchived: appContext.team !== undefined ? appContext.team.isArchived : undefined,
        userTeamRole: appContext.team !== undefined ? appContext.team.userRole : undefined,
        // sharepointSite
        teamSiteUrl: appContext.sharePointSite !== undefined ? appContext.sharePointSite.teamSiteUrl : undefined,
        teamSiteDomain: appContext.sharePointSite !== undefined ? appContext.sharePointSite.teamSiteDomain : undefined,
        teamSitePath: appContext.sharePointSite !== undefined ? appContext.sharePointSite.teamSitePath : undefined,
        teamSiteId: appContext.sharePointSite !== undefined ? appContext.sharePointSite.teamSiteId : undefined,
        mySitePath: appContext.sharePointSite !== undefined ? appContext.sharePointSite.mySitePath : undefined,
        mySiteDomain: appContext.sharePointSite !== undefined ? appContext.sharePointSite.mySiteDomain : undefined,
    };
    return context;
}
//# sourceMappingURL=publicAPIs.js.map