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
}
