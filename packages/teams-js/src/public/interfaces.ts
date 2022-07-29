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

export enum ActionObjectType {
  M365Content = 'm365content',
}

export interface BaseActionObject<T extends ActionObjectType> {
  type: T;
}

/**
 * Represents Action Information
 */
export interface ActionInfo {
  /**
   * Maps to the action id supplied inside the manifest
   */
  actionId: string;
  actionObjects: BaseActionObject<ActionObjectType>[];
}

export interface M365ContentAction extends BaseActionObject<ActionObjectType.M365Content> {
  /**
   * Only office content IDs are passed to the app. Apps should use these ids
   * to query the Microsoft graph for more details.
   */
  itemId: string;
  secondaryId?: SecondaryId;
}

export interface SecondaryId {
  name: SecondaryM365ContentIdName;
  value: string;
}

/**
 * These correspond with field names in the MSGraph
 */
export enum SecondaryM365ContentIdName {
  DriveId = 'driveId',
  GroupId = 'groupId',
  SiteId = 'siteId',
  UserId = 'userId',
}

export function isM365ContentType(actionItem: unknown): actionItem is M365ContentAction {
  // eslint-disable-next-line no-prototype-builtins
  return actionItem && Object.prototype.hasOwnProperty.call(actionItem, 'secondaryId');
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
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.actionInfo} instead
   *
   * Common information applicable to all content actions
   */
  actionInfo?: ActionInfo;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.groupId} instead
   *
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.internalId} instead
   *
   * The Microsoft Teams ID for the team with which the content is associated.
   */
  teamId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.displayName} instead
   *
   * The name for the team with which the content is associated.
   */
  teamName?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.id} instead
   *
   * The Microsoft Teams ID for the channel with which the content is associated.
   */
  channelId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.displayName} instead
   *
   * The name for the channel with which the content is associated.
   */
  channelName?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.membershipType} instead
   *
   * The type of the channel with which the content is associated.
   */
  channelType?: ChannelType;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.id} instead
   *
   * The developer-defined unique ID for the entity this content points to.
   */
  entityId: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.subPageId} instead
   *
   * The developer-defined unique ID for the sub-entity this content points to.
   * This field should be used to restore to a specific state within an entity,
   * such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.locale} instead
   *
   * The current locale that the user has configured for the app formatted as
   * languageId-countryId (for example, en-us).
   */
  locale: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.osLocaleInfo} instead
   *
   * More detailed locale info from the user's OS if available. Can be used together with
   * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
   * time format configuration
   */
  osLocaleInfo?: LocaleInfo;

  /**
   * @deprecated
   *
   * As of 2.0.0, please use {@link app.Context.user.loginHint} or {@link app.Context.user.userPrincipalName} instead.
   * The UPN of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  upn?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.tenant.id} instead
   *
   * The Azure AD tenant ID of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  tid?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.theme} instead
   *
   * The current UI theme.
   */
  theme?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.isFullScreen} instead
   *
   * Indication whether the tab is in full-screen mode.
   */
  isFullScreen?: boolean;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.type} instead
   *
   * The type of the team.
   */
  teamType?: TeamType;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.teamSiteUrl} instead
   *
   * The root SharePoint site associated with the team.
   */
  teamSiteUrl?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.teamSiteDomain} instead
   *
   * The domain of the root SharePoint site associated with the team.
   */
  teamSiteDomain?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.teamSitePath} instead
   *
   * The relative path to the SharePoint site associated with the team.
   */
  teamSitePath?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.ownerTeamTenantId} instead
   *
   * The tenant ID of the host team.
   */
  hostTeamTenantId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.ownerGroupId} instead
   *
   * The AAD group ID of the host team.
   */
  hostTeamGroupId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.relativeUrl} instead
   *
   * The relative path to the SharePoint folder associated with the channel.
   */
  channelRelativeUrl?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.host.sessionId} instead
   *
   * Unique ID for the current Teams session for use in correlating telemetry data.
   */
  sessionId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.userRole} instead
   *
   * The user's role in the team.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to the user's role, and never as proof of her role.
   */
  userTeamRole?: UserTeamRole;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.chat.id} instead
   *
   * The Microsoft Teams ID for the chat with which the content is associated.
   */
  chatId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.loginHint} instead
   *
   * A value suitable for use as a login_hint when authenticating with Azure AD.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  loginHint?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.userPrincipalName} instead
   *
   * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userPrincipalName?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.id} instead
   *
   * The Azure AD object id of the current user.
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userObjectId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.isArchived} instead
   *
   * Indicates whether team is archived.
   * Apps should use this as a signal to prevent any changes to content associated with archived teams.
   */
  isTeamArchived?: boolean;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.host.name} instead
   *
   * The name of the host client. Possible values are: Office, Orange, Outlook, Teams
   */
  hostName?: HostName;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.host.clientType} instead
   *
   * The type of the host client. Possible values are : android, ios, web, desktop, rigel(deprecated, use teamsRoomsWindows instead),
   * surfaceHub, teamsRoomsWindows, teamsRoomsAndroid, teamsPhones, teamsDisplays
   */
  hostClientType?: HostClientType;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.frameContext} instead
   *
   * The context where tab url is loaded (content, task, setting, remove, sidePanel)
   */
  frameContext?: FrameContexts;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharepoint} instead
   *
   * SharePoint context. This is only available when hosted in SharePoint.
   */
  sharepoint?: any;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.tenant.teamsSku} instead
   *
   * The type of license for the current users tenant.
   */
  tenantSKU?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.licenseType} instead
   *
   * The license type for the current user.
   */
  userLicenseType?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.parentMessageId} instead
   *
   * The ID of the parent message from which this task module was launched.
   * This is only available in task modules launched from bot cards.
   */
  parentMessageId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.host.ringId} instead
   *
   * Current ring ID
   */
  ringId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.sessionId} instead
   *
   * Unique ID for the current session for use in correlating telemetry data.
   */
  appSessionId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.appLaunchId} instead
   *
   * ID for the current visible app which is different for across cached sessions. Used for correlating telemetry data``
   */
  appLaunchId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.isCallingAllowed} instead
   *
   * Represents whether calling is allowed for the current logged in User
   */
  isCallingAllowed?: boolean;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.isPSTNCallingAllowed} instead
   *
   * Represents whether PSTN calling is allowed for the current logged in User
   */
  isPSTNCallingAllowed?: boolean;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.meeting.id} instead
   *
   * Meeting Id used by tab when running in meeting context
   */
  meetingId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.channel.defaultOneNoteSectionId} instead
   *
   * The OneNote section ID that is linked to the channel.
   */
  defaultOneNoteSectionId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.isMultiWindow} instead
   *
   * Indication whether the tab is in a pop out window
   */
  isMultiWindow?: boolean;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.iconPositionVertical} instead
   *
   * Personal app icon y coordinate position
   */
  appIconPosition?: number;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.page.sourceOrigin} instead
   *
   * Source origin from where the tab is opened
   */
  sourceOrigin?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.userClickTime} instead
   *
   * Time when the user clicked on the tab
   */
  userClickTime?: number;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.team.templateId} instead
   *
   * Team Template ID if there was a Team Template associated with the creation of the team.
   */
  teamTemplateId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.app.userFileOpenPreference} instead
   *
   * Where the user prefers the file to be opened from by default during file open
   */
  userFileOpenPreference?: FileOpenPreference;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.user.displayName} instead
   *
   * The address book name of the current user.
   */
  userDisplayName?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.teamSiteId} instead
   *
   * Teamsite ID, aka sharepoint site id.
   */
  teamSiteId?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.mySiteDomain} instead
   *
   * The SharePoint my site domain associated with the user.
   */
  mySiteDomain?: string;

  /**
   * @deprecated
   * As of 2.0.0, please use {@link app.Context.sharePointSite.mySitePath} instead
   *
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

/**
 * Data structure to describe dialog information
 */
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

/** @hidden */
export enum DevicePermission {
  GeoLocation = 'geolocation',
  Media = 'media',
}
