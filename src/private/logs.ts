import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, sendMessageToParent } from '../internal/communication';

/**
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * @private
 * Hide from docs
 */
export namespace logs {
  export function initialize(): void {
    registerHandler('log.request', handleGetLogRequest);
  }

  function handleGetLogRequest(): void {
    if (GlobalVars.getLogHandler) {
      const log: string = GlobalVars.getLogHandler();
      sendMessageToParent('log.receive', [log]);
    }
  }

  /**
   * @private
   * Hide from docs
   * ------
   * Registers a handler for getting app log
   * @param handler The handler to invoke to get the app log
   */
  export function registerGetLogHandler(handler: () => string): void {
    ensureInitialized();

    GlobalVars.getLogHandler = handler;
    handler && sendMessageToParent('registerHandler', ['log.request']);
  }
}
