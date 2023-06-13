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
   * Clipboard data formats.
   */
  export enum ClipboardDataFormat {
    /** Clipboard data in text/html format. */
    HTML = 'text/html',
    /** Clipboard data in plain text format. */
    Plain = 'text/plain',
    /** Clipboard data in image PNG format. */
    PNG = 'image/png',
    /** Clipboard data in image JPEG format. */
    JPG = 'image/jpeg',
    /** Clipboard data in image SVG format. */
    SVG = 'image/svg+xml',
  }

  /**
   * Clipboard config interface to interact with clipboard API.
   *
   * @beta
   */
  export interface ICopyToClipboard {
    /** String value */
    value?: string;
    /** Data type to be copied */
    dataType: ClipboardDataFormat;
  }

  /**
   * Function to copy text to clipboard.
   * @param clipboardConfig: {@link ICopyToClipboard} - an object representing target element or value to be copied to clipboard.
   */
  export function write(clipboardConfig: ICopyToClipboard): Promise<void> {
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
      resolve(sendAndHandleSdkError('clipboard.writeToClipboard', clipboardConfig));
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
    return ensureInitialized(runtime) && runtime.supports.clipboard ? true : false;
  }
}
