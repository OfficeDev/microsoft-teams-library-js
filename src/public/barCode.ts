import { GlobalVars } from '../internal/globalVars';
import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts } from './constants';

export namespace barCode {
  /**
   * This is the SDK version when scan barcode API is supported on all three platforms android, iOS and web.
   */
  export const scanBarCodeAPIRequiredVersion = '2.0.0';

  /**
   * Optional BarCode configuration which can be passed as input to the Scan Bar Code API to customize barcode scanning experience.
   * All properties in BarCodeConfig are optional and have default values in the platform.
   */
  export interface BarCodeConfig {
    /**
     * Optional; Lets the developer to specify the type of barcode which can be scanned.
     * Default value is All i.e Both OneDBarCode and QR code can be scanned
     */
    barCodeType?: BarCodeType;
    /**
     * Optional; Lets the developer to specify the bar code scan time out interval in seconds.
     * Default value is 60 seconds
     */
    timeOutIntervalInSec?: number;
  }

  /**
   * Specifies the types of barcode which are supported by Barcode API
   */
  export enum BarCodeType {
    All = 1,
    OneDBarCode = 2,
    QRCode = 3,
  }

  /**
   * Scan Barcode/QR code
   * @param callback callback to invoke after scanning the barcode/QR code
   * @param config optional input configuration to customize the bar code scanning experience
   */
  export function scanBarCode(callback: (error: SdkError, decodedText: string) => void, config?: BarCodeConfig): void {
    if (!callback) {
      throw new Error('[barCode.scanBarCode] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!isAPISupportedByPlatform(scanBarCodeAPIRequiredVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, undefined);
      return;
    }
    const messageId = sendMessageRequestToParent('barCode.scanBarCode', [config]);
    GlobalVars.callbacks[messageId] = callback;
  }
}
