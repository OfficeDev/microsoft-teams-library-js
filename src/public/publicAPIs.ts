import {
  processMessage,
  ensureInitialized,
  sendMessageRequestToParent,
  handleParentMessage,
  processAdditionalValidOrigins,
} from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { version, defaultSDKVersionForCompatCheck } from '../internal/constants';
import { ExtendedWindow, DOMMessageEvent } from '../internal/interfaces';
import { settings } from './settings';
import {
  TabInformation,
  TabInstanceParameters,
  DeepLinkParameters,
  Context,
  LoadContext,
  FrameContext,
  userSettingKeys,
} from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { logs } from '../private/logs';
import { FrameContexts } from './constants';

// ::::::::::::::::::::::: MicrosoftTeams SDK public API ::::::::::::::::::::
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins Optionally specify a list of cross frame message origins. There must have
 * https: protocol otherwise they will be ignored. Example: https://www.example.com
 */
export function initialize(callback?: () => void, validMessageOrigins?: string[]): void {
  // Independent components might not know whether the SDK is initialized so might call it to be safe.
  // Just no-op if that happens to make it easier to use.
  if (!GlobalVars.initializeCalled) {
    GlobalVars.initializeCalled = true;

    // Listen for messages post to our window
    const messageListener = (evt: DOMMessageEvent): void => processMessage(evt);

    // If we are in an iframe, our parent window is the one hosting us (i.e., window.parent); otherwise,
    // it's the window that opened us (i.e., window.opener)
    GlobalVars.currentWindow = GlobalVars.currentWindow || window;
    GlobalVars.parentWindow =
      GlobalVars.currentWindow.parent !== GlobalVars.currentWindow.self
        ? GlobalVars.currentWindow.parent
        : GlobalVars.currentWindow.opener;

    // Listen to messages from the parent or child frame.
    // Frameless windows will only receive this event from child frames and if validMessageOrigins is passed.
    if (GlobalVars.parentWindow || validMessageOrigins) {
      GlobalVars.currentWindow.addEventListener('message', messageListener, false);
    }

    if (!GlobalVars.parentWindow) {
      GlobalVars.isFramelessWindow = true;
      (window as ExtendedWindow).onNativeMessage = handleParentMessage;
    }

    try {
      // Send the initialized message to any origin, because at this point we most likely don't know the origin
      // of the parent window, and this message contains no data that could pose a security risk.
      GlobalVars.parentOrigin = '*';
      const messageId = sendMessageRequestToParent('initialize', [version]);
      GlobalVars.callbacks[messageId] = (
        context: FrameContexts,
        clientType: string,
        clientSupportedSDKVersion: string = defaultSDKVersionForCompatCheck,
      ) => {
        GlobalVars.frameContext = context;
        GlobalVars.hostClientType = clientType;
        GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;

        // Notify all waiting callers that the initialization has completed
        GlobalVars.initializeCallbacks.forEach(initCallback => initCallback());
        GlobalVars.initializeCallbacks = [];
        GlobalVars.initializeCompleted = true;
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
        registerOnLoadHandler(null);
        logs.registerGetLogHandler(null);
      }

      if (GlobalVars.frameContext === FrameContexts.settings) {
        settings.registerOnSaveHandler(null);
      }

      if (GlobalVars.frameContext === FrameContexts.remove) {
        settings.registerOnRemoveHandler(null);
      }

      GlobalVars.currentWindow.removeEventListener('message', messageListener, false);

      GlobalVars.initializeCalled = false;
      GlobalVars.initializeCompleted = false;
      GlobalVars.initializeCallbacks = [];
      GlobalVars.additionalValidOrigins = [];
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

  // Handle additional valid message origins if specified
  if (Array.isArray(validMessageOrigins)) {
    processAdditionalValidOrigins(validMessageOrigins);
  }

  // Handle the callback if specified:
  // 1. If initialization has already completed then just call it right away
  // 2. If initialization hasn't completed then add it to the array of callbacks
  //    that should be invoked once initialization does complete
  if (callback) {
    GlobalVars.initializeCompleted ? callback() : GlobalVars.initializeCallbacks.push(callback);
  }
}

/**
 * @private
 * Hide from docs.
 * ------
 * Undocumented function used to set a mock window for unit tests
 */
export function _initialize(hostWindow: any): void {
  GlobalVars.currentWindow = hostWindow;
}

/**
 * @private
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 */
export function _uninitialize(): void {}

/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export function enablePrintCapability(): void {
  if (!GlobalVars.printCapabilityEnabled) {
    GlobalVars.printCapabilityEnabled = true;
    ensureInitialized();
    // adding ctrl+P and cmd+P handler
    document.addEventListener('keydown', (event: KeyboardEvent) => {
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

  const messageId = sendMessageRequestToParent('getContext');
  GlobalVars.callbacks[messageId] = (context: Context) => {
    if (!context.frameContext) {
      // Fallback logic for frameContext properties
      context.frameContext = GlobalVars.frameContext;
    }
    callback(context);
  };
}

/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  ensureInitialized();
  GlobalVars.themeChangeHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['themeChange']);
}

/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
  ensureInitialized();

  GlobalVars.fullScreenChangeHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['fullScreen']);
}

/**
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the personal app button is clicked in the app bar.
 */
export function registerAppButtonClickHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);

  GlobalVars.appButtonClickHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['appButtonClick']);
}

/**
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when entering hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverEnterHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);

  GlobalVars.appButtonHoverEnterHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['appButtonHoverEnter']);
}

/**
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when exiting hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverLeaveHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);

  GlobalVars.appButtonHoverLeaveHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['appButtonHoverLeave']);
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
  handler && sendMessageRequestToParent('registerHandler', ['backButton']);
}

/**
 * @private
 * Registers a handler to be called when the page has been requested to load.
 * @param handler The handler to invoke when the page is loaded.
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  ensureInitialized();

  GlobalVars.loadHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['load']);
}

/**
 * @private
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  ensureInitialized();

  GlobalVars.beforeUnloadHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['beforeUnload']);
}

/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
export function registerChangeSettingsHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);

  GlobalVars.changeSettingsHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['changeSettings']);
}

/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export function getTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('getTabInstances', [tabInstanceParameters]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
export function getMruTabInstances(
  callback: (tabInfo: TabInformation) => void,
  tabInstanceParameters?: TabInstanceParameters,
): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('getMruTabInstances', [tabInstanceParameters]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
  ensureInitialized(FrameContexts.content, FrameContexts.sidePanel);

  sendMessageRequestToParent('shareDeepLink', [
    deepLinkParameters.subEntityId,
    deepLinkParameters.subEntityLabel,
    deepLinkParameters.subEntityWebUrl,
  ]);
}

/**
 * execute deep link API.
 * @param deepLink deep link.
 */
export function executeDeepLink(deepLink: string, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized(
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.task,
    FrameContexts.stage,
  );
  const messageId = sendMessageRequestToParent('executeDeepLink', [deepLink]);
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
}

export function setFrameContext(frameContext: FrameContext): void {
  ensureInitialized(FrameContexts.content);
  sendMessageRequestToParent('setFrameContext', [frameContext]);
}

export function initializeWithFrameContext(
  frameContext: FrameContext,
  callback?: () => void,
  validMessageOrigins?: string[],
): void {
  initialize(callback, validMessageOrigins);
  setFrameContext(frameContext);
}

/**
 * register a handler to be called when a user setting changes. The changed setting key & value is provided in the callback.
 * @param settingKeys List of user setting changes to subscribe
 * @param handler When a subscribed setting is updated this handler is called
 */
export function registerUserSettingsChangeHandler(
  settingKeys: userSettingKeys[],
  handler: (updatedSettingKey: userSettingKeys, updatedValue: any) => void,
): void {
  ensureInitialized(FrameContexts.content);

  GlobalVars.userSettingsChangeHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['userSettingsChange', settingKeys]);
}
