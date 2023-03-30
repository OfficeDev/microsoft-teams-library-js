import { HostClientType } from '../public/constants';
import { ErrorCode, SdkError } from '../public/interfaces';
import { IBaseRuntime, isRuntimeInitialized, Runtime } from '../public/runtime';
import {
  defaultSDKVersionForCompatCheck,
  errorLibraryNotInitialized,
  userOriginUrlValidationRegExp,
} from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { compareSDKVersions } from './utils';

const internalLogger = getLogger('internal');
const ensureInitializeCalledLogger = internalLogger.extend('ensureInitializeCalled');
const ensureInitializedLogger = internalLogger.extend('ensureInitialized');

/**
 * Ensures `initialize` was called. This function does NOT verify that a response from Host was received and initialization completed.
 *
 * `ensureInitializeCalled` should only be used for APIs which:
 * - work in all FrameContexts
 * - are part of a required Capability
 * - are suspected to be used directly after calling `initialize`, potentially without awaiting the `initialize` call itself
 *
 * For most APIs {@link ensureInitialized} is the right validation function to use instead.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function ensureInitializeCalled(): void {
  if (!GlobalVars.initializeCalled) {
    ensureInitializeCalledLogger(errorLibraryNotInitialized);
    throw new Error(errorLibraryNotInitialized);
  }
}

/**
 * Ensures `initialize` was called and response from Host was received and processed and that `runtime` is initialized.
 * If expected FrameContexts are provided, it also validates that the current FrameContext matches one of the expected ones.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function ensureInitialized(runtime: IBaseRuntime, ...expectedFrameContexts: string[]): runtime is Runtime {
  // This global var can potentially be removed in the future if we use the initialization status of the runtime object as our source of truth
  if (!GlobalVars.initializeCompleted) {
    ensureInitializedLogger(
      '%s. initializeCalled: %s',
      errorLibraryNotInitialized,
      GlobalVars.initializeCalled.toString(),
    );
    throw new Error(errorLibraryNotInitialized);
  }

  if (expectedFrameContexts && expectedFrameContexts.length > 0) {
    let found = false;
    for (let i = 0; i < expectedFrameContexts.length; i++) {
      if (expectedFrameContexts[i] === GlobalVars.frameContext) {
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(
        `This call is only allowed in following contexts: ${JSON.stringify(expectedFrameContexts)}. ` +
          `Current context: "${GlobalVars.frameContext}".`,
      );
    }
  }
  return isRuntimeInitialized(runtime);
}

/**
 * @hidden
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 *
 * @param requiredVersion - SDK version required by the API
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isCurrentSDKVersionAtLeast(requiredVersion: string = defaultSDKVersionForCompatCheck): boolean {
  const value = compareSDKVersions(GlobalVars.clientSupportedSDKVersion, requiredVersion);
  if (isNaN(value)) {
    return false;
  }
  return value >= 0;
}

/**
 * @hidden
 * Helper function to identify if host client is either android, ios, or ipados
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isHostClientMobile(): boolean {
  return (
    GlobalVars.hostClientType == HostClientType.android ||
    GlobalVars.hostClientType == HostClientType.ios ||
    GlobalVars.hostClientType == HostClientType.ipados
  );
}

/**
 * @hidden
 * Helper function which indicates if current API is supported on mobile or not.
 * @throws SdkError if host client is not android/ios or if the requiredVersion is not
 *          supported by platform or not. Null is returned in case of success.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function throwExceptionIfMobileApiIsNotSupported(
  requiredVersion: string = defaultSDKVersionForCompatCheck,
): void {
  if (!isHostClientMobile()) {
    const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
    throw notSupportedError;
  } else if (!isCurrentSDKVersionAtLeast(requiredVersion)) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    throw oldPlatformError;
  }
}

/**
 * @hidden
 * Processes the valid origins specifuied by the user, de-duplicates and converts them into a regexp
 * which is used later for message source/origin validation
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function processAdditionalValidOrigins(validMessageOrigins: string[]): void {
  let combinedOriginUrls = GlobalVars.additionalValidOrigins.concat(
    validMessageOrigins.filter((_origin: string) => {
      return typeof _origin === 'string' && userOriginUrlValidationRegExp.test(_origin);
    }),
  );
  const dedupUrls: { [url: string]: boolean } = {};
  combinedOriginUrls = combinedOriginUrls.filter((_originUrl) => {
    if (dedupUrls[_originUrl]) {
      return false;
    }
    dedupUrls[_originUrl] = true;
    return true;
  });
  GlobalVars.additionalValidOrigins = combinedOriginUrls;
}
