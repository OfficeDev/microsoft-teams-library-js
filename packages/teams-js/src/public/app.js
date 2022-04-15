"use strict";
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
var communication_1 = require("../internal/communication");
var constants_1 = require("../internal/constants");
var globalVars_1 = require("../internal/globalVars");
var Handlers = require("../internal/handlers"); // Conflict with some names
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var logs_1 = require("../private/logs");
var privateAPIs_1 = require("../private/privateAPIs");
var authentication_1 = require("./authentication");
var constants_2 = require("./constants");
var menus_1 = require("./menus");
var pages_1 = require("./pages");
var runtime_1 = require("./runtime");
var teamsAPIs_1 = require("./teamsAPIs");
/**
 * Namespace to interact with app initialization and lifecycle.
 *
 * @beta
 */
var app;
(function (app) {
    // ::::::::::::::::::::::: MicrosoftTeams client SDK public API ::::::::::::::::::::
    app.Messages = {
        AppLoaded: 'appInitialization.appLoaded',
        Success: 'appInitialization.success',
        Failure: 'appInitialization.failure',
        ExpectedFailure: 'appInitialization.expectedFailure',
    };
    var FailedReason;
    (function (FailedReason) {
        FailedReason["AuthFailed"] = "AuthFailed";
        FailedReason["Timeout"] = "Timeout";
        FailedReason["Other"] = "Other";
    })(FailedReason = app.FailedReason || (app.FailedReason = {}));
    var ExpectedFailureReason;
    (function (ExpectedFailureReason) {
        ExpectedFailureReason["PermissionError"] = "PermissionError";
        ExpectedFailureReason["NotFound"] = "NotFound";
        ExpectedFailureReason["Throttling"] = "Throttling";
        ExpectedFailureReason["Offline"] = "Offline";
        ExpectedFailureReason["Other"] = "Other";
    })(ExpectedFailureReason = app.ExpectedFailureReason || (app.ExpectedFailureReason = {}));
    /**
     * Checks whether the Teams client SDK has been initialized.
     * @returns whether the Teams client SDK has been initialized.
     */
    function isInitialized() {
        return globalVars_1.GlobalVars.initializeCalled;
    }
    app.isInitialized = isInitialized;
    /**
     * Gets the Frame Context that the App is running in. {@see FrameContexts} for the list of possible values.
     * @returns the Frame Context.
     */
    function getFrameContext() {
        return globalVars_1.GlobalVars.frameContext;
    }
    app.getFrameContext = getFrameContext;
    /**
     * Number of milliseconds we'll give the initialization call to return before timing it out
     */
    var initializationTimeoutInMs = 5000;
    /**
     * Initializes the library.
     *
     * @remarks
     * This must be called before any other SDK calls
     * but after the frame is loaded successfully.
     *
     * @param validMessageOrigins - Optionally specify a list of cross frame message origins. They must have
     * https: protocol otherwise they will be ignored. Example: https:www.example.com
     * @returns Promise that will be fulfilled when initialization has completed, or rejected if the initialization fails or times out
     */
    function initialize(validMessageOrigins) {
        return (0, utils_1.runWithTimeout)(function () { return initializeHelper(validMessageOrigins); }, initializationTimeoutInMs, new Error('SDK initialization timed out.'));
    }
    app.initialize = initialize;
    function initializeHelper(validMessageOrigins) {
        return new Promise(function (resolve) {
            // Independent components might not know whether the SDK is initialized so might call it to be safe.
            // Just no-op if that happens to make it easier to use.
            if (!globalVars_1.GlobalVars.initializeCalled) {
                globalVars_1.GlobalVars.initializeCalled = true;
                Handlers.initializeHandlers();
                globalVars_1.GlobalVars.initializePromise = (0, communication_1.initializeCommunication)(validMessageOrigins).then(function (_a) {
                    var context = _a.context, clientType = _a.clientType, runtimeConfig = _a.runtimeConfig, _b = _a.clientSupportedSDKVersion, clientSupportedSDKVersion = _b === void 0 ? constants_1.defaultSDKVersionForCompatCheck : _b;
                    globalVars_1.GlobalVars.frameContext = context;
                    globalVars_1.GlobalVars.hostClientType = clientType;
                    globalVars_1.GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;
                    // Temporary workaround while the Host is updated with the new argument order.
                    // For now, we might receive any of these possibilities:
                    // - `runtimeConfig` in `runtimeConfig` and `clientSupportedSDKVersion` in `clientSupportedSDKVersion`.
                    // - `runtimeConfig` in `clientSupportedSDKVersion` and `clientSupportedSDKVersion` in `runtimeConfig`.
                    // - `clientSupportedSDKVersion` in `runtimeConfig` and no `clientSupportedSDKVersion`.
                    // This code supports any of these possibilities
                    // Teams AppHost won't provide this runtime config
                    // so we assume that if we don't have it, we must be running in Teams.
                    // After Teams updates its client code, we can remove this default code.
                    try {
                        var givenRuntimeConfig = JSON.parse(runtimeConfig);
                        // Check that givenRuntimeConfig is a valid instance of IRuntimeConfig
                        if (!givenRuntimeConfig || !givenRuntimeConfig.apiVersion) {
                            throw new Error('Received runtime config is invalid');
                        }
                        runtimeConfig && (0, runtime_1.applyRuntimeConfig)(givenRuntimeConfig);
                    }
                    catch (e) {
                        if (e instanceof SyntaxError) {
                            try {
                                // if the given runtime config was actually meant to be a SDK version, store it as such.
                                // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                                // it doesn't provide the runtimeConfig. After Teams updates its client code, we should
                                // remove this feature.
                                if (!isNaN((0, utils_1.compareSDKVersions)(runtimeConfig, constants_1.defaultSDKVersionForCompatCheck))) {
                                    globalVars_1.GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                                }
                                var givenRuntimeConfig = JSON.parse(clientSupportedSDKVersion);
                                clientSupportedSDKVersion && (0, runtime_1.applyRuntimeConfig)(givenRuntimeConfig);
                            }
                            catch (e) {
                                if (e instanceof SyntaxError) {
                                    (0, runtime_1.applyRuntimeConfig)((0, runtime_1.generateBackCompatRuntimeConfig)(globalVars_1.GlobalVars.clientSupportedSDKVersion));
                                }
                                else {
                                    throw e;
                                }
                            }
                        }
                        else {
                            // If it's any error that's not a JSON parsing error, we want the program to fail.
                            throw e;
                        }
                    }
                    globalVars_1.GlobalVars.initializeCompleted = true;
                });
                authentication_1.authentication.initialize();
                menus_1.menus.initialize();
                pages_1.pages.config.initialize();
                (0, privateAPIs_1.initializePrivateApis)();
            }
            // Handle additional valid message origins if specified
            if (Array.isArray(validMessageOrigins)) {
                (0, internalAPIs_1.processAdditionalValidOrigins)(validMessageOrigins);
            }
            resolve(globalVars_1.GlobalVars.initializePromise);
        });
    }
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Undocumented function used to set a mock window for unit tests
     *
     * @internal
     */
    function _initialize(hostWindow) {
        communication_1.Communication.currentWindow = hostWindow;
    }
    app._initialize = _initialize;
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Undocumented function used to clear state between unit tests
     *
     * @internal
     */
    function _uninitialize() {
        if (!globalVars_1.GlobalVars.initializeCalled) {
            return;
        }
        if (globalVars_1.GlobalVars.frameContext) {
            registerOnThemeChangeHandler(null);
            pages_1.pages.backStack.registerBackButtonHandler(null);
            pages_1.pages.registerFullScreenHandler(null);
            teamsAPIs_1.teamsCore.registerBeforeUnloadHandler(null);
            teamsAPIs_1.teamsCore.registerOnLoadHandler(null);
            logs_1.logs.registerGetLogHandler(null);
        }
        if (globalVars_1.GlobalVars.frameContext === constants_2.FrameContexts.settings) {
            pages_1.pages.config.registerOnSaveHandler(null);
        }
        if (globalVars_1.GlobalVars.frameContext === constants_2.FrameContexts.remove) {
            pages_1.pages.config.registerOnRemoveHandler(null);
        }
        globalVars_1.GlobalVars.initializeCalled = false;
        globalVars_1.GlobalVars.initializeCompleted = false;
        globalVars_1.GlobalVars.initializePromise = null;
        globalVars_1.GlobalVars.additionalValidOrigins = [];
        globalVars_1.GlobalVars.frameContext = null;
        globalVars_1.GlobalVars.hostClientType = null;
        globalVars_1.GlobalVars.isFramelessWindow = false;
        (0, communication_1.uninitializeCommunication)();
    }
    app._uninitialize = _uninitialize;
    /**
     * Retrieves the current context the frame is running in.
     *
     * @returns Promise that will resolve with the {@link Context} object.
     */
    function getContext() {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)();
            resolve((0, communication_1.sendAndUnwrap)('getContext'));
        }).then(function (legacyContext) { return transformLegacyContextToAppContext(legacyContext); }); // converts globalcontext to app.context
    }
    app.getContext = getContext;
    /**
     * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
     */
    function notifyAppLoaded() {
        (0, internalAPIs_1.ensureInitialized)();
        (0, communication_1.sendMessageToParent)(app.Messages.AppLoaded, [constants_1.version]);
    }
    app.notifyAppLoaded = notifyAppLoaded;
    /**
     * Notifies the frame that app initialization is successful and is ready for user interaction.
     */
    function notifySuccess() {
        (0, internalAPIs_1.ensureInitialized)();
        (0, communication_1.sendMessageToParent)(app.Messages.Success, [constants_1.version]);
    }
    app.notifySuccess = notifySuccess;
    /**
     * Notifies the frame that app initialization has failed and to show an error page in its place.
     */
    function notifyFailure(appInitializationFailedRequest) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, communication_1.sendMessageToParent)(app.Messages.Failure, [
            appInitializationFailedRequest.reason,
            appInitializationFailedRequest.message,
        ]);
    }
    app.notifyFailure = notifyFailure;
    /**
     * Notifies the frame that app initialized with some expected errors.
     */
    function notifyExpectedFailure(expectedFailureRequest) {
        (0, internalAPIs_1.ensureInitialized)();
        (0, communication_1.sendMessageToParent)(app.Messages.ExpectedFailure, [expectedFailureRequest.reason, expectedFailureRequest.message]);
    }
    app.notifyExpectedFailure = notifyExpectedFailure;
    /**
     * Registers a handler for theme changes.
     *
     * @remarks
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the user changes their theme.
     */
    function registerOnThemeChangeHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        Handlers.registerOnThemeChangeHandler(handler);
    }
    app.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
    /**
     * open link API.
     *
     * @param deepLink - deep link.
     * @returns Promise that will be fulfilled when the operation has completed
     */
    function openLink(deepLink) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(constants_2.FrameContexts.content, constants_2.FrameContexts.sidePanel, constants_2.FrameContexts.settings, constants_2.FrameContexts.task, constants_2.FrameContexts.stage, constants_2.FrameContexts.meetingStage);
            resolve((0, communication_1.sendAndHandleStatusAndReason)('executeDeepLink', deepLink));
        });
    }
    app.openLink = openLink;
})(app = exports.app || (exports.app = {}));
/**
 * @hidden
 * Transforms the Legacy Context object received from Messages to the structured app.Context object
 *
 * @internal
 */
function transformLegacyContextToAppContext(legacyContext) {
    var context = {
        app: {
            locale: legacyContext.locale,
            sessionId: legacyContext.appSessionId ? legacyContext.appSessionId : '',
            theme: legacyContext.theme ? legacyContext.theme : 'default',
            iconPositionVertical: legacyContext.appIconPosition,
            osLocaleInfo: legacyContext.osLocaleInfo,
            parentMessageId: legacyContext.parentMessageId,
            userClickTime: legacyContext.userClickTime,
            userFileOpenPreference: legacyContext.userFileOpenPreference,
            host: {
                name: legacyContext.hostName ? legacyContext.hostName : constants_2.HostName.teams,
                clientType: legacyContext.hostClientType ? legacyContext.hostClientType : constants_2.HostClientType.web,
                sessionId: legacyContext.sessionId ? legacyContext.sessionId : '',
                ringId: legacyContext.ringId,
            },
            appLaunchId: legacyContext.appLaunchId,
        },
        page: {
            id: legacyContext.entityId,
            frameContext: legacyContext.frameContext ? legacyContext.frameContext : globalVars_1.GlobalVars.frameContext,
            subPageId: legacyContext.subEntityId,
            isFullScreen: legacyContext.isFullScreen,
            isMultiWindow: legacyContext.isMultiWindow,
            sourceOrigin: legacyContext.sourceOrigin,
        },
        user: {
            id: legacyContext.userObjectId,
            displayName: legacyContext.userDisplayName,
            isCallingAllowed: legacyContext.isCallingAllowed,
            isPSTNCallingAllowed: legacyContext.isPSTNCallingAllowed,
            licenseType: legacyContext.userLicenseType,
            loginHint: legacyContext.loginHint,
            userPrincipalName: legacyContext.userPrincipalName,
            tenant: legacyContext.tid
                ? {
                    id: legacyContext.tid,
                    teamsSku: legacyContext.tenantSKU,
                }
                : undefined,
        },
        channel: legacyContext.channelId
            ? {
                id: legacyContext.channelId,
                displayName: legacyContext.channelName,
                relativeUrl: legacyContext.channelRelativeUrl,
                membershipType: legacyContext.channelType,
                defaultOneNoteSectionId: legacyContext.defaultOneNoteSectionId,
                ownerGroupId: legacyContext.hostTeamGroupId,
                ownerTenantId: legacyContext.hostTeamTenantId,
            }
            : undefined,
        chat: legacyContext.chatId
            ? {
                id: legacyContext.chatId,
            }
            : undefined,
        meeting: legacyContext.meetingId
            ? {
                id: legacyContext.meetingId,
            }
            : undefined,
        sharepoint: legacyContext.sharepoint,
        team: legacyContext.teamId
            ? {
                internalId: legacyContext.teamId,
                displayName: legacyContext.teamName,
                type: legacyContext.teamType,
                groupId: legacyContext.groupId,
                templateId: legacyContext.teamTemplateId,
                isArchived: legacyContext.isTeamArchived,
                userRole: legacyContext.userTeamRole,
            }
            : undefined,
        sharePointSite: legacyContext.teamSiteUrl ||
            legacyContext.teamSiteDomain ||
            legacyContext.teamSitePath ||
            legacyContext.mySitePath ||
            legacyContext.mySiteDomain
            ? {
                teamSiteUrl: legacyContext.teamSiteUrl,
                teamSiteDomain: legacyContext.teamSiteDomain,
                teamSitePath: legacyContext.teamSitePath,
                teamSiteId: legacyContext.teamSiteId,
                mySitePath: legacyContext.mySitePath,
                mySiteDomain: legacyContext.mySiteDomain,
            }
            : undefined,
    };
    return context;
}
//# sourceMappingURL=app.js.map