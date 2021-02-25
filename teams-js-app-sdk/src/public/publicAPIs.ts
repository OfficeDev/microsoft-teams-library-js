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
import { teamsCore } from './teamsAPIs';

export namespace core {
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

        GlobalVars.initializeCalled = false;
        GlobalVars.initializeCompleted = false;
        GlobalVars.initializeCallbacks = [];
        GlobalVars.additionalValidOrigins = [];
        GlobalVars.frameContext = null;
        GlobalVars.hostClientType = null;
        GlobalVars.isFramelessWindow = false;

        uninitializeCommunication();
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
    Communication.currentWindow = hostWindow;
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
   * Shares a deep link that a user can use to navigate back to a specific state in this page.
   * @param deepLinkParameters ID and label for the link and fallback URL.
   */
  export function shareDeepLink(deepLinkParameters: DeepLinkParameters): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel);

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
    );
    sendMessageToParent('executeDeepLink', [deepLink], onComplete ? onComplete : getGenericOnCompleteHandler());
  }
}
