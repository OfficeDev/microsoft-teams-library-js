import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

/**
 * @beta
 * @hidden
 * Namespace to delegate M365 chat app specific APIs
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace copilot {
  /**
   * @beta
   * @hidden
   * User information required by specific apps
   * @internal
   * Limited to Microsoft-internal use
   */
  export namespace license {
    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     * This function is called by M365Chat app.
     * @returns true if a user had M365Chat license and false otherwise
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return (ensureInitialized(runtime) && runtime.hostVersionsInfo?.m365ChatLicenseInfo?.hasM365ChatLicense) ?? false;
    }
  }
}
