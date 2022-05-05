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
  /**
   * Enable print capability to support printing page using Ctrl+P and cmd+P
   */
  export function enablePrintCapability(): void {
    if (!GlobalVars.printCapabilityEnabled) {
      ensureInitialized();
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
    window.print();
  }

  /**
   * @hidden
   * Registers a handler to be called when the page has been requested to load.
   *
   * @param handler - The handler to invoke when the page is loaded.
   *
   * @internal
   */
  export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
    ensureInitialized();

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    Handlers.registerOnLoadHandler(handler);
  }

  /**
   * @hidden
   * Registers a handler to be called before the page is unloaded.
   *
   * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
   * invoke the readyToUnload function provided to it once it's ready to be unloaded.
   *
   * @internal
   */
  export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    Handlers.registerBeforeUnloadHandler(handler);
  }

  /**
   * Checks if teamsCore capability is supported by the host
   * @returns true if the teamsCore capability is enabled in runtime.supports.teamsCore and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.teamsCore ? true : false;
  }
}
