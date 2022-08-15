import { ensureInitialized } from '../internal/internalAPIs';
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
