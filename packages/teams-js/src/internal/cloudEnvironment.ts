import * as cloudArtifactModule from '../artifactsForCDN/validDomains.json';

/**
 * @hidden
 * The set of clouds teamsjs can be built for.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export type CloudEnvironment = 'prod' | 'gcch' | 'dod' | 'gallatin' | 'ag08' | 'ag09';

/**
 * @hidden
 * Shape of a valid-domains artifact.
 *
 * Declared explicitly because TypeScript resolves whichever artifact exists at compile time
 * (always the prod one) while the bundler may substitute a different cloud's artifact, whose
 * `validOriginsCdnEndpoint` is `null` for air-gapped clouds.
 *
 * The artifacts are generated and checked into this repository and their shape is asserted by unit
 * tests, so no defensive parsing is done here: validating at runtime would add bytes to every
 * app's bundle to guard against a malformed file that cannot reach production.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface CloudArtifact {
  cloud: CloudEnvironment;
  validOriginsCdnEndpoint: string | null;
  teamsDeepLinkHost: string;
  validOrigins: string[];
}

const cloudArtifact = cloudArtifactModule as unknown as CloudArtifact;

/**
 * @hidden
 * The cloud this bundle was built for.
 *
 * Read from the bundled valid-domains artifact, which is the single source of truth: a sovereign
 * build swaps that artifact via a bundler alias, so the declared cloud cannot drift from the
 * origin list actually shipped. `cloudBuild.cjs` asserts at build time that the swapped artifact
 * matches the requested cloud.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const currentCloudEnvironment: CloudEnvironment = cloudArtifact.cloud;

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
 * CDN endpoint hosting the dynamic valid-origins list for this cloud, or `null` when the cloud has
 * no reachable CDN (air-gapped). When `null`, {@link bundledValidOrigins} is authoritative and
 * teamsjs never makes a network call to resolve origins.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const bundledValidOriginsCdnEndpoint: URL | null =
  cloudArtifact.validOriginsCdnEndpoint === null ? null : new URL(cloudArtifact.validOriginsCdnEndpoint);

/**
 * @hidden
 * Host used to build Teams deep links for this cloud. Sovereign clouds use their own Teams host, so
 * a sovereign bundle contains no prod deep-link host.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const bundledTeamsDeepLinkHost: string = cloudArtifact.teamsDeepLinkHost;
