import {
  processMessage,
  ensureInitialized,
  sendMessageRequestToParent,
  handleParentMessage,
  processAdditionalValidOrigins,
} from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { version, frameContexts, defaultSDKVersionForCompatCheck } from '../internal/constants';
import { ExtendedWindow, DOMMessageEvent } from '../internal/interfaces';
import { settings } from './settings';
import {
  TabInformation,
  TabInstanceParameters,
  TabInstance,
  DeepLinkParameters,
  Context,
  LoadContext,
  FrameContext,
} from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { logs } from '../private/logs';

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

    if (!GlobalVars.parentWindow) {
      GlobalVars.isFramelessWindow = true;
      (window as ExtendedWindow).onNativeMessage = handleParentMessage;
    } else {
      // For iFrame scenario, add listener to listen 'message'
      GlobalVars.currentWindow.addEventListener('message', messageListener, false);
    }

    try {
      // Send the initialized message to any origin, because at this point we most likely don't know the origin
      // of the parent window, and this message contains no data that could pose a security risk.
      GlobalVars.parentOrigin = '*';
      const messageId = sendMessageRequestToParent('initialize', [version]);
      GlobalVars.callbacks[messageId] = (context: string, clientType: string, props: {}) => {
        GlobalVars.frameContext = context;
        GlobalVars.hostClientType = clientType;
        if (props && props.hasOwnProperty('clientSupportedSDKVersion')) {
          GlobalVars.clientSupportedSDKVersion = props['clientSupportedSDKVersion'];
        } else {
          GlobalVars.clientSupportedSDKVersion = defaultSDKVersionForCompatCheck;
        }

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

      if (GlobalVars.frameContext === frameContexts.settings) {
        settings.registerOnSaveHandler(null);
      }

      if (GlobalVars.frameContext === frameContexts.remove) {
        settings.registerOnRemoveHandler(null);
      }

      if (!GlobalVars.isFramelessWindow) {
        GlobalVars.currentWindow.removeEventListener('message', messageListener, false);
      }

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
  GlobalVars.callbacks[messageId] = callback;
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
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
export function navigateBack(onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('navigateBack', []);
  const errorMessage = 'Back navigation is not supported in the current client or context.';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
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
  ensureInitialized(frameContexts.content);

  GlobalVars.changeSettingsHandler = handler;
  handler && sendMessageRequestToParent('registerHandler', ['changeSettings']);
}

/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
export function navigateCrossDomain(url: string, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove, frameContexts.task);

  const messageId = sendMessageRequestToParent('navigateCrossDomain', [url]);
  const errorMessage =
    'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
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
  ensureInitialized(frameContexts.content);

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
  ensureInitialized(frameContexts.content, frameContexts.task);
  const messageId = sendMessageRequestToParent('executeDeepLink', [deepLink]);
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
}

/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export function navigateToTab(tabInstance: TabInstance, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('navigateToTab', [tabInstance]);

  const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
}

export function setFrameContext(frameContext: FrameContext): void {
  ensureInitialized(frameContexts.content);
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
