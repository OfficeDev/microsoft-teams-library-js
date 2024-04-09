import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from './runtime';

/**
 * @beta
 * Nested app auth capabilities
 */
export namespace nestedAppAuth {
  /**
   * Checks if MSAL-NAA channel recommended by the host
   * @returns true if host is recommending NAA channel and false otherwise
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isNAAChannelRecommended(): boolean {
    return (ensureInitialized(runtime) && runtime.isNAAChannelRecommended) ?? false;
  }
}
