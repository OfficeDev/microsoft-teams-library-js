import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { Communication } from '../internal/communication';

/**
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * @private
 * Hide from docs
 */
export namespace logs {
  export function initialize(): void {
    Communication.registerHandler('log.request', handleGetLogRequest);
  }

  function handleGetLogRequest(): void {
    if (GlobalVars.getLogHandler) {
      const log: string = GlobalVars.getLogHandler();
      Communication.sendMessageToParent('log.receive', [log]);
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
    handler && Communication.sendMessageToParent('registerHandler', ['log.request']);
  }
}
