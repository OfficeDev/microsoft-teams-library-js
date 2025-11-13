/**
 * @module
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */

import { callFunctionInHostAndHandleResponse } from '../../../internal/communication';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { SimpleTypeResponseHandler } from '../../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../../internal/telemetry';
import { errorNotSupportedOnPlatform } from '../../../public/constants';
import { runtime } from '../../../public/runtime';
import * as joinedTeams from './joinedTeams';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const teamsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @hidden
 * Allows an app to get the configuration setting value
 *
 * @param key - The key for the config setting
 * @returns Promise that resolves with the value for the provided configuration setting or rejects with an error when the operation has completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export async function getConfigSetting(key: string): Promise<string> {
  ensureInitialized(runtime);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  return callFunctionInHostAndHandleResponse(
    'getConfigSetting',
    [key],
    new SimpleTypeResponseHandler(),
    getApiVersionTag(teamsTelemetryVersionNumber, ApiName.Teams_FullTrust_GetConfigSetting),
  );
}

/**
 * @hidden
 *
 * Checks if teams.fullTrust capability is supported by the host
 * @returns boolean to represent whether the teams.fullTrust capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.teams
    ? runtime.supports.teams.fullTrust
      ? true
      : false
    : false;
}

export { joinedTeams };
