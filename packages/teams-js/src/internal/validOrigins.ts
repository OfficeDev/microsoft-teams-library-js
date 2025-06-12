import { ORIGIN_LIST_FETCH_TIMEOUT_IN_MS, validOriginsCdnEndpoint, validOriginsFallback } from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { inServerSideRenderingEnvironment, isValidHttpsURL } from './utils';

let validOriginsCache: string[] = [];
const validateOriginLogger = getLogger('validateOrigin');
let validOriginsPromise: Promise<string[]> | undefined;

export async function prefetchOriginsFromCDN(): Promise<void> {
  if (!validOriginsPromise) {
    await getValidOriginsListFromCDN();
  }
}

function isValidOriginsCacheEmpty(): boolean {
  return validOriginsCache.length === 0;
}

async function getValidOriginsListFromCDN(shouldDisableCache: boolean = false): Promise<string[]> {
  if (!isValidOriginsCacheEmpty() && !shouldDisableCache) {
    return validOriginsCache;
  }
  if (validOriginsPromise) {
    // Fetch has already been initiated, return the existing promise
    return validOriginsPromise;
  }
  if (!inServerSideRenderingEnvironment()) {
    validateOriginLogger('Initiating fetch call to acquire valid origins list from CDN');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ORIGIN_LIST_FETCH_TIMEOUT_IN_MS);

    validOriginsPromise = fetch(validOriginsCdnEndpoint, { signal: controller.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error('Invalid Response from Fetch Call');
        }
        validateOriginLogger('Fetch call completed and retrieved valid origins list from CDN');
        return response.json().then((validOriginsCDN) => {
          if (isValidOriginsJSONValid(JSON.stringify(validOriginsCDN))) {
            validOriginsCache = validOriginsCDN.validOrigins;
            return validOriginsCache;
          } else {
            throw new Error('Valid origins list retrieved from CDN is invalid');
          }
        });
      })
      .catch((e) => {
        if (e.name === 'AbortError') {
          validateOriginLogger(
            `validOrigins fetch call to CDN failed due to Timeout of ${ORIGIN_LIST_FETCH_TIMEOUT_IN_MS} ms. Defaulting to fallback list`,
          );
        } else {
          validateOriginLogger('validOrigins fetch call to CDN failed with error: %s. Defaulting to fallback list', e);
        }
        validOriginsCache = validOriginsFallback;
        return validOriginsCache;
      });
    return validOriginsPromise;
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
export function validateOrigin(messageOrigin: URL, disableCache?: boolean): Promise<boolean> {
  return getValidOriginsListFromCDN(disableCache).then((validOriginsList) => {
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

prefetchOriginsFromCDN();
