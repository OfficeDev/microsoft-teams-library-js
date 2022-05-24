import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { validateScanBarCodeInput } from '../internal/mediaUtil';
import { FrameContexts } from './constants';
import { DevicePermission, ErrorCode } from './interfaces';
import { runtime } from './runtime';

export namespace barCode {
  export interface BarCodeConfig {
    timeOutIntervalInSec?: number;
  }

  export function scanBarCode(barCodeConfig: BarCodeConfig): Promise<string> {
    return new Promise<string>(resolve => {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      if (!validateScanBarCodeInput(barCodeConfig)) {
        throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
      }

      resolve(sendAndHandleSdkError('barcode.scan', barCodeConfig));
    });
  }

  export function hasPermission(): Promise<boolean> {
    const permissions: DevicePermission[] = [DevicePermission.Media];

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('permissions.has', permissions));
    });
  }

  export function requestPermission(): Promise<boolean> {
    const permissions: DevicePermission[] = [DevicePermission.Media];

    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('permissions.request', permissions));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.barCode ? true : false;
  }
}
