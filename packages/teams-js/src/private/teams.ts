import { sendAndUnwrap, sendMessageToParent } from '../internal/communication';
import { getUserJoinedTeamsSupportedAndroidClientVersion } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from '../public/constants';
import { ErrorCode, SdkError } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { TeamInstanceParameters, UserJoinedTeamsInformation } from './interfaces';

/**
 * @hidden
 * Namespace to interact with the `teams` specific part of the SDK.
 * ------
 * Hide from docs
 *
 * @internal
 */
export namespace teams {
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
   * @hidden
   * Hide from docs
   * ------
   * Get a list of channels belong to a Team
   *
   * @param groupId - a team's objectId
   */
  export function getTeamChannels(groupId: string, callback: (error: SdkError, channels: ChannelInfo[]) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (!groupId) {
      throw new Error('[teams.getTeamChannels] groupId cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[teams.getTeamChannels] Callback cannot be null');
    }

    sendMessageToParent('teams.getTeamChannels', [groupId], callback);
  }

  /**
   * @hidden
   * Allow 1st party apps to call this function when they receive migrated errors to inform the Hub/Host to refresh the siteurl
   * when site admin renames siteurl.
   *
   * @param threadId - ID of the thread where the app entity will be created; if threadId is not
   * provided, the threadId from route params will be used.
   */
  export function refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void {
    ensureInitialized();

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (!threadId) {
      throw new Error('[teams.refreshSiteUrl] threadId cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[teams.refreshSiteUrl] Callback cannot be null');
    }

    sendMessageToParent('teams.refreshSiteUrl', [threadId], callback);
  }

  /**
   * @hidden
   * Checks if teams capability is supported by the host
   *
   * @returns true if the teams capability is enabled in runtime.supports.teams and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.teams ? true : false;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   *
   * @internal
   */
  export namespace fullTrust {
    export namespace joinedTeams {
      /**
       * @hidden
       * Hide from docs
       * ------
       * Allows an app to retrieve information of all user joined teams
       *
       * @param teamInstanceParameters - Optional flags that specify whether to scope call to favorite teams
       * @returns Promise that resolves with information about the user joined teams or rejects with an error when the operation has completed
       */
      export function getUserJoinedTeams(
        teamInstanceParameters?: TeamInstanceParameters,
      ): Promise<UserJoinedTeamsInformation> {
        return new Promise<UserJoinedTeamsInformation>(resolve => {
          ensureInitialized();
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

          resolve(sendAndUnwrap('getUserJoinedTeams', teamInstanceParameters));
        });
      }
      /**
       * @hidden
       * Hide from docs
       * ------
       * Checks if teams.fullTrust.joinedTeams capability is supported by the host
       *
       * @returns true if the teams.fullTrust.joinedTeams capability is enabled in
       * runtime.supports.teams.fullTrust.joinedTeams and false if it is disabled
       */
      export function isSupported(): boolean {
        return runtime.supports.teams
          ? runtime.supports.teams.fullTrust
            ? runtime.supports.teams.fullTrust.joinedTeams
              ? true
              : false
            : false
          : false;
      }
    }

    /**
     * @hidden
     * Hide from docs
     * ------
     * Allows an app to get the configuration setting value
     *
     * @param key - The key for the config setting
     * @returns Promise that resolves with the value for the provided configuration setting or rejects with an error when the operation has completed
     */
    export function getConfigSetting(key: string): Promise<string> {
      return new Promise<string>(resolve => {
        ensureInitialized();
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndUnwrap('getConfigSetting', key));
      });
    }

    /**
     * @hidden
     * Hide from docs
     * ------
     * Checks if teams.fullTrust capability is supported by the host
     * @returns true if the teams.fullTrust capability is enabled in runtime.supports.teams.fullTrust and
     * false if it is disabled
     */
    export function isSupported(): boolean {
      return runtime.supports.teams ? (runtime.supports.teams.fullTrust ? true : false) : false;
    }
  }
}
