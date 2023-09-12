import { sendAndHandleSdkError } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isHostClientMobile } from '../internal/internalAPIs';
import * as utils from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from './constants';
import { ClipboardParams, ClipboardSupportedMimeType } from './interfaces';
import { runtime } from './runtime';

/**
 * Interact with the system clipboard
 *
 * @beta
 */
export namespace clipboard {
  /**
   * Function to copy data to clipboard.
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
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task, FrameContexts.stage, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (!(blob.type && Object.values(ClipboardSupportedMimeType).includes(blob.type as ClipboardSupportedMimeType))) {
      throw new Error(
        `Blob type ${blob.type} is not supported. Supported blob types are ${Object.values(
          ClipboardSupportedMimeType,
        )}`,
      );
    }
    const base64StringContent = await utils.getBase64StringFromBlob(blob);
    const writeParams: ClipboardParams = {
      mimeType: blob.type as ClipboardSupportedMimeType,
      content: base64StringContent,
    };
    return sendAndHandleSdkError('clipboard.writeToClipboard', writeParams);
  }

  /**
   * Function to read data from clipboard.
   *
   * @returns A promise blob which resolves to the data read from the clipboard or
   *          rejects stating the reason for failure.
   *          Note: Returned blob type will contain one of the MIME type `image/png`, `text/plain` or `text/html`.
   */
  export async function read(): Promise<Blob> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task, FrameContexts.stage, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (isHostClientMobile() || GlobalVars.hostClientType === HostClientType.macos) {
      const response = JSON.parse(await sendAndHandleSdkError('clipboard.readFromClipboard')) as ClipboardParams;
      return utils.base64ToBlob(response.mimeType, response.content);
    } else {
      return sendAndHandleSdkError('clipboard.readFromClipboard');
    }
  }

  /**
   * Checks if clipboard capability is supported by the host
   * @returns boolean to represent whether the clipboard capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && navigator && navigator.clipboard && runtime.supports.clipboard ? true : false;
  }
}
