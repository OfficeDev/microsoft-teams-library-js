import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { HostClientType } from './constants';
import { runtime } from './runtime';

/**
 * Contains functionality to allow web apps to store data in webview cache
 *
 * @beta
 */
export namespace storage {
  /**
   * Checks if web storage gets cleared when a user logs out from host client
   *
   * @returns true is web storage gets cleared on logout and false if it does not
   */
  export function isWebStorageClearedOnUserLogOut(): boolean {
    ensureInitialized();
    // return true as storage is always cleared on desktop.
    if (GlobalVars.hostClientType === HostClientType.desktop) {
      return true;
    }
    return isSupported();
  }

  /**
   * Checks if storage capability is supported by the host
   * @returns true if the storage capability is enabled in runtime.supports.storage and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.storage ? true : false;
  }
}
