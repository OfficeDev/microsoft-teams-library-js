/**
 * @beta
 * Nested app auth capabilities
 * @module
 */
import { callFunctionInHostAndHandleResponse, Communication } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler, SimpleType } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, HostClientType } from './constants';
import { runtime } from './runtime';
import { ISerializable } from './serializable.interface';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const hostEntityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Response handler for managing NAA Trusted Origins.
 */
const trustedOriginResponseHandler: ResponseHandler<string, string> = {
  validate: (response) => Array.isArray(response) || typeof response === 'object',
  deserialize: (response) => response,
};

enum TrustedOriginAction {
  ADD = 'ADD',
  DELETE = 'DELETE',
}

/**
 * Checks if MSAL-NAA channel recommended by the host
 * @returns true if host is recommending NAA channel and false otherwise
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
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
  return (
    ((ensureInitialized(runtime) && runtime.isDeeplyNestedAuthSupported) ||
      isDeeplyNestedAuthSupportedForLegacyTeamsMobile()) ??
    false
  );
}

function isDeeplyNestedAuthSupportedForLegacyTeamsMobile(): boolean {
  return ensureInitialized(runtime) &&
    isHostAndroidOrIOSOrIPadOSOrVisionOS() &&
    runtime.isLegacyTeams &&
    runtime.supports.nestedAppAuth?.deeplyNestedAuth
    ? true
    : false;
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

/**
 * Registers the origins of child apps as trusted for Nested App Auth (NAA).
 *
 * This allows a top-level parent app to specify which child app origins are considered trusted
 *
 * @param appOrigins - An array of child app origins to trust (must be a non-empty array).
 * @returns A Promise resolving with the result of the action.
 * @throws Error if called from a non-top-level parent or if parameters are invalid.
 *
 * @beta
 */
export async function addNAATrustedOrigins(appOrigins: string[]): Promise<string> {
  if (!canParentManageNAATrustedOrigins()) {
    throw errorNotSupportedOnPlatform;
  }
  const normalizedOrigins = appOrigins.map(normalizeOrigin);
  return manageNAATrustedOrigins(TrustedOriginAction.ADD, normalizedOrigins);
}

/**
 * Removes previously trusted child app origins from Nested App Auth (NAA).
 *
 * The specified origins will no longer be considered trusted.
 *
 * @param appOrigins - An array of child app origins to remove from the trusted list (must be a non-empty array).
 * @returns A Promise resolving with the result of the action.
 * @throws Error if called from a non-top-level parent or if parameters are invalid.
 *
 * @beta
 */
export async function deleteNAATrustedOrigins(appOrigins: string[]): Promise<string> {
  if (!canParentManageNAATrustedOrigins()) {
    throw errorNotSupportedOnPlatform;
  }
  const normalizedOrigins = appOrigins.map(normalizeOrigin);
  return manageNAATrustedOrigins(TrustedOriginAction.DELETE, normalizedOrigins);
}

/**
 * Performs the specified action (add or delete) on the list of trusted child app origins for Nested App Auth (NAA).
 *
 * This function is intended to be called by a top-level parent app to manage which child app origins are considered trusted.
 *
 * @param action - The action to perform: 'ADD' or 'DELETE'.
 * @param appOrigins - An array of origins to add or remove (must be a non-empty array).
 * @returns A Promise resolving with the result of the action.
 * @throws Error if called from a non-top-level parent or if parameters are invalid.
 */
async function manageNAATrustedOrigins(action: TrustedOriginAction, appOrigins: string[]): Promise<string> {
  if (window.parent !== window.top) {
    throw new Error('This API is only available in the top-level parent.');
  }

  if (!Array.isArray(appOrigins) || appOrigins.length === 0) {
    throw new Error(`The '${appOrigins}' parameter is required and must be a non-empty array.`);
  }

  const args: (SimpleType | ISerializable)[] = [new SerializableManageNAATrustedOriginArgs(action, appOrigins)];

  return callFunctionInHostAndHandleResponse(
    'nestedAppAuth.manageNAATrustedOrigins',
    args,
    trustedOriginResponseHandler,
    getApiVersionTag(hostEntityTelemetryVersionNumber, ApiName.NestedAppAuth_ManageNAATrustedOrigins),
  );
}

/**
 * Normalizes a given origin string by converting it to lowercase and extracting only the origin part.
 *
 * @param origin - A string representing a full URL.
 * @returns The normalized origin (scheme + host + port) in lowercase.
 * @throws Error if the input is not a valid URL.
 */
function normalizeOrigin(origin: string): string {
  try {
    const url = new URL(origin);
    return url.origin.toLowerCase(); // Normalize and return only the origin part
  } catch (error) {
    throw new Error(`Invalid origin provided: ${origin}`);
  }
}

/**
 * Serializable arguments for manageNAATrustedOrigins.
 */
class SerializableManageNAATrustedOriginArgs implements ISerializable {
  public constructor(
    private readonly action: TrustedOriginAction,
    private readonly appOrigins: string[],
  ) {}

  /**
   * Serializes the object to a JSON-compliant format.
   * @returns JSON representation of the arguments.
   */
  public serialize(): object {
    return {
      action: this.action,
      appOrigins: this.appOrigins, // No need for conditional check, always included
    };
  }
}
