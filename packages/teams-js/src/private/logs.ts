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
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace logs {
  /**
   * @hidden
   *
   * Registers a handler for getting app log
   *
   * @param handler - The handler to invoke to get the app log
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerGetLogHandler(handler: () => string): void {
    // allow for registration cleanup even when not finished initializing
    handler && ensureInitialized(runtime);
    if (handler && !isSupported()) {
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

  /**
   * @hidden
   *
   * Checks if the logs capability is supported by the host
   * @returns boolean to represent whether the logs capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.logs ? true : false;
  }
}
