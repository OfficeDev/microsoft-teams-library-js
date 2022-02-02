import { HostClientType } from '../public/constants';
import { ErrorCode, SdkError } from '../public/interfaces';
import { defaultSDKVersionForCompatCheck, userOriginUrlValidationRegExp } from './constants';
import { GlobalVars } from './globalVars';
import { compareSDKVersions } from './utils';

/** @internal */
export function ensureInitialized(...expectedFrameContexts: string[]): void {
  if (!GlobalVars.initializeCalled) {
    throw new Error('The library has not yet been initialized');
  }

  if (GlobalVars.frameContext && expectedFrameContexts && expectedFrameContexts.length > 0) {
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
}

/**
 * @hidden
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 *
 * @param requiredVersion - SDK version required by the API
 *
 * @internal
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
 * Helper function to identify if host client is either android or ios
 *
 * @internal
 */
export function isHostClientMobile(): boolean {
  return GlobalVars.hostClientType == HostClientType.android || GlobalVars.hostClientType == HostClientType.ios;
}

/**
 * @hidden
 * Helper function which indicates if current API is supported on mobile or not.
 * @throws SdkError if host client is not android/ios or if the requiredVersion is not
 *          supported by platform or not. Null is returned in case of success.
 *
 * @internal
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
 */
export function processAdditionalValidOrigins(validMessageOrigins: string[]): void {
  let combinedOriginUrls = GlobalVars.additionalValidOrigins.concat(
    validMessageOrigins.filter((_origin: string) => {
      return typeof _origin === 'string' && userOriginUrlValidationRegExp.test(_origin);
    }),
  );
  const dedupUrls: { [url: string]: boolean } = {};
  combinedOriginUrls = combinedOriginUrls.filter(_originUrl => {
    if (dedupUrls[_originUrl]) {
      return false;
    }
    dedupUrls[_originUrl] = true;
    return true;
  });
  GlobalVars.additionalValidOrigins = combinedOriginUrls;
}
