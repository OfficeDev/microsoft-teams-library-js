import * as cloudArtifactModule from '../artifactsForCDN/validDomains.json';
import { getLogger } from './telemetry';

/**
 * @hidden
 * Shape of a valid-domains artifact. Declared explicitly because TypeScript infers the shape of
 * whichever artifact is resolved at compile time (always the prod one), while the bundler
 * may substitute a different cloud's artifact whose fields differ — notably
 * `validOriginsCdnEndpoint`, which is `null` for air-gapped clouds.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface CloudArtifact {
  cloud?: string;
  validOriginsCdnEndpoint?: string | null;
  teamsDeepLinkHost?: string;
  validOrigins: string[];
}

const cloudArtifact = cloudArtifactModule as unknown as CloudArtifact;

/**
 * @hidden
 * Replaced at build time by webpack `DefinePlugin` / rollup `@rollup/plugin-replace`
 * (and by Jest `globals` during unit tests) with the cloud this bundle targets.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare const TEAMSJS_CLOUD = 'prod';

/**
 * @hidden
 * The set of clouds teamsjs can be built for.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type CloudEnvironment = 'prod' | 'gcch' | 'dod' | 'gallatin' | 'ag08' | 'ag09';

const knownCloudEnvironments: readonly string[] = ['prod', 'gcch', 'dod', 'gallatin', 'ag08', 'ag09'];

const cloudEnvironmentLogger = getLogger('cloudEnvironment');

/**
 * @hidden
 * The cloud this bundle was built for.
 *
 * This is resolved from the bundled valid-domains artifact rather than from `TEAMSJS_CLOUD`
 * directly. Sovereign builds swap that artifact via a bundler alias, so the artifact is the
 * single source of truth and cannot drift from the origin list actually shipped. The
 * `TEAMSJS_CLOUD` define is only used to detect a misconfigured build.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const currentCloudEnvironment: CloudEnvironment = resolveCloudEnvironment();

function resolveCloudEnvironment(): CloudEnvironment {
  const fromArtifact = typeof cloudArtifact.cloud === 'string' ? cloudArtifact.cloud : 'prod';
  const resolved = (knownCloudEnvironments.indexOf(fromArtifact) >= 0 ? fromArtifact : 'prod') as CloudEnvironment;

  // `TEAMSJS_CLOUD` is undefined in consumers that do not define it (for example an app that
  // bundles the ESM output directly). Only warn when it is present and disagrees.
  const declared = typeof TEAMSJS_CLOUD === 'string' ? TEAMSJS_CLOUD : undefined;
  if (declared !== undefined && declared !== resolved) {
    cloudEnvironmentLogger(
      'Build is configured for cloud %s but the bundled valid-domains artifact is for %s. The artifact wins. This indicates a misconfigured bundler alias.',
      declared,
      resolved,
    );
  }
  return resolved;
}

/**
 * @hidden
 * True when this bundle targets a sovereign (non-prod) cloud.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSovereignCloud(): boolean {
  return currentCloudEnvironment !== 'prod';
}

/**
 * @hidden
 * Valid origins bundled with this build. Only ever contains origins for {@link currentCloudEnvironment}.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const bundledValidOrigins: string[] = cloudArtifact.validOrigins;

/**
 * @hidden
 * CDN endpoint hosting the dynamic valid-origins list for this cloud, or `null` when the cloud
 * has no reachable CDN (air-gapped). When `null`, {@link bundledValidOrigins} is authoritative
 * and teamsjs never makes a network call to resolve origins.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const bundledValidOriginsCdnEndpoint: URL | null = parseEndpoint(cloudArtifact.validOriginsCdnEndpoint);

/**
 * @hidden
 * Host used to build Teams deep links for this cloud. Sovereign clouds use their own Teams host,
 * so a sovereign bundle contains no prod deep-link host.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const bundledTeamsDeepLinkHost: string =
  typeof cloudArtifact.teamsDeepLinkHost === 'string' && cloudArtifact.teamsDeepLinkHost.length > 0
    ? cloudArtifact.teamsDeepLinkHost
    : cloudArtifact.validOrigins[0];

function parseEndpoint(value: string | null | undefined): URL | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  try {
    return new URL(value);
  } catch (_) {
    cloudEnvironmentLogger('Bundled validOriginsCdnEndpoint %s is not a valid URL; treating as absent', value);
    return null;
  }
}
