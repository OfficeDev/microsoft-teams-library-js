import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { uploadLogsWithAzureSas } from '../internal/utils';
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
   * @internal
   * Limited to Microsoft-internal use
   */
  interface ILogRequestOptions {
    appId: string;
    appSessionId?: string;
    azureSas: string;
  }

  /**
   * @hidden
   * Registers a handler for getting app log
   * @param handler - The handler to invoke to get the app log
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function registerGetLogHandler(handler: () => string | Promise<string>): void {
    ensureInitialized();
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (handler) {
      registerHandler('log.request', ({ appId, appSessionId, azureSas }: ILogRequestOptions) => {
        Promise.resolve(handler()).then(log => {
          appId && azureSas
            ? uploadLogsWithAzureSas(log, `${appId}_${appSessionId}.txt`, azureSas)
            : sendMessageToParent('log.receive', [log]);
        });
      });
    } else {
      removeHandler('log.request');
    }
  }

  /**
   * @hidden
   *
   * @returns boolean to represent whether the logs capability is supported
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return runtime.supports.logs ? true : false;
  }
}
