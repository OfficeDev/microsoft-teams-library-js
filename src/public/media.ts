import { GlobalVars } from '../internal/globalVars';
import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { frameContexts } from '../internal/constants';

/**
 * Enum for file formats supported
 */
export enum FileFormat {
  Base64 = 'base64',
}

/**
 * File object that can be used to represent image or video or audio
 */
export interface File {
  /**
   * Content of the file
   * App needs to convert this to dataUrl, if this must be used directly in HTML tags
   */
  content?: string;

  /**
   *  Format of the content
   */
  format?: FileFormat;

  /**
   * Size of the file in KB
   */
  size?: number;

  /**
   * MIME type. This can be used for constructing a dataUrl, if needed.
   */
  mimeType?: string;

  /**
   * Optional: Name of the file
   */
  name?: string;
}

/**
 * Launch camera, capture image or choose image from gallery and return the images as a File[] object to the callback.
 * Callback will be called with an error, if there are any. App should first check the error.
 * If it is present the user can be updated with appropriate error message.
 * If error is null or undefined, then files will have the required result.
 * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
 * Note: For desktop, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
 * @see File
 * @see SdkError
 */
export function captureImage(callback: (error: SdkError, files: File[]) => void): void {
  if (!callback) {
    throw new Error('[captureImage] Callback cannot be null');
  }
  ensureInitialized(frameContexts.content, frameContexts.task);

  if (!isAPISupportedByPlatform('1.7')) {
    let oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError, undefined);
    return;
  }

  if (!GlobalVars.isFramelessWindow) {
    let notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
    callback(notSupportedError, undefined);
    return;
  }

  const messageId = sendMessageRequestToParent('captureImage');
  GlobalVars.callbacks[messageId] = callback;
}
