import { GlobalVars, processMessage, MessageEvent, ensureInitialized, sendMessageRequest, ExtendedWindow, waitForMessageQueue } from "../internal/MicrosoftTeams.internal";
import { version, frameContexts } from "../internal/constants";

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

/**
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
export namespace settings {
  let saveHandler: (evt: SaveEvent) => void;
  let removeHandler: (evt: RemoveEvent) => void;
  GlobalVars.handlers["settings.save"] = handleSave;
  GlobalVars.handlers["settings.remove"] = handleRemove;

  /**
   * Sets the validity state for the settings.
   * The initial value is false, so the user cannot save the settings until this is called with true.
   * @param validityState Indicates whether the save or remove button is enabled for the user.
   */
  export function setValidityState(validityState: boolean): void {
    ensureInitialized(frameContexts.settings, frameContexts.remove);

    sendMessageRequest(GlobalVars.parentWindow, "settings.setValidityState", [
      validityState
    ]);
  }

  /**
   * Gets the settings for the current instance.
   * @param callback The callback to invoke when the {@link Settings} object is retrieved.
   */
  export function getSettings(
    callback: (instanceSettings: Settings) => void
  ): void {
    ensureInitialized(
      frameContexts.content,
      frameContexts.settings,
      frameContexts.remove
    );

    const messageId = sendMessageRequest(GlobalVars.parentWindow, "settings.getSettings");
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Sets the settings for the current instance.
   * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
   * @param settings The desired settings for this instance.
   */
  export function setSettings(instanceSettings: Settings): void {
    ensureInitialized(frameContexts.content, frameContexts.settings);

    const messageId = sendMessageRequest(GlobalVars.parentWindow, "settings.setSettings", [
      instanceSettings
    ]);
    GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
      if (!success) {
        throw new Error(result);
      }
    };
  }

  /**
   * Registers a handler for when the user attempts to save the settings. This handler should be used
   * to create or update the underlying resource powering the content.
   * The object passed to the handler must be used to notify whether to proceed with the save.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler The handler to invoke when the user selects the save button.
   */
  export function registerOnSaveHandler(
    handler: (evt: SaveEvent) => void
  ): void {
    ensureInitialized(frameContexts.settings);

    saveHandler = handler;
    handler && sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["save"]);
  }

  /**
   * Registers a handler for user attempts to remove content. This handler should be used
   * to remove the underlying resource powering the content.
   * The object passed to the handler must be used to indicate whether to proceed with the removal.
   * Only one handler may be registered at a time. Subsequent registrations will override the first.
   * @param handler The handler to invoke when the user selects the remove button.
   */
  export function registerOnRemoveHandler(
    handler: (evt: RemoveEvent) => void
  ): void {
    ensureInitialized(frameContexts.remove);

    removeHandler = handler;
    handler && sendMessageRequest(GlobalVars.parentWindow, "registerHandler", ["remove"]);
  }

  function handleSave(result?: SaveParameters): void {
    const saveEvent = new SaveEventImpl(result);
    if (saveHandler) {
      saveHandler(saveEvent);
    } else {
      // If no handler is registered, we assume success.
      saveEvent.notifySuccess();
    }
  }

  export interface Settings {
    /**
     * A suggested display name for the new content.
     * In the settings for an existing instance being updated, this call has no effect.
     */
    suggestedDisplayName?: string;

    /**
     * Sets the URL to use for the content of this instance.
     */
    contentUrl: string;

    /**
     * Sets the URL for the removal configuration experience.
     */
    removeUrl?: string;

    /**
     * Sets the URL to use for the external link to view the underlying resource in a browser.
     */
    websiteUrl?: string;

    /**
     * The developer-defined unique ID for the entity to which this content points.
     */
    entityId: string;
  }

  export interface SaveEvent {
    /**
     * Object containing properties passed as arguments to the settings.save event.
     */
    result: SaveParameters;

    /**
     * Indicates that the underlying resource has been created and the settings can be saved.
     */
    notifySuccess(): void;

    /**
     * Indicates that creation of the underlying resource failed and that the settings cannot be saved.
     * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
     */
    notifyFailure(reason?: string): void;
  }

  export interface RemoveEvent {
    /**
     * Indicates that the underlying resource has been removed and the content can be removed.
     */
    notifySuccess(): void;

    /**
     * Indicates that removal of the underlying resource failed and that the content cannot be removed.
     * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
     */
    notifyFailure(reason?: string): void;
  }

  export interface SaveParameters {
    /**
     * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
     */
    webhookUrl?: string;
  }

  /**
   * @private
   * Hide from docs, since this class is not directly used.
   */
  class SaveEventImpl implements SaveEvent {
    public notified: boolean = false;
    public result: SaveParameters;

    constructor(result?: SaveParameters) {
      this.result = result ? result : {};
    }

    public notifySuccess(): void {
      this.ensureNotNotified();

      sendMessageRequest(GlobalVars.parentWindow, "settings.save.success");

      this.notified = true;
    }

    public notifyFailure(reason?: string): void {
      this.ensureNotNotified();

      sendMessageRequest(GlobalVars.parentWindow, "settings.save.failure", [reason]);

      this.notified = true;
    }

    private ensureNotNotified(): void {
      if (this.notified) {
        throw new Error(
          "The SaveEvent may only notify success or failure once."
        );
      }
    }
  }

  function handleRemove(): void {
    const removeEvent = new RemoveEventImpl();
    if (removeHandler) {
      removeHandler(removeEvent);
    } else {
      // If no handler is registered, we assume success.
      removeEvent.notifySuccess();
    }
  }

  /**
   * @private
   * Hide from docs, since this class is not directly used.
   */
  class RemoveEventImpl implements RemoveEvent {
    public notified: boolean = false;

    public notifySuccess(): void {
      this.ensureNotNotified();

      sendMessageRequest(GlobalVars.parentWindow, "settings.remove.success");

      this.notified = true;
    }

    public notifyFailure(reason?: string): void {
      this.ensureNotNotified();

      sendMessageRequest(GlobalVars.parentWindow, "settings.remove.failure", [reason]);

      this.notified = true;
    }

    private ensureNotNotified(): void {
      if (this.notified) {
        throw new Error(
          "The removeEvent may only notify success or failure once."
        );
      }
    }
  }
}

/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
export namespace authentication {
  let authParams: AuthenticateParameters;
  let authWindowMonitor: number;
  GlobalVars.handlers["authentication.authenticate.success"] = handleSuccess;
  GlobalVars.handlers["authentication.authenticate.failure"] = handleFailure;

  /**
   * Registers the authentication GlobalVars.handlers
   * @param authenticateParameters A set of values that configure the authentication pop-up.
   */
  export function registerAuthenticationHandlers(
    authenticateParameters: AuthenticateParameters
  ): void {
    authParams = authenticateParameters;
  }

  /**
   * Initiates an authentication request, which opens a new window with the specified settings.
   */
  export function authenticate(
    authenticateParameters?: AuthenticateParameters
  ): void {
    const authenticateParams =
      authenticateParameters !== undefined
        ? authenticateParameters
        : authParams;
    ensureInitialized(
      frameContexts.content,
      frameContexts.settings,
      frameContexts.remove,
      frameContexts.task
    );

    if (
      GlobalVars.hostClientType === HostClientType.desktop ||
      GlobalVars.hostClientType === HostClientType.android ||
      GlobalVars.hostClientType === HostClientType.ios
    ) {
      // Convert any relative URLs into absolute URLs before sending them over to the parent window.
      const link = document.createElement("a");
      link.href = authenticateParams.url;

      // Ask the parent window to open an authentication window with the parameters provided by the caller.
      const messageId = sendMessageRequest(
        GlobalVars.parentWindow,
        "authentication.authenticate",
        [link.href, authenticateParams.width, authenticateParams.height]
      );
      GlobalVars.callbacks[messageId] = (success: boolean, response: string) => {
        if (success) {
          authenticateParams.successCallback(response);
        } else {
          authenticateParams.failureCallback(response);
        }
      };
    } else {
      // Open an authentication window with the parameters provided by the caller.
      openAuthenticationWindow(authenticateParams);
    }
  }

  /**
   * @private
   * Hide from docs.
   * ------
   * Requests an Azure AD token to be issued on behalf of the app. The token is acquired from the cache
   * if it is not expired. Otherwise a request is sent to Azure AD to obtain a new token.
   * @param authTokenRequest A set of values that configure the token request.
   */
  export function getAuthToken(authTokenRequest: AuthTokenRequest): void {
    ensureInitialized();

    const messageId = sendMessageRequest(
      GlobalVars.parentWindow,
      "authentication.getAuthToken",
      [authTokenRequest.resources]
    );
    GlobalVars.callbacks[messageId] = (success: boolean, result: string) => {
      if (success) {
        authTokenRequest.successCallback(result);
      } else {
        authTokenRequest.failureCallback(result);
      }
    };
  }

  /**
   * @private
   * Hide from docs.
   * ------
   * Requests the decoded Azure AD user identity on behalf of the app.
   */
  export function getUser(userRequest: UserRequest): void {
    ensureInitialized();

    const messageId = sendMessageRequest(
      GlobalVars.parentWindow,
      "authentication.getUser"
    );
    GlobalVars.callbacks[messageId] = (success: boolean, result: UserProfile | string) => {
      if (success) {
        userRequest.successCallback(result as UserProfile);
      } else {
        userRequest.failureCallback(result as string);
      }
    };
  }

  function closeAuthenticationWindow(): void {
    // Stop monitoring the authentication window
    stopAuthenticationWindowMonitor();

    // Try to close the authentication window and clear all properties associated with it
    try {
      if (GlobalVars.childWindow) {
        GlobalVars.childWindow.close();
      }
    } finally {
      GlobalVars.childWindow = null;
      GlobalVars.childOrigin = null;
    }
  }

  function openAuthenticationWindow(
    authenticateParameters: AuthenticateParameters
  ): void {
    authParams = authenticateParameters;

    // Close the previously opened window if we have one
    closeAuthenticationWindow();

    // Start with a sensible default size
    let width = authParams.width || 600;
    let height = authParams.height || 400;

    // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
    width = Math.min(width, GlobalVars.currentWindow.outerWidth - 400);
    height = Math.min(height, GlobalVars.currentWindow.outerHeight - 200);

    // Convert any relative URLs into absolute URLs before sending them over to the parent window
    const link = document.createElement("a");
    link.href = authParams.url;

    // We are running in the browser, so we need to center the new window ourselves
    let left: number =
      typeof GlobalVars.currentWindow.screenLeft !== "undefined"
        ? GlobalVars.currentWindow.screenLeft
        : GlobalVars.currentWindow.screenX;
    let top: number =
      typeof GlobalVars.currentWindow.screenTop !== "undefined"
        ? GlobalVars.currentWindow.screenTop
        : GlobalVars.currentWindow.screenY;
    left += GlobalVars.currentWindow.outerWidth / 2 - width / 2;
    top += GlobalVars.currentWindow.outerHeight / 2 - height / 2;

    // Open a child window with a desired set of standard browser features
    GlobalVars.childWindow = GlobalVars.currentWindow.open(
      link.href,
      "_blank",
      "toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=" +
      top +
      ", left=" +
      left +
      ", width=" +
      width +
      ", height=" +
      height
    );
    if (GlobalVars.childWindow) {
      // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
      startAuthenticationWindowMonitor();
    } else {
      // If we failed to open the window, fail the authentication flow
      handleFailure("FailedToOpenWindow");
    }
  }

  function stopAuthenticationWindowMonitor(): void {
    if (authWindowMonitor) {
      clearInterval(authWindowMonitor);
      authWindowMonitor = 0;
    }

    delete GlobalVars.handlers["initialize"];
    delete GlobalVars.handlers["navigateCrossDomain"];
  }

  function startAuthenticationWindowMonitor(): void {
    // Stop the previous window monitor if one is running
    stopAuthenticationWindowMonitor();

    // Create an interval loop that
    // - Notifies the caller of failure if it detects that the authentication window is closed
    // - Keeps pinging the authentication window while it is open to re-establish
    //   contact with any pages along the authentication flow that need to communicate
    //   with us
    authWindowMonitor = GlobalVars.currentWindow.setInterval(() => {
      if (!GlobalVars.childWindow || GlobalVars.childWindow.closed) {
        handleFailure("CancelledByUser");
      } else {
        const savedChildOrigin = GlobalVars.childOrigin;
        try {
          GlobalVars.childOrigin = "*";
          sendMessageRequest(GlobalVars.childWindow, "ping");
        } finally {
          GlobalVars.childOrigin = savedChildOrigin;
        }
      }
    }, 100);

    // Set up an initialize-message handler that gives the authentication window its frame context
    GlobalVars.handlers["initialize"] = () => {
      return [frameContexts.authentication, GlobalVars.hostClientType];
    };

    // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
    // in the authentication window. We could at some point choose to implement this method via a call to
    // authenticationWindow.location.href = url; however, we would first need to figure out how to
    // validate the URL against the tab's list of valid domains.
    GlobalVars.handlers["navigateCrossDomain"] = (url: string) => {
      return false;
    };
  }

  /**
   * Notifies the frame that initiated this authentication request that the request was successful.
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
   * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifySuccess(result?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, "result", result);

    ensureInitialized(frameContexts.authentication);

    sendMessageRequest(GlobalVars.parentWindow, "authentication.authenticate.success", [
      result
    ]);

    // Wait for the message to be sent before closing the window
    waitForMessageQueue(GlobalVars.parentWindow, () =>
      setTimeout(() => GlobalVars.currentWindow.close(), 200)
    );
  }

  /**
   * Notifies the frame that initiated this authentication request that the request failed.
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
   * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifyFailure(reason?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, "reason", reason);

    ensureInitialized(frameContexts.authentication);

    sendMessageRequest(GlobalVars.parentWindow, "authentication.authenticate.failure", [
      reason
    ]);

    // Wait for the message to be sent before closing the window
    waitForMessageQueue(GlobalVars.parentWindow, () =>
      setTimeout(() => GlobalVars.currentWindow.close(), 200)
    );
  }

  function handleSuccess(result?: string): void {
    try {
      if (authParams && authParams.successCallback) {
        authParams.successCallback(result);
      }
    } finally {
      authParams = null;
      closeAuthenticationWindow();
    }
  }

  function handleFailure(reason?: string): void {
    try {
      if (authParams && authParams.failureCallback) {
        authParams.failureCallback(reason);
      }
    } finally {
      authParams = null;
      closeAuthenticationWindow();
    }
  }

  /**
   * Validates that the callbackUrl param is a valid connector url, appends the result/reason and authSuccess/authFailure as URL fragments and redirects the window
   * @param callbackUrl - the connectors url to redirect to
   * @param key - "result" in case of success and "reason" in case of failure
   * @param value - the value of the passed result/reason parameter
   */
  function redirectIfWin32Outlook(
    callbackUrl?: string,
    key?: string,
    value?: string
  ): void {
    if (callbackUrl) {
      const link = document.createElement("a");
      link.href = decodeURIComponent(callbackUrl);
      if (
        link.host &&
        link.host !== window.location.host &&
        link.host === "outlook.office.com" &&
        link.search.indexOf("client_type=Win32_Outlook") > -1
      ) {
        if (key && key === "result") {
          if (value) {
            link.href = updateUrlParameter(link.href, "result", value);
          }
          GlobalVars.currentWindow.location.assign(
            updateUrlParameter(link.href, "authSuccess", "")
          );
        }
        if (key && key === "reason") {
          if (value) {
            link.href = updateUrlParameter(link.href, "reason", value);
          }
          GlobalVars.currentWindow.location.assign(
            updateUrlParameter(link.href, "authFailure", "")
          );
        }
      }
    }
  }

  /**
   * Appends either result or reason as a fragment to the 'callbackUrl'
   * @param uri - the url to modify
   * @param key - the fragment key
   * @param value - the fragment value
   */
  function updateUrlParameter(uri: string, key: string, value: string): string {
    const i = uri.indexOf("#");
    let hash = i === -1 ? "#" : uri.substr(i);
    hash = hash + "&" + key + (value !== "" ? "=" + value : "");
    uri = i === -1 ? uri : uri.substr(0, i);
    return uri + hash;
  }

  export interface AuthenticateParameters {
    /**
     * The URL for the authentication pop-up.
     */
    url: string;

    /**
     * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
     */
    width?: number;

    /**
     * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
     */
    height?: number;

    /**
     * A function that is called if the authentication succeeds, with the result returned from the authentication pop-up.
     */
    successCallback?: (result?: string) => void;

    /**
     * A function that is called if the authentication fails, with the reason for the failure returned from the authentication pop-up.
     */
    failureCallback?: (reason?: string) => void;
  }

  /**
   * @private
   * Hide from docs.
   * ------
   */
  export interface AuthTokenRequest {
    /**
     * An array of resource URIs identifying the target resources for which the token should be requested.
     */
    resources: string[];

    /**
     * A function that is called if the token request succeeds, with the resulting token.
     */
    successCallback?: (token: string) => void;

    /**
     * A function that is called if the token request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
  }

  /**
   * @private
   * Hide from docs.
   * ------
   */
  export interface UserRequest {
    /**
     * A function that is called if the token request succeeds, with the resulting token.
     */
    successCallback?: (user: UserProfile) => void;

    /**
     * A function that is called if the token request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
  }

  /**
   * @private
   * Hide from docs.
   * ------
   */
  export interface UserProfile {
    /**
     * The intended recipient of the token. The application that receives the token must verify that the audience
     * value is correct and reject any tokens intended for a different audience.
     */
    aud: string;

    /**
     * Identifies how the subject of the token was authenticated.
     */
    amr: string[];

    /**
     * Stores the time at which the token was issued. It is often used to measure token freshness.
     */
    iat: number;

    /**
     * Identifies the security token service (STS) that constructs and returns the token. In the tokens that Azure AD
     * returns, the issuer is sts.windows.net. The GUID in the issuer claim value is the tenant ID of the Azure AD
     * directory. The tenant ID is an immutable and reliable identifier of the directory.
     */
    iss: string;

    /**
     * Provides the last name, surname, or family name of the user as defined in the Azure AD user object.
     */
    family_name: string;

    /**
     * Provides the first or "given" name of the user, as set on the Azure AD user object.
     */
    given_name: string;

    /**
     * Provides a human-readable value that identifies the subject of the token. This value is not guaranteed to
     * be unique within a tenant and is designed to be used only for display purposes.
     */
    unique_name: string;

    /**
     * Contains a unique identifier of an object in Azure AD. This value is immutable and cannot be reassigned or
     * reused. Use the object ID to identify an object in queries to Azure AD.
     */
    oid: string;

    /**
     * Identifies the principal about which the token asserts information, such as the user of an application.
     * This value is immutable and cannot be reassigned or reused, so it can be used to perform authorization
     * checks safely. Because the subject is always present in the tokens the Azure AD issues, we recommended
     * using this value in a general-purpose authorization system.
     */
    sub: string;

    /**
     * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
     * use this value to access tenant-specific directory resources in a multitenant application. For example,
     * you can use this value to identify the tenant in a call to the Graph API.
     */
    tid: string;

    /**
     * Defines the time interval within which a token is valid. The service that validates the token should verify
     * that the current date is within the token lifetime; otherwise it should reject the token. The service might
     * allow for up to five minutes beyond the token lifetime to account for any differences in clock time ("time
     * skew") between Azure AD and the service.
     */
    exp: number;
    nbf: number;

    /**
     * Stores the user name of the user principal.
     */
    upn: string;

    /**
     * Stores the version number of the token.
     */
    ver: string;
  }
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
