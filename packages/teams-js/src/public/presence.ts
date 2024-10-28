import { callFunctionInHostAndHandleResponse } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ResponseHandler } from '../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';
import { ISerializable } from './serializable.interface';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const presenceTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Represents a user's presence status
 */
export enum PresenceStatus {
  /**
   * User is available and can be contacted
   */
  Available = 'Available',

  /**
   * User is busy and should not be disturbed
   */
  Busy = 'Busy',

  /**
   * User has explicitly set their status to "Do Not Disturb" and should not be contacted
   */
  DoNotDisturb = 'DoNotDisturb',

  /**
   * User is temporarily away from their device
   */
  Away = 'Away',

  /**
   * User is offline and cannot be contacted
   */
  Offline = 'Offline',
}

/**
 * Represents a user's presence information
 */
export interface UserPresence {
  /**
   * User's current presence status
   */
  status: PresenceStatus;

  /**
   * Optional custom status message
   * @since 2.0.0
   */
  customMessage?: string;
}

/**
 * Parameters for getting a user's presence
 */
export interface GetPresenceParams {
  /**
   * The user's UPN (email) to get presence for
   */
  upn: string;
}

/**
 * Parameters for setting presence
 */
export interface SetPresenceParams {
  /**
   * New presence status to set
   */
  status: PresenceStatus;

  /**
   * Optional custom status message
   * @since 2.0.0
   */
  customMessage?: string;
}

/**
 * Response handler for presence information
 */
class UserPresenceResponseHandler extends ResponseHandler<UserPresence, UserPresence> {
  public validate(response: UserPresence): boolean {
    return response !== undefined && Object.values(PresenceStatus).includes(response.status);
  }

  public deserialize(response: UserPresence): UserPresence {
    return response;
  }
}

/**
 * Response handler for void responses
 */
class VoidResponseHandler extends ResponseHandler<void, void> {
  public validate(response: void): boolean {
    return response === undefined;
  }

  public deserialize(response: void): void {
    return response;
  }
}

/**
 * Serializable wrapper for GetPresenceParams
 */
class SerializableGetPresenceParams implements ISerializable {
  public constructor(private params: GetPresenceParams) {}

  public serialize(): object {
    return this.params;
  }
}

/**
 * Serializable wrapper for SetPresenceParams
 */
class SerializableSetPresenceParams implements ISerializable {
  public constructor(private params: SetPresenceParams) {}

  public serialize(): object {
    return this.params;
  }
}

/**
 * Gets a user's current presence status
 * @param params Parameters for getting presence
 * @returns Promise resolving with the user's presence
 *
 * @throws Error if:
 * - The presence capability is not supported
 * - The library has not been initialized
 * - The UPN parameter is invalid
 */
export function getPresence(params: GetPresenceParams): Promise<UserPresence> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  validateUpn(params.upn);

  return callFunctionInHostAndHandleResponse(
    'presence.getPresence',
    [new SerializableGetPresenceParams(params)],
    new UserPresenceResponseHandler(),
    getApiVersionTag(presenceTelemetryVersionNumber, ApiName.Presence_GetPresence),
  );
}

/**
 * Sets the current user's presence status
 * @param params Parameters for setting presence
 * @returns Promise that resolves when operation completes
 *
 * @throws Error if:
 * - The presence capability is not supported
 * - The library has not been initialized
 * - The status parameter is invalid
 */
export function setPresence(params: SetPresenceParams): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  validateStatus(params.status);

  return callFunctionInHostAndHandleResponse(
    'presence.setPresence',
    [new SerializableSetPresenceParams(params)],
    new VoidResponseHandler(),
    getApiVersionTag(presenceTelemetryVersionNumber, ApiName.Presence_SetPresence),
  );
}

/**
 * Checks if presence capability is supported by the host
 * @returns boolean indicating if presence is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  const isInit = ensureInitialized(runtime);
  const hasSupport = ensureInitialized(runtime) && runtime.supports.presence ? true : false;
  console.log('Presence support check:', {
    isInitialized: isInit,
    runtimeSupports: runtime.supports,
    hasPresenceSupport: hasSupport,
  });
  return isInit && hasSupport;
}

/**
 * Validates that the UPN parameter is defined and not empty
 * @param upn The UPN to validate
 * @throws Error if UPN is invalid
 */
function validateUpn(upn: string): void {
  if (!upn || upn.length === 0) {
    throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: UPN cannot be null or empty`);
  }
}

/**
 * Validates that the status parameter is a valid PresenceStatus value
 * @param status The status to validate
 * @throws Error if status is invalid
 */
function validateStatus(status: PresenceStatus): void {
  if (!Object.values(PresenceStatus).includes(status)) {
    throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: Invalid presence status`);
  }
}
