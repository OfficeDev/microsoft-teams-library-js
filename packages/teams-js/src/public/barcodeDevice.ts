import { sendAndHandleSdkError } from '../internal/communication';
import { scanBarCodeAPIMobileSupportVersion } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { FrameContexts, HostClientType } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

export namespace barcodeDevice {
  /**
   * Scan Barcode/QRcode using camera
   *
   * @remarks
   * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   * @param config - optional input configuration to customize the barcode scanning experience
   * @returns A promise resolved with the barcode data or rejected with an @see SdkError
   */
  export function scanBarCode(config?: BarCodeConfig): Promise<string> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    return new Promise<string>(resolve => {
      if (
        GlobalVars.hostClientType === HostClientType.desktop ||
        GlobalVars.hostClientType === HostClientType.web ||
        GlobalVars.hostClientType === HostClientType.rigel ||
        GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
        GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
        GlobalVars.hostClientType === HostClientType.teamsPhones ||
        GlobalVars.hostClientType === HostClientType.teamsDisplays
      ) {
        throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
      }

      if (!isCurrentSDKVersionAtLeast(scanBarCodeAPIMobileSupportVersion)) {
        throw { errorCode: ErrorCode.OLD_PLATFORM };
      }

      if (!validateScanBarCodeInput(config)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      resolve(sendAndHandleSdkError('media.scanBarCode', config));
    });
  }

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

  export function isSupported(): boolean {
    return runtime.supports.barcodeDevice ? true : false;
  }
}
