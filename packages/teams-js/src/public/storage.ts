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
  export function isWebStorageClearedOnUserLogOut(): boolean {
    ensureInitialized();
    // return true as storage is always cleared on desktop.
    if (GlobalVars.hostClientType === HostClientType.desktop) {
      return true;
    }
    return isSupported();
  }

  export function isSupported(): boolean {
    return runtime.supports.storage ? true : false;
  }
}
