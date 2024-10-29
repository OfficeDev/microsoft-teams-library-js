/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { initializeCommunication, sendAndHandleStatusAndReason, sendMessageToParent } from '../internal/communication';
import { defaultSDKVersionForCompatCheck } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import * as Handlers from '../internal/handlers'; // Conflict with some names
import { ensureInitializeCalled, ensureInitialized, processAdditionalValidOrigins } from '../internal/internalAPIs';
import { getLogger } from '../internal/telemetry';
import { isNullOrUndefined } from '../internal/typeCheckUtilities';
import { compareSDKVersions, inServerSideRenderingEnvironment, runWithTimeout } from '../internal/utils';
import * as app from '../public/app/app';
import * as authentication from '../public/authentication';
import { FrameContexts } from '../public/constants';
import * as dialog from '../public/dialog/dialog';
import * as menus from '../public/menus';
import { pages } from '../public/pages';
import {
  applyRuntimeConfig,
  generateVersionBasedTeamsRuntimeConfig,
  IBaseRuntime,
  mapTeamsVersionToSupportedCapabilities,
  runtime,
  versionAndPlatformAgnosticTeamsRuntimeConfig,
} from '../public/runtime';
import { version } from '../public/version';

/**
 * Number of milliseconds we'll give the initialization call to return before timing it out
 */
const initializationTimeoutInMs = 5000;

const appLogger = getLogger('app');

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
  ]);
}

export function notifySuccessHelper(apiVersionTag: string): void {
  sendMessageToParent(apiVersionTag, app.Messages.Success, [version]);
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
            const givenRuntimeConfig: IBaseRuntime | null = JSON.parse(runtimeConfig);
            initializeHelperLogger('Checking if %o is a valid runtime object', givenRuntimeConfig ?? 'null');
            // Check that givenRuntimeConfig is a valid instance of IBaseRuntime
            if (!givenRuntimeConfig || !givenRuntimeConfig.apiVersion) {
              throw new Error('Received runtime config is invalid');
            }
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
                const givenRuntimeConfig: IBaseRuntime | null = JSON.parse(clientSupportedSDKVersion);
                initializeHelperLogger('givenRuntimeConfig parsed to %o', givenRuntimeConfig ?? 'null');

                if (!givenRuntimeConfig) {
                  throw new Error(
                    'givenRuntimeConfig string was successfully parsed. However, it parsed to value of null',
                  );
                } else {
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

      authentication.initialize();
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
