import { ensureInitialized } from '../internal/internalAPIs';
import { runtime } from '../public/runtime';

/**
 * @beta
 * User information required by specific apps
 */
export namespace copilot {
  export namespace license {
    /**
     * This function is called by M365Chat app.
     * @returns true if a user had M365Chat license and false otherwise
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    export function isSupported(): boolean {
      return (ensureInitialized(runtime) && runtime.hostVersionsInfo?.m365ChatLicenseInfo?.hasM365ChatLicense) ?? false;
    }
  }
}
