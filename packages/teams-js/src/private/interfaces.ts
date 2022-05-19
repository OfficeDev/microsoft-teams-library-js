import { FileOpenPreference, TeamInformation } from '../public/interfaces';

/**
 * @hidden
 * Hide from docs
 * --------
 * Information about all members in a chat
 */
export interface ChatMembersInformation {
  members: ThreadMember[];
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Information about a chat member
 */
export interface ThreadMember {
  /**
   * @hidden
   * The member's user principal name in the current tenant.
   */
  upn: string;
}

export enum NotificationTypes {
  fileDownloadStart = 'fileDownloadStart',
  fileDownloadComplete = 'fileDownloadComplete',
}

export interface ShowNotificationParameters {
  message: string;
  notificationType: NotificationTypes;
}

/**
 * @hidden
 * Hide from docs.
 */
export enum ViewerActionTypes {
  view = 'view',
  edit = 'edit',
  editNew = 'editNew',
}

/**
 * @hidden
 * Hide from docs.
 * ------
 * User setting changes that can be subscribed to
 */
export enum UserSettingTypes {
  /**
   * @hidden
   * Use this key to subscribe to changes in user's file open preference
   */
  fileOpenPreference = 'fileOpenPreference',
  /**
   * @hidden
   * Use this key to subscribe to theme changes
   */
  theme = 'theme',
}

/**
 * @hidden
 * Hide from docs.
 */
export interface FilePreviewParameters {
  /**
   * @hidden
   * The developer-defined unique ID for the file.
   */
  entityId: string;

  /**
   * @hidden
   * The display name of the file.
   */
  title: string;

  /**
   * @hidden
   * An optional description of the file.
   */
  description?: string;

  /**
   * @hidden
   * The file extension; e.g. pptx, docx, etc.
   */
  type: string;

  /**
   * @hidden
   * A url to the source of the file, used to open the content in the user's default browser
   */
  objectUrl: string;

  /**
   * @hidden
   * Optional; an alternate self-authenticating url used to preview the file in Mobile clients and offer it for download by the user
   */
  downloadUrl?: string;

  /**
   * @hidden
   * Optional; an alternate url optimized for previewing the file in web and desktop clients
   */
  webPreviewUrl?: string;

  /**
   * @hidden
   * Optional; an alternate url that allows editing of the file in web and desktop clients
   */
  webEditUrl?: string;

  /**
   * @hidden
   * Optional; the base url of the site where the file is hosted
   */
  baseUrl?: string;

  /**
   * @hidden
   * Deprecated; prefer using viewerAction instead
   * Optional; indicates whether the file should be opened in edit mode
   */
  editFile?: boolean;

  /**
   * @hidden
   * Optional; the developer-defined unique ID for the sub-entity to return to when the file stage closes.
   * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;

  /**
   * @hidden
   * Optional; indicates the mode in which file should be opened. Takes precedence over edit mode.
   */
  viewerAction?: ViewerActionTypes;

  /**
   * @hidden
   * Optional; indicates how user prefers to open the file
   */
  fileOpenPreference?: FileOpenPreference;

  /**
   * Optional; id required to enable conversation button in files. Will be channel id in case file is shared in a channel or the chat id in p2p chat case.
   */
  conversationId?: string;
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Query parameters used when fetching team information
 */
export interface TeamInstanceParameters {
  /**
   * @hidden
   * Flag allowing to select favorite teams only
   */
  favoriteTeamsOnly?: boolean;
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Information on userJoined Teams
 */
export interface UserJoinedTeamsInformation {
  /**
   * @hidden
   * List of team information
   */
  userJoinedTeams: TeamInformation[];
}
