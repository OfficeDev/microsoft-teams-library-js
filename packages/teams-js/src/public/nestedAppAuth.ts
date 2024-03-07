import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

/**
 * @beta
 * Capability that allows embedding other applications inside an existing application
 */
export namespace nestedAppAuthService {
  /**
   * @beta
   * @returns true if embedded apps are supported in this host and false otherwise
   */
  export function isBridgeAvailable(): boolean {
    return ensureInitialized(runtime) && runtime.supports.nestedAppAuth ? true : false;
  }
  /**
   * @beta
   * @returns true if embedded apps are supported in this host and false otherwise
   */
  export function isChannelRecommended(): boolean {
    return ensureInitialized(runtime) && runtime.isNAAChannelRecommended ? true : false;
  }
}
