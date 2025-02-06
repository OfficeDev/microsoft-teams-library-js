/**
 * @beta
 * Nested app auth capabilities
 * @module
 */

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
