import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitialized } from '../internal/internalAPIs';
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
    if (typeof window !== 'undefined') {
      window.print();
    } else {
      // This codepath only exists to enable compilation in a server-side redered environment. In standard usage, the window object should never be undefined so this code path should never run.
      // If this error has actually been thrown, something has gone very wrong and it is a bug
      throw new Error('window object undefined at print call');
    }
  }

  /**
   * Registers a handler to be called when the page has been requested to load.
   *
   * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/build-tabs-for-meeting?tabs=desktop%2Cmeeting-chat-view-desktop%2Cmeeting-stage-view-desktop%2Cchannel-meeting-desktop#app-caching)
   * for a more detailed explanation about using this API.
   *
   * @param handler - The handler to invoke when the page is loaded.
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
