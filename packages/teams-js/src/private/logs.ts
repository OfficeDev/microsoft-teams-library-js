import { sendMessageToParentWithVersion } from '../internal/communication';
import { registerHandlerWithVersion, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const logsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

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
    !isNullOrUndefined(handler) && ensureInitialized(runtime);
    if (!isNullOrUndefined(handler) && !isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (handler) {
      registerHandlerWithVersion(
        getApiVersionTag(logsTelemetryVersionNumber, ApiName.Logs_RegisterLogRequestHandler),
        'log.request',
        () => {
          const log: string = handler();
          sendMessageToParentWithVersion(
            getApiVersionTag(logsTelemetryVersionNumber, ApiName.Logs_Receive),
            'log.receive',
            [log],
          );
        },
      );
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
