import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { AppEligibilityInformation } from '../public/interfaces';
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
  export namespace eligibility {
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
      return ensureInitialized(runtime) && !!runtime.hostVersionsInfo?.appEligibilityInformation;
    }

    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     * This function is called by M365Chat app.
     * @returns the eligibility information the user associated with the app contains.
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function getEligibilityInfo(): AppEligibilityInformation {
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      return runtime.hostVersionsInfo!.appEligibilityInformation!;
    }
  }
}
