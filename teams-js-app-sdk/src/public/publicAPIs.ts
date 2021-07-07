/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { defaultSDKVersionForCompatCheck } from '../internal/constants';
import { pages } from './pages';
import { DeepLinkParameters, Context, ContextBridge } from './interfaces';
import { compareSDKVersions, getGenericOnCompleteHandler, transformContext } from '../internal/utils';
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
import { applyRuntimeConfig, IRuntime, teamsRuntimeConfig } from './runtime';

/**
 * Namespace to interact with the core part of the teamsjs App SDK.
 *
 * @beta
 */
export namespace core {
  // ::::::::::::::::::::::: teamsjs App SDK public API ::::::::::::::::::::
  /**
   * Initializes the library. This must be called before any other SDK calls
   * but after the frame is loaded successfully.
   * @param callback - Optionally specify a callback to invoke when App SDK has successfully initialized
   * @param validMessageOrigins - Optionally specify a list of cross frame message origins. There must have
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
          runtimeConfig: string,
          clientSupportedSDKVersion: string = defaultSDKVersionForCompatCheck,
        ) => {
          GlobalVars.frameContext = context;
          GlobalVars.hostClientType = clientType;
          GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;

          // Temporary workaround while the Hub is updated with the new argument order.
          // For now, we might receive any of these possibilities:
          // - `runtimeConfig` in `runtimeConfig` and `clientSupportedSDKVersion` in `clientSupportedSDKVersion`.
          // - `runtimeConfig` in `clientSupportedSDKVersion` and `clientSupportedSDKVersion` in `runtimeConfig`.
          // - `clientSupportedSDKVersion` in `runtimeConfig` and no `clientSupportedSDKVersion`.
          // This code supports any of these possibilities

          // Until Teams adopts the hub SDK, the Teams AppHost won't provide this runtime config
          // so we assume that if we don't have it, we must be running in Teams.
          // After Teams switches to the hub SDK, we can remove this default code.
          try {
            const givenRuntimeConfig: IRuntime = JSON.parse(runtimeConfig);
            runtimeConfig && applyRuntimeConfig(givenRuntimeConfig);
          } catch (e) {
            if (e instanceof SyntaxError) {
              try {
                const givenRuntimeConfig: IRuntime = JSON.parse(clientSupportedSDKVersion);
                clientSupportedSDKVersion && applyRuntimeConfig(givenRuntimeConfig);
              } catch (e) {
                if (e instanceof SyntaxError) {
                  // if the given runtime config was actually meant to be a SDK version, store it as such.
                  // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                  // it doesn't provide the runtimeConfig. After Teams switches to the hub SDK, we should
                  // remove this feature.
                  if (!isNaN(compareSDKVersions(runtimeConfig, defaultSDKVersionForCompatCheck))) {
                    GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                  }
                  applyRuntimeConfig(teamsRuntimeConfig);
                } else {
                  throw e;
                }
              }
            } else {
              // If it's any error that's not a JSON parsing error, we want the program to fail.
              throw e;
            }
          }

          // Notify all waiting callers that the initialization has completed
          GlobalVars.initializeCallbacks.forEach(initCallback => initCallback());
          GlobalVars.initializeCallbacks = [];
          GlobalVars.initializeCompleted = true;
        },
        validMessageOrigins,
      );

      authentication.initialize();
      pages.config.initialize();
      initializePrivateApis();

      // Undocumented function used to clear state between unit tests
      this._uninitialize = () => {
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
   * @privateRemarks
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
   * @privateRemarks
   * Hide from docs.
   * ------
   * Undocumented function used to clear state between unit tests
   *
   * @internal
   */
  export function _uninitialize(): void {}

  /**
   * Retrieves the current context the frame is running in.
   * @param callback - The callback to invoke when the {@link Context} object is retrieved.
   */
  export function getContext(callback: (context: Context) => void): void {
    ensureInitialized();

    sendMessageToParent('getContext', (contextBridge: ContextBridge) => {
      const context: Context = transformContext(contextBridge);
      callback(context);
    });
  }

  /**
   * @private
   * Hide from docs.
   * --Retaining for E2E tests, remove after E2E tests configuration
   * Retrieves the current context the frame is running in.
   * @param callback The callback to invoke when the {@link Context} object is retrieved.
   */
  export function getContextOld(callback: (contextBridge: ContextBridge) => void): void {
    ensureInitialized();

    sendMessageToParent('getContext', (contextBridge: ContextBridge) => {
      if (!contextBridge.frameContext) {
        // Fallback logic for frameContext properties
        contextBridge.frameContext = GlobalVars.frameContext;
      }
      callback(contextBridge);
    });
  }

  /**
   * Registers a handler for theme changes.
   * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
   * @param handler - The handler to invoke when the user changes their theme.
   */
  export function registerOnThemeChangeHandler(handler: (theme: string) => void): void {
    ensureInitialized();
    Handlers.registerOnThemeChangeHandler(handler);
  }

  /**
   * Shares a deep link that a user can use to navigate back to a specific state in this page.
   * @param deepLinkParameters - ID and label for the link and fallback URL.
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
   * @param deepLink - deep link.
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
}
