import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * Hide from docs
 *
 * @internal
 */
export namespace logs {
  /**
   * @hidden
   * Hide from docs
   * ------
   * Registers a handler for getting app log
   *
   * @param handler - The handler to invoke to get the app log
   */
  export function registerGetLogHandler(handler: () => string): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (handler) {
      registerHandler('log.request', () => {
        const log: string = handler();
        sendMessageToParent('log.receive', [log]);
      });
    } else {
      removeHandler('log.request');
    }
  }

  export function isSupported(): boolean {
    return runtime.supports.logs ? true : false;
  }
}
