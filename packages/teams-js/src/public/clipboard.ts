import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
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
   *       Also, JPEG and SVG will be converted to PNG image when copying to clipboard.
   *
   * @param blob - A Blob object representing the data to be copied to clipboard.
   */
  export function write(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      ensureInitialized(
        runtime,
        FrameContexts.content,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.sidePanel,
      );
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (
        blob.type.startsWith('image') &&
        !blob.type.endsWith('png') &&
        !blob.type.endsWith('jpeg') &&
        !blob.type.endsWith('svg+xml')
      ) {
        throw `Blob type ${blob.type} is not supported.`;
      }
      sendMessageToParent('clipboard.writeToClipboard', [blob], resolve);
    });
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
