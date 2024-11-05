import { sendMessageToParent } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../public/constants';
import { SdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import * as fullTrust from './fullTrust/fullTrust';

/**
 * @hidden
 * Module to interact with the `teams` specific part of the SDK.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const teamsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

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

  sendMessageToParent(
    getApiVersionTag(teamsTelemetryVersionNumber, ApiName.Teams_GetTeamChannels),
    'teams.getTeamChannels',
    [groupId],
    callback,
  );
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

  sendMessageToParent(
    getApiVersionTag(teamsTelemetryVersionNumber, ApiName.Teams_RefreshSiteUrl),
    'teams.refreshSiteUrl',
    [threadId],
    callback,
  );
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

export { fullTrust };
