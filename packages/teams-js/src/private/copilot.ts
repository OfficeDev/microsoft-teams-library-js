import { ensureInitialized } from '../internal/internalAPIs';
import { M365ChatLicenseType } from '../public/interfaces';
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
      return (ensureInitialized(runtime) &&  (runtime.hostVersionsInfo?.m365ChatLicenseInfo ?? false) && runtime.hostVersionsInfo?.m365ChatLicenseInfo?.m365ChatLicenseType !== M365ChatLicenseType.None);
    }

    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     * This function is called by M365Chat app.
     * @returns the type of the M365Chat license the user associated with the app has.
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function getM365ChatLicenseType(): M365ChatLicenseType {
      if (isSupported()) {
        return runtime.hostVersionsInfo?.m365ChatLicenseInfo?.m365ChatLicenseType ?? M365ChatLicenseType.None;
      }
      throw new Error('M365Chat license is not supported');
    }
  }
}
