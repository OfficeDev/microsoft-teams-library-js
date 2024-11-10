/**
 * @module
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * This capability contains the APIs for handling events that happen to other applications on the host
 * *while* the developer's application is running. For example, if the developer wants to be notified
 * when another application has been installed.
 */

import { callFunctionInHost, sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { AppId } from '../public/appId';
import { ErrorCode } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const otherAppStateChangeTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * Represent an event that has happened with other number of applications installed on this host.
 * (e.g. a new app has been installed)
 */
export interface OtherAppStateChangeEvent {
  /** An array of app ids that this event applies to */
  appIds: string[];
}

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * A function handler that will be called whenever an event happens with some number of applications installed on this host.
 */
export type OtherAppStateChangeEventHandler = (event: OtherAppStateChangeEvent) => void;

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * This function allows an app to register a handler that will receive whenever other applications are installed
 * on the host while the developer's application is running.
 *
 * @param appInstallHandler - This handler will be called whenever apps are installed on the host.
 *
 * @throws Error if {@link app.initialize} has not successfully completed, if the platform
 * does not support the otherAppStateChange capability, or if a valid handler is not passed to the function.
 *
 * @example
 * ``` ts
 * if (otherAppStateChange.isSupported()) {
 *  otherAppStateChange.registerAppInstallationHandler((event: otherAppStateChange.OtherAppStateChangeEvent) => {
 *    // code to handle the event goes here
 *  });
 * }
 * ```
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
 * This function can be called so that the handler passed to {@link registerAppInstallationHandler}
 * will no longer receive app installation events. If this is called before registering a handler
 * it will have no effect.
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
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * This function should be called by the Store App to notify the host that the
 * app with the given appId has been installed.
 *
 * @throws Error if {@link app.initialize} has not successfully completed or if the platform
 * does not support the otherAppStateChange capability.
 */
export function notifyAppInstall(appId: AppId): Promise<void> {
  if (!isSupported()) {
    throw new Error(ErrorCode.NOT_SUPPORTED_ON_PLATFORM.toString());
  }

  return callFunctionInHost(
    ApiName.OtherAppStateChange_NotifyAppInstall,
    [appId.toString()],
    getApiVersionTag(otherAppStateChangeTelemetryVersionNumber, ApiName.OtherAppStateChange_NotifyAppInstall),
  );
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
