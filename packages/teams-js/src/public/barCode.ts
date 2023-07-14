import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission, ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the barcode scanning-specific part of the SDK.
 *
 * @beta
 */
export namespace barCode {
  /**
   * Data structure to customize the barcode scanning experience in scanBarCode API.
   * All properties in BarCodeConfig are optional and have default values in the platform
   *
   * @beta
   */
  export interface BarCodeConfig {
    /**
     * Optional; designates the scan timeout interval in seconds.
     * Default value is 30 seconds, max allowed value is 60 seconds.
     */
    timeOutIntervalInSec?: number;
  }

  /**
   * Scan Barcode or QRcode using camera
   *
   * @param barCodeConfig - input configuration to customize the barcode scanning experience
   *
   * @returns a scanned code
   *
   * @beta
   */
  export function scanBarCode(barCodeConfig: BarCodeConfig): Promise<string> {
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
