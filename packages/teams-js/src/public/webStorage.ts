import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { HostClientType } from './constants';
import { runtime } from './runtime';

/**
 * Contains functionality to allow web apps to store data in webview cache
 *
 * @beta
 */
export namespace webStorage {
  /**
   * Checks if web storage gets cleared when a user logs out from host client
   *
   * @returns true is web storage gets cleared on logout and false if it does not
   *
   * @beta
   */
  export function isWebStorageClearedOnUserLogOut(): boolean {
    ensureInitialized();
    // return true as web storage is always cleared on desktop.
    if (GlobalVars.hostClientType === HostClientType.desktop || GlobalVars.hostClientType === HostClientType.web) {
      return true;
    }
    return isSupported();
  }

  /**
   * Checks if webStorage capability is supported by the host
   * @returns true if the webStorage capability is enabled in runtime.supports.webStorage and
   * false if it is disabled
   *
   * @beta
   */
  export function isSupported(): boolean {
    return runtime.supports.webStorage ? true : false;
  }
}
