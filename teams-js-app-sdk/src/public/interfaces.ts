import { TaskModuleDimension, HostClientType, TeamType, UserTeamRole, ChannelType } from './constants';
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

export interface Context {
  /**
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * The Microsoft Teams ID for the team with which the content is associated.
   */
  teamId?: string;

  /**
   * The name for the team with which the content is associated.
   */
  teamName?: string;

  /**
   * The Microsoft Teams ID for the channel with which the content is associated.
   */
  channelId?: string;

  /**
   * The name for the channel with which the content is associated.
   */
  channelName?: string;

  /**
   * The type of the channel with which the content is associated.
   */
  channelType?: ChannelType;

  /**
   * The developer-defined unique ID for the entity this content points to.
   */
  entityId: string;

  /**
   * The developer-defined unique ID for the sub-entity this content points to.
   * This field should be used to restore to a specific state within an entity,
   * such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;

  /**
   * The current locale that the user has configured for the app formatted as
   * languageId-countryId (for example, en-us).
   */
  locale: string;

  /**
   * More detailed locale info from the user's OS if available. Can be used together with
   * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
   * time format configuration
   */
  osLocaleInfo?: LocaleInfo;

  /**
   * @deprecated Use loginHint or userPrincipalName.
   * The UPN of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  upn?: string;

  /**
   * The Azure AD tenant ID of the current user.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  tid?: string;

  /**
   * The current UI theme.
   */
  theme?: string;

  /**
   * Indication whether the tab is in full-screen mode.
   */
  isFullScreen?: boolean;

  /**
   * The type of the team.
   */
  teamType?: TeamType;

  /**
   * The root SharePoint site associated with the team.
   */
  teamSiteUrl?: string;

  /**
   * The domain of the root SharePoint site associated with the team.
   */
  teamSiteDomain?: string;

  /**
   * The relative path to the SharePoint site associated with the team.
   */
  teamSitePath?: string;

  /**
   * The relative path to the SharePoint folder associated with the channel.
   */
  channelRelativeUrl?: string;

  /**
   * Unique ID for the current Teams session for use in correlating telemetry data.
   */
  sessionId?: string;

  /**
   * The user's role in the team.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to the user's role, and never as proof of her role.
   */
  userTeamRole?: UserTeamRole;

  /**
   * The Microsoft Teams ID for the chat with which the content is associated.
   */
  chatId?: string;

  /**
   * A value suitable for use as a login_hint when authenticating with Azure AD.
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  loginHint?: string;

  /**
   * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userPrincipalName?: string;

  /**
   * The Azure AD object id of the current user.
   * Because a malicious party run your content in a browser, this value should
   * be used only as a hint as to who the user is and never as proof of identity.
   * This field is available only when the identity permission is requested in the manifest.
   */
  userObjectId?: string;

  /**
   * Indicates whether team is archived.
   * Apps should use this as a signal to prevent any changes to content associated with archived teams.
   */
  isTeamArchived?: boolean;

  /**
   * The type of the host client. Possible values are : android, ios, web, desktop, rigel
   */
  hostClientType?: HostClientType;

  /**
   * The context where tab url is loaded (content, task, setting, remove, sidePanel)
   */
  frameContext?: FrameContexts;

  /**
   * SharePoint context. This is only available when hosted in SharePoint.
   */
  sharepoint?: any;

  /**
   * The type of license for the current users tenant.
   */
  tenantSKU?: string;

  /**
   * The license type for the current user.
   */
  userLicenseType?: string;

  /**
   * The ID of the parent message from which this task module was launched.
   * This is only available in task modules launched from bot cards.
   */
  parentMessageId?: string;

  /**
   * Current ring ID
   */
  ringId?: string;

  /**
   * Unique ID for the current session for use in correlating telemetry data.
   */
  appSessionId?: string;

  /**
   * Represents whether calling is allowed for the current logged in User
   */
  isCallingAllowed?: boolean;

  /**
   * Represents whether PSTN calling is allowed for the current logged in User
   */
  isPSTNCallingAllowed?: boolean;

  /**
   * Meeting Id used by tab when running in meeting context
   */
  meetingId?: string;

  /**
   * The OneNote section ID that is linked to the channel.
   */
  defaultOneNoteSectionId?: string;

  /**
   * Indication whether the tab is in a pop out window
   */
  isMultiWindow?: boolean;

  /**
   * Personal app icon y coordinate position
   */
  appIconPosition?: number;
}

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

export interface TaskInfo {
  /**
   * The url to be rendered in the webview/iframe.
   */
  url?: string;

  /**
   * JSON defining an adaptive card.
   */
  card?: string;

  /**
   * The requested height of the webview/iframe.
   */
  height?: TaskModuleDimension | number;

  /**
   * The requested width of the webview/iframe.
   */
  width?: TaskModuleDimension | number;

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
 * @private
 * Hide from docs.
 * ------
 */
export interface OpenConversationRequest {
  /**
   * The Id of the subEntity where the conversation is taking place
   */
  subEntityId: string;

  /**
   * The title of the conversation
   */
  title: string;

  /**
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   */
  conversationId?: string;

  /**
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   */
  channelId?: string;

  /**
   * The entity Id of the tab
   */
  entityId: string;

  /**
   * A function that is called once the conversation Id has been created
   */
  onStartConversation?: (conversationResponse: ConversationResponse) => void;

  /**
   * A function that is called if the pane is closed
   */
  onCloseConversation?: (conversationResponse: ConversationResponse) => void;
}

/**
 * @private
 * Hide from docs.
 * ------
 */
export interface ConversationResponse {
  /**
   * The Id of the subEntity where the conversation is taking place
   */
  subEntityId: string;

  /**
   * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
   */
  conversationId?: string;

  /**
   * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
   */
  channelId?: string;

  /**
   * The entity Id of the tab
   */
  entityId?: string;
}

/**
 * @private
 * Hide from docs.
 */
export interface LoadContext {
  /**
   * The enitity that is requested to be loaded
   */
  entityId: string;

  /**
   * The content URL that is requested to be loaded
   */
  contentUrl: string;
}

export interface FrameContext {
  /**
   * The current URL that needs to be used in the iframe if the tab is reloaded
   */
  contentUrl: string;

  /**
   * The current URL that needs to be used for opening the website when the user clicks on 'Go to website'
   */
  websiteUrl: string;
}

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
