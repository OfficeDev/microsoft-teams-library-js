/**
 * Interact with the system clipboard
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
 * @module
 */

import { sendAndHandleSdkError } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import * as utils from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ClipboardParams, ClipboardSupportedMimeType } from './interfaces';
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
 * Function to read data from clipboard.
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
