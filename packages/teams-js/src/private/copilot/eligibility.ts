/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { sendAndUnwrap } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../../public/constants';
import { AppEligibilityInformation, isSdkError, LegalAgeGroupClassification, SdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
const copilotLogger = getLogger('copilot');

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
 *
 * @param forceRefresh - boolean to represent whether to force refresh the eligibility information
 * @returns the copilot eligibility information about the user
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getEligibilityInfo(forceRefresh?: boolean): Promise<AppEligibilityInformation> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw new Error(`Error code: ${errorNotSupportedOnPlatform.errorCode}, message: Not supported on platform`);
  }

  // Return the eligibility information if it is already available
  if (runtime.hostVersionsInfo?.appEligibilityInformation && !forceRefresh) {
    copilotLogger('Eligibility information is already available on runtime.');
    return runtime.hostVersionsInfo!.appEligibilityInformation;
  }

  copilotLogger('Eligibility information is not available on runtime. Requesting from host.');
  // Send message to host SDK to get eligibility information
  const response = await sendAndUnwrap<AppEligibilityInformation | SdkError>(
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_Eligibility_GetEligibilityInfo),
    ApiName.Copilot_Eligibility_GetEligibilityInfo,
    forceRefresh,
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
  // convert nonAdult age group to NotAdult
  if ((response.ageGroup as unknown as string)?.toLowerCase() === 'nonadult') {
    response.ageGroup = LegalAgeGroupClassification.NotAdult;
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
    eligibilityInfo.isOptedOutByAdmin === undefined ||
    (eligibilityInfo.featureSet &&
      (eligibilityInfo.featureSet.serverFeatures === undefined || eligibilityInfo.featureSet.uxFeatures === undefined))
  ) {
    return false;
  }
  return true;
}
