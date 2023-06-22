import { sendAndHandleSdkError } from '../internal/communication';
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
   * Function to copy text to clipboard.
   * @param blob - A Blob object representing the data to be copied to clipboard.
   */
  export function write(blob: Blob): Promise<void> {
    return new Promise<void>((resolve) => {
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
      resolve(sendAndHandleSdkError('clipboard.writeToClipboard', blob));
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
    return ensureInitialized(runtime) && (!navigator || !navigator.clipboard) && runtime.supports.clipboard
      ? true
      : false;
  }
}
