import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitialized } from '../internal/internalAPIs';
import { LoadContext } from './interfaces';

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

  /**
   * @private
   * Registers a handler when focus needs to be passed from teams to the place of choice on app.
   * @param handler The handler to invoked by the app when they want the focus to be in the place of their choice.
   */
  export function registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void {
    ensureInitialized();
    Handlers.registerHandler('focusEnter', handler);
  }
}
