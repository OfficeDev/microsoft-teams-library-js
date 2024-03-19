import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { ErrorCode } from '../public';
import { runtime } from '../public/runtime';

export namespace otherAppStateChange {
  /**
   * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
   */
  const otherAppStateChangeTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

  /**
   * @hidden
   * @beta
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface OtherAppStateChangeEvent {
    appIds: string[];
  }

  /**
   * @hidden
   * @beta
   * @internal
   * Limited to Microsoft-internal use
   */
  export type OtherAppStateChangeEventHandler = (event: OtherAppStateChangeEvent) => void;

  /**
   * @hidden
   * @beta
   * @internal
   * Limited to Microsoft-internal use
   *
   * @throws Error if {@link app.initialize} has not successfully completed, if the platform
   * does not support the otherAppStateChange capability, or if a valid handler is not passed to the function.
   */
  export function registerAppInstallationHandler(appInstallHandler: OtherAppStateChangeEventHandler): void {
    if (!isSupported()) {
      throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
    }

    if (isNullOrUndefined(appInstallHandler)) {
      throw new Error(ErrorCode.INVALID_ARGUMENTS.toString());
    }

    registerHandler(
      getApiVersionTag(otherAppStateChangeTelemetryVersionNumber, ApiName.OtherAppStateChange_Install),
      ApiName.OtherAppStateChange_Install,
      appInstallHandler,
    );
  }

  /**
   * @hidden
   * @beta
   * @internal
   * Limited to Microsoft-internal use
   *
   * @throws Error if {@link app.initialize} has not successfully completed or if the platform
   * does not support the otherAppStateChange capability.
   */
  export function unregisterAppInstallationHandler(): void {
    if (!isSupported()) {
      throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
    }

    sendMessageToParent(
      getApiVersionTag(otherAppStateChangeTelemetryVersionNumber, ApiName.OtherAppStateChange_UnregisterInstall),
      ApiName.OtherAppStateChange_UnregisterInstall,
    );

    removeHandler(ApiName.OtherAppStateChange_Install);
  }

  /**
   * Checks if the otherAppStateChange capability is supported by the host
   * @returns boolean to represent whether the otherAppStateChange capability is supported
   *
   * @throws Error if {@link app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.otherAppStateChange ? true : false;
  }
}
