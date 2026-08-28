import { ORIGIN_LIST_FETCH_TIMEOUT_IN_MS, validOriginsCdnEndpoint, validOriginsFallback } from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { createURLVerifier, URLVerifier, validateHostAgainstPattern } from './urlPattern';
import { inServerSideRenderingEnvironment, isValidHttpsURL } from './utils';

let validOriginsCache: string[] = [];
const validateOriginLogger = getLogger('validateOrigin');
let validOriginsPromise: Promise<string[]> | undefined;

/**
 * @hidden
 * An app-supplied replacement for the built-in valid-origins list.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface ValidOriginsOverride {
  /** Origins to trust, supplied inline. */
  list?: string[];
  /** URL of a JSON document shaped like `{ "validOrigins": string[] }`. */
  url?: URL;
}

let originsOverride: ValidOriginsOverride | undefined;
let overrideOriginsCache: string[] | undefined;
let overrideOriginsPromise: Promise<string[]> | undefined;

/**
 * @hidden
 * Replaces the built-in valid-origins list for the lifetime of this teamsjs instance.
 *
 * Once set, neither the bundled fallback list nor the CDN list is consulted: only the supplied
 * origins (plus any patterns passed as `validMessageOrigins`) are trusted. This is what allows an
 * app deployed to a sovereign cloud to stop trusting the origins teamsjs shipped with, rather
 * than merely adding to them.
 *
 * Must be applied before the host handshake begins.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function setValidOriginsOverride(override: ValidOriginsOverride): void {
  if (override.list === undefined && override.url === undefined) {
    throw new Error('A valid origins override must specify at least one of `list` or `url`.');
  }
  originsOverride = override;
  overrideOriginsCache = undefined;
  overrideOriginsPromise = undefined;
  validateOriginLogger(
    'Valid origins override applied. The built-in origin list will not be used. list=%o url=%s',
    override.list,
    override.url?.toString(),
  );
}

/**
 * @hidden
 * Whether an app-supplied override is currently replacing the built-in list.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function hasValidOriginsOverride(): boolean {
  return originsOverride !== undefined;
}

/**
 * @hidden
 * Warms the valid-origins cache.
 *
 * This is intentionally *not* invoked when this module is imported. Doing so would make merely
 * importing teamsjs emit a network request before the app has had any chance to configure which
 * cloud it is running in. It is instead triggered from `app.initialize`, and skipped entirely when
 * an override is in effect or the target cloud has no CDN.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function prefetchOriginsFromCDN(): Promise<void> {
  if (originsOverride !== undefined) {
    validateOriginLogger('Skipping CDN prefetch because a valid origins override is in effect');
    return;
  }
  if (!validOriginsPromise) {
    await getValidOriginsListFromCDN();
  }
}

function isValidOriginsCacheEmpty(): boolean {
  return validOriginsCache.length === 0;
}

/**
 * Fetches and validates a `{ validOrigins: string[] }` document, rejecting on any failure.
 */
function fetchOriginsList(endpoint: URL): Promise<string[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ORIGIN_LIST_FETCH_TIMEOUT_IN_MS);

  return fetch(endpoint, { signal: controller.signal }).then(
    (response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Invalid Response from Fetch Call');
      }
      return response.json().then((originsJSON) => {
        if (isValidOriginsJSONValid(JSON.stringify(originsJSON))) {
          return originsJSON.validOrigins as string[];
        }
        throw new Error('Valid origins list retrieved from CDN is invalid');
      });
    },
    (e) => {
      clearTimeout(timeoutId);
      throw e;
    },
  );
}

async function getValidOriginsListFromCDN(shouldDisableCache: boolean = false): Promise<string[]> {
  if (!isValidOriginsCacheEmpty() && !shouldDisableCache) {
    return validOriginsCache;
  }
  if (validOriginsPromise) {
    // Fetch has already been initiated, return the existing promise
    return validOriginsPromise;
  }
  if (validOriginsCdnEndpoint === null) {
    // This cloud has no reachable CDN (air-gapped). The bundled list is authoritative and we must
    // never attempt a network call.
    validateOriginLogger('No CDN endpoint is configured for this cloud. Using the bundled list.');
    validOriginsCache = validOriginsFallback;
    return validOriginsCache;
  }
  if (!inServerSideRenderingEnvironment()) {
    validateOriginLogger('Initiating fetch call to acquire valid origins list from CDN');

    validOriginsPromise = fetchOriginsList(validOriginsCdnEndpoint)
      .then((origins) => {
        validateOriginLogger('Fetch call completed and retrieved valid origins list from CDN');
        validOriginsCache = origins;
        return validOriginsCache;
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

/**
 * Resolves the override list. Unlike the CDN path this deliberately does **not** fall back to the
 * bundled list on failure: an app that asked to replace the built-in origins must not silently be
 * handed them back.
 */
function getOverrideOriginsList(): Promise<string[]> {
  const override = originsOverride;
  if (override === undefined) {
    return Promise.resolve([]);
  }
  if (overrideOriginsCache !== undefined) {
    return Promise.resolve(overrideOriginsCache);
  }
  if (overrideOriginsPromise) {
    return overrideOriginsPromise;
  }

  const inlineOrigins = override.list ?? [];
  if (override.url === undefined || inServerSideRenderingEnvironment()) {
    overrideOriginsCache = inlineOrigins;
    return Promise.resolve(overrideOriginsCache);
  }

  overrideOriginsPromise = fetchOriginsList(override.url)
    .then((origins) => {
      overrideOriginsCache = inlineOrigins.concat(origins);
      return overrideOriginsCache;
    })
    .catch((e) => {
      validateOriginLogger(
        'Failed to retrieve the valid origins override from %s: %s. Falling back to the inline override list only; the built-in list is still NOT used.',
        override.url?.toString(),
        e,
      );
      overrideOriginsCache = inlineOrigins;
      return overrideOriginsCache;
    });
  return overrideOriginsPromise;
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
  if (originsOverride !== undefined) {
    // Replace semantics: the bundled and CDN lists are never consulted.
    if (validateOriginWithValidOriginsList(messageOrigin, originsOverride.list ?? [])) {
      return Promise.resolve(true);
    }
    if (originsOverride.url === undefined) {
      return Promise.resolve(false);
    }
    return getOverrideOriginsList().then((validOriginsList) =>
      validateOriginWithValidOriginsList(messageOrigin, validOriginsList),
    );
  }

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
  originsOverride = undefined;
  overrideOriginsCache = undefined;
  overrideOriginsPromise = undefined;
}
