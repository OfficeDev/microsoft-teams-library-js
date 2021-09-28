import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts, SdkError } from '../public';

/**
 * Namespace to interact with the `teams` specific part of the SDK.
 *
 * @private
 * Hide from docs
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
   * @private
   * Hide from docs
   *
   * Get a list of channels belong to a Team
   * @param groupId a team's objectId
   */
  export function getTeamChannels(groupId: string, callback: (error: SdkError, channels: ChannelInfo[]) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!groupId) {
      throw new Error('[teams.getTeamChannels] groupId cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[teams.getTeamChannels] Callback cannot be null');
    }

    sendMessageToParent('teams.getTeamChannels', [groupId], callback);
  }

  /**
   * @private
   * Allow 1st party apps to call this function when they receive migrated errors to inform Teams refresh siteurl
   * when site admin renames siteurl.
   * @param threadId ID of the thread where the app entity will be created; if threadId is not
   * provided, the threadId from route params will be used.
   */
  export function refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void {
    ensureInitialized();

    if (!threadId) {
      throw new Error('[teams.refreshSiteUrl] threadId cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[teams.refreshSiteUrl] Callback cannot be null');
    }

    sendMessageToParent('teams.refreshSiteUrl', [threadId], callback);
  }
}
