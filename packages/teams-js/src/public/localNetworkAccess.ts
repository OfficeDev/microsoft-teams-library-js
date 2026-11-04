/**
 * APIs for requesting permission to access devices on the user's local network.
 *
 * @remarks
 * The TeamsJS permission value is `localNetworkAccess`. The browser Permissions-Policy directive
 * uses the separate `local-network-access` spelling.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission } from './interfaces';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All APIs in this capability file should send API version v2 only.
 */
const localNetworkAccessTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Checks whether the app has permission to access devices on the user's local network.
 *
 * @returns A promise that resolves to `true` if local network access permission has been granted,
 * or `false` otherwise.
 * @throws {@link errorNotSupportedOnPlatform} if the host does not support local network access permission.
 *
 * @beta
 */
export function hasPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  return sendAndHandleSdkError(
    getApiVersionTag(localNetworkAccessTelemetryVersionNumber, ApiName.LocalNetworkAccess_HasPermission),
    'permissions.has',
    DevicePermission.LocalNetworkAccess,
  );
}

/**
 * Requests permission to access devices on the user's local network.
 *
 * @returns A promise that resolves to `true` if local network access permission was granted,
 * or `false` otherwise.
 * @throws {@link errorNotSupportedOnPlatform} if the host does not support local network access permission.
 *
 * @beta
 */
export function requestPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  return sendAndHandleSdkError(
    getApiVersionTag(localNetworkAccessTelemetryVersionNumber, ApiName.LocalNetworkAccess_RequestPermission),
    'permissions.request',
    DevicePermission.LocalNetworkAccess,
  );
}

/**
 * Checks whether the host supports local network access permission.
 *
 * @returns `true` if the host advertises local network access permission support, or `false` otherwise.
 * @throws Error if {@linkcode app.initialize} has not successfully completed.
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.permissions?.localNetworkAccess;
}
