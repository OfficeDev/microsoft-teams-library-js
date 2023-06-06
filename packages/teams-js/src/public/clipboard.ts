import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission, ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the clipboard specific part of the SDK.
 *
 * @beta
 */
export namespace clipboard {
  /**
   * Clipboard config interface to interact with clipboard API.
   *
   * @beta
   */
  export interface clipboardConfig {
    /**
     * Think it through. what kind of event, what other parameters? detail it.
     * button, click event to tie it to app not to app developer calls.
     */
    clipboardConfig?: Event;
  }
  /**
   * write
   */
  export function write(barCodeConfig: BarCodeConfig): Promise<string> {
    return new Promise<string>((resolve) => {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (!validateScanBarCodeInput(barCodeConfig)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      resolve(sendAndHandleSdkError('media.scanBarCode', barCodeConfig));
    });
  }

  /**
   * Checks whether or not media has user permission
   *
   * @returns true if the user has granted the app permission to media information, false otherwise
   *
   * @beta
   */
  export function hasPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>((resolve) => {
      resolve(sendAndHandleSdkError('permissions.has', permissions));
    });
  }

  /**
   * Requests user permission for media
   *
   * @returns true if the user has granted the app permission to the media, false otherwise
   *
   * @beta
   */
  export function requestPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>((resolve) => {
      resolve(sendAndHandleSdkError('permissions.request', permissions));
    });
  }

  /**
   * Checks if barCode capability is supported by the host
   * @returns boolean to represent whether the barCode capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.barCode && runtime.supports.permissions ? true : false;
  }
}
