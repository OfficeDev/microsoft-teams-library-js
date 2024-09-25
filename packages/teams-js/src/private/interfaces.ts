import { FileOpenPreference, TeamInformation } from '../public/interfaces';
import { ExternalAppErrorCode } from './constants';

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
   * The size of the file in bytes.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  sizeInBytes?: number;

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

/**
 * @beta
 * @hidden
 * The types for ActionOpenUrl
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ActionOpenUrlType {
  DeepLinkDialog = 'DeepLinkDialog',
  DeepLinkOther = 'DeepLinkOther',
  DeepLinkStageView = 'DeepLinkStageView',
  GenericUrl = 'GenericUrl',
}

/**
 * @beta
 * @hidden
 * Error that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
 * and IExternalAppCardActionForCEAService.handleActionOpenUrl
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ActionOpenUrlError {
  errorCode: ActionOpenUrlErrorCode;
  message?: string;
}

/**
 * @beta
 * @hidden
 * Error codes that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
 * and IExternalAppCardActionForCEAService.handleActionOpenUrl
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ActionOpenUrlErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
  INVALID_LINK = 'INVALID_LINK', // Deep link is invalid
  NOT_SUPPORTED = 'NOT_SUPPORTED', // Deep link is not supported
}

/**
 * @beta
 * @hidden
 * The payload that is used when executing an Adaptive Card Action.Submit
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IAdaptiveCardActionSubmit {
  id: string;
  data: string | Record<string, unknown>;
}

/**
 * @beta
 * @hidden
 * Error that can be thrown from IExternalAppCardActionService.handleActionSubmit
 * and IExternalAppCardActionForCEAService.handleActionSubmit
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ActionSubmitError {
  errorCode: ExternalAppErrorCode;
  message?: string;
}

/**
 * @hidden
 * Information about the bot request that should be resent by the host
 * @internal
 * Limited to Microsoft-internal use
 */
export type IOriginalRequestInfo = IQueryMessageExtensionRequest | IActionExecuteInvokeRequest;

/**
 * @hidden
 * Parameters OauthWindow
 * @internal
 * Limited to Microsoft-internal use
 */
export type OauthWindowProperties = {
  /**
   * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
   */
  width?: number;
  /**
   * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
   */
  height?: number;
  /**
   * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
   * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page
   * to be opened in an external browser. If this flag is `false`, the page will be opened directly within the current hosting application.
   *
   * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
   * environment without an embedded browser.
   */
  isExternal?: boolean;
};
/**
 * @hidden
 * Parameters for the authentication pop-up. This interface is used exclusively with the externalAppAuthentication APIs
 * @internal
 * Limited to Microsoft-internal use
 */
export type AuthenticatePopUpParameters = {
  /**
   * The URL for the authentication pop-up.
   */
  url: URL;
  /**
   * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
   */
  width?: number;
  /**
   * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
   */
  height?: number;
  /**
   * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
   * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page specified in
   * the {@link url} property to be opened in an external browser.
   * If this flag is `false`, the page will be opened directly within the current hosting application.
   *
   * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
   * environment without an embedded browser.
   */
  isExternal?: boolean;
};

/**
 * @hidden
 * Parameters for SSO authentication. This interface is used exclusively with the externalAppAuthentication APIs
 * @internal
 * Limited to Microsoft-internal use
 */
export type AuthTokenRequestParameters = {
  /**
   * An optional list of claims which to pass to Microsoft Entra when requesting the access token.
   */
  claims?: string[];
  /**
   * An optional flag indicating whether to attempt the token acquisition silently or allow a prompt to be shown.
   */
  silent?: boolean;
};

/**
 * @hidden
 * Information about the message extension request that should be resent by the host. Corresponds to request schema in https://learn.microsoft.com/microsoftteams/platform/resources/messaging-extension-v3/search-extensions#receive-user-requests
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IQueryMessageExtensionRequest {
  requestType: OriginalRequestType.QueryMessageExtensionRequest;
  commandId: string;
  parameters: {
    name: string;
    value: string;
  }[];
  queryOptions?: {
    count: number;
    skip: number;
  };
}

/**
 * @hidden
 * Information about the Action.Execute request that should be resent by the host. Corresponds to schema in https://adaptivecards.io/explorer/Action.Execute.html
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IActionExecuteInvokeRequest {
  requestType: OriginalRequestType.ActionExecuteInvokeRequest;
  type: string; // This must be "Action.Execute"
  id: string; // The unique identifier associated with the action
  verb: string; // The card author defined verb associated with the action
  data: string | Record<string, unknown>;
}

/**
 * @hidden
 * Used to differentiate between IOriginalRequestInfo types
 * @internal
 * Limited to Microsoft-internal use
 */
export enum OriginalRequestType {
  ActionExecuteInvokeRequest = 'ActionExecuteInvokeRequest',
  QueryMessageExtensionRequest = 'QueryMessageExtensionRequest',
}
/*********** END REQUEST TYPE ************/

/*********** BEGIN RESPONSE TYPE ************/
/**
 * @hidden
 * The response from the bot returned via the host
 * @internal
 * Limited to Microsoft-internal use
 */
export type IInvokeResponse = IQueryMessageExtensionResponse | IActionExecuteResponse;

/**
 * @hidden
 * Used to differentiate between IInvokeResponse types
 * @internal
 * Limited to Microsoft-internal use
 */
export enum InvokeResponseType {
  ActionExecuteInvokeResponse = 'ActionExecuteInvokeResponse',
  QueryMessageExtensionResponse = 'QueryMessageExtensionResponse',
}

/**
 * @hidden
 * The response from the bot returned via the host for a message extension query request.
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IQueryMessageExtensionResponse {
  responseType: InvokeResponseType.QueryMessageExtensionResponse;
  composeExtension?: ComposeExtensionResponse;
}

/**
 * @hidden
 * The response from the bot returned via the host for an Action.Execute request.
 * @internal
 * Limited to Microsoft-internal use
 */
export interface IActionExecuteResponse {
  responseType: InvokeResponseType.ActionExecuteInvokeResponse;
  value: Record<string, unknown>;
  signature?: string;
  statusCode: number;
  type: string;
}

/**
 * @hidden
 * The compose extension response returned for a message extension query request. `suggestedActions` will be present only when the type is is 'config' or 'auth'.
 * @internal
 * Limited to Microsoft-internal use
 */
export type ComposeExtensionResponse = {
  attachmentLayout: AttachmentLayout;
  type: ComposeResultTypes;
  attachments?: QueryMessageExtensionAttachment[];
  suggestedActions?: QueryMessageExtensionSuggestedActions;
  text?: string;
};

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type QueryMessageExtensionSuggestedActions = {
  actions: Action[];
};

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type Action = {
  type: string;
  title: string;
  value: string;
};

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type QueryMessageExtensionCard = {
  contentType: string;
  content: Record<string, unknown>;
  fallbackHtml?: string;
  signature?: string;
};

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type QueryMessageExtensionAttachment = QueryMessageExtensionCard & {
  preview?: QueryMessageExtensionCard;
};

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type AttachmentLayout = 'grid' | 'list';
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type ComposeResultTypes = 'auth' | 'config' | 'message' | 'result' | 'silentAuth';
/*********** END RESPONSE TYPE ************/

/*********** BEGIN ERROR TYPE ***********/
export interface InvokeError {
  errorCode: InvokeErrorCode;
  message?: string;
}

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export enum InvokeErrorCode {
  INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
}

/**
 * @hidden
 * Wrapper to differentiate between InvokeError and IInvokeResponse response from host
 * @internal
 * Limited to Microsoft-internal use
 */
export type InvokeErrorWrapper = InvokeError & { responseType: undefined };
export const ActionExecuteInvokeRequestType = 'Action.Execute';
