import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitialized } from '../internal/internalAPIs';
import { ssrSafeWindow } from '../internal/utils';
import { errorNotSupportedOnPlatform } from './constants';
import { LoadContext } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace containing the set of APIs that support Teams-specific functionalities.
 */
export namespace teamsCore {
  /** Ready to unload function type */
  type readyToUnloadFunctionType = () => void;
  /** Register on load handler function type */
  type registerOnLoadHandlerFunctionType = (context: LoadContext) => void;
  /** Register before unload handler function type */
  type registerBeforeUnloadHandlerFunctionType = (readyToUnload: readyToUnloadFunctionType) => boolean;
  /**
   * Enable print capability to support printing page using Ctrl+P and cmd+P
   */
  export function enablePrintCapability(): void {
    if (!GlobalVars.printCapabilityEnabled) {
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      GlobalVars.printCapabilityEnabled = true;
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
    ssrSafeWindow().print();
  }

  /**
   * Registers a handler to be called when the page has been requested to load.
   *
   * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/build-tabs-for-meeting?tabs=desktop%2Cmeeting-chat-view-desktop%2Cmeeting-stage-view-desktop%2Cchannel-meeting-desktop#app-caching)
   * for a more detailed explanation about using this API.
   *
   * @param handler - The handler to invoke when the page is loaded.
   *
   * @deprecated
   * As of 2.14.1, please use {@link app.lifecycle.registerOnResumeHandler} instead.
   *
   * @beta
   */
  export function registerOnLoadHandler(handler: registerOnLoadHandlerFunctionType): void {
    registerOnLoadHandlerHelper(handler, () => {
      if (handler && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    });
  }

  /**
   * @hidden
   * Undocumented helper function with shared code between deprecated version and current version of the registerOnLoadHandler API.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @param handler - The handler to invoke when the page is loaded.
   * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
   *
   * @deprecated
   */
  export function registerOnLoadHandlerHelper(
    handler: registerOnLoadHandlerFunctionType,
    versionSpecificHelper?: () => void,
  ): void {
    // allow for registration cleanup even when not finished initializing
    handler && ensureInitialized(runtime);

    if (handler && versionSpecificHelper) {
      versionSpecificHelper();
    }

    Handlers.registerOnLoadHandler(handler);
  }

  /**
   * Registers a handler to be called before the page is unloaded.
   *
   * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/build-tabs-for-meeting?tabs=desktop%2Cmeeting-chat-view-desktop%2Cmeeting-stage-view-desktop%2Cchannel-meeting-desktop#app-caching)
   * for a more detailed explanation about using this API.
   *
   * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
   * invoke the readyToUnload function provided to it once it's ready to be unloaded.
   *
   * @deprecated
   * @beta
   */
  export function registerBeforeUnloadHandler(handler: registerBeforeUnloadHandlerFunctionType): void {
    registerBeforeUnloadHandlerHelper(handler, () => {
      if (handler && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    });
  }

  /**
   * @hidden
   * Undocumented helper function with shared code between deprecated version and current version of the registerBeforeUnloadHandler API.
   *
   * @internal
   * Limited to Microsoft-internal use
   *
   * @param handler - - The handler to invoke before the page is unloaded. If this handler returns true the page should
   * invoke the readyToUnload function provided to it once it's ready to be unloaded.
   * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
   *
   * @deprecated
   */
  export function registerBeforeUnloadHandlerHelper(
    handler: registerBeforeUnloadHandlerFunctionType,
    versionSpecificHelper?: () => void,
  ): void {
    // allow for registration cleanup even when not finished initializing
    handler && ensureInitialized(runtime);
    if (handler && versionSpecificHelper) {
      versionSpecificHelper();
    }
    Handlers.registerBeforeUnloadHandler(handler);
  }

  /**
   * Checks if teamsCore capability is supported by the host
   *
   * @returns boolean to represent whether the teamsCore capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.teamsCore ? true : false;
  }
}
