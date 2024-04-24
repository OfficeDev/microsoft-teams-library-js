import { sendAndUnwrap } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from './constants';
import { runtime } from './runtime';

/**
 * Contains functionality enabling apps to query properties about how the host manages web storage (`Window.LocalStorage`)
 *
 * @beta
 */
export namespace webStorage {
  /**
   * Checks if web storage (`Window.LocalStorage`) gets cleared when a user logs out from host
   *
   * @returns `true` if web storage gets cleared on logout and `false` if not
   *
   * @throws `Error` if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export async function isWebStorageClearedOnUserLogOut(): Promise<boolean> {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return await sendAndUnwrap(
      getApiVersionTag(ApiVersionNumber.V_2, ApiName.WebStorage_IsWebStorageClearedOnUserLogOut),
      ApiName.WebStorage_IsWebStorageClearedOnUserLogOut,
    );
  }

  /**
   * Checks if webStorage capability is supported by the host
   * @returns boolean to represent whether the webStorage capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.webStorage !== undefined;
  }
}
