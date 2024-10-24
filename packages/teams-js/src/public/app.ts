/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as appHelpers from '../internal/appHelpers';
import { Communication, sendAndUnwrap, uninitializeCommunication } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitializeCalled, ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
import { inServerSideRenderingEnvironment } from '../internal/utils';
import { prefetchOriginsFromCDN } from '../internal/validOrigins';
import { messageChannels } from '../private/messageChannels';
import { ChannelType, FrameContexts, HostClientType, HostName, TeamType, UserTeamRole } from './constants';
import {
  ActionInfo,
  Context as LegacyContext,
  FileOpenPreference,
  HostToAppPerformanceMetrics,
  LocaleInfo,
  ResumeContext,
} from './interfaces';
import { runtime } from './runtime';
import { version } from './version';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const appTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Namespace to interact with app initialization and lifecycle.
 */

const appLogger = getLogger('app');

// ::::::::::::::::::::::: MicrosoftTeams client SDK public API ::::::::::::::::::::

/** App Initialization Messages */
export const Messages = {
  /** App loaded. */
  AppLoaded: 'appInitialization.appLoaded',
  /** App initialized successfully. */
  Success: 'appInitialization.success',
  /** App initialization failed. */
  Failure: 'appInitialization.failure',
  /** App initialization expected failure. */
  ExpectedFailure: 'appInitialization.expectedFailure',
};

/**
 * Describes errors that caused app initialization to fail
 */
export enum FailedReason {
  /**
   * Authentication failed
   */
  AuthFailed = 'AuthFailed',
  /**
   * The application timed out
   */
  Timeout = 'Timeout',
  /**
   * The app failed for a different reason
   */
  Other = 'Other',
}

/**
 * Describes expected errors that occurred during an otherwise successful
 * app initialization
 */
export enum ExpectedFailureReason {
  /**
   * There was a permission error
   */
  PermissionError = 'PermissionError',
  /**
   * The item was not found
   */
  NotFound = 'NotFound',
  /**
   * The network is currently throttled
   */
  Throttling = 'Throttling',
  /**
   * The application is currently offline
   */
  Offline = 'Offline',
  /**
   * The app failed for a different reason
   */
  Other = 'Other',
}

/**
 * Represents the failed request sent during a failed app initialization.
 */
export interface IFailedRequest {
  /**
   * The reason for the failure
   */
  reason: FailedReason;
  /**
   * This property is currently unused.
   */
  message?: string;
}

/**
 * Represents the failure request sent during an erroneous app initialization.
 */
export interface IExpectedFailureRequest {
  /**
   * The reason for the failure
   */
  reason: ExpectedFailureReason;
  /**
   * A message that describes the failure
   */
  message?: string;
}

/**
 * Represents application information.
 */
export interface AppInfo {
  /**
   * The current locale that the user has configured for the app formatted as
   * languageId-countryId (for example, en-us).
   */
  locale: string;

  /**
   * The current UI theme of the host. Possible values: "default", "dark", "contrast" or "glass".
   */
  theme: string;

  /**
   * Unique ID for the current session for use in correlating telemetry data. A session corresponds to the lifecycle of an app. A new session begins upon the creation of a webview (on Teams mobile) or iframe (in Teams desktop) hosting the app, and ends when it is destroyed.
   */
  sessionId: string;

  /**
   * Info of the host
   */
  host: AppHostInfo;

  /**
   * More detailed locale info from the user's OS if available. Can be used together with
   * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
   * time format configuration
   */
  osLocaleInfo?: LocaleInfo;
  /**
   * Personal app icon y coordinate position
   */
  iconPositionVertical?: number;

  /**
   * Time when the user clicked on the tab using the date.
   *
   * For measuring elapsed time between the moment the user click the tab, use {@link app.AppInfo.userClickTimeV2 | app.Context.app.userClickTimeV2} instead as it uses the performance timer API.
   */
  userClickTime?: number;

  /**
   * Time when the user click on the app by using the performance timer API. Useful for measuring elapsed time accurately.
   *
   * For displaying the time when the user clicked on the app, please use {@link app.AppInfo.userClickTime | app.Context.app.userClickTime} as it uses the date.
   */
  userClickTimeV2?: number;

  /**
   * The ID of the parent message from which this task module was launched.
   * This is only available in task modules launched from bot cards.
   */
  parentMessageId?: string;

  /**
   * Where the user prefers the file to be opened from by default during file open
   */
  userFileOpenPreference?: FileOpenPreference;

  /**
   * ID for the current visible app which is different for across cached sessions. Used for correlating telemetry data.
   */
  appLaunchId?: string;
}

/**
 * Represents information about the application's host.
 */
export interface AppHostInfo {
  /**
   * Identifies which host is running your app
   */
  name: HostName;

  /**
   * The client type on which the host is running
   */
  clientType: HostClientType;

  /**
   * Unique ID for the current Host session for use in correlating telemetry data.
   */
  sessionId: string;

  /**
   * Current ring ID
   */
  ringId?: string;
}

/**
 * Represents Channel information.
 */
export interface ChannelInfo {
  /**
   * The Microsoft Teams ID for the channel with which the content is associated.
   */
  id: string;

  /**
   * The name for the channel with which the content is associated.
   */
  displayName?: string;

  /**
   * The relative path to the SharePoint folder associated with the channel.
   */
  relativeUrl?: string;

  /**
   * The type of the channel with which the content is associated.
   */
  membershipType?: ChannelType;

  /**
   * The OneNote section ID that is linked to the channel.
   */
  defaultOneNoteSectionId?: string;

  /**
   * The tenant ID of the team which owns the channel.
   */
  ownerTenantId?: string;

  /**
   * The Microsoft Entra group ID of the team which owns the channel.
   */
  ownerGroupId?: string;
}

/**
 * Represents Chat information.
 */
export interface ChatInfo {
  /**
   * The Microsoft Teams ID for the chat with which the content is associated.
   */
  id: string;
}

/**
 * Represents Meeting information.
 */
export interface MeetingInfo {
  /**
   * Meeting Id used by tab when running in meeting context
   */
  id: string;
}

/**
 * Represents Page information.
 */
export interface PageInfo {
  /**
   * The developer-defined unique ID for the page this content points to.
   */
  id: string;

  /**
   * The context where page url is loaded (content, task, setting, remove, sidePanel)
   */
  frameContext: FrameContexts;

  /**
   * The developer-defined unique ID for the sub-page this content points to.
   * This field should be used to restore to a specific state within a page,
   * such as scrolling to or activating a specific piece of content.
   */
  subPageId?: string;

  /**
   * Indication whether the page is in full-screen mode.
   */
  isFullScreen?: boolean;

  /**
   * Indication whether the page is in a pop out window
   */
  isMultiWindow?: boolean;

  /**
   * Indicates whether the page is being loaded in the background as
   * part of an opt-in performance enhancement.
   */
  isBackgroundLoad?: boolean;

  /**
   * Source origin from where the page is opened
   */
  sourceOrigin?: string;
}

/**
 * Represents Team information.
 */
export interface TeamInfo {
  /**
   * The Microsoft Teams ID for the team with which the content is associated.
   */
  internalId: string;

  /**
   * The name for the team with which the content is associated.
   */
  displayName?: string;

  /**
   * The type of the team.
   */
  type?: TeamType;

  /**
   * The Office 365 group ID for the team with which the content is associated.
   * This field is available only when the identity permission is requested in the manifest.
   */
  groupId?: string;

  /**
   * Indicates whether team is archived.
   * Apps should use this as a signal to prevent any changes to content associated with archived teams.
   */
  isArchived?: boolean;

  /**
   * Team Template ID if there was a Team Template associated with the creation of the team.
   */
  templateId?: string;

  /**
     * The user's role in the team.

     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to the user's role, and never as proof of her role.
     */
  userRole?: UserTeamRole;
}

/**
 * Represents User information.
 */
export interface UserInfo {
  /**
   * The Microsoft Entra object id of the current user.
   *
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a optimization hint as to who the user is and never as proof of identity.
   * Specifically, this value should never be used to determine if a user is authorized to access
   * a resource; access tokens should be used for that.
   * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
   *
   * This field is available only when the identity permission is requested in the manifest.
   */
  id: string;

  /**
   * The address book name of the current user.
   */
  displayName?: string;

  /**
   * Represents whether calling is allowed for the current logged in User
   */
  isCallingAllowed?: boolean;

  /**
   * Represents whether PSTN calling is allowed for the current logged in User
   */
  isPSTNCallingAllowed?: boolean;

  /**
   * The license type for the current user. Possible values are:
   * "Unknown", "Teacher", "Student", "Free", "SmbBusinessVoice", "SmbNonVoice", "FrontlineWorker", "Anonymous"
   */
  licenseType?: string;

  /**
   * A value suitable for use when providing a login_hint to Microsoft Entra ID for authentication purposes.
   * See [Provide optional claims to your app](https://learn.microsoft.com/azure/active-directory/develop/active-directory-optional-claims#v10-and-v20-optional-claims-set)
   * for more information about the use of login_hint
   *
   * Because a malicious party can run your content in a browser, this value should
   * be used only as a optimization hint as to who the user is and never as proof of identity.
   * Specifically, this value should never be used to determine if a user is authorized to access
   * a resource; access tokens should be used for that.
   * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
   */
  loginHint?: string;

  /**
     * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).

     * Because a malicious party can run your content in a browser, this value should
     * be used only as a optimization hint as to who the user is and never as proof of identity.
     * Specifically, this value should never be used to determine if a user is authorized to access
     * a resource; access tokens should be used for that.
     * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
     */
  userPrincipalName?: string;

  /**
   * The tenant related info of the current user.
   */
  tenant?: TenantInfo;
}

/**
 * Represents Tenant information.
 */
export interface TenantInfo {
  /**
     * The Microsoft Entra tenant ID of the current user.

     * Because a malicious party can run your content in a browser, this value should
     * be used only as a optimization hint as to who the user is and never as proof of identity.
     * Specifically, this value should never be used to determine if a user is authorized to access
     * a resource; access tokens should be used for that.
     * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
     */
  id: string;

  /**
   * The type of license for the current user's tenant. Possible values are enterprise, free, edu, and unknown.
   */
  teamsSku?: string;
}

/** Represents information about a SharePoint site */
export interface SharePointSiteInfo {
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
   * Teamsite ID, aka sharepoint site id.
   */
  teamSiteId?: string;

  /**
   * The SharePoint my site domain associated with the user.
   */
  mySiteDomain?: string;

  /**
   * The SharePoint relative path to the current users mysite
   */
  mySitePath?: string;
}

/**
 * Represents structure of the received context message.
 */
export interface Context {
  /**
   * Content Action Info
   *
   * @beta
   */
  actionInfo?: ActionInfo;
  /**
   * Properties about the current session for your app
   */
  app: AppInfo;

  /**
   * Info about the current page context hosting your app
   */
  page: PageInfo;

  /**
   * Info about the currently logged in user running the app.
   * If the current user is not logged in/authenticated (e.g. a meeting app running for an anonymously-joined partcipant) this will be `undefined`.
   */
  user?: UserInfo;

  /**
   * When running in the context of a Teams channel, provides information about the channel, else `undefined`
   */
  channel?: ChannelInfo;

  /**
   * When running in the context of a Teams chat, provides information about the chat, else `undefined`
   */
  chat?: ChatInfo;

  /**
   * When running in the context of a Teams meeting, provides information about the meeting, else `undefined`
   */
  meeting?: MeetingInfo;

  /**
   * When hosted in SharePoint, this is the [SharePoint PageContext](https://learn.microsoft.com/javascript/api/sp-page-context/pagecontext?view=sp-typescript-latest), else `undefined`
   */
  sharepoint?: any;

  /**
   * When running in Teams for an organization with a tenant, provides information about the SharePoint site associated with the team.
   * Will be `undefined` when not running in Teams for an organization with a tenant.
   */
  sharePointSite?: SharePointSiteInfo;

  /**
   * When running in Teams, provides information about the Team context in which your app is running.
   * Will be `undefined` when not running in Teams.
   */
  team?: TeamInfo;

  /**
   * When `processActionCommand` activates a dialog, this dialog should automatically fill in some fields with information. This information comes from M365 and is given to `processActionCommand` as `extractedParameters`.
   * App developers need to use these `extractedParameters` in their dialog.
   * They help pre-fill the dialog with necessary information (`dialogParameters`) along with other details.
   * If there's no key/value pairs passed, the object will be empty in the case
   */
  dialogParameters: Record<string, string>;
}

/**
 * This function is passed to registerOnThemeHandler. It is called every time the user changes their theme.
 */
export type themeHandler = (theme: string) => void;

/**
 * This function is passed to registerHostToAppPerformanceMetricsHandler. It is called every time a response is received from the host with metrics for analyzing message delay. See {@link HostToAppPerformanceMetrics} to see which metrics are passed to the handler.
 */
export type HostToAppPerformanceMetricsHandler = (metrics: HostToAppPerformanceMetrics) => void;

/**
 * Checks whether the Teams client SDK has been initialized.
 * @returns whether the Teams client SDK has been initialized.
 */
export function isInitialized(): boolean {
  return GlobalVars.initializeCompleted;
}

/**
 * Gets the Frame Context that the App is running in. See {@link FrameContexts} for the list of possible values.
 * @returns the Frame Context.
 */
export function getFrameContext(): FrameContexts | undefined {
  return GlobalVars.frameContext;
}

function logWhereTeamsJsIsBeingUsed(): void {
  if (inServerSideRenderingEnvironment()) {
    return;
  }
  const scripts = document.getElementsByTagName('script');
  // This will always be the current script because browsers load and execute scripts in order.
  // Whenever a script is executing for the first time it will be the last script in this array.
  const currentScriptSrc = scripts && scripts[scripts.length - 1] && scripts[scripts.length - 1].src;
  const scriptUsageWarning =
    'Today, teamsjs can only be used from a single script or you may see undefined behavior. This log line is used to help detect cases where teamsjs is loaded multiple times -- it is always written. The presence of the log itself does not indicate a multi-load situation, but multiples of these log lines will. If you would like to use teamjs from more than one script at the same time, please open an issue at https://github.com/OfficeDev/microsoft-teams-library-js/issues';
  if (!currentScriptSrc || currentScriptSrc.length === 0) {
    appLogger('teamsjs is being used from a script tag embedded directly in your html. %s', scriptUsageWarning);
  } else {
    appLogger('teamsjs is being used from %s. %s', currentScriptSrc, scriptUsageWarning);
  }
}

// This is called right away to make sure that we capture which script is being executed and important stats about the current teamsjs instance
appLogger(
  'teamsjs instance is version %s, starting at %s UTC (%s local)',
  version,
  new Date().toISOString(),
  new Date().toLocaleString(),
);
logWhereTeamsJsIsBeingUsed();

/**
 * Initializes the library.
 *
 * @remarks
 * Initialize must have completed successfully (as determined by the resolved Promise) before any other library calls are made
 *
 * @param validMessageOrigins - Optionally specify a list of cross-frame message origins. This parameter is used if you know that your app
 * will be hosted on a custom domain (i.e., not a standard Microsoft 365 host like Teams, Outlook, etc.) Most apps will never need
 * to pass a value for this parameter.
 * Any domains passed in the array must have the https: protocol on the string otherwise they will be ignored. Example: https://www.example.com
 * @returns Promise that will be fulfilled when initialization has completed, or rejected if the initialization fails or times out
 */
export function initialize(validMessageOrigins?: string[]): Promise<void> {
  prefetchOriginsFromCDN();
  return appHelpers.appInitializeHelper(
    getApiVersionTag(appTelemetryVersionNumber, ApiName.App_Initialize),
    validMessageOrigins,
  );
}

/**
 * @hidden
 * Undocumented function used to set a mock window for unit tests
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function _initialize(hostWindow: any): void {
  Communication.currentWindow = hostWindow;
}

/**
 * @hidden
 * Undocumented function used to clear state between unit tests
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function _uninitialize(): void {
  if (!GlobalVars.initializeCalled) {
    return;
  }

  Handlers.uninitializeHandlers();

  GlobalVars.initializeCalled = false;
  GlobalVars.initializeCompleted = false;
  GlobalVars.initializePromise = undefined;
  GlobalVars.additionalValidOrigins = [];
  GlobalVars.frameContext = undefined;
  GlobalVars.hostClientType = undefined;
  GlobalVars.isFramelessWindow = false;

  messageChannels.telemetry._clearTelemetryPort();
  messageChannels.dataLayer._clearDataLayerPort();

  uninitializeCommunication();
}

/**
 * Retrieves the current context the frame is running in.
 *
 * @returns Promise that will resolve with the {@link app.Context} object.
 */
export function getContext(): Promise<Context> {
  return new Promise<LegacyContext>((resolve) => {
    ensureInitializeCalled();
    resolve(sendAndUnwrap(getApiVersionTag(appTelemetryVersionNumber, ApiName.App_GetContext), 'getContext'));
  }).then((legacyContext) => transformLegacyContextToAppContext(legacyContext)); // converts globalcontext to app.context
}

/**
 * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
 */
export function notifyAppLoaded(): void {
  ensureInitializeCalled();
  appHelpers.notifyAppLoadedHelper(getApiVersionTag(appTelemetryVersionNumber, ApiName.App_NotifyAppLoaded));
}

/**
 * Notifies the frame that app initialization is successful and is ready for user interaction.
 */
export function notifySuccess(): void {
  ensureInitializeCalled();
  appHelpers.notifySuccessHelper(getApiVersionTag(appTelemetryVersionNumber, ApiName.App_NotifySuccess));
}

/**
 * Notifies the frame that app initialization has failed and to show an error page in its place.
 *
 * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
 * during initialization as well as an optional message.
 */
export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
  ensureInitializeCalled();
  appHelpers.notifyFailureHelper(
    getApiVersionTag(appTelemetryVersionNumber, ApiName.App_NotifyFailure),
    appInitializationFailedRequest,
  );
}

/**
 * Notifies the frame that app initialized with some expected errors.
 *
 * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
 */
export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
  ensureInitializeCalled();
  appHelpers.notifyExpectedFailureHelper(
    getApiVersionTag(appTelemetryVersionNumber, ApiName.App_NotifyExpectedFailure),
    expectedFailureRequest,
  );
}

/**
 * Registers a handler for theme changes.
 *
 * @remarks
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(handler: themeHandler): void {
  appHelpers.registerOnThemeChangeHandlerHelper(
    getApiVersionTag(appTelemetryVersionNumber, ApiName.App_RegisterOnThemeChangeHandler),
    handler,
  );
}

/**
 * Registers a function for handling data of host to app message delay.
 *
 * @remarks
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the metrics are available on each function response.
 */
export function registerHostToAppPerformanceMetricsHandler(handler: HostToAppPerformanceMetricsHandler): void {
  Handlers.registerHostToAppPerformanceMetricsHandler(handler);
}

/**
 * This function opens deep links to other modules in the host such as chats or channels or
 * general-purpose links (to external websites). It should not be used for navigating to your
 * own or other apps.
 *
 * @remarks
 * If you need to navigate to your own or other apps, use:
 *
 * - {@link pages.currentApp.navigateToDefaultPage} for navigating to the default page of your own app
 * - {@link pages.currentApp.navigateTo} for navigating to a section of your own app
 * - {@link pages.navigateToApp} for navigating to other apps besides your own
 *
 * Many areas of functionality previously provided by deep links are now handled by strongly-typed functions in capabilities.
 * If your app is using a deep link to trigger these specific components, use the strongly-typed alternatives.
 * For example (this list is not exhaustive):
 * - To open an app installation dialog, use the {@link appInstallDialog} capability
 * - To start a call, use the {@link call} capability
 * - To open a chat, use the {@link chat} capability
 * - To open a dialog, use the {@link dialog} capability
 * - To create a new meeting, use the {@link calendar.composeMeeting} function
 * - To open a Stage View, use the {@link stageView} capability
 *
 * In each of these capabilities, you can use the `isSupported()` function to determine if the host supports that capability.
 * When using a deep link to trigger these components, there's no way to determine whether the host supports it.
 *
 * For more information on crafting deep links to the host, see [Configure deep links](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/deep-links)
 *
 * @param deepLink The host deep link or external web URL to which to navigate
 * @returns `Promise` that will be fulfilled when the navigation has initiated. A successful `Promise` resolution
 * does not necessarily indicate whether the target loaded successfully.
 */
export function openLink(deepLink: string): Promise<void> {
  return appHelpers.openLinkHelper(getApiVersionTag(appTelemetryVersionNumber, ApiName.App_OpenLink), deepLink);
}

/**
 * A namespace for enabling the suspension or delayed termination of an app when the user navigates away.
 * When an app registers for the registerBeforeSuspendOrTerminateHandler, it chooses to delay termination.
 * When an app registers for both registerBeforeSuspendOrTerminateHandler and registerOnResumeHandler, it chooses the suspension of the app .
 * Please note that selecting suspension doesn't guarantee prevention of background termination.
 * The outcome is influenced by factors such as available memory and the number of suspended apps.
 *
 * @beta
 */
export namespace lifecycle {
  /**
   * Register on resume handler function type
   *
   * @param context - Data structure to be used to pass the context to the app.
   */
  export type registerOnResumeHandlerFunctionType = (context: ResumeContext) => void;

  /**
   * Register before suspendOrTerminate handler function type
   *
   * @returns void
   */
  export type registerBeforeSuspendOrTerminateHandlerFunctionType = () => Promise<void>;

  /**
   * Registers a handler to be called before the page is suspended or terminated. Once a user navigates away from an app,
   * the handler will be invoked. App developers can use this handler to save unsaved data, pause sync calls etc.
   *
   * @param handler - The handler to invoke before the page is suspended or terminated. When invoked, app can perform tasks like cleanups, logging etc.
   * Upon returning, the app will be suspended or terminated.
   *
   */
  export function registerBeforeSuspendOrTerminateHandler(
    handler: registerBeforeSuspendOrTerminateHandlerFunctionType,
  ): void {
    if (!handler) {
      throw new Error('[app.lifecycle.registerBeforeSuspendOrTerminateHandler] Handler cannot be null');
    }
    ensureInitialized(runtime);
    Handlers.registerBeforeSuspendOrTerminateHandler(handler);
  }

  /**
   * Registers a handler to be called when the page has been requested to resume from being suspended.
   *
   * @param handler - The handler to invoke when the page is requested to be resumed. The app is supposed to navigate to
   * the appropriate page using the ResumeContext. Once done, the app should then call {@link notifySuccess}.
   *
   * @beta
   */
  export function registerOnResumeHandler(handler: registerOnResumeHandlerFunctionType): void {
    if (!handler) {
      throw new Error('[app.lifecycle.registerOnResumeHandler] Handler cannot be null');
    }
    ensureInitialized(runtime);
    Handlers.registerOnResumeHandler(handler);
  }
}

/**
 * @hidden
 * Transforms the Legacy Context object received from Messages to the structured app.Context object
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function transformLegacyContextToAppContext(legacyContext: LegacyContext): Context {
  const context: Context = {
    actionInfo: legacyContext.actionInfo,
    app: {
      locale: legacyContext.locale,
      sessionId: legacyContext.appSessionId ? legacyContext.appSessionId : '',
      theme: legacyContext.theme ? legacyContext.theme : 'default',
      iconPositionVertical: legacyContext.appIconPosition,
      osLocaleInfo: legacyContext.osLocaleInfo,
      parentMessageId: legacyContext.parentMessageId,
      userClickTime: legacyContext.userClickTime,
      userClickTimeV2: legacyContext.userClickTimeV2,
      userFileOpenPreference: legacyContext.userFileOpenPreference,
      host: {
        name: legacyContext.hostName ? legacyContext.hostName : HostName.teams,
        clientType: legacyContext.hostClientType ? legacyContext.hostClientType : HostClientType.web,
        sessionId: legacyContext.sessionId ? legacyContext.sessionId : '',
        ringId: legacyContext.ringId,
      },
      appLaunchId: legacyContext.appLaunchId,
    },
    page: {
      id: legacyContext.entityId,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      frameContext: legacyContext.frameContext ? legacyContext.frameContext : GlobalVars.frameContext,
      subPageId: legacyContext.subEntityId,
      isFullScreen: legacyContext.isFullScreen,
      isMultiWindow: legacyContext.isMultiWindow,
      isBackgroundLoad: legacyContext.isBackgroundLoad,
      sourceOrigin: legacyContext.sourceOrigin,
    },
    user: {
      id: legacyContext.userObjectId ?? '',
      displayName: legacyContext.userDisplayName,
      isCallingAllowed: legacyContext.isCallingAllowed,
      isPSTNCallingAllowed: legacyContext.isPSTNCallingAllowed,
      licenseType: legacyContext.userLicenseType,
      loginHint: legacyContext.loginHint,
      userPrincipalName: legacyContext.userPrincipalName,
      tenant: legacyContext.tid
        ? {
            id: legacyContext.tid,
            teamsSku: legacyContext.tenantSKU,
          }
        : undefined,
    },
    channel: legacyContext.channelId
      ? {
          id: legacyContext.channelId,
          displayName: legacyContext.channelName,
          relativeUrl: legacyContext.channelRelativeUrl,
          membershipType: legacyContext.channelType,
          defaultOneNoteSectionId: legacyContext.defaultOneNoteSectionId,
          ownerGroupId: legacyContext.hostTeamGroupId,
          ownerTenantId: legacyContext.hostTeamTenantId,
        }
      : undefined,
    chat: legacyContext.chatId
      ? {
          id: legacyContext.chatId,
        }
      : undefined,
    meeting: legacyContext.meetingId
      ? {
          id: legacyContext.meetingId,
        }
      : undefined,
    sharepoint: legacyContext.sharepoint,
    team: legacyContext.teamId
      ? {
          internalId: legacyContext.teamId,
          displayName: legacyContext.teamName,
          type: legacyContext.teamType,
          groupId: legacyContext.groupId,
          templateId: legacyContext.teamTemplateId,
          isArchived: legacyContext.isTeamArchived,
          userRole: legacyContext.userTeamRole,
        }
      : undefined,
    sharePointSite:
      legacyContext.teamSiteUrl ||
      legacyContext.teamSiteDomain ||
      legacyContext.teamSitePath ||
      legacyContext.mySitePath ||
      legacyContext.mySiteDomain
        ? {
            teamSiteUrl: legacyContext.teamSiteUrl,
            teamSiteDomain: legacyContext.teamSiteDomain,
            teamSitePath: legacyContext.teamSitePath,
            teamSiteId: legacyContext.teamSiteId,
            mySitePath: legacyContext.mySitePath,
            mySiteDomain: legacyContext.mySiteDomain,
          }
        : undefined,
    dialogParameters: legacyContext.dialogParameters || {},
  };

  return context;
}
