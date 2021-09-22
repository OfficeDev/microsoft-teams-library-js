import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { HostClientType } from '../public/constants';
import { TeamInstanceParameters, UserJoinedTeamsInformation } from './interfaces';
import { sendAndUnwrap } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ErrorCode, SdkError } from '../public/interfaces';
import { getUserJoinedTeamsSupportedAndroidClientVersion } from '../internal/constants';
import { runtime } from '../public/runtime';

export namespace legacy {
  export namespace fullTrust {
    /**
     * @private
     * Hide from docs
     * ------
     * Allows an app to retrieve information of all user joined teams
     * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
     * @returns Promise resolved containing information about the user joined teams or rejected with error
     */
    export function getUserJoinedTeams(
      teamInstanceParameters?: TeamInstanceParameters,
    ): Promise<UserJoinedTeamsInformation> {
      return new Promise<UserJoinedTeamsInformation>(resolve => {
        ensureInitialized();

        if (
          (GlobalVars.hostClientType === HostClientType.android ||
            GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
            GlobalVars.hostClientType === HostClientType.teamsPhones ||
            GlobalVars.hostClientType === HostClientType.teamsDisplays) &&
          !isAPISupportedByPlatform(getUserJoinedTeamsSupportedAndroidClientVersion)
        ) {
          const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
          throw new Error(JSON.stringify(oldPlatformError));
        }

        resolve(sendAndUnwrap('getUserJoinedTeams', teamInstanceParameters));
      });
    }

    /**
     * @private
     * Hide from docs
     * ------
     * Allows an app to get the configuration setting value
     * @param key The key for the config setting
     * @returns Promise resolved containing the value for the provided config setting or rejected with error
     */
    export function getConfigSetting(key: string): Promise<string> {
      return new Promise<string>(resolve => {
        ensureInitialized();
        resolve(sendAndUnwrap('getConfigSetting', key));
      });
    }

    /**
     * Checks if teams.fullTrust capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.teams ? (runtime.supports.teams.fullTrust ? true : false) : false;
    }
  }
}
