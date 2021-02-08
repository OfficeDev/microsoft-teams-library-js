import { ensureInitialized } from '../internal/internalAPIs';
import { Communication } from '../internal/communication';
import { Handlers } from '../internal/handlers';

/**
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * @private
 * Hide from docs
 */
export namespace logs {
  /**
   * @private
   * Hide from docs
   * ------
   * Registers a handler for getting app log
   * @param handler The handler to invoke to get the app log
   */
  export function registerGetLogHandler(handler: () => string): void {
    ensureInitialized();

    if (handler) {
      Handlers.registerHandler('log.request', () => {
        const log: string = handler();
        Communication.sendMessageToParent('log.receive', [log]);
      });
    } else {
      Handlers.removeHandler('log.request');
    }
  }
}
