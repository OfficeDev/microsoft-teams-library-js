/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { defaultSDKVersionForCompatCheck, version } from '../internal/constants';
import { pages } from './pages';
import { DeepLinkParameters, Context, ContextBridge } from './interfaces';
import { compareSDKVersions, transformContext } from '../internal/utils';
import { logs } from '../private/logs';
import { FrameContexts } from './constants';
import {
  Communication,
  initializeCommunication,
  sendMessageToParent,
  uninitializeCommunication,
  sendAndUnwrap,
  sendAndHandleStatusAndReason as send,
} from '../internal/communication';
import { authentication } from './authentication';
import { initializePrivateApis } from '../private/privateAPIs';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { teamsCore } from './teamsAPIs';
import { applyRuntimeConfig, IRuntime, teamsRuntimeConfig } from './runtime';

/**
 * Namespace to interact with app initialization and lifecycle.
 *
 * @beta
 */
export namespace app {
  // ::::::::::::::::::::::: M365 App SDK public API ::::::::::::::::::::

  export const Messages = {
    AppLoaded: 'appInitialization.appLoaded',
    Success: 'appInitialization.success',
    Failure: 'appInitialization.failure',
    ExpectedFailure: 'appInitialization.expectedFailure',
  };

  export enum FailedReason {
    AuthFailed = 'AuthFailed',
    Timeout = 'Timeout',
    Other = 'Other',
  }

  export enum ExpectedFailureReason {
    PermissionError = 'PermissionError',
    NotFound = 'NotFound',
    Throttling = 'Throttling',
    Offline = 'Offline',
    Other = 'Other',
  }

  export interface IFailedRequest {
    reason: FailedReason;
    message?: string;
  }

  export interface IExpectedFailureRequest {
    reason: ExpectedFailureReason;
    message?: string;
  }

  /**
   * Checks whether the App SDK has been initialized.
   * @returns whether the App SDK has been initialized.
   */
  export function isInitialized(): boolean {
    return GlobalVars.initializeCalled;
  }

  /**
   * Gets the Frame Context that the App is running in. {@see FrameContexts} for the list of possible values.
   * @returns the Frame Context.
   */
  export function getFrameContext(): FrameContexts {
    return GlobalVars.frameContext;
  }

  /**
   * Initializes the library. This must be called before any other SDK calls
   * but after the frame is loaded successfully.
   * @param validMessageOrigins Optionally specify a list of cross frame message origins. They must have
   * https: protocol otherwise they will be ignored. Example: https://www.example.com
   * @returns Promise that will be fulfilled when initialization has completed
   */
  export function initialize(validMessageOrigins?: string[]): Promise<void> {
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
                  // if the given runtime config was actually meant to be a SDK version, store it as such.
                  // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                  // it doesn't provide the runtimeConfig. After Teams switches to the hub SDK, we should
                  // remove this feature.
                  if (!isNaN(compareSDKVersions(runtimeConfig, defaultSDKVersionForCompatCheck))) {
                    GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                  }
                  const givenRuntimeConfig: IRuntime = JSON.parse(clientSupportedSDKVersion);
                  clientSupportedSDKVersion && applyRuntimeConfig(givenRuntimeConfig);
                } catch (e) {
                  if (e instanceof SyntaxError) {
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

            GlobalVars.initializeCompleted = true;
          },
        );

        authentication.initialize();
        pages.config.initialize();
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
   * @returns Promise that will resolve with the {@link Context} object.
   */
  export function getContext(): Promise<Context> {
    return new Promise<ContextBridge>(resolve => {
      ensureInitialized();
      resolve(sendAndUnwrap('getContext'));
    }).then(contextBridge => transformContext(contextBridge));
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
   */
  export function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void {
    ensureInitialized();
    sendMessageToParent(Messages.ExpectedFailure, [expectedFailureRequest.reason, expectedFailureRequest.message]);
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
}

export namespace core {
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
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function executeDeepLink(deepLink: string): Promise<void> {
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
