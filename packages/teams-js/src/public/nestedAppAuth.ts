import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

/**
 * @beta
 * Nested app auth capabilities
 */
export namespace nestedAppAuthService {
  /**
   * @beta
   * @returns true if NAA bridge is available and false otherwise
   */
  export function isBridgeAvailable(): boolean {
    return ensureInitialized(runtime) && runtime.supports.nestedAppAuth ? true : false;
  }
  /**
   * @beta
   * @returns true if host is recommending NAA channel and false otherwise
   */
  export function isChannelRecommended(): boolean {
    return ensureInitialized(runtime) && runtime.isNAAChannelRecommended ? true : false;
  }
}
