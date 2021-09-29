import { userOriginUrlValidationRegExp, defaultSDKVersionForCompatCheck } from './constants';
import { GlobalVars } from './globalVars';
import { generateRegExpFromUrls, compareSDKVersions } from './utils';

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
      throw new Error("This call is not allowed in the '" + GlobalVars.frameContext + "' context");
    }
  }
}

/**
 * Checks whether the platform has knowledge of this API by doing a comparison
 * on API required version and platform supported version of the SDK
 * @param requiredVersion SDK version required by the API
 */
export function isAPISupportedByPlatform(requiredVersion: string = defaultSDKVersionForCompatCheck): boolean {
  const value = compareSDKVersions(GlobalVars.clientSupportedSDKVersion, requiredVersion);
  if (isNaN(value)) {
    return false;
  }
  return value >= 0;
}

/**
 * Processes the valid origins specifuied by the user, de-duplicates and converts them into a regexp
 * which is used later for message source/origin validation
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
  if (GlobalVars.additionalValidOrigins.length > 0) {
    GlobalVars.additionalValidOriginsRegexp = generateRegExpFromUrls(GlobalVars.additionalValidOrigins);
  } else {
    GlobalVars.additionalValidOriginsRegexp = null;
  }
}
