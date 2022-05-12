/* eslint-disable @typescript-eslint/no-explicit-any*/

import { ChannelType, DialogDimension, HostClientType, HostName, TeamType, UserTeamRole } from './constants';
import { FrameContexts } from './constants';

/**
 * Represents information about tabs for an app
 */
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
   * @internal
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

  /**
   * The type of the team.
   */
  teamType?: TeamType;

  /**
   * The locked status of the team
   */
  isTeamLocked?: boolean;

  /**
   * The archived status of the team
   */
  isTeamArchived?: boolean;
}

/**
 * Represents OS locale info used for formatting date and time data
 */
export interface LocaleInfo {
  platform: 'windows' | 'macos';
  regionalFormat: string;
  shortDate: string;
  longDate: string;
  shortTime: string;
  longTime: string;
}

/**
 * Allowed user file open preferences
 */
export enum FileOpenPreference {
  Inline = 'inline',
  Desktop = 'desktop',
  Web = 'web',
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link app.Context} instead.
 *
 * @remarks
 * For more details on the updated {@link app.Context} interface, visit
 * {@link https://docs.microsoft.com/microsoftteams/platform/tabs/how-to/using-teams-client-sdk#updates-to-the-context-interface}.
 *
 * Represents the structure of the received context message.
 */
export interface Context {
  /**
   * @hidden
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * @hidden
   * The Microsoft Teams ID for the team with which the content is associated.
   */
  teamId?: string;

  /**
   * @hidden
   * The name for the team with which the content is associated.
   */
  teamName?: string;

  /**
   * @hidden
   * The Microsoft Teams ID for the channel with which the content is associated.
   */
  channelId?: string;

  /**
   * @hidden
   * The name for the channel with which the content is associated.
   */
  channelName?: string;

  /**
   * @hidden
   * The type of the channel with which the content is associated.
   */
  channelType?: ChannelType;

  /**
   * @hidden
   * The developer-defined unique ID for the entity this content points to.
   */
  entityId: string;

  /**
   * @hidden
   * The developer-defined unique ID for the sub-entity this content points to.
   * This field should be used to restore to a specific state within an entity,
   * such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;

  /**
   * @hidden
   * The current locale that the user has configured for the app formatted as
   * languageId-countryId (for example, en-us).
   */
  locale: string;

  /**
   * @hidden
   * More detailed locale info from the user's OS if available. Can be used together with
   * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
   * time format configuration
   */
  osLocaleInfo?: LocaleInfo;

  /**
   * @hidden
   * @deprecated
   * As of 2.0.0, please use {@link loginHint} or {@link userPrincipalName} instead.
   * The UPN of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  upn?: string;

  /**
   * @hidden
   * The Azure AD tenant ID of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  tid?: string;

  /**
   * @hidden
   * The current UI theme.
   */
  theme?: string;

  /**
   * @hidden
   * Indication whether the tab is in full-screen mode.
   */
  isFullScreen?: boolean;

  /**
   * @hidden
   * The type of the team.
   */
  teamType?: TeamType;

  /**
   * @hidden
   * The root SharePoint site associated with the team.
   */
  teamSiteUrl?: string;

  /**
   * @hidden
   * The domain of the root SharePoint site associated with the team.
   */
  teamSiteDomain?: string;

  /**
   * @hidden
   * The relative path to the SharePoint site associated with the team.
   */
  teamSitePath?: string;

  /**
   * @hidden
   * The tenant ID of the host team.
   */
  hostTeamTenantId?: string;

  /**
   * @hidden
   * The AAD group ID of the host team.
   */
  hostTeamGroupId?: string;

  /**
   * @hidden
   * The relative path to the SharePoint folder associated with the channel.
   */
  channelRelativeUrl?: string;

  /**
   * @hidden
   * Unique ID for the current Teams session for use in correlating telemetry data.
   */
  sessionId?: string;

  /**
   * @hidden
   * The user's role in the team.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to the user's role, and never as proof of her role.
   */
  userTeamRole?: UserTeamRole;

  /**
   * @hidden
   * The Microsoft Teams ID for the chat with which the content is associated.
   */
  chatId?: string;

  /**
   * @hidden
   * A value suitable for use as a login_hint when authenticating with Azure AD.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  loginHint?: string;

  /**
   * @hidden
   * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userPrincipalName?: string;

  /**
   * @hidden
   * The Azure AD object id of the current user.
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userObjectId?: string;

  /**
   * @hidden
   * Indicates whether team is archived.
   * Apps should use this as a signal to prevent any changes to content associated with archived teams.
   */
  isTeamArchived?: boolean;

  /**
   * @hidden
   * The name of the host client. Possible values are: Office, Orange, Outlook, Teams
   */
  hostName?: HostName;

  /**
   * @hidden
   * The type of the host client. Possible values are : android, ios, web, desktop, rigel(deprecated, use teamsRoomsWindows instead),
   * surfaceHub, teamsRoomsWindows, teamsRoomsAndroid, teamsPhones, teamsDisplays
   */
  hostClientType?: HostClientType;

  /**
   * @hidden
   * The context where tab url is loaded (content, task, setting, remove, sidePanel)
   */
  frameContext?: FrameContexts;

  /**
   * @hidden
   * SharePoint context. This is only available when hosted in SharePoint.
   */
  sharepoint?: any;

  /**
   * @hidden
   * The type of license for the current users tenant.
   */
  tenantSKU?: string;

  /**
   * @hidden
   * The license type for the current user.
   */
  userLicenseType?: string;

  /**
   * @hidden
   * The ID of the parent message from which this task module was launched.
   * This is only available in task modules launched from bot cards.
   */
  parentMessageId?: string;

  /**
   * @hidden
   * Current ring ID
   */
  ringId?: string;

  /**
   * @hidden
   * Unique ID for the current session for use in correlating telemetry data.
   */
  appSessionId?: string;

  /**
   * @hidden
   * ID for the current visible app which is different for across cached sessions. Used for correlating telemetry data``
   */
  appLaunchId?: string;

  /**
   * @hidden
   * Represents whether calling is allowed for the current logged in User
   */
  isCallingAllowed?: boolean;

  /**
   * @hidden
   * Represents whether PSTN calling is allowed for the current logged in User
   */
  isPSTNCallingAllowed?: boolean;

  /**
   * @hidden
   * Meeting Id used by tab when running in meeting context
   */
  meetingId?: string;

  /**
   * @hidden
   * The OneNote section ID that is linked to the channel.
   */
  defaultOneNoteSectionId?: string;

  /**
   * @hidden
   * Indication whether the tab is in a pop out window
   */
  isMultiWindow?: boolean;

  /**
   * @hidden
   * Personal app icon y coordinate position
   */
  appIconPosition?: number;

  /**
   * @hidden
   * Source origin from where the tab is opened
   */
  sourceOrigin?: string;

  /**
   * @hidden
   * Time when the user clicked on the tab
   */
  userClickTime?: number;

  /**
   * @hidden
   * Team Template ID if there was a Team Template associated with the creation of the team.
   */
  teamTemplateId?: string;

  /**
   * @hidden
   * Where the user prefers the file to be opened from by default during file open
   */
  userFileOpenPreference?: FileOpenPreference;

  /**
   * @hidden
   * The address book name of the current user.
   */
  userDisplayName?: string;

  /**
   * @hidden
   * Teamsite ID, aka sharepoint site id.
   */
  teamSiteId?: string;

  /**
   * @hidden
   * The SharePoint my site domain associated with the user.
   */
  mySiteDomain?: string;

  /**
   * @hidden
   * The SharePoint relative path to the current users mysite
   */
  mySitePath?: string;
}

export interface ShareDeepLinkParameters {
  /**
   * The developer-defined unique ID for the sub-page to which this deep link points in the current page.
   * This field should be used to restore to a specific state within a page, such as scrolling to or activating a specific piece of content.
   */
  subPageId: string;

  /**
   * The label for the sub-page that should be displayed when the deep link is rendered in a client.
   */
  subPageLabel: string;

  /**
   * The fallback URL to which to navigate the user if the client cannot render the page.
   * This URL should lead directly to the sub-entity.
   */
  subPageWebUrl?: string;
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link ShareDeepLinkParameters} instead.
 */
export interface DeepLinkParameters {
  /**
   * The developer-defined unique ID for the sub-entity to which this deep link points in the current entity.
   * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
   */
  subEntityId: string;

  /**
   * The label for the sub-entity that should be displayed when the deep link is rendered in a client.
   */
  subEntityLabel: string;

  /**
   * The fallback URL to which to navigate the user if the client cannot render the page.
   * This URL should lead directly to the sub-entity.
   */
  subEntityWebUrl?: string;
}

/**
 * Data structure to represent the size of a dialog
 */
export interface DialogSize {
  /**
   * The requested height of the webview/iframe.
   */
  height: DialogDimension | number;

  /**
   * The requested width of the webview/iframe.
   */
  width: DialogDimension | number;
}

/**
 * Data structure to describe dialog information needed to open a url based dialog.
 */
export interface UrlDialogInfo {
  /**
   * The url to be rendered in the webview/iframe.
   *
   * @remarks
   * The domain of the url must match at least one of the
   * valid domains specified in the validDomains block of the manifest
   */
  url: string;

  /*
   * The requested size of the dialog
   */
  size: DialogSize;

  /**
   * Title of the task module.
   */
  title?: string;

  /**
   * If client doesnt support the URL, the URL that needs to be opened in the browser.
   */
  fallbackUrl?: string;
}

/**
 * Data structure to describe dialog information needed to open a bot based dialog.
 */
export interface BotUrlDialogInfo extends UrlDialogInfo {
  /**
   * Specifies a bot ID to send the result of the user's interaction with the task module.
   * The bot will receive a task/complete invoke event with a JSON object
   * in the event payload.
   */
  completionBotId: string;
}

export interface DialogInfo {
  /**
   * The url to be rendered in the webview/iframe.
   *
   * @remarks
   * The domain of the url must match at least one of the
   * valid domains specified in the validDomains block of the manifest
   */
  url?: string;

  /**
   * JSON defining an adaptive card.
   */
  card?: string;

  /**
   * The requested height of the webview/iframe.
   */
  height?: DialogDimension | number;

  /**
   * The requested width of the webview/iframe.
   */
  width?: DialogDimension | number;

  /**
   * Title of the task module.
   */
  title?: string;

  /**
   * If client doesnt support the URL, the URL that needs to be opened in the browser.
   */
  fallbackUrl?: string;

  /**
   * Specifies a bot ID to send the result of the user's interaction with the task module.
   * If specified, the bot will receive a task/complete invoke event with a JSON object
   * in the event payload.
   */
  completionBotId?: string;
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link DialogInfo} instead.
 */
export type TaskInfo = DialogInfo;

export interface DialogSize {
  height: DialogDimension | number;
  width: DialogDimension | number;
}
/**
 * @hidden
 * Hide from docs.
 *
 * @internal
 */
export interface LoadContext {
  /**
   * @hidden
   * The entity that is requested to be loaded
   */
  entityId: string;

  /**
   * @hidden
   * The content URL that is requested to be loaded
   */
  contentUrl: string;
}

export interface FrameInfo {
  /**
   * The current URL that needs to be used in the iframe if the tab is reloaded
   */
  contentUrl: string;

  /**
   * The current URL that needs to be used for opening the website when the user clicks on 'Go to website'
   */
  websiteUrl: string;
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link FrameInfo} instead.
 */
export type FrameContext = FrameInfo;

export interface SdkError {
  /**
  error code
  */
  errorCode: ErrorCode;
  /**
  Optional description for the error. This may contain useful information for web-app developers.
  This string will not be localized and is not for end-user consumption. 
  App should not depend on the string content. The exact value may change. This is only for debugging purposes.
  */
  message?: string;
}

export enum ErrorCode {
  /**
   * API not supported in the current platform.
   */
  NOT_SUPPORTED_ON_PLATFORM = 100,
  /**
   * Internal error encountered while performing the required operation.
   */
  INTERNAL_ERROR = 500,
  /**
   * API is not supported in the current context
   */
  NOT_SUPPORTED_IN_CURRENT_CONTEXT = 501,
  /**
  Permissions denied by user
  */
  PERMISSION_DENIED = 1000,
  /**
   * Network issue
   */
  NETWORK_ERROR = 2000,
  /**
   * Underlying hardware doesn't support the capability
   */
  NO_HW_SUPPORT = 3000,
  /**
   * One or more arguments are invalid
   */
  INVALID_ARGUMENTS = 4000,
  /**
   * User is not authorized for this operation
   */
  UNAUTHORIZED_USER_OPERATION = 5000,
  /**
   * Could not complete the operation due to insufficient resources
   */
  INSUFFICIENT_RESOURCES = 6000,
  /**
   * Platform throttled the request because of API was invoked too frequently
   */
  THROTTLE = 7000,
  /**
   * User aborted the operation
   */
  USER_ABORT = 8000,
  /**
   * Could not complete the operation in the given time interval
   */
  OPERATION_TIMED_OUT = 8001,
  /**
   * Platform code is old and doesn't implement this API
   */
  OLD_PLATFORM = 9000,
  /**
   * The file specified was not found on the given location
   */
  FILE_NOT_FOUND = 404,
  /**
   * The return value is too big and has exceeded our size boundries
   */
  SIZE_EXCEEDED = 10000,
}
