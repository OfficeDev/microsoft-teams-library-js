import { processMessage, ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { version, frameContexts } from "../internal/constants";
import { ExtendedWindow, MessageEvent } from "../internal/interfaces";
import { settings } from "./settings";
import { TabInformation, TabInstanceParameters, TabInstance, DeepLinkParameters, Context } from "./interfaces";
import { registerGenericCallback } from "../internal/utils";

// ::::::::::::::::::::::: MicrosoftTeams SDK public API ::::::::::::::::::::
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
  registerGenericCallback(messageId, "Back navigation is not supported in the current client or context.");
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
  registerGenericCallback(messageId, "Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
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
  registerGenericCallback(messageId, "Invalid internalTabInstanceId and/or channelId were/was provided");
}
