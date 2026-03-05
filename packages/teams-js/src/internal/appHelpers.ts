/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  callFunctionInHostAndHandleResponse,
  initializeCommunication,
  sendAndHandleStatusAndReason,
  sendMessageToParent,
} from '../internal/communication';
import { defaultSDKVersionForCompatCheck, errorLibraryNotInitialized } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitializeCalled, ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { getLogger } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import {
  compareSDKVersions,
  inServerSideRenderingEnvironment,
  normalizeAgeGroupValue,
  runWithTimeout,
} from '../internal/utils';
import * as app from '../public/app/app';
import { FrameContexts } from '../public/constants';
import * as dialog from '../public/dialog/dialog';
import * as menus from '../public/menus';
import * as pages from '../public/pages/pages';
import {
  applyRuntimeConfig,
  generateVersionBasedTeamsRuntimeConfig,
  IBaseRuntime,
  mapTeamsVersionToSupportedCapabilities,
  runtime,
  versionAndPlatformAgnosticTeamsRuntimeConfig,
} from '../public/runtime';
import { version } from '../public/version';
import { SimpleTypeResponseHandler } from './responseHandler';

/**
 * Number of milliseconds we'll give the initialization call to return before timing it out
 */
const initializationTimeoutInMs = 60000;

const appLogger = getLogger('app');

/**
 * The response of the notify success callback.
 */
export interface NotifySuccessResponse {
  /**
   * It shows if the callback resolved successfully in the host. If the host does not support answering back to the callback, the result is unknown.
   */
  hasFinishedSuccessfully: true | 'unknown';
}

export function appInitializeHelper(apiVersionTag: string, validMessageOrigins?: string[]): Promise<void> {
  if (!inServerSideRenderingEnvironment()) {
    return runWithTimeout(
      () => initializeHelper(apiVersionTag, validMessageOrigins),
      initializationTimeoutInMs,
      new Error('SDK initialization timed out.'),
    );
  } else {
    const initializeLogger = appLogger.extend('initialize');
    // This log statement should NEVER actually be written. This code path exists only to enable compilation in server-side rendering environments.
    // If you EVER see this statement in ANY log file, something has gone horribly wrong and a bug needs to be filed.
    initializeLogger('window object undefined at initialization');
    return Promise.resolve();
  }
}

export function notifyAppLoadedHelper(apiVersionTag: string): void {
  sendMessageToParent(apiVersionTag, app.Messages.AppLoaded, [version]);
}

export function notifyExpectedFailureHelper(
  apiVersionTag: string,
  expectedFailureRequest: app.IExpectedFailureRequest,
): void {
  sendMessageToParent(apiVersionTag, app.Messages.ExpectedFailure, [
    expectedFailureRequest.reason,
    expectedFailureRequest.message,
  ]);
}

export function notifyFailureHelper(apiVersiontag: string, appInitializationFailedRequest: app.IFailedRequest): void {
  sendMessageToParent(apiVersiontag, app.Messages.Failure, [
    appInitializationFailedRequest.reason,
    appInitializationFailedRequest.message,
    appInitializationFailedRequest.authHeader,
  ]);
}

export async function notifySuccessHelper(apiVersionTag: string): Promise<NotifySuccessResponse> {
  // The following implementation ensures that notify success can be called before the initialize
  // call resolves completely, while still accessing the initialized runtime object without
  // any issue.

  // If the initialize already completed, dispatch notify success
  if (GlobalVars.initializeCompleted) {
    return callNotifySuccessInHost(apiVersionTag);
  }

  // If initialize hasn't been called yet, throw an error to the dev as the app hasn't initialized yet
  if (!GlobalVars.initializePromise) {
    throw new Error(errorLibraryNotInitialized);
  }

  // If initialize is still waiting for response, dispatch the call after initialize
  // finishes to have the full runtime object instantiated.
  return GlobalVars.initializePromise.then(() => callNotifySuccessInHost(apiVersionTag));
}

function supportsNotifySuccessResponse(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.app?.notifySuccessResponse;
}

export async function callNotifySuccessInHost(apiVersionTag: string): Promise<NotifySuccessResponse> {
  if (!supportsNotifySuccessResponse()) {
    sendMessageToParent(apiVersionTag, app.Messages.Success, [version]);
    return {
      hasFinishedSuccessfully: 'unknown',
    };
  }
  return callFunctionInHostAndHandleResponse(
    app.Messages.Success,
    [version],
    new SimpleTypeResponseHandler<undefined>(),
    apiVersionTag,
  ).then(() => ({ hasFinishedSuccessfully: true }));
}

const initializeHelperLogger = appLogger.extend('initializeHelper');
function initializeHelper(apiVersionTag: string, validMessageOrigins?: string[]): Promise<void> {
  return new Promise<void>((resolve) => {
    // Independent components might not know whether the SDK is initialized so might call it to be safe.
    // Just no-op if that happens to make it easier to use.
    if (!GlobalVars.initializeCalled) {
      GlobalVars.initializeCalled = true;
      Handlers.initializeHandlers();
      GlobalVars.initializePromise = initializeCommunication(validMessageOrigins, apiVersionTag).then(
        ({ context, clientType, runtimeConfig, clientSupportedSDKVersion = defaultSDKVersionForCompatCheck }) => {
          GlobalVars.frameContext = context;
          GlobalVars.hostClientType = clientType;
          GlobalVars.clientSupportedSDKVersion = clientSupportedSDKVersion;
          // Temporary workaround while the Host is updated with the new argument order.
          // For now, we might receive any of these possibilities:
          // - `runtimeConfig` in `runtimeConfig` and `clientSupportedSDKVersion` in `clientSupportedSDKVersion`.
          // - `runtimeConfig` in `clientSupportedSDKVersion` and `clientSupportedSDKVersion` in `runtimeConfig`.
          // - `clientSupportedSDKVersion` in `runtimeConfig` and no `clientSupportedSDKVersion`.
          // This code supports any of these possibilities

          // Teams AppHost won't provide this runtime config
          // so we assume that if we don't have it, we must be running in Teams.
          // After Teams updates its client code, we can remove this default code.
          try {
            initializeHelperLogger('Parsing %s', runtimeConfig);
            let givenRuntimeConfig: IBaseRuntime | null = JSON.parse(runtimeConfig);
            initializeHelperLogger('Checking if %o is a valid runtime object', givenRuntimeConfig ?? 'null');
            // Check that givenRuntimeConfig is a valid instance of IBaseRuntime
            if (!givenRuntimeConfig || !givenRuntimeConfig.apiVersion) {
              throw new Error('Received runtime config is invalid');
            }
            // Normalize ageGroup value for backward compatibility
            givenRuntimeConfig = normalizeAgeGroupValue(givenRuntimeConfig);
            runtimeConfig && applyRuntimeConfig(givenRuntimeConfig);
          } catch (e) {
            if (e instanceof SyntaxError) {
              try {
                initializeHelperLogger('Attempting to parse %s as an SDK version', runtimeConfig);
                // if the given runtime config was actually meant to be a SDK version, store it as such.
                // TODO: This is a temporary workaround to allow Teams to store clientSupportedSDKVersion even when
                // it doesn't provide the runtimeConfig. After Teams updates its client code, we should
                // remove this feature.
                if (!isNaN(compareSDKVersions(runtimeConfig, defaultSDKVersionForCompatCheck))) {
                  GlobalVars.clientSupportedSDKVersion = runtimeConfig;
                }
                let givenRuntimeConfig: IBaseRuntime | null = JSON.parse(clientSupportedSDKVersion);
                initializeHelperLogger('givenRuntimeConfig parsed to %o', givenRuntimeConfig ?? 'null');

                if (!givenRuntimeConfig) {
                  throw new Error(
                    'givenRuntimeConfig string was successfully parsed. However, it parsed to value of null',
                  );
                } else {
                  givenRuntimeConfig = normalizeAgeGroupValue(givenRuntimeConfig);
                  applyRuntimeConfig(givenRuntimeConfig);
                }
              } catch (e) {
                if (e instanceof SyntaxError) {
                  applyRuntimeConfig(
                    generateVersionBasedTeamsRuntimeConfig(
                      GlobalVars.clientSupportedSDKVersion,
                      versionAndPlatformAgnosticTeamsRuntimeConfig,
                      mapTeamsVersionToSupportedCapabilities,
                    ),
                  );
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

      menus.initialize();
      pages.config.initialize();
      dialog.initialize();
    }

    // Handle additional valid message origins if specified
    if (Array.isArray(validMessageOrigins)) {
      processAdditionalValidOrigins(validMessageOrigins);
    }

    if (GlobalVars.initializePromise !== undefined) {
      resolve(GlobalVars.initializePromise);
    } else {
      initializeHelperLogger('GlobalVars.initializePromise is unexpectedly undefined');
    }
  });
}

export function registerOnThemeChangeHandlerHelper(apiVersionTag: string, handler: app.themeHandler): void {
  // allow for registration cleanup even when not called initialize
  !isNullOrUndefined(handler) && ensureInitializeCalled();
  Handlers.registerOnThemeChangeHandler(apiVersionTag, handler);
}

export function registerOnPromptHandlerHelper(apiVersionTag: string, handler: app.promptHandler): void {
  // allow for registration cleanup even when not called initialize
  !isNullOrUndefined(handler) && ensureInitializeCalled();
  Handlers.registerOnPromptHandler(apiVersionTag, handler);
}

export function registerOnContextChangeHandlerHelper(apiVersionTag: string, handler: app.contextHandler): void {
  !isNullOrUndefined(handler) && ensureInitializeCalled();
  Handlers.registerOnContextChangeHandler(apiVersionTag, handler);
}

export function openLinkHelper(apiVersionTag: string, deepLink: string): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    resolve(sendAndHandleStatusAndReason(apiVersionTag, 'executeDeepLink', deepLink));
  });
}
