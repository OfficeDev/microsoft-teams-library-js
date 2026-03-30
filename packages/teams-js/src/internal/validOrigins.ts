import { ORIGIN_LIST_FETCH_TIMEOUT_IN_MS, validOriginsCdnEndpoint, validOriginsFallback } from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { createURLVerifier, URLVerifier, validateHostAgainstPattern } from './urlPattern';
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
 * Validates the origin against the full pattern including protocol and hostname.
 * @param pattern - reference pattern
 * @param origin - candidate URL object
 */
function validateOriginAgainstFullPattern(pattern: string, origin: URL): boolean {
  let patternUrl: URLVerifier;
  try {
    const createdURLVerifier = createURLVerifier(pattern, validateOriginLogger);
    if (!createdURLVerifier) {
      return false;
    }
    patternUrl = createdURLVerifier;
  } catch {
    return false;
  }
  return patternUrl.test(origin);
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateOrigin(messageOrigin: URL, disableCache?: boolean): Promise<boolean> {
  // Try origin against the cache or hardcoded fallback list first before fetching from CDN
  const localList = !disableCache && !isValidOriginsCacheEmpty() ? validOriginsCache : validOriginsFallback;
  if (validateOriginWithValidOriginsList(messageOrigin, localList)) {
    return Promise.resolve(true);
  }

  validateOriginLogger('Origin %s is not in the local valid origins list, fetching from CDN', messageOrigin);
  return getValidOriginsListFromCDN(disableCache).then((validOriginsList) =>
    validateOriginWithValidOriginsList(messageOrigin, validOriginsList),
  );
}

function validateOriginWithValidOriginsList(messageOrigin: URL, validOriginsList: string[]): boolean {
  // User provided additional valid origins take precedence as they do not require https protocol
  for (const domainOrPattern of GlobalVars.additionalValidOrigins) {
    if (validateOriginAgainstFullPattern(domainOrPattern, messageOrigin)) {
      return true;
    }
  }

  const messageOriginHost = messageOrigin.host;

  // For standard valid origins, only allow https protocol
  if (!isValidHttpsURL(messageOrigin)) {
    validateOriginLogger(
      'Origin %s is invalid because it is not using https protocol. Protocol being used: %s',
      messageOrigin,
      messageOrigin.protocol,
    );
    return false;
  }

  if (validOriginsList.some((pattern) => validateHostAgainstPattern(pattern, messageOriginHost))) {
    return true;
  }

  validateOriginLogger(
    'Origin %s is invalid because it is not an origin approved by this library or included in the call to app.initialize.\nOrigins approved by this library: %o\nOrigins included in app.initialize: %o',
    messageOrigin,
    validOriginsList,
    GlobalVars.additionalValidOrigins,
  );
  return false;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * This function is only used for testing to reset the valid origins cache and ignore prefetched values.
 */
export function resetValidOriginsCache(): void {
  validOriginsCache = [];
  validOriginsPromise = undefined;
}

prefetchOriginsFromCDN();
