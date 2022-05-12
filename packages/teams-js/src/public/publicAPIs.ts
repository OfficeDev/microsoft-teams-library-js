import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { app } from './app';
import { FrameContexts } from './constants';
import {
  Context,
  DeepLinkParameters,
  FrameContext,
  LoadContext,
  TabInformation,
  TabInstanceParameters,
} from './interfaces';
import { pages } from './pages';
import { teamsCore } from './teamsAPIs';

/**
 * @deprecated
 * As of 2.0.0, please use {@link app.initialize app.initialize(validMessageOrigins?: string[]): Promise\<void\>} instead.
 *
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback - Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins - Optionally specify a list of cross frame message origins. There must have
 * https: protocol otherwise they will be ignored. Example: https://www.example.com
 */
export function initialize(callback?: () => void, validMessageOrigins?: string[]): void {
  app.initialize(validMessageOrigins).then(() => {
    if (callback) {
      callback();
    }
  });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app._initialize app._initialize(hostWindow: any): void} instead.
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to set a mock window for unit tests
 *
 * @internal
 */
// eslint-disable-next-line
export function _initialize(hostWindow: any): void {
  app._initialize(hostWindow);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app._uninitialize app._uninitialize(): void} instead.
 *
 * @hidden
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 *
 * @internal
 */
export function _uninitialize(): void {
  app._uninitialize();
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link teamsCore.enablePrintCapability teamsCore.enablePrintCapability(): void} instead.
 *
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export function enablePrintCapability(): void {
  teamsCore.enablePrintCapability();
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link teamsCore.print teamsCore.print(): void} instead.
 *
 * Default print handler
 */
export function print(): void {
  teamsCore.print();
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app.getContext app.getContext(): Promise\<app.Context\>} instead.
 *
 * Retrieves the current context the frame is running in.
 *
 * @param callback - The callback to invoke when the {@link Context} object is retrieved.
 */
export function getContext(callback: (context: Context) => void): void {
  ensureInitialized();
  app.getContext().then((context: app.Context) => {
    if (callback) {
      callback(transformAppContextToLegacyContext(context));
    }
  });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app.registerOnThemeChangeHandler app.registerOnThemeChangeHandler(handler: (theme: string) => void): void} instead.
 *
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  app.registerOnThemeChangeHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.registerFullScreenHandler pages.registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void} instead.
 *
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
  pages.registerFullScreenHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.appButton.onClick pages.appButton.onClick(handler: () => void): void} instead.
 *
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
export function registerAppButtonClickHandler(handler: () => void): void {
  pages.appButton.onClick(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.appButton.onHoverEnter pages.appButton.onHoverEnter(handler: () => void): void} instead.
 *
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverEnterHandler(handler: () => void): void {
  pages.appButton.onHoverEnter(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.appButton.onHoverLeave pages.appButton.onHoverLeave(handler: () => void): void} instead.
 *
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 *
 */
export function registerAppButtonHoverLeaveHandler(handler: () => void): void {
  pages.appButton.onHoverLeave(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.backStack.registerBackButtonHandler pages.backStack.registerBackButtonHandler(handler: () => boolean): void} instead.
 *
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 *
 * @param handler - The handler to invoke when the user presses their Team client's back button.
 */
export function registerBackButtonHandler(handler: () => boolean): void {
  pages.backStack.registerBackButtonHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link teamsCore.registerOnLoadHandler teamsCore.registerOnLoadHandler(handler: (context: LoadContext) => void): void} instead.
 *
 * @hidden
 * Registers a handler to be called when the page has been requested to load.
 *
 * @param handler - The handler to invoke when the page is loaded.
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  teamsCore.registerOnLoadHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link teamsCore.registerBeforeUnloadHandler teamsCore.registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void} instead.
 *
 * @hidden
 * Registers a handler to be called before the page is unloaded.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  teamsCore.registerBeforeUnloadHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.registerFocusEnterHandler pages.registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void} instead.
 *
 * @hidden
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 *
 * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
export function registerFocusEnterHandler(handler: (navigateForward: boolean) => boolean): void {
  pages.registerFocusEnterHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.config.registerChangeConfigHandler pages.config.registerChangeConfigHandler(handler: () => void): void} instead.
 *
 * Registers a handler for when the user reconfigurated tab.
 *
 * @param handler - The handler to invoke when the user click on Settings.
 */
export function registerChangeSettingsHandler(handler: () => void): void {
  pages.config.registerChangeConfigHandler(handler);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.tabs.getTabInstances pages.tabs.getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 *
 * @param callback - The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export function getTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized();
  pages.tabs.getTabInstances(tabInstanceParameters).then((tabInfo: TabInformation) => {
    callback(tabInfo);
  });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.tabs.getMruTabInstances pages.tabs.getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve the most recently used tabs for this user.
 *
 * @param callback - The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Ignored, kept for future use
 */
export function getMruTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized();
  pages.tabs.getMruTabInstances(tabInstanceParameters).then((tabInfo: TabInformation) => {
    callback(tabInfo);
  });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.shareDeepLink pages.shareDeepLink(deepLinkParameters: DeepLinkParameters): void} instead.
 *
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
  pages.shareDeepLink({
    subPageId: deepLinkParameters.subEntityId,
    subPageLabel: deepLinkParameters.subEntityLabel,
    subPageWebUrl: deepLinkParameters.subEntityWebUrl,
  });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app.openLink core.openLink(deepLink: string): Promise\<void\>} instead.
 *
 * Execute deep link API.
 *
 * @param deepLink - deep link.
 */
export function executeDeepLink(deepLink: string, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized(
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  );
  onComplete = onComplete ? onComplete : getGenericOnCompleteHandler();
  app
    .openLink(deepLink)
    .then(() => {
      onComplete(true);
    })
    .catch((err: Error) => {
      onComplete(false, err.message);
    });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.setCurrentFrame pages.setCurrentFrame(frameInfo: FrameInfo): void} instead.
 *
 * Set the current Frame Context
 *
 * @param frameContext - FrameContext information to be set
 */
export function setFrameContext(frameContext: FrameContext): void {
  pages.setCurrentFrame(frameContext);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.initializeWithFrameContext pages.initializeWithFrameContext(frameInfo: FrameInfo, callback?: () => void, validMessageOrigins?: string[],): void} instead.
 *
 * Initilize with FrameContext
 *
 * @param frameContext - FrameContext information to be set
 * @param callback - The optional callback to be invoked be invoked after initilizing the frame context
 * @param validMessageOrigins -  Optionally specify a list of cross frame message origins.
 * They must have https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
export function initializeWithFrameContext(
  frameContext: FrameContext,
  callback?: () => void,
  validMessageOrigins?: string[],
): void {
  pages.initializeWithFrameContext(frameContext, callback, validMessageOrigins);
}

/**
 * Transforms the app.Context object received to the legacy global Context object
 * @param appContext - The app.Context object to be transformed
 * @returns The transformed legacy global Context object
 */
function transformAppContextToLegacyContext(appContext: app.Context): Context {
  const context: Context = {
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
    tid:
      appContext.user !== undefined
        ? appContext.user.tenant !== undefined
          ? appContext.user.tenant.id
          : undefined
        : undefined,
    tenantSKU:
      appContext.user !== undefined
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
