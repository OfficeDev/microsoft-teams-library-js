import { processMessage, ensureInitialized, sendMessageRequest } from "../internal/MicrosoftTeams.internal";
import { GlobalVars } from "../internal/GlobalVars";
import { version, frameContexts } from "../internal/constants";
import { ExtendedWindow, MessageEvent } from "../internal/MicrosoftTeams.internal.interface";
import { settings } from "./settings";
import { TabInformation, TabInstanceParameters, TabInstance } from "./MicrosoftTeams.public.interface";

// ::::::::::::::::::::::: MicrosoftTeams SDK public API ::::::::::::::::::::

export const enum HostClientType {
  desktop = "desktop",
  web = "web",
  android = "android",
  ios = "ios"
}

/**
 * Represents information about tabs for an app
 */


/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
export const enum TeamType {
  Standard = 0,
  Edu = 1,
  Class = 2,
  Plc = 3,
  Staff = 4
}

/**
 * Indicates the various types of roles of a user in a team.
 */
export const enum UserTeamRole {
  Admin = 0,
  User = 1,
  Guest = 2
}


export const enum TaskModuleDimension {
  Large = "large",
  Medium = "medium",
  Small = "small"
}

/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
export function initialize(hostWindow: any = window): void {
  if (GlobalVars.initializeCalled) {
    // Independent components might not know whether the SDK is initialized so might call it to be safe.
    // Just no-op if that happens to make it easier to use.
    return;
  }

  GlobalVars.initializeCalled = true;


  // Undocumented field used to mock the window for unit tests
  GlobalVars.currentWindow = hostWindow;

  // Listen for messages post to our window
  const messageListener = (evt: MessageEvent) => processMessage(evt);

  // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
  // it's the window that opened us (i.e., window.opener)
  GlobalVars.parentWindow =
    GlobalVars.currentWindow.parent !== GlobalVars.currentWindow.self
      ? GlobalVars.currentWindow.parent
      : GlobalVars.currentWindow.opener;

  if (!GlobalVars.parentWindow) {
    GlobalVars.isFramelessWindow = true;
    (window as ExtendedWindow).onNativeMessage = GlobalVars.handleParentMessage;
  } else {
    // For iFrame scenario, add listener to listen 'message'
    GlobalVars.currentWindow.addEventListener("message", messageListener, false);
  }

  try {
    // Send the initialized message to any origin, because at this point we most likely don't know the origin
    // of the parent window, and this message contains no data that could pose a security risk.
    GlobalVars.parentOrigin = "*";
    const messageId = sendMessageRequest(GlobalVars.parentWindow, "initialize", [version]);
    GlobalVars.callbacks[messageId] = (context: string, clientType: string) => {
      GlobalVars.frameContext = context;
      GlobalVars.hostClientType = clientType;
    };
  } finally {
    GlobalVars.parentOrigin = null;
  }

  // Undocumented function used to clear state between unit tests
  this._uninitialize = () => {
    if (GlobalVars.frameContext) {
      registerOnThemeChangeHandler(null);
      registerFullScreenHandler(null);
      registerBackButtonHandler(null);
      registerBeforeUnloadHandler(null);
    }

    if (GlobalVars.frameContext === frameContexts.settings) {
      settings.registerOnSaveHandler(null);
    }

    if (GlobalVars.frameContext === frameContexts.remove) {
      settings.registerOnRemoveHandler(null);
    }

    if (!GlobalVars.isFramelessWindow) {
      GlobalVars.currentWindow.removeEventListener("message", messageListener, false);
    }

    GlobalVars.initializeCalled = false;
    GlobalVars.parentWindow = null;
    GlobalVars.parentOrigin = null;
    GlobalVars.parentMessageQueue = [];
    GlobalVars.childWindow = null;
    GlobalVars.childOrigin = null;
    GlobalVars.childMessageQueue = [];
    GlobalVars.nextMessageId = 0;
    GlobalVars.callbacks = {};
    GlobalVars.frameContext = null;
    GlobalVars.hostClientType = null;
    GlobalVars.isFramelessWindow = false;
  };
}

/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
export function _uninitialize(): void { }
/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export function enablePrintCapability(): void {
  if (!GlobalVars.printCapabilityEnabled) {
    GlobalVars.printCapabilityEnabled = true;
    ensureInitialized();
    // adding ctrl+P and cmd+P handler
    document.addEventListener("keydown", (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
        print();
        event.cancelBubble = true;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });
  }
}

/**
 * default print handler
 */
export function print(): void {
  window.print();
}

/**
 * Retrieves the current context the frame is running in.
 * @param callback The callback to invoke when the {@link Context} object is retrieved.
 */
export function getContext(callback: (context: Context) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getContext");
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(
  handler: (theme: string) => void
): void {
  ensureInitialized();

  GlobalVars.themeChangeHandler = handler;
  handler &&
    sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["themeChange"]);
}

/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(
  handler: (isFullScreen: boolean) => void
): void {
  ensureInitialized();

  GlobalVars.fullScreenChangeHandler = handler;
  handler &&
    sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["fullScreen"]);
}

/**
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 * @param handler The handler to invoke when the user presses their Team client's back button.
 */
export function registerBackButtonHandler(handler: () => boolean): void {
  ensureInitialized();

  GlobalVars.backButtonPressHandler = handler;
  handler &&
    sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["backButton"]);
}

/**
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
export function navigateBack(): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "navigateBack", []);
  GlobalVars.callbacks[messageId] = (success: boolean) => {
    if (!success) {
      throw new Error(
        "Back navigation is not supported in the current client or context."
      );
    }
  };
}

/**
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export function registerBeforeUnloadHandler(
  handler: (readyToUnload: () => void) => boolean
): void {
  ensureInitialized();

  GlobalVars.beforeUnloadHandler = handler;
  handler &&
    sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["beforeUnload"]);
}

/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
export function registerChangeSettingsHandler(
  handler: () => void
): void {
  ensureInitialized(frameContexts.content);

  GlobalVars.changeSettingsHandler = handler;
  handler && sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["changeSettings"]);
}

/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
export function navigateCrossDomain(url: string): void {
  ensureInitialized(
    frameContexts.content,
    frameContexts.settings,
    frameContexts.remove,
    frameContexts.task
  );

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "navigateCrossDomain", [
    url
  ]);
  GlobalVars.callbacks[messageId] = (success: boolean) => {
    if (!success) {
      throw new Error(
        "Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest."
      );
    }
  };
}

/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export function getTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getTabInstances", [
    tabInstanceParameters
  ]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
export function getMruTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getMruTabInstances", [
    tabInstanceParameters
  ]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
  ensureInitialized(frameContexts.content);

  sendMessageRequest(GlobalVars.parentWindow, "shareDeepLink", [
    deepLinkParameters.subEntityId,
    deepLinkParameters.subEntityLabel,
    deepLinkParameters.subEntityWebUrl
  ]);
}

/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export function navigateToTab(tabInstance: TabInstance): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "navigateToTab", [
    tabInstance
  ]);
  GlobalVars.callbacks[messageId] = (success: boolean) => {
    if (!success) {
      throw new Error(
        "Invalid internalTabInstanceId and/or channelId were/was provided"
      );
    }
  };
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
   * The developer-defined unique ID for the entity this content points to.
   */
  entityId: string;

  /**
   * The developer-defined unique ID for the sub-entity this content points to.
   * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
   */
  subEntityId?: string;

  /**
   * The current locale that the user has configured for the app formatted as
   * languageId-countryId (for example, en-us).
   */
  locale: string;

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
   * The root SharePoint folder associated with the team.
   */
  teamSiteUrl?: string;

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
   * The type of the host client. Possible values are : android, ios, web, desktop
   */
  hostClientType?: HostClientType;

  /**
   * SharePoint context
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
  height?: TaskModuleDimension | Number;

  /**
   * The requested width of the webview/iframe.
   */
  width?: TaskModuleDimension | Number;

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
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
export namespace tasks {
  /**
   * Allows an app to open the task module.
   * @param taskInfo An object containing the parameters of the task module
   * @param submitHandler Handler to call when the task module is completed
   */
  export function startTask(
    taskInfo: TaskInfo,
    submitHandler?: (err: string, result: string) => void
  ): void {
    ensureInitialized(frameContexts.content);

    const messageId = sendMessageRequest(GlobalVars.parentWindow, "tasks.startTask", [
      taskInfo
    ]);
    GlobalVars.callbacks[messageId] = submitHandler;
  }

  /**
   * Update height/width task info properties.
   * @param taskInfo An object containing width and height properties
   */
  export function updateTask(taskInfo: TaskInfo): void {
    ensureInitialized(frameContexts.content, frameContexts.task);
    const { width, height, ...extra } = taskInfo;

    if (!Object.keys(extra).length) {
      sendMessageRequest(GlobalVars.parentWindow, "tasks.updateTask", [taskInfo]);
    } else {
      throw new Error(
        "updateTask requires a taskInfo argument containing only width and height"
      );
    }
  }

  /**
   * Submit the task module.
   * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
   */
  export function submitTask(
    result?: string | object,
    appIds?: string | string[]
  ): void {
    ensureInitialized(frameContexts.content, frameContexts.task);

    // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
    sendMessageRequest(GlobalVars.parentWindow, "tasks.completeTask", [
      result,
      Array.isArray(appIds) ? appIds : [appIds]
    ]);
  }
}
