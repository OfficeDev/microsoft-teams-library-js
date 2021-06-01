import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts, SdkError } from '../public';

/**
 * Namespace to interact with the files specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace teams {

  export enum ChannelType {
    Regular = 0,
    Private = 1,
    Shared = 2
  }

  export interface TeamsChannelInfo {
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
   * @param teamId a team's objectId
   */
  export function getTeamsChannels(
    teamId: string,
    callback: (error: SdkError, channels: TeamsChannelInfo[]) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!teamId) {
      throw new Error('[teams.getTeamsChannels] teamId cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[teams.getTeamsChannels] Callback cannot be null');
    }

    sendMessageToParent('teams.getTeamsChannels', [teamId], callback);
  }
}
