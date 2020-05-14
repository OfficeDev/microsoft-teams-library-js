import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { frameContexts } from '../internal/constants';

/**
 * Namespace for device related APIs. These are implemented only for mobile (Android and iOS)
 * On desktop, these APIs will be a noop.
 */
export namespace device {
  /**
   * Status codes for device APIs
   * @see File
   */
  export enum StatusCode {
    Success = 0,
    /**
     * Missing required permission to perform the action
     */
    PermissionError = 1,
    /**
     * Error encountered while performing the required operation.
     * e.g. Camera failed, compression failed etc
     */
    InternalError = 2,
    /**
     * User cancelled the action
     */
    UserCancelled = 3,
  }

  export enum FileFormat {
    Base64 = "base64"
  }

  /**
   * File object that can be used to represent image or video or audio
   * The object will have "statusCode" as defined in StatusCode enum
   * The user of this API should check "statusCode" to be "Success" before reading the "content"
   * In case of other status codes, app can decide to show an error message to the user
   * @see StatusCode
   */
  export interface File {
    /**
     * Status code
     */
    statusCode: StatusCode;

    /**
     *  Content of the file
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
     * MIME type
     */
    mimeType?: string;

    /**
     * Optional: Name of the file
     */
    name?: string;
  }

  /**
   * Launch camera, capture image or choose image from gallery and return the images as a File[] object to the callback
   * File object returned will have status codes to call out error scenarios
   * App can check against the StatusCode enum to find out the exact cause and present
   * the user with appropriate error message. App should also do a `statusCode == Success` check before accessing the content
   * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one
   * @see File
   */
  export function getImages(callback: (files: File[]) => void): void {
    if (!callback) {
      throw new Error('[device.getImages] Callback cannot be null');
    } 
    ensureInitialized(frameContexts.content);
    const messageId = sendMessageRequestToParent('device.getImages');
    GlobalVars.callbacks[messageId] = callback;
  }
}
