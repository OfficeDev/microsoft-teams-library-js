import { sendMessageToParent } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandlerHelper } from '../internal/handlers';
import { ensureInitializeCalled, ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { appInitializeHelper, openLinkHelper, registerOnThemeChangeHandlerHelper } from './app';
import { FrameContexts } from './constants';
import {
  Context,
  DeepLinkParameters,
  FrameContext,
  LoadContext,
  TabInformation,
  TabInstanceParameters,
} from './interfaces';
import { getMruTabInstancesHelper, getTabInstancesHelper, setCurrentFrameHelper, shareDeepLinkHelper } from './pages';
import { pages } from './pages';
import { runtime } from './runtime';
import { teamsCore } from './teamsAPIs';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const publicAPIsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/** Type of callback used to indicate when {@link executeDeepLink} completes */
export type executeDeepLinkOnCompleteFunctionType = (status: boolean, reason?: string) => void;
/** Callback function type */
export type callbackFunctionType = () => void;
/** Get context callback function type */
export type getContextCallbackFunctionType = (context: Context) => void;
/** Get tab instances callback function type */
export type getTabInstancesCallbackFunctionType = (tabInfo: TabInformation) => void;
/** Register back button handler function type */
export type registerBackButtonHandlerFunctionType = () => boolean;
/** Register full screen handler function type */
export type registerFullScreenHandlerFunctionType = (isFullScreen: boolean) => void;
/** Register on theme change handler function type */
export type registerOnThemeChangeHandlerFunctionType = (theme: string) => void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.initialize app.initialize(validMessageOrigins?: string[]): Promise\<void\>} instead.
 *
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback - Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins - Optionally specify a list of cross-frame message origins. This parameter is used if you know that your app
 * will be hosted on a custom domain (i.e., not a standard Microsoft 365 host like Teams, Outlook, etc.) Most apps will never need
 * to pass a value for this parameter.
 * Any domains passed in the array must have the https: protocol on the string otherwise they will be ignored. Example: https://www.example.com
 */
export function initialize(callback?: callbackFunctionType, validMessageOrigins?: string[]): void {
  appInitializeHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_Initialize),
    validMessageOrigins,
  ).then(() => {
    if (callback) {
      callback();
    }
  });
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.enablePrintCapability teamsCore.enablePrintCapability(): void} instead.
 *
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export function enablePrintCapability(): void {
  teamsCore.enablePrintCapability();
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.print teamsCore.print(): void} instead.
 *
 * Default print handler
 */
export function print(): void {
  teamsCore.print();
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.getContext app.getContext(): Promise\<app.Context\>} instead.
 *
 * Retrieves the current context the frame is running in.
 *
 * @param callback - The callback to invoke when the {@link Context} object is retrieved.
 */
export function getContext(callback: getContextCallbackFunctionType): void {
  ensureInitializeCalled();
  sendMessageToParent(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_GetContext),
    'getContext',
    (context: Context) => {
      if (!context.frameContext) {
        // Fallback logic for frameContext properties
        context.frameContext = GlobalVars.frameContext;
      }
      callback(context);
    },
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.registerOnThemeChangeHandler app.registerOnThemeChangeHandler(handler: registerOnThemeChangeHandlerFunctionType): void} instead.
 *
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(handler: registerOnThemeChangeHandlerFunctionType): void {
  registerOnThemeChangeHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterOnThemeChangeHandlerHelper),
    handler,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.registerFullScreenHandler pages.registerFullScreenHandler(handler: registerFullScreenHandlerFunctionType): void} instead.
 *
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(handler: registerFullScreenHandlerFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterFullScreenHandler),
    'fullScreenChange',
    handler,
    [],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onClick pages.appButton.onClick(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
export function registerAppButtonClickHandler(handler: callbackFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterAppButtonClickHandler),
    'appButtonClick',
    handler,
    [FrameContexts.content],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onHoverEnter pages.appButton.onHoverEnter(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverEnterHandler(handler: callbackFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterAppButtonHoverEnterHandler),
    'appButtonHoverEnter',
    handler,
    [FrameContexts.content],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onHoverLeave pages.appButton.onHoverLeave(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 *
 */
export function registerAppButtonHoverLeaveHandler(handler: callbackFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterAppButtonHoverLeaveHandler),
    'appButtonHoverLeave',
    handler,
    [FrameContexts.content],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.backStack.registerBackButtonHandler pages.backStack.registerBackButtonHandler(handler: registerBackButtonHandlerFunctionType): void} instead.
 *
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 *
 * @param handler - The handler to invoke when the user presses their Team client's back button.
 */
export function registerBackButtonHandler(handler: registerBackButtonHandlerFunctionType): void {
  pages.backStack.registerBackButtonHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterBackButtonHandler),
    handler,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.registerOnLoadHandler teamsCore.registerOnLoadHandler(handler: (context: LoadContext) => void): void} instead.
 *
 * @hidden
 * Registers a handler to be called when the page has been requested to load.
 *
 * @param handler - The handler to invoke when the page is loaded.
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  teamsCore.registerOnLoadHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterOnLoadHandler),
    handler,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.registerBeforeUnloadHandler teamsCore.registerBeforeUnloadHandler(handler: (readyToUnload: callbackFunctionType) => boolean): void} instead.
 *
 * @hidden
 * Registers a handler to be called before the page is unloaded.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: callbackFunctionType) => boolean): void {
  teamsCore.registerBeforeUnloadHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterBeforeUnloadHandler),
    handler,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.registerFocusEnterHandler pages.registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void} instead.
 *
 * @hidden
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 *
 * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
export function registerFocusEnterHandler(handler: (navigateForward: boolean) => boolean): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterFocusEnterHandler),
    'focusEnter',
    handler,
    [],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.registerChangeConfigHandler pages.config.registerChangeConfigHandler(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for when the user reconfigurated tab.
 *
 * @param handler - The handler to invoke when the user click on Settings.
 */
export function registerChangeSettingsHandler(handler: callbackFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_RegisterChangeSettingsHandler),
    'changeSettings',
    handler,
    [FrameContexts.content],
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.getTabInstances pages.tabs.getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 *
 * @param callback - The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export function getTabInstances(
  callback: getTabInstancesCallbackFunctionType,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized(runtime);
  getTabInstancesHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_GetTabInstances),
    tabInstanceParameters,
  ).then((tabInfo: TabInformation) => {
    callback(tabInfo);
  });
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.getMruTabInstances pages.tabs.getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve the most recently used tabs for this user.
 *
 * @param callback - The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Ignored, kept for future use
 */
export function getMruTabInstances(
  callback: getTabInstancesCallbackFunctionType,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized(runtime);
  getMruTabInstancesHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_GetMruTabInstances),
    tabInstanceParameters,
  ).then((tabInfo: TabInformation) => {
    callback(tabInfo);
  });
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.shareDeepLink pages.shareDeepLink(deepLinkParameters: DeepLinkParameters): void} instead.
 *
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
  shareDeepLinkHelper(getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_ShareDeepLink), {
    subPageId: deepLinkParameters.subEntityId,
    subPageLabel: deepLinkParameters.subEntityLabel,
    subPageWebUrl: deepLinkParameters.subEntityWebUrl,
  });
}

/**
 * @deprecated
 * This function was previously used for opening various types of links. As of TeamsJS v2.0.0, it has been replaced with multiple different
 * functions depending on the type of link:
 *
 * - Use {@link pages.currentApp.navigateToDefaultPage} to navigate to the default page of your own app
 * - Use {@link pages.currentApp.navigateTo} to navigate to a section of your own app
 * - Use {@link pages.navigateToApp} to navigate to other apps besides your own
 * - Use {@link app.openLink} for opening deep links to other parts of the host (e.g., to chats or channels) or
 * general-purpose links (e.g., to external websites).
 *
 * @param deepLink deep link.
 */
export function executeDeepLink(deepLink: string, onComplete?: executeDeepLinkOnCompleteFunctionType): void {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  );
  const completionHandler: executeDeepLinkOnCompleteFunctionType = onComplete ?? getGenericOnCompleteHandler();
  openLinkHelper(getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_ExecuteDeepLink), deepLink)
    .then(() => {
      completionHandler(true);
    })
    .catch((err: Error) => {
      completionHandler(false, err.message);
    });
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.setCurrentFrame pages.setCurrentFrame(frameInfo: FrameInfo): void} instead.
 *
 * Set the current Frame Context
 *
 * @param frameContext - FrameContext information to be set
 */
export function setFrameContext(frameContext: FrameContext): void {
  setCurrentFrameHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_SetFrameContext),
    frameContext,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.initializeWithFrameContext pages.initializeWithFrameContext(frameInfo: FrameInfo, callback?: callbackFunctionType, validMessageOrigins?: string[],): void} instead.
 *
 * Initialize with FrameContext
 *
 * @param frameContext - FrameContext information to be set
 * @param callback - The optional callback to be invoked be invoked after initilizing the frame context
 * @param validMessageOrigins -  Optionally specify a list of cross frame message origins.
 * They must have https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
export function initializeWithFrameContext(
  frameContext: FrameContext,
  callback?: callbackFunctionType,
  validMessageOrigins?: string[],
): void {
  appInitializeHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_InitializeWithFrameContext),
    validMessageOrigins,
  ).then(() => callback && callback());
  setCurrentFrameHelper(
    getApiVersionTag(publicAPIsTelemetryVersionNumber, ApiName.PublicAPIs_SetFrameContext),
    frameContext,
  );
}
