import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { TabInformation, TabInstanceParameters, LoadContext, FrameContext } from './interfaces';
import { FrameContexts } from './constants';
import { core } from './publicAPIs';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { sendMessageToParent } from '../internal/communication';

/**
 * Namespace containing the set of APIs that support Teams-specific functionalities.
 */

export namespace teamsCore {
  /**
   * Enable print capability to support printing page using Ctrl+P and cmd+P
   */
  export function enablePrintCapability(): void {
    if (!GlobalVars.printCapabilityEnabled) {
      GlobalVars.printCapabilityEnabled = true;
      ensureInitialized();
      // adding ctrl+P and cmd+P handler
      document.addEventListener('keydown', (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
          print();
          event.cancelBubble = true;
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });
    }
  }

  /**
   * default print handler
   */
  export function print(): void {
    window.print();
  }

  /**
   * Registers a handler for changes from or to full-screen view for a tab.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the user toggles full-screen view for a tab.
   */
  export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
    ensureInitialized();
    Handlers.registerHandler('fullScreenChange', handler);
  }

  /**
   * Registers a handler for clicking the app button.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the personal app button is clicked in the app bar.
   */
  export function registerAppButtonClickHandler(handler: () => void): void {
    ensureInitialized(FrameContexts.content);
    Handlers.registerHandler('appButtonClick', handler);
  }

  /**
   * Registers a handler for entering hover of the app button.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when entering hover of the personal app button in the app bar.
   */
  export function registerAppButtonHoverEnterHandler(handler: () => void): void {
    ensureInitialized(FrameContexts.content);
    Handlers.registerHandler('appButtonHoverEnter', handler);
  }

  /**
   * Registers a handler for exiting hover of the app button.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when exiting hover of the personal app button in the app bar.
   */
  export function registerAppButtonHoverLeaveHandler(handler: () => void): void {
    ensureInitialized(FrameContexts.content);
    Handlers.registerHandler('appButtonHoverLeave', handler);
  }

  /**
   * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
   * navigation stack should use this handler to navigate the user back within their frame. If an app finds
   * that after running its back button handler it cannot handle the event it should call the navigateBack
   * method to ask the Teams client to handle it instead.
   * @param handler The handler to invoke when the user presses their Team client's back button.
   */
  export function registerBackButtonHandler(handler: () => boolean): void {
    ensureInitialized();
    Handlers.registerBackButtonHandler(handler);
  }

  /**
   * Registers a handler for when the user reconfigurated tab
   * @param handler The handler to invoke when the user click on Settings.
   */
  export function registerChangeSettingsHandler(handler: () => void): void {
    ensureInitialized(FrameContexts.content);
    Handlers.registerHandler('changeSettings', handler);
  }

  /**
   * Allows an app to retrieve for this user tabs that are owned by this app.
   * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
   * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
   * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
   */
  export function getTabInstances(
    callback: (tabInfo: TabInformation) => void,
    tabInstanceParameters?: TabInstanceParameters,
  ): void {
    ensureInitialized();

    sendMessageToParent('getTabInstances', [tabInstanceParameters], callback);
  }

  /**
   * Allows an app to retrieve the most recently used tabs for this user.
   * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
   * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
   */
  export function getMruTabInstances(
    callback: (tabInfo: TabInformation) => void,
    tabInstanceParameters?: TabInstanceParameters,
  ): void {
    ensureInitialized();

    sendMessageToParent('getMruTabInstances', [tabInstanceParameters], callback);
  }

  export function setFrameContext(frameContext: FrameContext): void {
    ensureInitialized(FrameContexts.content);
    sendMessageToParent('setFrameContext', [frameContext]);
  }

  export function initializeWithFrameContext(
    frameContext: FrameContext,
    callback?: () => void,
    validMessageOrigins?: string[],
  ): void {
    core.initialize(callback, validMessageOrigins);
    setFrameContext(frameContext);
  }

  /**
   * @private
   * Registers a handler to be called when the page has been requested to load.
   * @param handler The handler to invoke when the page is loaded.
   */
  export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
    ensureInitialized();
    Handlers.registerOnLoadHandler(handler);
  }

  /**
   * @private
   * Registers a handler to be called before the page is unloaded.
   * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
   * invoke the readyToUnload function provided to it once it's ready to be unloaded.
   */
  export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
    ensureInitialized();
    Handlers.registerBeforeUnloadHandler(handler);
  }
}
