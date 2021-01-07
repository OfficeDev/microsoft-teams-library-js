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
import { DeepLinkParameters, Context } from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { logs } from '../private/logs';
import { FrameContexts } from './constants';
import { teamsCore } from './teamsAPIs';

// ::::::::::::::::::::::: teamsjs App SDK public API ::::::::::::::::::::
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback Optionally specify a callback to invoke when teamsjs App SDK has successfully initialized
 * @param validMessageOrigins Optionally specify a list of cross frame message origins. There must have
 * https: protocol otherwise they will be ignored. Example: https://www.example.com
 */

/**
 * Namespace to interact with the core part of the teamsjs App SDK.
 * This object is used for starting or completing authentication flows.
 */
export namespace core {
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
          teamsCore.registerFullScreenHandler(null);
          teamsCore.registerBackButtonHandler(null);
          teamsCore.registerBeforeUnloadHandler(null);
          teamsCore.registerOnLoadHandler(null);
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
}
