/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Communication,
  initializeCommunication,
  sendAndHandleStatusAndReason as send,
  sendAndUnwrap,
  sendMessageToParent,
  uninitializeCommunication,
} from '../internal/communication';
import { defaultSDKVersionForCompatCheck, version } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { compareSDKVersions, runWithTimeout } from '../internal/utils';
import { logs } from '../private/logs';
import { initializePrivateApis } from '../private/privateAPIs';
import { authentication } from './authentication';
import { ChannelType, FrameContexts, HostClientType, HostName, TeamType, UserTeamRole } from './constants';
import { dialog } from './dialog';
import { Context as LegacyContext, FileOpenPreference, LocaleInfo } from './interfaces';
import { menus } from './menus';
import { pages } from './pages';
import { applyRuntimeConfig, generateBackCompatRuntimeConfig, IRuntime } from './runtime';
import { teamsCore } from './teamsAPIs';

/**
 * Namespace to interact with app initialization and lifecycle.
 *
 * @beta
 */
export namespace app {
  // ::::::::::::::::::::::: MicrosoftTeams client SDK public API ::::::::::::::::::::

  export const Messages = {
    AppLoaded: 'appInitialization.appLoaded',
    Success: 'appInitialization.success',
    Failure: 'appInitialization.failure',
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
     * A message that describes the failure
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
     * The current UI theme.
     */
    theme: string;

    /**
     * Unique ID for the current session for use in correlating telemetry data.
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
     * Time when the user clicked on the tab
     */
    userClickTime?: number;

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
     * The name of the host client. Possible values are: Office, Orange, Outlook, Teams
     */
    name: HostName;

    /**
     * The type of the host client. Possible values are : android, ios, web, desktop, rigel
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
     * The AAD group ID of the team which owns the channel.
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
     * The Azure AD object id of the current user.
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
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
     * The license type for the current user.
     */
    licenseType?: string;

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
     * The tenant related info of the current user.
     */
    tenant?: TenantInfo;
  }

  /**
   * Represents Tenant information.
   */
  export interface TenantInfo {
    /**
     * The Azure AD tenant ID of the current user.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    id: string;

    /**
     * The type of license for the current users tenant.
     */
    teamsSku?: string;
  }

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
     * Info of the app
     */
    app: AppInfo;

    /**
     * Info of the current page of App
     */
    page: PageInfo;

    /**
     * Info of the user
     */
    user?: UserInfo;

    /**
     * Info of the Microsoft Teams channel
     */
    channel?: ChannelInfo;

    /**
     * Info of the Microsoft Teams chat
     */
    chat?: ChatInfo;

    /**
     * Info of the Microsoft Teams meeting
     */
    meeting?: MeetingInfo;

    /**
     * SharePoint context. This is only available when hosted in SharePoint.
     */
    sharepoint?: any;

    /**
     * Info of the sharePoint site associated with the team.
     */
    sharePointSite?: SharePointSiteInfo;

    /**
     * Info of the Microsoft Teams team
     */
    team?: TeamInfo;
  }

  /**
   * Checks whether the Teams client SDK has been initialized.
   * @returns whether the Teams client SDK has been initialized.
   */
  export function isInitialized(): boolean {
    return GlobalVars.initializeCalled;
  }

  /**
   * Gets the Frame Context that the App is running in. See {@link FrameContexts} for the list of possible values.
   * @returns the Frame Context.
   */
  export function getFrameContext(): FrameContexts {
    return GlobalVars.frameContext;
  }

  /**
   * Number of milliseconds we'll give the initialization call to return before timing it out
   */
  const initializationTimeoutInMs = 5000;

  /**
   * Initializes the library.
   *
   * @remarks
   * This must be called before any other SDK calls
   * but after the frame is loaded successfully.
   *
   * @param validMessageOrigins - Optionally specify a list of cross frame message origins. They must have
   * https: protocol otherwise they will be ignored. Example: https:www.example.com
   * @returns Promise that will be fulfilled when initialization has completed, or rejected if the initialization fails or times out
   */
  export function initialize(validMessageOrigins?: string[]): Promise<void> {
    return runWithTimeout(
      () => initializeHelper(validMessageOrigins),
      initializationTimeoutInMs,
      new Error('SDK initialization timed out.'),
    );
  }

  function initializeHelper(validMessageOrigins?: string[]): Promise<void> {
    return new Promise<void>(resolve => {
      // Independent components might not know whether the SDK is initialized so might call it to be safe.
      // Just no-op if that happens to make it easier to use.
      if (!GlobalVars.initializeCalled) {
        GlobalVars.initializeCalled = true;

        Handlers.initializeHandlers();
        GlobalVars.initializePromise = initializeCommunication(validMessageOrigins).then(
          ({ context, clientType, runtimeConfig, clientSupportedSDKVersion = defaultSDKVersionForCompatCheck }) => {
            GlobalVars.frameContext = context;
            GlobalVars.hostClientType = clientType;
            GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;

            // Temporary workaround while the Host is updated with the new argument order.
            // For now, we might receive any of these possibilities:
            // - `runtimeConfig` in `runtimeConfig` and `clientSupportedSDKVersion` in `clientSupportedSDKVersion`.
            // - `runtimeConfig` in `clientSupportedSDKVersion` and `clientSupportedSDKVersion` in `runtimeConfig`.
            // - `clientSupportedSDKVersion` in `runtimeConfig` and no `clientSupportedSDKVersion`.
            // This code supports any of these possibilities

            // Teams AppHost won't provide this runtime config
            // so we assume that if we don't have it, we must be running in Teams.
            // After Teams updates its client code, we can remove this default code.
            try {
              const givenRuntimeConfig: IRuntime = JSON.parse(runtimeConfig);
              // Check that givenRuntimeConfig is a valid instance of IRuntimeConfig
              if (!givenRuntimeConfig || !givenRuntimeConfig.apiVersion) {
                throw new Error('Received runtime config is invalid');
              }
              runtimeConfig && applyRuntimeConfig(givenRuntimeConfig);
            } catch (e) {
              if (e instanceof SyntaxError) {
                try {
                  // if the given runtime config was actually meant to be a SDK version, store it as such.
                  // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                  // it doesn't provide the runtimeConfig. After Teams updates its client code, we should
                  // remove this feature.
                  if (!isNaN(compareSDKVersions(runtimeConfig, defaultSDKVersionForCompatCheck))) {
                    GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                  }
                  const givenRuntimeConfig: IRuntime = JSON.parse(clientSupportedSDKVersion);
                  clientSupportedSDKVersion && applyRuntimeConfig(givenRuntimeConfig);
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    applyRuntimeConfig(generateBackCompatRuntimeConfig(GlobalVars.clientSupportedSDKVersion));
                  } else {
                    throw e;
                  }
                }
              } else {
                // If it's any error that's not a JSON parsing error, we want the program to fail.
                throw e;
              }
            }

            GlobalVars.initializeCompleted = true;
          },
        );

        authentication.initialize();
        menus.initialize();
        pages.config.initialize();
        dialog.initialize();
        initializePrivateApis();
      }

      // Handle additional valid message origins if specified
      if (Array.isArray(validMessageOrigins)) {
        processAdditionalValidOrigins(validMessageOrigins);
      }

      resolve(GlobalVars.initializePromise);
    });
  }

  /**
   * @hidden
   * Hide from docs.
   * ------
   * Undocumented function used to set a mock window for unit tests
   *
   * @internal
   */
  export function _initialize(hostWindow: any): void {
    Communication.currentWindow = hostWindow;
  }

  /**
   * @hidden
   * Hide from docs.
   * ------
   * Undocumented function used to clear state between unit tests
   *
   * @internal
   */
  export function _uninitialize(): void {
    if (!GlobalVars.initializeCalled) {
      return;
    }

    if (GlobalVars.frameContext) {
      registerOnThemeChangeHandler(null);
      pages.backStack.registerBackButtonHandler(null);
      pages.registerFullScreenHandler(null);
      teamsCore.registerBeforeUnloadHandler(null);
      teamsCore.registerOnLoadHandler(null);
      logs.registerGetLogHandler(null);
    }

    if (GlobalVars.frameContext === FrameContexts.settings) {
      pages.config.registerOnSaveHandler(null);
    }

    if (GlobalVars.frameContext === FrameContexts.remove) {
      pages.config.registerOnRemoveHandler(null);
    }

    GlobalVars.initializeCalled = false;
    GlobalVars.initializeCompleted = false;
    GlobalVars.initializePromise = null;
    GlobalVars.additionalValidOrigins = [];
    GlobalVars.frameContext = null;
    GlobalVars.hostClientType = null;
    GlobalVars.isFramelessWindow = false;

    uninitializeCommunication();
  }

  /**
   * Retrieves the current context the frame is running in.
   *
   * @returns Promise that will resolve with the {@link app.Context} object.
   */
  export function getContext(): Promise<app.Context> {
    return new Promise<LegacyContext>(resolve => {
      ensureInitialized();
      resolve(sendAndUnwrap('getContext'));
    }).then(legacyContext => transformLegacyContextToAppContext(legacyContext)); // converts globalcontext to app.context
  }

  /**
   * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
   */
  export function notifyAppLoaded(): void {
    ensureInitialized();
    sendMessageToParent(Messages.AppLoaded, [version]);
  }

  /**
   * Notifies the frame that app initialization is successful and is ready for user interaction.
   */
  export function notifySuccess(): void {
    ensureInitialized();
    sendMessageToParent(Messages.Success, [version]);
  }

  /**
   * Notifies the frame that app initialization has failed and to show an error page in its place.
   *
   * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
   * during initialization as well as an optional message.
   */
  export function notifyFailure(appInitializationFailedRequest: IFailedRequest): void {
    ensureInitialized();
    sendMessageToParent(Messages.Failure, [
      appInitializationFailedRequest.reason,
      appInitializationFailedRequest.message,
    ]);
  }

  /**
   * Notifies the frame that app initialized with some expected errors.
   *
   * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    ensureInitialized();
    sendMessageToParent(Messages.ExpectedFailure, [expectedFailureRequest.reason, expectedFailureRequest.message]);
  }

  /**
   * Registers a handler for theme changes.
   *
   * @remarks
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   *
   * @param handler - The handler to invoke when the user changes their theme.
   */
  export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
    ensureInitialized();
    Handlers.registerOnThemeChangeHandler(handler);
  }

  /**
   * open link API.
   *
   * @param deepLink - deep link.
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function openLink(deepLink: string): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.settings,
        FrameContexts.task,
        FrameContexts.stage,
        FrameContexts.meetingStage,
      );
      resolve(send('executeDeepLink', deepLink));
    });
  }
}

/**
 * @hidden
 * Transforms the Legacy Context object received from Messages to the structured app.Context object
 *
 * @internal
 */
function transformLegacyContextToAppContext(legacyContext: LegacyContext): app.Context {
  const context: app.Context = {
    app: {
      locale: legacyContext.locale,
      sessionId: legacyContext.appSessionId ? legacyContext.appSessionId : '',
      theme: legacyContext.theme ? legacyContext.theme : 'default',
      iconPositionVertical: legacyContext.appIconPosition,
      osLocaleInfo: legacyContext.osLocaleInfo,
      parentMessageId: legacyContext.parentMessageId,
      userClickTime: legacyContext.userClickTime,
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
      frameContext: legacyContext.frameContext ? legacyContext.frameContext : GlobalVars.frameContext,
      subPageId: legacyContext.subEntityId,
      isFullScreen: legacyContext.isFullScreen,
      isMultiWindow: legacyContext.isMultiWindow,
      sourceOrigin: legacyContext.sourceOrigin,
    },
    user: {
      id: legacyContext.userObjectId,
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
  };

  return context;
}
