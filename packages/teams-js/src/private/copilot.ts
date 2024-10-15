import { sendAndUnwrap } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { AppEligibilityInformation, isSdkError, SdkError } from '../public/interfaces';
import { runtime } from '../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');
/**
 * @beta
 * @hidden
 * Namespace to delegate copilot app specific APIs
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
     * @returns boolean to represent whether copilot.eligibility capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean {
      return (
        ensureInitialized(runtime) &&
        (!!runtime.hostVersionsInfo?.appEligibilityInformation ||
          !!(runtime.supports.copilot && runtime.supports.copilot.eligibility))
      );
    }

    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     * @returns the copilot eligibility information about the user
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export async function getEligibilityInfo(): Promise<AppEligibilityInformation> {
      ensureInitialized(runtime);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      // Return the eligibility information if it is already available
      if (runtime.hostVersionsInfo?.appEligibilityInformation) {
        copilotLogger('Eligibility information is already available on runtime.');
        return Promise.resolve(runtime.hostVersionsInfo!.appEligibilityInformation);
      }

      copilotLogger('Eligibility information is not available on runtime. Requesting from host.');
      // Send message to host SDK to get eligibility information
      const response = await sendAndUnwrap<AppEligibilityInformation | SdkError>(
        getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_Eligibility_GetEligibilityInfo),
        'copilot.eligibility.getEligibilityInfo',
      );

      console.log('response:', JSON.stringify(response));

      if (isSdkError(response)) {
        throw new Error(
          `Error code: ${response.errorCode}, message: ${response.message ?? 'Failed to get eligibility information from the host.'}`,
        );
      }
      // validate response
      return response;

      // return new Promise((resolve, reject) => {
      //   // return the eligibility information if it is already available
      //   if (runtime.hostVersionsInfo?.appEligibilityInformation) {
      //     resolve(runtime.hostVersionsInfo!.appEligibilityInformation);
      //   } else {
      //     // send message to host SDK to get eligibility information
      //     sendAndUnwrap<AppEligibilityInformation | undefined>(
      //       getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_Eligibility_GetEligibilityInfo),
      //       // what should this param be? 'copilot.getEligibilityInfo' or 'getEligibilityInfo' or what I have?,
      //       'copilot.eligibility.getEligibilityInfo',
      //     )
      //       .then((result: AppEligibilityInformation | undefined) => {
      //         if (result) {
      //           resolve(result);
      //         } else {
      //           reject(new Error('Failed to get eligibility information from the host.'));
      //         }
      //       })
      //       .catch((error) => {
      //         reject(error);
      //       });
      //   }
      // });
    }
  }
}
