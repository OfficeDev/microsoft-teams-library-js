import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

export namespace barcode {
  export interface BarCodeConfig {
    /**
     * Optional; Lets the developer specify the scan timeout interval in seconds
     * Default value is 30 seconds and max allowed value is 60 seconds
     * these defaults came from media, can be changed /removed if we want to push this up to the hosts
     */
    timeOutIntervalInSec?: number;
  }

  export function scanBarCode(barcodeConfig: BarCodeConfig): Promise<string> {
    return new Promise<string>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      if (!validateScanBarCodeInput(barcodeConfig)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      // could also not use the old message format here and totally break from media.ts, open to opinions
      // actually thinking it might be good to totally break from media. Leaving in now to provoke discussion
      resolve(sendAndHandleSdkError('media.scanBarCode', barcodeConfig));
    });
  }

  export function hasPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('barcode.hasPermission'));
    });
  }

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('barcode.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.barcode ? true : false;
  }
}
