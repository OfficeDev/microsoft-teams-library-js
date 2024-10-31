import { sendAndUnwrap } from '../../../internal/communication';
import { getUserJoinedTeamsSupportedAndroidClientVersion } from '../../../internal/constants';
import { GlobalVars } from '../../../internal/globalVars';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../../internal/telemetry';
import { errorNotSupportedOnPlatform, HostClientType } from '../../../public/constants';
import { ErrorCode, SdkError } from '../../../public/interfaces';
import { runtime } from '../../../public/runtime';
import { TeamInstanceParameters, UserJoinedTeamsInformation } from '../../interfaces';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const teamsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
/**
 * @hidden
 * Allows an app to retrieve information of all user joined teams
 *
 * @param teamInstanceParameters - Optional flags that specify whether to scope call to favorite teams
 * @returns Promise that resolves with information about the user joined teams or rejects with an error when the operation has completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getUserJoinedTeams(
  teamInstanceParameters?: TeamInstanceParameters,
): Promise<UserJoinedTeamsInformation> {
  return new Promise<UserJoinedTeamsInformation>((resolve) => {
    ensureInitialized(runtime);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (
      (GlobalVars.hostClientType === HostClientType.android ||
        GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
        GlobalVars.hostClientType === HostClientType.teamsPhones ||
        GlobalVars.hostClientType === HostClientType.teamsDisplays) &&
      !isCurrentSDKVersionAtLeast(getUserJoinedTeamsSupportedAndroidClientVersion)
    ) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      throw new Error(JSON.stringify(oldPlatformError));
    }

    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    resolve(
      sendAndUnwrap(
        getApiVersionTag(teamsTelemetryVersionNumber, ApiName.Teams_FullTrust_JoinedTeams_GetUserJoinedTeams),
        'getUserJoinedTeams',
        /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
        teamInstanceParameters,
      ),
    );
  });
}
/**
 * @hidden
 *
 * Checks if teams.fullTrust.joinedTeams capability is supported by the host
 * @returns boolean to represent whether the teams.fullTrust.joinedTeams capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.teams
    ? runtime.supports.teams.fullTrust
      ? runtime.supports.teams.fullTrust.joinedTeams
        ? true
        : false
      : false
    : false;
}
