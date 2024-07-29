import { validOriginsCdnEndpoint, validOriginsFallback } from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { inServerSideRenderingEnvironment, isValidHttpsURL } from './utils';

let validOriginsCache: string[] = [];
const validateOriginLogger = getLogger('validateOrigin');

export async function prefetchOriginsFromCDN(): Promise<void> {
  await getValidOriginsListFromCDN();
}

function isValidOriginsCacheEmpty(): boolean {
  return validOriginsCache.length === 0;
}

async function getValidOriginsListFromCDN(): Promise<string[]> {
  if (!isValidOriginsCacheEmpty()) {
    return validOriginsCache;
  }
  if (!inServerSideRenderingEnvironment()) {
    return fetch(validOriginsCdnEndpoint)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Invalid Response from Fetch Call');
        }
        return response.json().then((validOriginsCDN) => {
          if (isValidOriginsJSONValid(JSON.stringify(validOriginsCDN))) {
            validOriginsCache = validOriginsCDN.validOrigins;
            return validOriginsCache;
          } else {
            throw new Error('Valid Origins List Is Invalid');
          }
        });
      })
      .catch((e) => {
        validateOriginLogger('validOrigins fetch call to CDN failed with error: %s. Defaulting to fallback list', e);
        validOriginsCache = validOriginsFallback;
        return validOriginsCache;
      });
  } else {
    validOriginsCache = validOriginsFallback;
    return validOriginsFallback;
  }
}

function isValidOriginsJSONValid(validOriginsJSON: string): boolean {
  let validOriginsCDN = JSON.parse(validOriginsJSON);
  try {
    validOriginsCDN = JSON.parse(validOriginsJSON);
  } catch (_) {
    return false;
  }
  if (!validOriginsCDN.validOrigins) {
    return false;
  }
  for (const validOrigin of validOriginsCDN.validOrigins) {
    try {
      new URL('https://' + validOrigin);
    } catch (_) {
      validateOriginLogger('isValidOriginsFromCDN call failed to validate origin: %s', validOrigin);
      return false;
    }
  }
  return true;
}

/**
 * @param pattern - reference pattern
 * @param host - candidate string
 * @returns returns true if host matches pre-know valid pattern
 *
 * @example
 *    validateHostAgainstPattern('*.teams.microsoft.com', 'subdomain.teams.microsoft.com') returns true
 *    validateHostAgainstPattern('teams.microsoft.com', 'team.microsoft.com') returns false
 *
 * @internal
 * Limited to Microsoft-internal use
 */
function validateHostAgainstPattern(pattern: string, host: string): boolean {
  if (pattern.substring(0, 2) === '*.') {
    const suffix = pattern.substring(1);
    if (
      host.length > suffix.length &&
      host.split('.').length === suffix.split('.').length &&
      host.substring(host.length - suffix.length) === suffix
    ) {
      return true;
    }
  } else if (pattern === host) {
    return true;
  }
  return false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateOrigin(messageOrigin: URL): Promise<boolean> {
  return getValidOriginsListFromCDN().then((validOriginsList) => {
    // Check whether the url is in the pre-known allowlist or supplied by user
    if (!isValidHttpsURL(messageOrigin)) {
      validateOriginLogger(
        'Origin %s is invalid because it is not using https protocol. Protocol being used: %s',
        messageOrigin,
        messageOrigin.protocol,
      );
      return false;
    }
    const messageOriginHost = messageOrigin.host;
    if (validOriginsList.some((pattern) => validateHostAgainstPattern(pattern, messageOriginHost))) {
      return true;
    }

    for (const domainOrPattern of GlobalVars.additionalValidOrigins) {
      const pattern = domainOrPattern.substring(0, 8) === 'https://' ? domainOrPattern.substring(8) : domainOrPattern;
      if (validateHostAgainstPattern(pattern, messageOriginHost)) {
        return true;
      }
    }

    validateOriginLogger(
      'Origin %s is invalid because it is not an origin approved by this library or included in the call to app.initialize.\nOrigins approved by this library: %o\nOrigins included in app.initialize: %o',
      messageOrigin,
      validOriginsList,
      GlobalVars.additionalValidOrigins,
    );
    return false;
  });
}
