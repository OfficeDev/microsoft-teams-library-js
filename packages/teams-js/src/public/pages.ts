import {
  sendAndHandleStatusAndReason as send,
  sendAndHandleStatusAndReasonWithDefaultError as sendAndDefaultError,
  sendAndUnwrap,
  sendMessageToParent,
} from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { createTeamsAppLink } from '../internal/utils';
import { app } from './app';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { FrameInfo, ShareDeepLinkParameters, TabInformation, TabInstance, TabInstanceParameters } from './interfaces';
import { runtime } from './runtime';

/**
 * Navigation-specific part of the SDK.
 *
 * @beta
 */
export namespace pages {
  /**
   * Return focus to the host. Will move focus forward or backward based on where the application container falls in
   * the F6/tab order in the host.
   * @param navigateForward - Determines the direction to focus in host.
   */
  export function returnFocus(navigateForward?: boolean): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('returnFocus', [navigateForward]);
  }

  /**
   * @hidden
   *
   * Registers a handler for specifying focus when it passes from the host to the application.
   *
   * @param handler - The handler for placing focus within the application.
   *
   * @internal
   */
  export function registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('focusEnter', handler);
  }

  /**
   * Sets/Updates the current frame with new information
   *
   * @param frameInfo - Frame information containing the URL used in the iframe on reload and the URL for when the
   * user clicks 'Go To Website'
   */
  export function setCurrentFrame(frameInfo: FrameInfo): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('setFrameContext', [frameInfo]);
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
    callback?: () => void,
    validMessageOrigins?: string[],
  ): void {
    app.initialize(validMessageOrigins).then(() => callback && callback());
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
    return new Promise<InstanceConfig>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.remove, FrameContexts.sidePanel);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndUnwrap('settings.getSettings'));
    });
  }

  /**
   * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
   * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
   * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
   * than the current one in a way that keeps the application informed of the change and allows the SDK to
   * continue working.
   * @param url - The URL to navigate the frame to.
   * @returns Promise that resolves when the navigation has completed.
   */
  export function navigateCrossDomain(url: string): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.remove,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      );
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      const errorMessage =
        'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
      resolve(sendAndDefaultError('navigateCrossDomain', errorMessage, url));
    });
  }

  /**
   * Navigate to the given application ID and page ID, with optional parameters for a WebURL (if the application
   * cannot be navigated to, such as if it is not installed), Channel ID (for applications installed as a channel tab),
   * and sub-page ID (for navigating to specific content within the page). This is equivalent to navigating to
   * a deep link with the above data, but does not require the application to build a URL or worry about different
   * deep link formats for different hosts.
   * @param params - Parameters for the navigation
   * @returns a promise that will resolve if the navigation was successful
   */
  export function navigateToApp(params: NavigateToAppParams): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(
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
      if (runtime.isLegacyTeams) {
        resolve(send('executeDeepLink', createTeamsAppLink(params)));
      } else {
        resolve(send('pages.navigateToApp', params));
      }
    });
  }

  /**
   * Shares a deep link that a user can use to navigate back to a specific state in this page.
   *
   * @param deepLinkParameters - ID and label for the link and fallback URL.
   */
  export function shareDeepLink(deepLinkParameters: ShareDeepLinkParameters): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    sendMessageToParent('shareDeepLink', [
      deepLinkParameters.subPageId,
      deepLinkParameters.subPageLabel,
      deepLinkParameters.subPageWebUrl,
    ]);
  }

  /**
   * Registers a handler for changes from or to full-screen view for a tab.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
   */
  export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    registerHandler('fullScreenChange', handler);
  }

  /**
   * Checks if the pages capability is supported by the host
   * @returns true if the pages capability is enabled in runtime.supports.pages and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.pages ? true : false;
  }

  /**
   * Parameters for the NavigateToApp API
   */
  export interface NavigateToAppParams {
    /**
     * ID of the application to navigate to
     */
    appId: string;

    /**
     * Developer-defined ID of the Page to navigate to within the application (Formerly EntityID)
     */
    pageId: string;

    /**
     * Optional URL to open if the navigation cannot be completed within the host
     */
    webUrl?: string;

    /**
     * Optional developer-defined ID describing the content to navigate to within the Page. This will be passed
     * back to the application via the Context object.
     */
    subPageId?: string;

    /**
     * Optional ID of the Teams Channel where the application should be opened
     */
    channelId?: string;
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
      return new Promise<void>(resolve => {
        ensureInitialized();
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
        resolve(sendAndDefaultError('navigateToTab', errorMessage, tabInstance));
      });
    }
    /**
     * Retrieves application tabs for the current user.
     * If no TabInstanceParameters are passed, the application defaults to favorite teams and favorite channels.
     * @param tabInstanceParameters - An optional set of flags that specify whether to scope call to favorite teams or channels.
     * @returns Promise that resolves with the {@link TabInformation}. Contains information for the user's tabs that are owned by this application {@link TabInstance}.
     */
    export function getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return new Promise<TabInformation>(resolve => {
        ensureInitialized();
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndUnwrap('getTabInstances', tabInstanceParameters));
      });
    }

    /**
     * Retrieves the most recently used application tabs for the current user.
     * @param tabInstanceParameters - An optional set of flags. Note this is currently ignored and kept for future use.
     * @returns Promise that resolves with the {@link TabInformation}. Contains information for the users' most recently used tabs {@link TabInstance}.
     */
    export function getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return new Promise<TabInformation>(resolve => {
        ensureInitialized();
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndUnwrap('getMruTabInstances', tabInstanceParameters));
      });
    }

    /**
     * Checks if the pages.tab capability is supported by the host
     * @returns true if the pages.tabs capability is enabled in runtime.supports.pages.tabs and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.tabs ? true : false) : false;
    }
  }
  /**
   * Provides APIs to interact with the configuration-specific part of the SDK.
   * This object is usable only on the configuration frame.
   */
  export namespace config {
    let saveHandler: (evt: SaveEvent) => void;
    let removeHandler: (evt: RemoveEvent) => void;

    /**
     * @hidden
     * Hide from docs because this function is only used during initialization
     * ------------------
     * Adds register handlers for settings.save and settings.remove upon initialization. Function is called in {@link app.initializeHelper}
     * @internal
     */
    export function initialize(): void {
      registerHandler('settings.save', handleSave, false);
      registerHandler('settings.remove', handleRemove, false);
    }

    /**
     * Sets the validity state for the configuration.
     * The initial value is false, so the user cannot save the configuration until this is called with true.
     * @param validityState - Indicates whether the save or remove button is enabled for the user.
     */
    export function setValidityState(validityState: boolean): void {
      ensureInitialized(FrameContexts.settings, FrameContexts.remove);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent('settings.setValidityState', [validityState]);
    }

    /**
     * Sets the configuration for the current instance.
     * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
     * @param instanceConfig - The desired configuration for this instance.
     * @returns Promise that resolves when the operation has completed.
     */
    export function setConfig(instanceConfig: InstanceConfig): Promise<void> {
      return new Promise<void>(resolve => {
        ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(send('settings.setSettings', instanceConfig));
      });
    }

    /**
     * Registers a handler for when the user attempts to save the configuration. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the user selects the Save button.
     */
    export function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void {
      ensureInitialized(FrameContexts.settings);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      saveHandler = handler;
      handler && sendMessageToParent('registerHandler', ['save']);
    }

    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler - The handler to invoke when the user selects the Remove button.
     */
    export function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void {
      ensureInitialized(FrameContexts.remove, FrameContexts.settings);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      removeHandler = handler;
      handler && sendMessageToParent('registerHandler', ['remove']);
    }

    function handleSave(result?: SaveParameters): void {
      const saveEvent = new SaveEventImpl(result);
      if (saveHandler) {
        saveHandler(saveEvent);
      } else {
        // If no handler is registered, we assume success.
        saveEvent.notifySuccess();
      }
    }

    /**
     * Registers a handler for when the tab configuration is changed by the user
     * @param handler - The handler to invoke when the user clicks on Settings.
     */
    export function registerChangeConfigHandler(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      registerHandler('changeSettings', handler);
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
        sendMessageToParent('settings.save.success');
        this.notified = true;
      }
      public notifyFailure(reason?: string): void {
        this.ensureNotNotified();
        sendMessageToParent('settings.save.failure', [reason]);
        this.notified = true;
      }
      private ensureNotNotified(): void {
        if (this.notified) {
          throw new Error('The SaveEvent may only notify success or failure once.');
        }
      }
    }

    function handleRemove(): void {
      const removeEvent = new RemoveEventImpl();
      if (removeHandler) {
        removeHandler(removeEvent);
      } else {
        // If no handler is registered, we assume success.
        removeEvent.notifySuccess();
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
        sendMessageToParent('settings.remove.success');
        this.notified = true;
      }

      public notifyFailure(reason?: string): void {
        this.ensureNotNotified();
        sendMessageToParent('settings.remove.failure', [reason]);
        this.notified = true;
      }

      private ensureNotNotified(): void {
        if (this.notified) {
          throw new Error('The removeEvent may only notify success or failure once.');
        }
      }
    }

    /**
     * Checks if the pages.config capability is supported by the host
     * @returns true if the pages.config capability is enabled in runtime.supports.pages.config and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.config ? true : false) : false;
    }
  }

  /**
   * Provides APIs for handling the user's navigational history.
   */
  export namespace backStack {
    let backButtonPressHandler: () => boolean;

    export function _initialize(): void {
      registerHandler('backButtonPress', handleBackButtonPress, false);
    }

    /**
     * Navigates back in the hosted application. See {@link pages.backStack.registerBackButtonHandler} for notes on usage.
     * @returns Promise that resolves when the navigation has completed.
     */
    export function navigateBack(): Promise<void> {
      return new Promise<void>(resolve => {
        ensureInitialized();
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        const errorMessage = 'Back navigation is not supported in the current client or context.';
        resolve(sendAndDefaultError('navigateBack', errorMessage));
      });
    }

    /**
     * Registers a handler for user presses of the host client's back button. Experiences that maintain an internal
     * navigation stack should use this handler to navigate the user back within their frame. If an application finds
     * that after running its back button handler it cannot handle the event it should call the navigateBack
     * method to ask the host client to handle it instead.
     * @param handler - The handler to invoke when the user presses the host client's back button.
     */
    export function registerBackButtonHandler(handler: () => boolean): void {
      ensureInitialized();
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      backButtonPressHandler = handler;
      handler && sendMessageToParent('registerHandler', ['backButton']);
    }

    function handleBackButtonPress(): void {
      if (!backButtonPressHandler || !backButtonPressHandler()) {
        navigateBack();
      }
    }

    /**
     * Checks if the pages.backStack capability is supported by the host
     * @returns true if the pages.backStack capability is enabled in runtime.supports.pages.backStack and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.backStack ? true : false) : false;
    }
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Provides APIs to interact with the full-trust part of the SDK. Limited to 1P applications
   */
  export namespace fullTrust {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Place the tab into full-screen mode.
     */
    export function enterFullscreen(): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent('enterFullscreen', []);
    }

    /**
     * @hidden
     * Hide from docs
     * ------
     * Reverts the tab into normal-screen mode.
     */
    export function exitFullscreen(): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent('exitFullscreen', []);
    }
    /**
     * @hidden
     * Hide from docs
     * ------
     * Checks if the pages.fullTrust capability is supported by the host
     * @returns true if the pages.fullTrust capability is enabled in runtime.supports.pages.fullTrust and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.fullTrust ? true : false) : false;
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
    export function onClick(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      registerHandler('appButtonClick', handler);
    }

    /**
     * Registers a handler for entering hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
     */
    export function onHoverEnter(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      registerHandler('appButtonHoverEnter', handler);
    }

    /**
     * Registers a handler for exiting hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
     */
    export function onHoverLeave(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      registerHandler('appButtonHoverLeave', handler);
    }

    /**
     * Checks if pages.appButton capability is supported by the host
     * @returns true if the pages.appButton capability is enabled in runtime.supports.pages.appButton and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.appButton ? true : false) : false;
    }
  }
}
