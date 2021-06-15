import { ensureInitialized, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts, HostClientType } from '../public/constants';
import { TeamInstanceParameters, UserJoinedTeamsInformation } from './interfaces';
import { sendMessageToParent } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ErrorCode, SdkError } from '../public/interfaces';
import { getUserJoinedTeamsSupportedAndroidClientVersion } from '../internal/constants';
import { runtime } from '../public/runtime';

export namespace teams {
  export namespace fullTrust {
    /**
     * @private
     * Hide from docs
     * ------
     * Allows an app to retrieve information of all user joined teams
     * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
     * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
     */
    export function getUserJoinedTeams(
      callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void,
      teamInstanceParameters?: TeamInstanceParameters,
    ): void {
      ensureInitialized();

      if (
        GlobalVars.hostClientType === HostClientType.android &&
        !isAPISupportedByPlatform(getUserJoinedTeamsSupportedAndroidClientVersion)
      ) {
        const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
        throw new Error(JSON.stringify(oldPlatformError));
      }

      sendMessageToParent('getUserJoinedTeams', [teamInstanceParameters], callback);
    }

    /**
     * @private
     * Hide from docs
     * ------
     * Allows an app to get the configuration setting value
     * @param callback The callback to invoke when the value is retrieved.
     * @param key The key for the config setting
     */
    export function getConfigSetting(callback: (value: string) => void, key: string): void {
      ensureInitialized();
      sendMessageToParent('getConfigSetting', [key], callback);
    }

    /**
     * Checks if teams.fullTrust capability is supported currently
     */
    export function isSupported(): boolean {
      return runtime.supports.teams ? (runtime.supports.teams.fullTrust ? true : false) : false;
    }

    export enum ChannelType {
      Regular = 0,
      Private = 1,
      Shared = 2,
    }

    export interface ChannelInfo {
      siteUrl: string;
      objectId: string;
      folderRelativeUrl: string;
      displayName: string;
      channelType: ChannelType;
    }

    /**
     * @private
     * Hide from docs
     *
     * Get a list of channels belong to a Team
     * @param groupId a team's objectId
     */
    export function getTeamChannels(
      groupId: string,
      callback: (error: SdkError, channels: ChannelInfo[]) => void,
    ): void {
      ensureInitialized(FrameContexts.content);

      if (!groupId) {
        throw new Error('[teams.getTeamChannels] groupId cannot be null or empty');
      }

      if (!callback) {
        throw new Error('[teams.getTeamChannels] Callback cannot be null');
      }

      sendMessageToParent('teams.getTeamChannels', [groupId], callback);
    }
  }
}
