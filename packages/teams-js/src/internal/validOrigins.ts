import { ORIGIN_LIST_FETCH_TIMEOUT_IN_MS, validOriginsCdnEndpoint, validOriginsFallback } from './constants';
import { GlobalVars } from './globalVars';
import { getLogger } from './telemetry';
import { createURLVerifier, URLVerifier, validateHostAgainstPattern } from './urlPattern';
import { inServerSideRenderingEnvironment, isValidHttpsURL } from './utils';

let validOriginsCache: string[] = [];
const validateOriginLogger = getLogger('validateOrigin');
let validOriginsPromise: Promise<string[]> | undefined;

/**
 * Incremented whenever the origins configuration changes.
 *
 * A fetch captures this when it is issued and compares it on resolution. A request made under a
 * superseded configuration must not reach the cache: its handler resolves the local list lazily, so
 * without this guard a fetch started against the built-in endpoint could land after an app-supplied
 * override was applied and write `[the app's list] + [the built-in origins]` -- handing back exactly
 * the origins the app asked to stop trusting.
 */
let configurationEpoch = 0;

/**
 * The most recently issued fetch, so it can be torn down when an app replaces the configuration
 * underneath it. Not cleared once the fetch settles: aborting an already-settled controller is a
 * no-op, and {@link configurationEpoch} is what actually invalidates the result.
 */
let inFlightFetchController: AbortController | undefined;

/**
 * The origins to use when a response arrives for a configuration that has since been replaced.
 *
 * Shared by both the success and failure paths so the superseded response is discarded identically
 * however it ends, and so the message is only emitted into the bundle once.
 */
function supersededOrigins(): string[] {
  validateOriginLogger('Ignoring valid origins response from a superseded configuration');
  return localOrigins();
}

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
  // A prefetch for the bundled cloud may already be in flight. Bumping the epoch stops its result
  // from landing; aborting additionally frees the connection, since the response is now unwanted.
  configurationEpoch++;
  inFlightFetchController?.abort();
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
 * Invoked once when this module is imported (see the bottom of this file) and again from
 * `app.initialize`, where it is a no-op if the import-time call is already in flight. It is also a
 * no-op when there is no endpoint to fetch from.
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
  // Captured so the result can be discarded if the configuration changes while this is in flight.
  const issuedAtEpoch = configurationEpoch;
  inFlightFetchController = controller;

  const isStale = (): boolean => issuedAtEpoch !== configurationEpoch;

  validOriginsPromise = fetch(endpoint, { signal: controller.signal })
    .then((response) => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error('Invalid Response from Fetch Call');
      }
      validateOriginLogger('Fetch call completed and retrieved valid origins list');
      return response.json().then((validOriginsCDN) => {
        if (isStale()) {
          // The app replaced the origins configuration while this was in flight, so this response
          // describes a list it no longer trusts. Returning the current local list instead is what
          // stops the superseded origins from being reinstated.
          return supersededOrigins();
        }
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
      if (isStale()) {
        // Includes the deliberate abort from abandonInFlightFetch(), which is not a failure.
        return supersededOrigins();
      }
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
  // Deliberately does not abort: this is a test helper, so there is no connection worth freeing, and
  // aborting here would be observable to tests that count aborts on the real timeout path.
  configurationEpoch++;
  validOriginsCache = [];
  validOriginsPromise = undefined;
  originsOverride = undefined;
}

/**
 * Warms the cache for the cloud this bundle targets, at module scope.
 *
 * Safe to do on import *because* the cloud is fixed at build time: `cloudBuild.cjs` aliases the
 * valid-domains artifact to the target cloud's, so `validOriginsCdnEndpoint` is a compile-time
 * constant and this bundle contains no other cloud's endpoint. Under the subpath-exports delivery
 * model, choosing `@microsoft/teams-js/gcch` is itself the declaration of which cloud to warm — the
 * app has nothing left to configure that would change the answer.
 *
 * Doing this here rather than in `app.initialize` keeps the fetch off the critical path: it
 * overlaps whatever the app does before initializing, so a host handshake that arrives later does
 * not wait on it.
 *
 * Two cases still resolve the endpoint later, and both are handled:
 *   - Air-gapped clouds carry a null endpoint, so this is a no-op and emits no request.
 *   - An app that supplies its own list or URL calls `setValidOriginsOverride`, which abandons this
 *     fetch so its response cannot reinstate the origins the app replaced.
 *
 * `validOrigins.ts` is declared in `sideEffects` (package.json) and `treeshake.moduleSideEffects`
 * (rollup.config.mjs) so this survives bundling.
 */
prefetchOriginsFromCDN();
