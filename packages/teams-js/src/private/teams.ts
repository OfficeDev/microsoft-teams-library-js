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
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace teams {
  export enum ChannelType {
    Regular = 0,
    Private = 1,
    Shared = 2,
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ChannelInfo {
    siteUrl: string;
    objectId: string;
    folderRelativeUrl: string;
    displayName: string;
    channelType: ChannelType;
  }

  /**
   * @hidden
   * Get a list of channels belong to a Team
   *
   * @param groupId - a team's objectId
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getTeamChannels(groupId: string, callback: (error: SdkError, channels: ChannelInfo[]) => void): void {
    ensureInitialized(runtime, FrameContexts.content);

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
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void {
    ensureInitialized(runtime);

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
   *
   * Checks if teams capability is supported by the host
   * @returns boolean to represent whether the teams capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.teams ? true : false;
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export namespace fullTrust {
    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     */
    export namespace joinedTeams {
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
          resolve(sendAndUnwrap('getUserJoinedTeams', teamInstanceParameters));
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
    }

    /**
     * @hidden
     * Allows an app to get the configuration setting value
     *
     * @param key - The key for the config setting
     * @returns Promise that resolves with the value for the provided configuration setting or rejects with an error when the operation has completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getConfigSetting(key: string): Promise<string> {
      return new Promise<string>((resolve) => {
        ensureInitialized(runtime);
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        resolve(sendAndUnwrap('getConfigSetting', key));
      });
    }

    /**
     * @hidden
     *
     * Checks if teams.fullTrust capability is supported by the host
     * @returns boolean to represent whether the teams.fullTrust capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.teams
        ? runtime.supports.teams.fullTrust
          ? true
          : false
        : false;
    }
  }
}
