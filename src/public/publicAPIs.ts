import { ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { defaultSDKVersionForCompatCheck } from '../internal/constants';
import { settings } from './settings';
import {
  TabInformation,
  TabInstanceParameters,
  DeepLinkParameters,
  Context,
  LoadContext,
  FrameContext,
} from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { logs } from '../private/logs';
import { FrameContexts } from './constants';
import {
  Communication,
  initializeCommunication,
  sendMessageToParent,
  uninitializeCommunication,
} from '../internal/communication';
import { authentication } from './authentication';
import { initializePrivateApis } from '../private/privateAPIs';
import * as Handlers from '../internal/handlers'; // Conflict with some names

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

    Handlers.initializeHandlers();
    initializeCommunication(
      (
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
      },
      validMessageOrigins,
    );

    authentication.initialize();
    settings.initialize();
    initializePrivateApis();
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
  Communication.currentWindow = hostWindow;
}

/**
 * @private
 * Hide from docs.
 * ------
 * Undocumented function used to clear state between unit tests
 */
export function _uninitialize(): void {
  //used to clear state between unit tests

  if (!GlobalVars.initializeCalled) {
    return;
  }
  if (GlobalVars.frameContext) {
    registerOnThemeChangeHandler(null);
    registerFullScreenHandler(null);
    registerBackButtonHandler(null);
    registerBeforeUnloadHandler(null);
    registerFocusEnterHandler(null);
    registerOnLoadHandler(null);
    logs.registerGetLogHandler(null);
  }

  if (GlobalVars.frameContext === FrameContexts.settings) {
    settings.registerOnSaveHandler(null);
  }

  if (GlobalVars.frameContext === FrameContexts.remove) {
    settings.registerOnRemoveHandler(null);
  }

  GlobalVars.initializeCalled = false;
  GlobalVars.initializeCompleted = false;
  GlobalVars.initializeCallbacks = [];
  GlobalVars.additionalValidOrigins = [];
  GlobalVars.frameContext = null;
  GlobalVars.hostClientType = null;
  GlobalVars.isFramelessWindow = false;

  uninitializeCommunication();
}

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

  sendMessageToParent('getContext', (context: Context) => {
    if (!context.frameContext) {
      // Fallback logic for frameContext properties
      context.frameContext = GlobalVars.frameContext;
    }
    callback(context);
  });
}

/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
  ensureInitialized();
  Handlers.registerOnThemeChangeHandler(handler);
}

/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
export function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void {
  ensureInitialized();
  Handlers.registerHandler('fullScreenChange', handler);
}

/**
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the personal app button is clicked in the app bar.
 */
export function registerAppButtonClickHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);
  Handlers.registerHandler('appButtonClick', handler);
}

/**
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when entering hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverEnterHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);
  Handlers.registerHandler('appButtonHoverEnter', handler);
}

/**
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when exiting hover of the personal app button in the app bar.
 */
export function registerAppButtonHoverLeaveHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);
  Handlers.registerHandler('appButtonHoverLeave', handler);
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
  Handlers.registerBackButtonHandler(handler);
}

/**
 * @private
 * Registers a handler to be called when the page has been requested to load.
 * @param handler The handler to invoke when the page is loaded.
 */
export function registerOnLoadHandler(handler: (context: LoadContext) => void): void {
  ensureInitialized();
  Handlers.registerOnLoadHandler(handler);
}

/**
 * @private
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void {
  ensureInitialized();
  Handlers.registerBeforeUnloadHandler(handler);
}

/**
 * @private
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 * @param handler The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
export function registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void {
  ensureInitialized();
  Handlers.registerFocusEnterHandler(handler);
}

/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
export function registerEnterSettingsHandler(handler: () => void): void {
  ensureInitialized(FrameContexts.content);
  Handlers.registerHandler('changeSettings', handler);
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

  sendMessageToParent('getTabInstances', [tabInstanceParameters], callback);
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

  sendMessageToParent('getMruTabInstances', [tabInstanceParameters], callback);
}

/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
  ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

  sendMessageToParent('shareDeepLink', [
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
    FrameContexts.meetingStage,
  );
  sendMessageToParent('executeDeepLink', [deepLink], onComplete ? onComplete : getGenericOnCompleteHandler());
}

export function setFrameContext(frameContext: FrameContext): void {
  ensureInitialized(FrameContexts.content);
  sendMessageToParent('setFrameContext', [frameContext]);
}

export function initializeWithFrameContext(
  frameContext: FrameContext,
  callback?: () => void,
  validMessageOrigins?: string[],
): void {
  initialize(callback, validMessageOrigins);
  setFrameContext(frameContext);
}
