import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

/**
 * Contains functionality to allow web apps to store data in webview cache
 *
 * @beta
 */
export namespace storage {
  export function isWebStorasgeSupported(): boolean {
    ensureInitialized();
    return isSupported();
  }

  export function isSupported(): boolean {
    return runtime.supports.storage ? true : false;
  }
}
