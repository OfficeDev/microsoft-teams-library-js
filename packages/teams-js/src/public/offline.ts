import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from './interfaces';

export interface IOfflineCapabilities {
  /**
   * Inidicates whether the client supports web storage for the Application.
   */
  isWebStorageSupported: boolean;
}

/**
 * Provides information related to the Offline Capabilites provided to the App by the Host Client
 * @param callback Callback contains 2 parameters, error and result.
 * error can either contain an error of type SdkError (error indication), or null (non-error indication)
 * offlineCapabilities can either contain an IOfflineCapabilities object
 * (indication of successful retrieval), or null (indication of failed retrieval)
 */
export function getOfflineCapabilities(
  callback: (error: SdkError | null, offlineCapabilities: IOfflineCapabilities | null) => void,
): void {
  if (!callback) {
    throw new Error('[get app offline capabilities] Callback cannot be null');
  }
  ensureInitialized();
  sendMessageToParent('offline.getAppOfflineCapabilities', callback);
}
