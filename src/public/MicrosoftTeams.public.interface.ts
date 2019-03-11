import { UserTeamRole } from "./MicrosoftTeams.public";

export interface TabInformation {
  teamTabs: TabInstance[];
}

/**
 * Represents information about a tab instance
 */
export interface TabInstance {
  /**
   * The name of the tab
   */
  tabName: string;

  /**
   * Internal: do not use
   * @protected
   */
  internalTabInstanceId?: string;

  /**
   * Last viewed time of this tab. null means unknown
   */
  lastViewUnixEpochTime?: string;

  /**
   * The developer-defined unique ID for the entity this content points to.
   */
  entityId?: string;

  /**
   * The Microsoft Teams ID for the channel with which the content is associated.
   */
  channelId?: string;

  /**
   * The name for the channel with which the content is associated.
   */
  channelName?: string;

  /**
   * Is this tab in a favorite channel?
   */
  channelIsFavorite?: boolean;

  /**
   * The Microsoft Teams ID for the team with which the content is associated.
   */
  teamId?: string;

  /**
   * The name for the team with which the content is associated.
   */
  teamName?: string;

  /**
   * Is this tab in a favorite team?
   */
  teamIsFavorite?: boolean;

  /**
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * Content URL of this tab
   */
  url?: string;

  /**
   * Website URL of this tab
   */
  websiteUrl?: string;
}

/**
 * Indicates information about the tab instance for filtering purposes.
 */
export interface TabInstanceParameters {
  /**
   * Flag allowing to select favorite channels only
   */
  favoriteChannelsOnly?: boolean;

  /**
   * Flag allowing to select favorite teams only
   */
  favoriteTeamsOnly?: boolean;
}

/**
 * Represents Team Information
 */
export interface TeamInformation {
  /**
   * Id of the team
   */
  teamId: string;

  /**
   * Team display name
   */
  teamName: string;

  /**
   * Team description
   */
  teamDescription?: string;

  /**
   * Thumbnail Uri
   */
  thumbnailUri?: string;

  /**
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * Role of current user in the team
   */
  userTeamRole?: UserTeamRole;
}
