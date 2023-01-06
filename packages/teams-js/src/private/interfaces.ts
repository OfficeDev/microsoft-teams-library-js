import { FileOpenPreference, TeamInformation } from '../public/interfaces';

/**
 * @hidden
 *
 * Information about all members in a chat
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ChatMembersInformation {
  members: ThreadMember[];
}

/**
 * @hidden
 *
 * Information about a chat member
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ThreadMember {
  /**
   * @hidden
   * The member's user principal name in the current tenant.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  upn: string;
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum NotificationTypes {
  fileDownloadStart = 'fileDownloadStart',
  fileDownloadComplete = 'fileDownloadComplete',
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ShowNotificationParameters {
  message: string;
  notificationType: NotificationTypes;
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ViewerActionTypes {
  view = 'view',
  edit = 'edit',
  editNew = 'editNew',
}

/**
 * @hidden
 *
 * User setting changes that can be subscribed to
 */
export enum UserSettingTypes {
  /**
   * @hidden
   * Use this key to subscribe to changes in user's file open preference
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  fileOpenPreference = 'fileOpenPreference',
  /**
   * @hidden
   * Use this key to subscribe to theme changes
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  theme = 'theme',
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface FilePreviewParameters {
  /**
   * @hidden
   * The developer-defined unique ID for the file.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  entityId?: string;

  /**
   * @hidden
   * The display name of the file.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  title?: string;

  /**
   * @hidden
   * An optional description of the file.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  description?: string;

  /**
   * @hidden
   * The file extension; e.g. pptx, docx, etc.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  type: string;

  /**
   * @hidden
   * A url to the source of the file, used to open the content in the user's default browser
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  objectUrl: string;

  /**
   * @hidden
   * Optional; an alternate self-authenticating url used to preview the file in Mobile clients and offer it for download by the user
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  downloadUrl?: string;

  /**
   * @hidden
   * Optional; an alternate url optimized for previewing the file in web and desktop clients
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  webPreviewUrl?: string;

  /**
   * @hidden
   * Optional; an alternate url that allows editing of the file in web and desktop clients
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  webEditUrl?: string;

  /**
   * @hidden
   * Optional; the base url of the site where the file is hosted
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  baseUrl?: string;

  /**
   * @hidden
   * Deprecated; prefer using {@linkcode viewerAction} instead
   * Optional; indicates whether the file should be opened in edit mode
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  editFile?: boolean;

  /**
   * @hidden
   * Optional; the developer-defined unique ID for the sub-entity to return to when the file stage closes.
   * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  subEntityId?: string;

  /**
   * @hidden
   * Optional; indicates the mode in which file should be opened. Takes precedence over edit mode.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  viewerAction?: ViewerActionTypes;

  /**
   * @hidden
   * Optional; indicates how user prefers to open the file
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  fileOpenPreference?: FileOpenPreference;

  /**
   * @hidden
   * Optional; id required to enable conversation button in files. Will be channel id in case file is shared in a channel or the chat id in p2p chat case.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  conversationId?: string;
}

/**
 * @hidden
 *
 * Query parameters used when fetching team information
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface TeamInstanceParameters {
  /**
   * @hidden
   * Flag allowing to select favorite teams only
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  favoriteTeamsOnly?: boolean;
}

/**
 * @hidden
 *
 * Information on userJoined Teams
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface UserJoinedTeamsInformation {
  /**
   * @hidden
   * List of team information
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  userJoinedTeams: TeamInformation[];
}
