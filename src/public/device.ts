import {
  ensureInitialized,
  sendMessageRequestToParent,
} from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
export namespace device {
  /**
   *  Error object
   */
  export interface Error {
    /**
     *  Error code
     */
    code: number;

    /**
     *  Error description
     */

    description: string;

    /**
     * Localized description
     */

    localizedDescription: string;
  }

  /**
   *  File object that can be used to represent image or video or audio.
   * The object will have either “error” attribute populated, or the remaining fields.
   * The user of this API should check if “error” if null before reading the “content” .
   * In case of error, app can decide to show an error message to the user
   */
  export interface File {
    /**
     *  Content of the file
     */
    content?: string;

    /**
     *  Format of the content
     */
    format?: string;

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

    /**
     * Error , if any
     */
    error?: Error;
  }

  /** 
   * Launch camera, capture image or choose image from gallery  
   * Return the image as a File object to the callback. 
   * In case of error, the error attribute will be populated with an Error obejct. 
   */  
  export function getImage(callback: (file: File) => void): void {
    ensureInitialized();
    const messageId = sendMessageRequestToParent('device.getImage');
    GlobalVars.callbacks[messageId] = callback;  
  }
}
