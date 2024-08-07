import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the stage view specific part of the SDK.
 *
 *  @beta
 */
export namespace offline {
  /**
   * Parameters to open a stage view.
   */
  export interface OfflineParams {
    /**
     * The ID of the Teams application to be opened.
     */
    invalidationUrl: string;
  }

  /**
   *
   * Opens a stage view to display a Teams application
   * @beta
   * @param stageViewParams - The parameters to pass into the stage view.
   * @returns Promise that resolves or rejects with an error once the stage view is closed.
   */
  export function enableOfflineMode(offlineParams: OfflineParams): Promise<void> {
    return new Promise((resolve) => {
      ensureInitialized(runtime);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (!offlineParams) {
        throw new Error('[offline.enableOfflineMode] Offline params cannot be null');
      }

      resolve(
        sendAndHandleSdkError(
          getApiVersionTag(ApiVersionNumber.V_2, ApiName.Offline_enableOfflineMode),
          'offline.enableOfflineMode',
          offlineParams,
        ),
      );
    });
  }

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.offline ? true : false;
  }
}
