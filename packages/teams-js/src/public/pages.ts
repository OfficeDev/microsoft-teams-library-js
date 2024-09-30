import {
  Communication,
  sendAndHandleSdkError,
  sendAndHandleStatusAndReason,
  sendAndHandleStatusAndReasonWithDefaultError,
  sendAndUnwrap,
  sendMessageEventToChild,
  sendMessageToParent,
} from '../internal/communication';
import { registerHandler, registerHandlerHelper } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { createTeamsAppLink } from '../internal/utils';
import { prefetchOriginsFromCDN } from '../internal/validOrigins';
import { AppId } from '../public/appId';
import { appInitializeHelper } from './app';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { FrameInfo, ShareDeepLinkParameters, TabInformation, TabInstance, TabInstanceParameters } from './interfaces';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const pagesTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

export function navigateCrossDomainHelper(apiVersionTag: string, url: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (!pages.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage =
      'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateCrossDomain', errorMessage, url));
  });
}

export function backStackNavigateBackHelper(apiVersionTag: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.backStack.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Back navigation is not supported in the current client or context.';
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateBack', errorMessage));
  });
}

export function tabsNavigateToTabHelper(apiVersionTag: string, tabInstance: TabInstance): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
    resolve(sendAndHandleStatusAndReasonWithDefaultError(apiVersionTag, 'navigateToTab', errorMessage, tabInstance));
  });
}
/**
 * @hidden
 */
export function returnFocusHelper(apiVersionTag: string, navigateForward?: boolean): void {
  ensureInitialized(runtime);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'returnFocus', [navigateForward]);
}

export function getTabInstancesHelper(
  apiVersionTag: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrap(apiVersionTag, 'getTabInstances', tabInstanceParameters));
  });
}

export function getMruTabInstancesHelper(
  apiVersionTag: string,
  tabInstanceParameters?: TabInstanceParameters,
): Promise<TabInformation> {
  return new Promise<TabInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!pages.tabs.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(sendAndUnwrap(apiVersionTag, 'getMruTabInstances', tabInstanceParameters));
  });
}

export function shareDeepLinkHelper(apiVersionTag: string, deepLinkParameters: ShareDeepLinkParameters): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'shareDeepLink', [
    deepLinkParameters.subPageId,
    deepLinkParameters.subPageLabel,
    deepLinkParameters.subPageWebUrl,
  ]);
}

export function setCurrentFrameHelper(apiVersionTag: string, frameInfo: FrameInfo): void {
  ensureInitialized(runtime, FrameContexts.content);
  if (!pages.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'setFrameContext', [frameInfo]);
}

export function configSetValidityStateHelper(apiVersionTag: string, validityState: boolean): void {
  ensureInitialized(runtime, FrameContexts.settings, FrameContexts.remove);
  if (!pages.config.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'settings.setValidityState', [validityState]);
}

export function getConfigHelper(apiVersionTag: string): Promise<pages.InstanceConfig> {
  return new Promise<pages.InstanceConfig>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.sidePanel,
    );
    if (!pages.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(sendAndUnwrap(apiVersionTag, 'settings.getSettings'));
  });
}

export function configSetConfigHelper(apiVersionTag: string, instanceConfig: pages.InstanceConfig): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
    if (!pages.config.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(sendAndHandleStatusAndReason(apiVersionTag, 'settings.setSettings', instanceConfig));
  });
}

/**
 * Navigation-specific part of the SDK.
 */
export namespace pages {
  /** Callback function */
  export type handlerFunctionType = () => void;
  /** Full screen function */
  export type fullScreenChangeFunctionType = (isFullScreen: boolean) => void;
  /** Back button handler function */
  export type backButtonHandlerFunctionType = () => boolean;
  /** Save event function */
  export type saveEventType = (evt: pages.config.SaveEvent) => void;
  /** Remove event function */
  export type removeEventType = (evt: pages.config.RemoveEvent) => void;

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
  export function returnFocus(returnFocusType: pages.ReturnFocusType): void;

  /**
   * @hidden
   */
  export function returnFocus(arg1?: boolean | pages.ReturnFocusType): void {
    const apiVersionTag = getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_ReturnFocus);
    ensureInitialized(runtime);
    if (!pages.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (arg1 === undefined) {
      sendMessageToParent(apiVersionTag, 'returnFocus', [false]);
    }
    if (typeof arg1 === 'boolean') {
      sendMessageToParent(apiVersionTag, 'returnFocus', [arg1]);
    } else {
      switch (arg1) {
        case pages.ReturnFocusType.PreviousLandmark:
        case pages.ReturnFocusType.GoToActivityFeed:
          sendMessageToParent(apiVersionTag, 'returnFocus', [false, arg1]);
          break;
        case pages.ReturnFocusType.NextLandmark:
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
   * This interface has been deprecated in favor of a more type-safe interface using {@link pages.AppNavigationParameters}
   *
   * Parameters for the {@link pages.navigateToApp} function
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
   * Type-safer version of parameters for the {@link pages.navigateToApp} function
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

  /**
   * Provides APIs for querying and navigating between contextual tabs of an application. Unlike personal tabs,
   * contextual tabs are pages associated with a specific context, such as channel or chat.
   */
  export namespace tabs {
    /**
     * Navigates the hosted application to the specified tab instance.
     * @param tabInstance - The destination tab instance.
     * @returns Promise that resolves when the navigation has completed.
     */
    export function navigateToTab(tabInstance: TabInstance): Promise<void> {
      return tabsNavigateToTabHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_NavigateToTab),
        tabInstance,
      );
    }
    /**
     * Retrieves application tabs for the current user.
     * If no TabInstanceParameters are passed, the application defaults to favorite teams and favorite channels.
     * @param tabInstanceParameters - An optional set of flags that specify whether to scope call to favorite teams or channels.
     * @returns Promise that resolves with the {@link TabInformation}. Contains information for the user's tabs that are owned by this application {@link TabInstance}.
     */
    export function getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return getTabInstancesHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_GetTabInstances),
        tabInstanceParameters,
      );
    }

    /**
     * Retrieves the most recently used application tabs for the current user.
     * @param tabInstanceParameters - An optional set of flags. Note this is currently ignored and kept for future use.
     * @returns Promise that resolves with the {@link TabInformation}. Contains information for the users' most recently used tabs {@link TabInstance}.
     */
    export function getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return getMruTabInstancesHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_GetMruTabInstances),
        tabInstanceParameters,
      );
    }

    /**
     * Checks if the pages.tab capability is supported by the host
     * @returns boolean to represent whether the pages.tab capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.tabs
          ? true
          : false
        : false;
    }
  }
  /**
   * Provides APIs to interact with the configuration-specific part of the SDK.
   * This object is usable only on the configuration frame.
   */
  export namespace config {
    let saveHandler: undefined | ((evt: SaveEvent) => void);
    let removeHandler: undefined | ((evt: RemoveEvent) => void);

    /**
     * @hidden
     * Hide from docs because this function is only used during initialization
     *
     * Adds register handlers for settings.save and settings.remove upon initialization. Function is called in {@link app.initializeHelper}
     * @internal
     * Limited to Microsoft-internal use
     */
    export function initialize(): void {
      registerHandler(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterSettingsSaveHandler),
        'settings.save',
        handleSave,
        false,
      );
      registerHandler(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterSettingsRemoveHandler),
        'settings.remove',
        handleRemove,
        false,
      );
    }

    /**
     * Sets the validity state for the configuration.
     * The initial value is false, so the user cannot save the configuration until this is called with true.
     * @param validityState - Indicates whether the save or remove button is enabled for the user.
     */
    export function setValidityState(validityState: boolean): void {
      return configSetValidityStateHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_SetValidityState),
        validityState,
      );
    }

    /**
     * Sets the configuration for the current instance.
     * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
     * @param instanceConfig - The desired configuration for this instance.
     * @returns Promise that resolves when the operation has completed.
     */
    export function setConfig(instanceConfig: InstanceConfig): Promise<void> {
      return configSetConfigHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_SetConfig),
        instanceConfig,
      );
    }

    /**
     * Registers a handler for when the user attempts to save the configuration. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the user selects the Save button.
     */
    export function registerOnSaveHandler(handler: saveEventType): void {
      registerOnSaveHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterOnSaveHandler),
        handler,
        () => {
          if (!isNullOrUndefined(handler) && !isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * @hidden
     * Undocumented helper function with shared code between deprecated version and current version of the registerOnSaveHandler API.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
     * @param handler - The handler to invoke when the user selects the Save button.
     * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
     */
    export function registerOnSaveHandlerHelper(
      apiVersionTag: string,
      handler: (evt: SaveEvent) => void,
      versionSpecificHelper?: () => void,
    ): void {
      // allow for registration cleanup even when not finished initializing
      !isNullOrUndefined(handler) && ensureInitialized(runtime, FrameContexts.settings);
      if (versionSpecificHelper) {
        versionSpecificHelper();
      }
      saveHandler = handler;
      !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['save']);
    }

    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler - The handler to invoke when the user selects the Remove button.
     */
    export function registerOnRemoveHandler(handler: removeEventType): void {
      registerOnRemoveHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterOnRemoveHandler),
        handler,
        () => {
          if (!isNullOrUndefined(handler) && !isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * @hidden
     * Undocumented helper function with shared code between deprecated version and current version of the registerOnRemoveHandler API.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
     * @param handler - The handler to invoke when the user selects the Remove button.
     * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
     */
    export function registerOnRemoveHandlerHelper(
      apiVersionTag: string,
      handler: (evt: RemoveEvent) => void,
      versionSpecificHelper?: () => void,
    ): void {
      // allow for registration cleanup even when not finished initializing
      !isNullOrUndefined(handler) && ensureInitialized(runtime, FrameContexts.remove, FrameContexts.settings);
      if (versionSpecificHelper) {
        versionSpecificHelper();
      }
      removeHandler = handler;
      !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['remove']);
    }

    function handleSave(result?: SaveParameters): void {
      const saveEventType = new SaveEventImpl(result);
      if (saveHandler) {
        saveHandler(saveEventType);
      } else if (Communication.childWindow) {
        sendMessageEventToChild('settings.save', [result]);
      } else {
        // If no handler is registered, we assume success.
        saveEventType.notifySuccess();
      }
    }

    /**
     * Registers a handler for when the tab configuration is changed by the user
     * @param handler - The handler to invoke when the user clicks on Settings.
     */
    export function registerChangeConfigHandler(handler: handlerFunctionType): void {
      registerHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Config_RegisterChangeConfigHandler),
        'changeSettings',
        handler,
        [FrameContexts.content],
        () => {
          if (!isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * Describes the results of the settings.save event. Includes result, notifySuccess, and notifyFailure
     * to indicate the return object (result) and the status of whether the settings.save call succeeded or not and why.
     */
    export interface SaveEvent {
      /**
       * Object containing properties passed as arguments to the settings.save event.
       */
      result: SaveParameters;
      /**
       * Indicates that the underlying resource has been created and the config can be saved.
       */
      notifySuccess(): void;
      /**
       * Indicates that creation of the underlying resource failed and that the config cannot be saved.
       * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
       */
      notifyFailure(reason?: string): void;
    }

    /**
     * Describes the results of the settings.remove event. Includes notifySuccess, and notifyFailure
     * to indicate the status of whether the settings.save call succeeded or not and why.
     */
    export interface RemoveEvent {
      /**
       * Indicates that the underlying resource has been removed and the content can be removed.
       */
      notifySuccess(): void;
      /**
       * Indicates that removal of the underlying resource failed and that the content cannot be removed.
       * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
       */
      notifyFailure(reason?: string): void;
    }

    /**
     * Parameters used in the settings.save event
     */
    export interface SaveParameters {
      /**
       * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
       */
      webhookUrl?: string;
    }

    /**
     * @hidden
     * Hide from docs, since this class is not directly used.
     */
    class SaveEventImpl implements SaveEvent {
      public notified = false;
      public result: SaveParameters;
      public constructor(result?: SaveParameters) {
        this.result = result ? result : {};
      }
      public notifySuccess(): void {
        this.ensureNotNotified();
        sendMessageToParent(
          getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_SaveEvent_NotifySuccess),
          'settings.save.success',
        );
        this.notified = true;
      }
      public notifyFailure(reason?: string): void {
        this.ensureNotNotified();
        sendMessageToParent(
          getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_SaveEvent_NotifyFailure),
          'settings.save.failure',
          [reason],
        );
        this.notified = true;
      }
      private ensureNotNotified(): void {
        if (this.notified) {
          throw new Error('The SaveEvent may only notify success or failure once.');
        }
      }
    }

    function handleRemove(): void {
      const removeEventType = new RemoveEventImpl();
      if (removeHandler) {
        removeHandler(removeEventType);
      } else if (Communication.childWindow) {
        sendMessageEventToChild('settings.remove', []);
      } else {
        // If no handler is registered, we assume success.
        removeEventType.notifySuccess();
      }
    }

    /**
     * @hidden
     * Hide from docs, since this class is not directly used.
     */
    class RemoveEventImpl implements RemoveEvent {
      public notified = false;

      public notifySuccess(): void {
        this.ensureNotNotified();
        sendMessageToParent(
          getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RemoveEvent_NotifySuccess),
          'settings.remove.success',
        );
        this.notified = true;
      }

      public notifyFailure(reason?: string): void {
        this.ensureNotNotified();
        sendMessageToParent(
          getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_RemoveEvent_NotifyFailure),
          'settings.remove.failure',
          [reason],
        );
        this.notified = true;
      }

      private ensureNotNotified(): void {
        if (this.notified) {
          throw new Error('The removeEventType may only notify success or failure once.');
        }
      }
    }

    /**
     * Checks if the pages.config capability is supported by the host
     * @returns boolean to represent whether the pages.config capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.config
          ? true
          : false
        : false;
    }
  }

  /**
   * Provides APIs for handling the user's navigational history.
   */
  export namespace backStack {
    let backButtonPressHandler: (() => boolean) | undefined;

    /**
     * @hidden
     * Register backButtonPress handler.
     *
     * @internal
     * Limited to Microsoft-internal use.
     */
    export function _initialize(): void {
      registerHandler(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_RegisterBackButtonPressHandler),
        'backButtonPress',
        handleBackButtonPress,
        false,
      );
    }

    /**
     * Navigates back in the hosted application. See {@link pages.backStack.registerBackButtonHandler} for notes on usage.
     * @returns Promise that resolves when the navigation has completed.
     */
    export function navigateBack(): Promise<void> {
      return backStackNavigateBackHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_NavigateBack),
      );
    }

    /**
     * Registers a handler for user presses of the host client's back button. Experiences that maintain an internal
     * navigation stack should use this handler to navigate the user back within their frame. If an application finds
     * that after running its back button handler it cannot handle the event it should call the navigateBack
     * method to ask the host client to handle it instead.
     * @param handler - The handler to invoke when the user presses the host client's back button.
     */
    export function registerBackButtonHandler(handler: backButtonHandlerFunctionType): void {
      registerBackButtonHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_RegisterBackButtonHandler),
        handler,
        () => {
          if (!isNullOrUndefined(handler) && !isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * @hidden
     * Undocumented helper function with shared code between deprecated version and current version of the registerBackButtonHandler API.
     *
     * @internal
     * Limited to Microsoft-internal use
     * @param apiVersionTag - The tag indicating API version number with name
     * @param handler - The handler to invoke when the user presses the host client's back button.
     * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
     */
    export function registerBackButtonHandlerHelper(
      apiVersionTag: string,
      handler: () => boolean,
      versionSpecificHelper?: () => void,
    ): void {
      // allow for registration cleanup even when not finished initializing
      !isNullOrUndefined(handler) && ensureInitialized(runtime);
      if (versionSpecificHelper) {
        versionSpecificHelper();
      }
      backButtonPressHandler = handler;
      !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['backButton']);
    }

    function handleBackButtonPress(): void {
      if (!backButtonPressHandler || !backButtonPressHandler()) {
        if (Communication.childWindow) {
          // If the current window did not handle it let the child window
          sendMessageEventToChild('backButtonPress', []);
        } else {
          navigateBack();
        }
      }
    }

    /**
     * Checks if the pages.backStack capability is supported by the host
     * @returns boolean to represent whether the pages.backStack capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.backStack
          ? true
          : false
        : false;
    }
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Provides APIs to interact with the full-trust part of the SDK. Limited to 1P applications
   * @internal
   * Limited to Microsoft-internal use
   */
  export namespace fullTrust {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Place the tab into full-screen mode.
     *
     */
    export function enterFullscreen(): void {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_FullTrust_EnterFullscreen),
        'enterFullscreen',
        [],
      );
    }

    /**
     * @hidden
     * Hide from docs
     * ------
     * Reverts the tab into normal-screen mode.
     */
    export function exitFullscreen(): void {
      ensureInitialized(runtime, FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_FullTrust_ExitFullscreen),
        'exitFullscreen',
        [],
      );
    }
    /**
     * @hidden
     *
     * Checks if the pages.fullTrust capability is supported by the host
     * @returns boolean to represent whether the pages.fullTrust capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.fullTrust
          ? true
          : false
        : false;
    }
  }

  /**
   * Provides APIs to interact with the app button part of the SDK.
   */
  export namespace appButton {
    /**
     * Registers a handler for clicking the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
     */
    export function onClick(handler: handlerFunctionType): void {
      registerHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnClick),
        'appButtonClick',
        handler,
        [FrameContexts.content],
        () => {
          if (!isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * Registers a handler for entering hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
     */
    export function onHoverEnter(handler: handlerFunctionType): void {
      registerHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnHoverEnter),
        'appButtonHoverEnter',
        handler,
        [FrameContexts.content],
        () => {
          if (!isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * Registers a handler for exiting hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
     */
    export function onHoverLeave(handler: handlerFunctionType): void {
      registerHandlerHelper(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnHoverLeave),
        'appButtonHoverLeave',
        handler,
        [FrameContexts.content],
        () => {
          if (!isSupported()) {
            throw errorNotSupportedOnPlatform;
          }
        },
      );
    }

    /**
     * Checks if pages.appButton capability is supported by the host
     * @returns boolean to represent whether the pages.appButton capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.appButton
          ? true
          : false
        : false;
    }
  }

  /**
   * Provides functions for navigating within your own app
   *
   * @remarks
   * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
   */
  export namespace currentApp {
    /**
     * Parameters provided to the {@link pages.currentApp.navigateTo} function
     */
    export interface NavigateWithinAppParams {
      /**
       * The developer-defined unique ID for the page defined in the manifest or when first configuring
       * the page. (Known as {@linkcode Context.entityId} prior to TeamsJS v2.0.0)
       */
      pageId: string;

      /**
       * Optional developer-defined unique ID describing the content to navigate to within the page. This
       * can be retrieved from the Context object {@link app.PageInfo.subPageId | app.Context.page.subPageId}
       */
      subPageId?: string;
    }

    /**
     * Navigate within the currently running app
     *
     * @remarks
     * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
     *
     * @param params Parameters for the navigation
     * @returns `Promise` that will resolve if the navigation was successful and reject if not
     */
    export function navigateTo(params: NavigateWithinAppParams): Promise<void> {
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
        resolve(
          sendAndHandleSdkError(
            getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_CurrentApp_NavigateTo),
            'pages.currentApp.navigateTo',
            params,
          ),
        );
      });
    }

    /**
     * Navigate to the currently running app's first static page defined in the application
     * manifest.
     *
     * @returns `Promise` that will resolve if the navigation was successful and reject if not
     */
    export function navigateToDefaultPage(): Promise<void> {
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
        resolve(
          sendAndHandleSdkError(
            getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_CurrentApp_NavigateToDefaultPage),
            'pages.currentApp.navigateToDefaultPage',
          ),
        );
      });
    }

    /**
     * Checks if pages.currentApp capability is supported by the host
     * @returns boolean to represent whether the pages.currentApp capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.pages
        ? runtime.supports.pages.currentApp
          ? true
          : false
        : false;
    }
  }
}

export function isAppNavigationParametersObject(
  obj: pages.AppNavigationParameters | pages.NavigateToAppParams,
): obj is pages.AppNavigationParameters {
  return obj.appId instanceof AppId;
}

export function convertNavigateToAppParamsToAppNavigationParameters(
  params: pages.NavigateToAppParams,
): pages.AppNavigationParameters {
  return {
    ...params,
    appId: new AppId(params.appId),
    webUrl: params.webUrl ? new URL(params.webUrl) : undefined,
  };
}

export function convertAppNavigationParametersToNavigateToAppParams(
  params: pages.AppNavigationParameters,
): pages.NavigateToAppParams {
  return {
    ...params,
    appId: params.appId.toString(),
    webUrl: params.webUrl ? params.webUrl.toString() : undefined,
  };
}
