/**
 * Interact with the system clipboard
 *
 * @remarks
 * The clipboard module provides two paths for reading clipboard data:
 * - **Native path** ({@link readNative}): Uses the browser-native Clipboard API (`navigator.clipboard.read()`)
 *   directly in the app frame. Requires the host to delegate `clipboard-read` via iframe Permissions-Policy
 *   (device permission consent). This is the recommended path for new apps.
 * - **Legacy proxy path** ({@link read}): Sends a message to the host, which reads the clipboard on the app's
 *   behalf and marshals the data back. This path is deprecated and may be removed in a future release.
 *
 * Use {@link hasPermission} and {@link requestPermission} to check/request clipboard-read consent
 * before calling {@link readNative}.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import * as utils from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ClipboardParams, ClipboardSupportedMimeType, DevicePermission } from './interfaces';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const clipboardTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Function to copy data to clipboard.
 *
 * @deprecated
 * As of TeamsJS v2.54.0, the clipboard capability is deprecated. These APIs may stop working at
 * any time without notice: support for this capability in Teams and other host apps may be removed
 * entirely and independently of a TeamsJS major release, so continued functionality is not
 * guaranteed. The intended long-term replacement is the standardized Clipboard API provided by the
 * browser ({@link https://developer.mozilla.org/docs/Web/API/Clipboard_API | Clipboard API}, `navigator.clipboard`).
 * Note that using the browser-native Clipboard API directly within Teams hosts is not yet fully
 * supported; it depends on native device permission handling that is still being enabled as a
 * separate effort.
 *
 * @remarks
 * Note: clipboard.write only supports Text, HTML, PNG, and JPEG data format.
 *       MIME type for Text -> `text/plain`, HTML -> `text/html`, PNG/JPEG -> `image/(png | jpeg)`
 *       Also, JPEG will be converted to PNG image when copying to clipboard.
 *
 * @param blob - A Blob object representing the data to be copied to clipboard.
 * @returns A string promise which resolves to success message from the clipboard or
 *          rejects with error stating the reason for failure.
 */
export async function write(blob: Blob): Promise<void> {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.meetingStage,
    FrameContexts.task,
    FrameContexts.settings,
    FrameContexts.stage,
    FrameContexts.sidePanel,
  );
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  if (!(blob.type && Object.values(ClipboardSupportedMimeType).includes(blob.type as ClipboardSupportedMimeType))) {
    throw new Error(
      `Blob type ${blob.type} is not supported. Supported blob types are ${Object.values(ClipboardSupportedMimeType)}`,
    );
  }
  const base64StringContent = await utils.getBase64StringFromBlob(blob);
  const writeParams: ClipboardParams = {
    mimeType: blob.type as ClipboardSupportedMimeType,
    content: base64StringContent,
  };
  return sendAndHandleSdkError(
    getApiVersionTag(clipboardTelemetryVersionNumber, ApiName.Clipboard_Write),
    'clipboard.writeToClipboard',
    writeParams,
  );
}

/**
 * Function to read data from clipboard using the host-proxy path.
 *
 * @deprecated
 * As of TeamsJS v2.54.0, the clipboard capability is deprecated. Use {@link readNative} instead,
 * which reads directly via the browser-native Clipboard API. For hosts that do not yet support
 * native clipboard-read device permissions, this function remains available as a fallback.
 *
 * @returns A promise blob which resolves to the data read from the clipboard or
 *          rejects stating the reason for failure.
 *          Note: Returned blob type will contain one of the MIME type `image/png`, `text/plain` or `text/html`.
 */
export async function read(): Promise<Blob> {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.meetingStage,
    FrameContexts.task,
    FrameContexts.settings,
    FrameContexts.stage,
    FrameContexts.sidePanel,
  );
  const apiVersionTag = getApiVersionTag(clipboardTelemetryVersionNumber, ApiName.Clipboard_Read);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const response = await sendAndHandleSdkError(apiVersionTag, 'clipboard.readFromClipboard');
  if (typeof response === 'string') {
    const data = JSON.parse(response) as ClipboardParams;
    return utils.base64ToBlob(data.mimeType, data.content);
  } else {
    return response as Blob;
  }
}

/**
 * Read data from the clipboard using the browser-native Clipboard API.
 *
 * @remarks
 * This function uses `navigator.clipboard.read()` directly in the app frame. It requires
 * the host to have granted `clipboard-read` device permission consent (which delegates the
 * `clipboard-read` Permissions-Policy directive to the app's iframe). Use {@link hasPermission}
 * to check and {@link requestPermission} to request consent before calling this function.
 *
 * If the host does not support native clipboard-read permissions, falls back to the deprecated
 * host-proxy path ({@link read}).
 *
 * @returns A promise that resolves to a `ClipboardItem[]` array from the native Clipboard API.
 * @throws Error if the platform does not support clipboard or if clipboard-read permission is denied.
 *
 * @beta
 */
export async function readNative(): Promise<ClipboardItem[]> {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.meetingStage,
    FrameContexts.task,
    FrameContexts.settings,
    FrameContexts.stage,
    FrameContexts.sidePanel,
  );
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  if (!navigator.clipboard?.read) {
    throw new Error('Native Clipboard API (navigator.clipboard.read) is not available in this environment');
  }
  return navigator.clipboard.read();
}

/**
 * Checks whether the host has granted clipboard-read device permission for this app.
 *
 * @remarks
 * Sends a `permissions.has` message to the host with the `clipboard-read` device permission.
 * The host checks its consent store (e.g., IndexedDB for hub-default hosts, GraphQL for Teams)
 * and returns whether the user has previously consented to clipboard-read for this app.
 *
 * @returns Promise that resolves to `true` if the user has granted clipboard-read permission,
 *          or `false` otherwise.
 * @throws {@link errorNotSupportedOnPlatform} if the host does not support the permissions capability.
 *
 * @beta
 */
export function hasPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isPermissionSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const permissions: DevicePermission = DevicePermission.ClipboardRead;
  return new Promise<boolean>((resolve) => {
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(clipboardTelemetryVersionNumber, ApiName.Clipboard_HasPermission),
        'permissions.has',
        permissions,
      ),
    );
  });
}

/**
 * Requests clipboard-read device permission consent from the user.
 *
 * @remarks
 * Sends a `permissions.request` message to the host. The host will check the consent store:
 * - If already consented, returns `true` immediately.
 * - If never asked, shows a consent prompt to the user and returns the result.
 * - If revoked, may re-prompt depending on host policy.
 *
 * After consent is granted, the host updates the iframe's `allow` attribute to include
 * `clipboard-read`, enabling the app to call {@link readNative}.
 *
 * @returns Promise that resolves to `true` if the user consented, or `false` otherwise.
 * @throws {@link errorNotSupportedOnPlatform} if the host does not support the permissions capability.
 *
 * @beta
 */
export function requestPermission(): Promise<boolean> {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!isPermissionSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const permissions: DevicePermission = DevicePermission.ClipboardRead;
  return new Promise<boolean>((resolve) => {
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(clipboardTelemetryVersionNumber, ApiName.Clipboard_RequestPermission),
        'permissions.request',
        permissions,
      ),
    );
  });
}

/**
 * Checks if clipboard capability is supported by the host
 * @returns boolean to represent whether the clipboard capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @deprecated
 * As of TeamsJS v2.54.0, the clipboard capability is deprecated. These APIs may stop working at
 * any time without notice: support for this capability in Teams and other host apps may be removed
 * entirely and independently of a TeamsJS major release, so continued functionality is not
 * guaranteed. The intended long-term replacement is the standardized Clipboard API provided by the
 * browser ({@link https://developer.mozilla.org/docs/Web/API/Clipboard_API | Clipboard API}, `navigator.clipboard`).
 * Note that using the browser-native Clipboard API directly within Teams hosts is not yet fully
 * supported; it depends on native device permission handling that is still being enabled as a
 * separate effort.
 *
 * @beta
 */
export function isSupported(): boolean {
  if (GlobalVars.isFramelessWindow) {
    return ensureInitialized(runtime) && runtime.supports.clipboard ? true : false;
  } else {
    return ensureInitialized(runtime) && navigator && navigator.clipboard && runtime.supports.clipboard ? true : false;
  }
}

/**
 * Checks if permission capability is supported by the host for clipboard operations
 * @returns boolean to represent whether permission is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
function isPermissionSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.permissions ? true : false;
}
