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
