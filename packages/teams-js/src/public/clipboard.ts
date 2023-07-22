import { sendAndHandleSdkError } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the clipboard specific part of the SDK.
 *
 * @beta
 */
export namespace clipboard {
  /**
   * Function to copy data to clipboard.
   * @remarks
   * Note: clipboard.write only supports Text, HTML, PNG, JPEG and SVG data format.
   *       MIME type for Text -> `text/plain`, HTML -> `text/html`, PNG/JPEG/SVG -> `image/(png | jpeg | svg+xml)`
   *       Also, JPEG and SVG will be converted to PNG image when copying to clipboard.
   *
   * @param blob - A Blob object representing the data to be copied to clipboard.
   * @returns A string promise which resolves to success message from the clipboard or
   *          rejects with error stating the reason for failure.
   */
  export async function write(blob: Blob): Promise<string> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task, FrameContexts.stage, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (
      (blob.type.startsWith('image') &&
        !blob.type.endsWith('png') &&
        !blob.type.endsWith('jpeg') &&
        !blob.type.endsWith('svg+xml')) ||
      (blob.type.startsWith('text') && !blob.type.endsWith('plain') && !blob.type.endsWith('html'))
    ) {
      throw new Error(`Blob type ${blob.type} is not supported.`);
    }
    if (GlobalVars.hostClientType === HostClientType.android) {
      const data: string | ArrayBuffer = await getBase64StringFromBlob(blob);
      return sendAndHandleSdkError('clipboard.writeToClipboard', data);
    } else {
      return sendAndHandleSdkError('clipboard.writeToClipboard', blob);
    }
  }

  /**
   * Converts blob to base64 string.
   * @param blob Blob to convert to base64 string.
   * @param callback function to set the data.
   */
  function getBase64StringFromBlob(blob: Blob): Promise<string | ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read the blob'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Function to read data from clipboard.
   *
   * @returns A promise blob which resolves to the data read from the clipboard or
   *          rejects stating the reason for failure.
   *          Note: Returned blob type will contain one of the MIME type `image/png`, `text/plain` or `text/html`.
   */
  export function read(): Promise<Blob> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task, FrameContexts.stage, FrameContexts.sidePanel);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    if (GlobalVars.hostClientType === HostClientType.android) {
      return sendAndHandleSdkError('clipboard.readFromClipboard');
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
