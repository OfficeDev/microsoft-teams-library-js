import { sendAndHandleSdkError } from '../internal/communication';
import { scanBarCodeAPIMobileSupportVersion } from '../internal/constants';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission, ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the scan barCode module-specific part of the SDK.
 */
export namespace barCode {
  /**
   * Barcode configuration supplied to scanBarCode API to customize barcode scanning experience in mobile
   * All properties in BarCodeConfig are optional and have default values in the platform
   */
  export interface BarCodeConfig {
    /**
     * Optional; Lets the developer specify the scan timeout interval in seconds
     * Default value is 30 seconds and max allowed value is 60 seconds
     */
    timeOutIntervalInSec?: number;
  }

  /**
   * Scan Barcode/QRcode using camera
   *
   * @remarks
   * Note: For desktop and web, this API is not supported.
   *
   * @param barCodeConfig - input configuration to customize the barcode scanning experience
   *
   * @return a scanned code
   */
  export function scanBarCode(barCodeConfig: BarCodeConfig): Promise<string> {
    return new Promise<string>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (!isCurrentSDKVersionAtLeast(scanBarCodeAPIMobileSupportVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
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
   * @returns if the media has user permission
   */
  export function hasPermission(): Promise<boolean> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('permissions.has', permissions));
    });
  }

  /**
   * Request user permission for media
   *
   * @returns if the user conseted permission for media
   */
  export function requestPermission(): Promise<boolean> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('permissions.request', permissions));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.barCode ? true : false;
  }
}
