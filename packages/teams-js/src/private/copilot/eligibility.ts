import { sendAndUnwrap } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../../public/constants';
import { AppEligibilityInformation, isSdkError, SdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 */
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
    (!!runtime.hostVersionsInfo?.appEligibilityInformation || !!runtime.supports.copilot?.eligibility)
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
    throw new Error(`Error code: ${errorNotSupportedOnPlatform.errorCode}, message: Not supported on platform`);
  }

  // Return the eligibility information if it is already available
  if (runtime.hostVersionsInfo?.appEligibilityInformation) {
    copilotLogger('Eligibility information is already available on runtime.');
    return runtime.hostVersionsInfo!.appEligibilityInformation;
  }

  copilotLogger('Eligibility information is not available on runtime. Requesting from host.');
  // Send message to host SDK to get eligibility information
  const response = await sendAndUnwrap<AppEligibilityInformation | SdkError>(
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_Eligibility_GetEligibilityInfo),
    ApiName.Copilot_Eligibility_GetEligibilityInfo,
  );

  if (isSdkError(response)) {
    throw new Error(
      `Error code: ${response.errorCode}, message: ${response.message ?? 'Failed to get eligibility information from the host.'}`,
    );
  }
  // validate response
  if (!isEligibilityInfoValid(response)) {
    throw new Error('Error deserializing eligibility information');
  }
  return response;
}

function isEligibilityInfoValid(eligibilityInfo: AppEligibilityInformation): boolean {
  if (
    eligibilityInfo.ageGroup === undefined ||
    eligibilityInfo.cohort === undefined ||
    eligibilityInfo.userClassification === undefined ||
    eligibilityInfo.isCopilotEligible === undefined ||
    eligibilityInfo.isCopilotEnabledRegion === undefined ||
    eligibilityInfo.isOptedOutByAdmin === undefined
  ) {
    return false;
  }
  return true;
}
