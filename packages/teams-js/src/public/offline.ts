import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the offline specific part of the SDK.
 *
 *  @beta
 */
export namespace offline {
  /**
   * Parameters to enable offline mode.
   */
  export interface OfflineModeParams {
    /**
     * The invalidation URL for the app.
     */
    invalidationUrl: string;
  }

  /**
   *
   * Enabled offline mode for the app
   * @beta
   * @param offlineModeParams - The parameters to pass into the enable offline mode.
   * @returns Promise that resolves or rejects with an error once the  is closed.
   */
  export function enableOfflineMode(offlineModeParams: OfflineModeParams): Promise<void> {
    return new Promise((resolve) => {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (!offlineModeParams) {
        throw new Error('[offline.enableOfflineMode] Offline params cannot be null');
      }
    
      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.Offline_enableOfflineMode),
          'offline.enableOfflineMode',
          offlineModeParams,
        ),
      );
    });
  }

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.offline ? true : false;
  }
}
