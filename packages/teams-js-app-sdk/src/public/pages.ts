import {
  sendAndHandleStatusAndReason as send,
  sendAndHandleStatusAndReasonWithDefaultError as sendAndDefaultError,
  sendAndUnwrap,
  sendMessageToParent,
} from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { app } from './app';
import { FrameContexts } from './constants';
import { FrameInfo, TabInformation, TabInstance, TabInstanceParameters } from './interfaces';
import { runtime } from './runtime';

/**
 * Navigation specific part of the SDK.
 *
 * @beta
 */
export namespace pages {
  /**
   * Return focus to the hub/host. Will move focus forward or backward based on where the app container falls in
   * the F6/Tab accessiblity loop in the hub/host.
   * @param navigateForward - Determines the direction to focus in hub/host.
   */
  export function returnFocus(navigateForward?: boolean): void {
    ensureInitialized(FrameContexts.content);

    sendMessageToParent('returnFocus', [navigateForward]);
  }

  export function setCurrentFrame(frameInfo: FrameInfo): void {
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('setFrameContext', [frameInfo]);
  }

  export function initializeWithFrameContext(
    frameInfo: FrameInfo,
    callback?: () => void,
    validMessageOrigins?: string[],
  ): void {
    app.initialize(validMessageOrigins).then(() => callback && callback());
    setCurrentFrame(frameInfo);
  }

  /**
   * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
   * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
   * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
   * than the current one in a way that keeps the app informed of the change and allows the SDK to
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

      const errorMessage =
        'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
      resolve(sendAndDefaultError('navigateCrossDomain', errorMessage, url));
    });
  }

  /**
   * Registers a handler for changes from or to full-screen view for a tab.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
   */
  export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
    ensureInitialized();
    registerHandler('fullScreenChange', handler);
  }

  /**
   * Checks if page capability is supported currently
   */
  export function isSupported(): boolean {
    return runtime.supports.pages ? true : false;
  }

  /**
   * Namespace to interact with the teams specific part of the SDK.
   */
  export namespace tabs {
    /**
     * Navigates the hosted app to the specified tab instance.
     * @param tabInstance The tab instance to navigate to.
     * @returns Promise that resolves when the navigation has completed.
     */
    export function navigateToTab(tabInstance: TabInstance): Promise<void> {
      return new Promise<void>(resolve => {
        ensureInitialized();
        const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
        resolve(sendAndDefaultError('navigateToTab', errorMessage, tabInstance));
      });
    }
    /**
     * Allows an app to retrieve for this user tabs that are owned by this app.
     * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
     * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
     * @returns Promise that resolves with the {@link TabInformation}.
     */
    export function getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return new Promise<TabInformation>(resolve => {
        ensureInitialized();
        resolve(sendAndUnwrap('getTabInstances', tabInstanceParameters));
      });
    }

    /**
     * Allows an app to retrieve the most recently used tabs for this user.
     * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
     * @returns Promise that resolves with the {@link TabInformation}.
     */
    export function getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
      return new Promise<TabInformation>(resolve => {
        ensureInitialized();
        resolve(sendAndUnwrap('getMruTabInstances', tabInstanceParameters));
      });
    }

    /**
     * Checks if pages.tabs capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.tabs ? true : false) : false;
    }
  }
  /**
   * Namespace to interact with the config-specific part of the SDK.
   * This object is usable only on the config frame.
   */
  export namespace config {
    let saveHandler: (evt: SaveEvent) => void;
    let removeHandler: (evt: RemoveEvent) => void;

    export function initialize(): void {
      registerHandler('settings.save', handleSave, false);
      registerHandler('settings.remove', handleRemove, false);
    }

    /**
     * Sets the validity state for the config.
     * The initial value is false, so the user cannot save the config until this is called with true.
     * @param validityState Indicates whether the save or remove button is enabled for the user.
     */
    export function setValidityState(validityState: boolean): void {
      ensureInitialized(FrameContexts.settings, FrameContexts.remove);
      sendMessageToParent('settings.setValidityState', [validityState]);
    }

    /**
     * Gets the config for the current instance.
     * @returns Promise that resolves with the {@link Config} object.
     */
    export function getConfig(): Promise<Config> {
      return new Promise<Config>(resolve => {
        ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.remove, FrameContexts.sidePanel);
        resolve(sendAndUnwrap('settings.getSettings'));
      });
    }

    /**
     * Sets the config for the current instance.
     * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
     * @param Config The desired config for this instance.
     * @returns Promise that resolves when the operation has completed.
     */
    export function setConfig(instanceSettings: Config): Promise<void> {
      return new Promise<void>(resolve => {
        ensureInitialized(FrameContexts.content, FrameContexts.settings, FrameContexts.sidePanel);
        resolve(send('settings.setSettings', instanceSettings));
      });
    }

    /**
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler The handler to invoke when the user selects the save button.
     */
    export function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void {
      ensureInitialized(FrameContexts.settings);
      saveHandler = handler;
      handler && sendMessageToParent('registerHandler', ['save']);
    }

    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user selects the remove button.
     */
    export function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void {
      ensureInitialized(FrameContexts.remove, FrameContexts.settings);
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
     * Registers a handler for when the user reconfigurated tab
     * @param handler The handler to invoke when the user click on Settings.
     */
    export function registerChangeConfigHandler(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      registerHandler('changeSettings', handler);
    }

    export interface Config {
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
       * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
       */
      notifyFailure(reason?: string): void;
    }

    export interface RemoveEvent {
      /**
       * Indicates that the underlying resource has been removed and the content can be removed.
       */
      notifySuccess(): void;
      /**
       * Indicates that removal of the underlying resource failed and that the content cannot be removed.
       * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
       */
      notifyFailure(reason?: string): void;
    }

    export interface SaveParameters {
      /**
       * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
       */
      webhookUrl?: string;
    }

    /**
     * @private
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
     * @private
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
     * Checks if pages.config capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.config ? true : false) : false;
    }
  }

  /**
   * Namespace to interact with the back-stack part of the SDK.
   */
  export namespace backStack {
    let backButtonPressHandler: () => boolean;

    export function _initialize(): void {
      registerHandler('backButtonPress', handleBackButtonPress, false);
    }

    /**
     * Navigates back in the hosted app. See registerBackButtonHandler for more information on when
     * it's appropriate to use this method.
     * @returns Promise that resolves when the navigation has completed.
     */
    export function navigateBack(): Promise<void> {
      return new Promise<void>(resolve => {
        ensureInitialized();
        const errorMessage = 'Back navigation is not supported in the current client or context.';
        resolve(sendAndDefaultError('navigateBack', errorMessage));
      });
    }

    /**
     * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
     * navigation stack should use this handler to navigate the user back within their frame. If an app finds
     * that after running its back button handler it cannot handle the event it should call the navigateBack
     * method to ask the Teams client to handle it instead.
     * @param handler The handler to invoke when the user presses their Team client's back button.
     */
    export function registerBackButtonHandler(handler: () => boolean): void {
      backButtonPressHandler = handler;
      handler && sendMessageToParent('registerHandler', ['backButton']);
    }

    function handleBackButtonPress(): void {
      if (!backButtonPressHandler || !backButtonPressHandler()) {
        navigateBack();
      }
    }

    /**
     * Checks if pages.backStack capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.backStack ? true : false) : false;
    }
  }

  export namespace fullTrust {
    /**
     * @private
     * Hide from docs
     * ------
     * Place the tab into full-screen mode.
     */
    export function enterFullscreen(): void {
      ensureInitialized(FrameContexts.content);
      sendMessageToParent('enterFullscreen', []);
    }

    /**
     * @private
     * Hide from docs
     * ------
     * Reverts the tab into normal-screen mode.
     */
    export function exitFullscreen(): void {
      ensureInitialized(FrameContexts.content);
      sendMessageToParent('exitFullscreen', []);
    }
    /**
     * Checks if pages.fullTrust capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.fullTrust ? true : false) : false;
    }
  }

  /**
   * Namespace to interact with the app button part of the SDK.
   */
  export namespace appButton {
    /**
     * Registers a handler for clicking the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
     */
    export function onClick(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      registerHandler('appButtonClick', handler);
    }

    /**
     * Registers a handler for entering hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
     */
    export function onHoverEnter(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      registerHandler('appButtonHoverEnter', handler);
    }

    /**
     * Registers a handler for exiting hover of the app button.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
     */
    export function onHoverLeave(handler: () => void): void {
      ensureInitialized(FrameContexts.content);
      registerHandler('appButtonHoverLeave', handler);
    }

    /**
     * Checks if pages.appButton capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.pages ? (runtime.supports.pages.appButton ? true : false) : false;
    }
  }
}
