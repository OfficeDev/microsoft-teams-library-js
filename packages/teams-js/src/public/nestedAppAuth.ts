/**
 * @beta
 * Nested app auth capabilities
 * @module
 */

import { Communication } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { HostClientType } from './constants';
import { runtime } from './runtime';

/**
 * Checks if MSAL-NAA channel recommended by the host
 * @returns true if host is recommending NAA channel and false otherwise
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isNAAChannelRecommended(): boolean {
  return (
    (ensureInitialized(runtime) &&
      (runtime.isNAAChannelRecommended || isNAAChannelRecommendedForLegacyTeamsMobile())) ??
    false
  );
}

/**
 * Gets the origin of the parent window if available.
 * This will be the top-level origin in the case of a parent app.
 * It is used to pass to the embedded child app to initialize the Nested App Auth bridge.

 * @returns The origin string if available, otherwise null
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function getParentOrigin(): string | null {
  ensureInitialized(runtime);
  return Communication.parentOrigin;
}

/**
 * Checks if the parent has the capability to manage its list of trusted child origins
 * for Nested App Auth (NAA).
 *
 * @returns true if parent can manage NAA TrustedOrigins, false otherwise
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function canParentManageNAATrustedOrigins(): boolean {
  return (ensureInitialized(runtime) && runtime.canParentManageNAATrustedOrigins) ?? false;
}

/**
 * Checks if NAA deeply nested scenario supported by the host
 * @returns true if host supports
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isDeeplyNestedAuthSupported(): boolean {
  return (ensureInitialized(runtime) && isNAAChannelRecommended() && runtime.isDeeplyNestedAuthSupported) ?? false;
}

function isNAAChannelRecommendedForLegacyTeamsMobile(): boolean {
  return ensureInitialized(runtime) &&
    isHostAndroidOrIOSOrIPadOSOrVisionOS() &&
    runtime.isLegacyTeams &&
    runtime.supports.nestedAppAuth
    ? true
    : false;
}

function isHostAndroidOrIOSOrIPadOSOrVisionOS(): boolean {
  return (
    GlobalVars.hostClientType === HostClientType.android ||
    GlobalVars.hostClientType === HostClientType.ios ||
    GlobalVars.hostClientType === HostClientType.ipados ||
    GlobalVars.hostClientType === HostClientType.visionOS
  );
}
