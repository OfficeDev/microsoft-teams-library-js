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

/**
 * The origins to trust without a network call: the app's inline override when one is set,
 * otherwise the list bundled with this build.
 */
function localOrigins(): string[] {
  return originsOverride ? (originsOverride.list ?? []) : validOriginsFallback;
}

/**
 * Where to fetch the dynamic list from, or `null` when there is nowhere to fetch it from -- either
 * the app supplied an inline-only override, or this cloud has no reachable CDN (air-gapped).
 */
function originsEndpoint(): URL | null {
  return originsOverride ? (originsOverride.url ?? null) : validOriginsCdnEndpoint;
}

/**
 * @hidden
 * Replaces the built-in valid-origins list for the lifetime of this teamsjs instance.
 *
 * Once set, neither the bundled fallback list nor the built-in CDN list is consulted: only the
 * supplied origins (plus any patterns passed as `validMessageOrigins`) are trusted. This is what
 * allows an app deployed to a sovereign cloud to stop trusting the origins teamsjs shipped with,
 * rather than merely adding to them -- including when the fetch fails, since the fallback is the
 * app's own inline list rather than the built-in one.
 *
 * Must be applied before the host handshake begins.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function setValidOriginsOverride(override: ValidOriginsOverride): void {
  if (override.list === undefined && override.url === undefined) {
    throw new Error('A valid origins override must specify a list or a url.');
  }
  originsOverride = override;
  validOriginsCache = [];
  validOriginsPromise = undefined;
  validateOriginLogger('Valid origins override applied; the built-in list will not be used');
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
 * cloud it is running in. It is instead triggered from `app.initialize`, and is a no-op when there
 * is no endpoint to fetch from.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function prefetchOriginsFromCDN(): Promise<void> {
  if (!validOriginsPromise) {
    await getValidOriginsList();
  }
}

function isValidOriginsCacheEmpty(): boolean {
  return validOriginsCache.length === 0;
}

/**
 * Resolves the dynamic origins list, falling back to {@link localOrigins} on any failure. Note that
 * for an app-supplied override the fallback is the app's own inline list, so a failed fetch never
 * restores the origins the app asked to stop trusting.
 */
async function getValidOriginsList(shouldDisableCache: boolean = false): Promise<string[]> {
  if (!isValidOriginsCacheEmpty() && !shouldDisableCache) {
    return validOriginsCache;
  }
  if (validOriginsPromise) {
    // Fetch has already been initiated, return the existing promise
    return validOriginsPromise;
  }

  const endpoint = originsEndpoint();
  if (endpoint === null || inServerSideRenderingEnvironment()) {
    validOriginsCache = localOrigins();
    return validOriginsCache;
  }

  validateOriginLogger('Initiating fetch call to acquire valid origins list from %s', endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ORIGIN_LIST_FETCH_TIMEOUT_IN_MS);

  validOriginsPromise = fetch(endpoint, { signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Invalid Response from Fetch Call');
      }
      validateOriginLogger('Fetch call completed and retrieved valid origins list');
      return response.json().then((validOriginsCDN) => {
        if (isValidOriginsJSONValid(JSON.stringify(validOriginsCDN))) {
          validOriginsCache = localOrigins().concat(validOriginsCDN.validOrigins);
          return validOriginsCache;
        } else {
          throw new Error('Valid origins list retrieved from CDN is invalid');
        }
      });
    })
    .catch((e) => {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        validateOriginLogger(
          `validOrigins fetch call failed due to Timeout of ${ORIGIN_LIST_FETCH_TIMEOUT_IN_MS} ms. Defaulting to fallback list`,
        );
      } else {
        validateOriginLogger('validOrigins fetch call failed with error: %s. Defaulting to fallback list', e);
      }
      validOriginsCache = localOrigins();
      return validOriginsCache;
    });
  return validOriginsPromise;
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
  // Try origin against the cache or the local list first before fetching
  const localList = !disableCache && !isValidOriginsCacheEmpty() ? validOriginsCache : localOrigins();
  if (validateOriginWithValidOriginsList(messageOrigin, localList)) {
    return Promise.resolve(true);
  }
  if (originsEndpoint() === null) {
    return Promise.resolve(false);
  }

  validateOriginLogger('Origin %s is not in the local valid origins list, fetching', messageOrigin);
  return getValidOriginsList(disableCache).then((validOriginsList) =>
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
}
