import { appInitializeHelper } from '../../internal/appHelpers';
import { sendAndHandleStatusAndReason, sendMessageToParent } from '../../internal/communication';
import { registerHandlerHelper } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import {
  convertAppNavigationParametersToNavigateToAppParams,
  convertNavigateToAppParamsToAppNavigationParameters,
  getConfigHelper,
  isAppNavigationParametersObject,
  navigateCrossDomainHelper,
  pagesTelemetryVersionNumber,
  setCurrentFrameHelper,
  shareDeepLinkHelper,
} from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { isNullOrUndefined } from '../../internal/typeCheckUtilities';
import { createTeamsAppLink } from '../../internal/utils';
import { prefetchOriginsFromCDN } from '../../internal/validOrigins';
import { AppId } from '../appId';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { FrameInfo, ShareDeepLinkParameters } from '../interfaces';
import { runtime } from '../runtime';
import * as appButton from './appButton';
import * as backStack from './backStack';
import * as config from './config';
import * as currentApp from './currentApp';
import * as fullTrust from './fullTrust';
import * as tabs from './tabs';

/**
 * Navigation-specific part of the SDK.
 */
/** Callback function */
export type handlerFunctionType = () => void;
/** Full screen function */
export type fullScreenChangeFunctionType = (isFullScreen: boolean) => void;
/** Back button handler function */
export type backButtonHandlerFunctionType = () => boolean;
/** Save event function */
export type saveEventType = (evt: config.SaveEvent) => void;
/** Remove event function */
export type removeEventType = (evt: config.RemoveEvent) => void;

/**
 * @hidden
 * List of enter focus action items
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum EnterFocusType {
  /**
   * Determines the previous direction to focus in app when hot keys entered.
   */
  PreviousLandmark = 0,
  /**
   * Determines the next direction to focus in app when hot keys entered.
   */
  NextLandmark = 1,
  /**
   * Determines if the focus should go to the particular content of the app.
   * Read - Focus should go to the content of the app.
   */
  Read = 2,
  /**
   * Determines if the focus should go to the particular content of the app.
   * Compose - Focus should go to the compose area (such as textbox) of the app.
   */
  Compose = 3,
}

/**
 * Return focus action items
 */
export enum ReturnFocusType {
  /**
   * Determines the direction to focus in host for previous landmark.
   */
  PreviousLandmark = 0,
  /**
   * Determines the direction to focus in host for next landmark.
   */
  NextLandmark = 1,
  /**
   * Determines if the focus should go to the host's activity feed
   */
  GoToActivityFeed = 2,
}

/**
 * @deprecated
 * Return focus to the host. Will move focus forward or backward based on where the application container falls in
 * the F6/tab order in the host.
 * On mobile hosts or hosts where there is no keyboard interaction or UI notion of "focus" this function has no
 * effect and will be a no-op when called.
 * @param navigateForward - Determines the direction to focus in host.
 */
export function returnFocus(navigateForward?: boolean): void;

/**
 * Return focus to the host. Will attempt to send focus to the appropriate part of the host (as specified by returnFocusType) based on where the application container falls in
 * the F6/tab order in the host.
 * On mobile hosts or hosts where there is no keyboard interaction or UI notion of "focus" this function has no
 * effect and will be a no-op when called.
 * @param returnFocusType - Determines the type of focus to return to in the host.
 */
export function returnFocus(returnFocusType: ReturnFocusType): void;

/**
 * @hidden
 */
export function returnFocus(arg1?: boolean | ReturnFocusType): void {
  const apiVersionTag = getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_ReturnFocus);
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  if (arg1 === undefined) {
    sendMessageToParent(apiVersionTag, 'returnFocus', [false]);
  }
  if (typeof arg1 === 'boolean') {
    sendMessageToParent(apiVersionTag, 'returnFocus', [arg1]);
  } else {
    switch (arg1) {
      case ReturnFocusType.PreviousLandmark:
      case ReturnFocusType.GoToActivityFeed:
        sendMessageToParent(apiVersionTag, 'returnFocus', [false, arg1]);
        break;
      case ReturnFocusType.NextLandmark:
        sendMessageToParent(apiVersionTag, 'returnFocus', [true, arg1]);
        break;
    }
  }
}

/**
 * @hidden
 *
 * Registers a handler for specifying focus when it passes from the host to the application.
 * On mobile hosts or hosts where there is no UI notion of "focus" the handler registered with
 * this function will never be called.
 *
 * @param handler - The handler for placing focus within the application.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerFocusEnterHandler(
  handler: (navigateForward: boolean, enterFocusType?: EnterFocusType) => void,
): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RegisterFocusEnterHandler),
    'focusEnter',
    handler,
    [],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Sets/Updates the current frame with new information
 *
 * @param frameInfo - Frame information containing the URL used in the iframe on reload and the URL for when the
 * user clicks 'Go To Website'
 */
export function setCurrentFrame(frameInfo: FrameInfo): void {
  setCurrentFrameHelper(getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_SetCurrentFrame), frameInfo);
}

/**
 * Initializes the library with context information for the frame
 *
 * @param frameInfo - Frame information containing the URL used in the iframe on reload and the URL for when the
 *  user clicks 'Go To Website'
 * @param callback - An optional callback that is executed once the application has finished initialization.
 * @param validMessageOrigins - An optional list of cross-frame message origins. They must have
 * https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
export function initializeWithFrameContext(
  frameInfo: FrameInfo,
  callback?: handlerFunctionType,
  validMessageOrigins?: string[],
): void {
  prefetchOriginsFromCDN();
  appInitializeHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_InitializeWithFrameContext),
    validMessageOrigins,
  ).then(() => callback && callback());
  setCurrentFrame(frameInfo);
}

/**
 * Defines the configuration of the current or desired instance
 */
export interface InstanceConfig {
  /**
   * A suggested display name for the new content.
   * In the settings for an existing instance being updated, this call has no effect.
   */
  suggestedDisplayName?: string;
  /**
   * Sets the URL to use for the content of this instance.
   */
  contentUrl: string;
  /**
   * Sets the URL for the removal configuration experience.
   */
  removeUrl?: string;
  /**
   * Sets the URL to use for the external link to view the underlying resource in a browser.
   */
  websiteUrl?: string;
  /**
   * The developer-defined unique ID for the entity to which this content points.
   */
  entityId?: string;
}

/**
 * Gets the config for the current instance.
 * @returns Promise that resolves with the {@link InstanceConfig} object.
 */
export function getConfig(): Promise<InstanceConfig> {
  return getConfigHelper(getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_GetConfig));
}

/**
 * @deprecated
 * As of 2.0.0, this API is deprecated and can be replaced by the standard JavaScript
 * API, window.location.href, when navigating the app to a new cross-domain URL. Any URL
 * that is redirected to must be listed in the validDomains block of the manifest. Please
 * remove any calls to this API.
 * @param url - The URL to navigate the frame to.
 * @returns Promise that resolves when the navigation has completed.
 */
export function navigateCrossDomain(url: string): Promise<void> {
  return navigateCrossDomainHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_NavigateCrossDomain),
    url,
  );
}

/**
 * Used to navigate to apps other than your own.
 *
 * If you are looking to navigate within your own app, use {@link pages.currentApp.navigateToDefaultPage} or {@link pages.currentApp.navigateTo}
 *
 * @param params Parameters for the navigation
 * @returns a `Promise` that will resolve if the navigation was successful or reject if it was not
 * @throws `Error` if the app ID is not valid or `params.webUrl` is defined but not a valid URL
 */
export function navigateToApp(params: AppNavigationParameters | NavigateToAppParams): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const apiVersionTag: string = getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_NavigateToApp);

    if (runtime.isLegacyTeams) {
      const typeSafeParameters: AppNavigationParameters = !isAppNavigationParametersObject(params)
        ? convertNavigateToAppParamsToAppNavigationParameters(params)
        : params;
      resolve(sendAndHandleStatusAndReason(apiVersionTag, 'executeDeepLink', createTeamsAppLink(typeSafeParameters)));
    } else {
      const serializedParameters: NavigateToAppParams = isAppNavigationParametersObject(params)
        ? convertAppNavigationParametersToNavigateToAppParams(params)
        : params;
      resolve(sendAndHandleStatusAndReason(apiVersionTag, 'pages.navigateToApp', serializedParameters));
    }
  });
}

/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * Please note that this method does not yet work on mobile hosts.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: ShareDeepLinkParameters): void {
  return shareDeepLinkHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_ShareDeepLink),
    deepLinkParameters,
  );
}

/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * On hosts where there is no support for making an app full screen, the handler registered
 * with this function will never be called.
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(handler: fullScreenChangeFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RegisterFullScreenHandler),
    'fullScreenChange',
    handler,
    [],
    () => {
      if (!isNullOrUndefined(handler) && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Checks if the pages capability is supported by the host
 * @returns boolean to represent whether the appEntity capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages ? true : false;
}

/**
 * @deprecated
 * This interface has been deprecated in favor of a more type-safe interface using {@link AppNavigationParameters}
 *
 * Parameters for the {@link navigateToApp} function
 */
export interface NavigateToAppParams {
  /**
   * ID of the app to navigate to
   */
  appId: string;

  /**
   * Developer-defined ID of the page to navigate to within the app (formerly called `entityId`)
   */
  pageId: string;

  /**
   * Fallback URL to open if the navigation cannot be completed within the host (e.g. if the target app is not installed)
   */
  webUrl?: string;

  /**
   * Developer-defined ID describing the content to navigate to within the page. This ID is passed to the application
   * via the {@link app.PageInfo.subPageId} property on the {@link app.Context} object (retrieved by calling {@link app.getContext})
   */
  subPageId?: string;

  /**
   * For apps installed as a channel tab, this ID can be supplied to indicate in which Teams channel the app should be opened
   */
  channelId?: string;

  /**
   * Optional ID of the chat or meeting where the app should be opened

   */
  chatId?: string;
}

/**
 * Type-safer version of parameters for the {@link navigateToApp} function
 */
export interface AppNavigationParameters {
  /**
   * ID of the app to navigate to
   */
  appId: AppId;

  /**
   * Developer-defined ID of the page to navigate to within the app (formerly called `entityId`)
   */
  pageId: string;

  /**
   * Fallback URL to open if the navigation cannot be completed within the host (e.g., if the target app is not installed)
   */
  webUrl?: URL;

  /**
   * Developer-defined ID describing the content to navigate to within the page. This ID is passed to the application
   * via the {@link app.PageInfo.subPageId} property on the {@link app.Context} object (retrieved by calling {@link app.getContext})
   */
  subPageId?: string;

  /**
   * For apps installed as a channel tab, this ID can be supplied to indicate in which Teams channel the app should be opened
   * This property has no effect in hosts where apps cannot be opened in channels
   */
  channelId?: string;

  /**
   * Optional ID of the chat or meeting where the app should be opened
   * This property has no effect in hosts where apps cannot be opened in chats or meetings
   */
  chatId?: string;
}

export { appButton, backStack, config, currentApp, fullTrust, tabs };
