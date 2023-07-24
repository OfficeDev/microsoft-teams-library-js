import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized, isHostClientMobile } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Currently supported Mime type
 */
enum SupportedMimeType {
  TextPlain = 'text/plain',
  TextHtml = 'text/html',
  ImagePNG = 'image/png',
  ImageJPEG = 'image/jpeg',
  ImageSVG = 'image/svg+xml',
}

/**
 * Clipboard wirte parameters
 */
interface ClipboardParams {
  /** Mime Type of data to be copied to Clipboard */
  mimeType: SupportedMimeType;
  /** Blob content in Base64 string format */
  content: string;
}

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
    if (!(blob.type && Object.values(SupportedMimeType).includes(blob.type as SupportedMimeType))) {
      throw new Error(`Blob type ${blob.type} is not supported.`);
    }
    const writeParams: ClipboardParams = {
      mimeType: blob.type as SupportedMimeType,
      content: await getBase64StringFromBlob(blob),
    };
    return sendAndHandleSdkError('clipboard.writeToClipboard', writeParams);
  }

  /**
   * Converts blob to base64 string.
   * @param blob Blob to convert to base64 string.
   */
  function getBase64StringFromBlob(blob: Blob): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          resolve(reader.result.toString().split(',')[1]);
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
   * Convert base64 string to blob
   * @param base64Data string respresenting the content
   * @param contentType Mimetype
   * @returns Promise
   */
  function base64ToBlob(data: ClipboardParams): Promise<Blob> {
    return new Promise<Blob>((resolve) => {
      const byteCharacters = atob(data.content);
      if (data.mimeType.startsWith('image/')) {
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }
        resolve(new Blob([byteArray], { type: data.mimeType }));
      }
      resolve(new Blob([byteCharacters], { type: data.mimeType }));
    });
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
    if (isHostClientMobile()) {
      const response = await sendAndHandleSdkError('clipboard.readFromClipboard');
      return base64ToBlob(JSON.parse(response as string) as ClipboardParams);
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
