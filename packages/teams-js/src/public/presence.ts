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

  /**
   * User is out of office
   */
  OutOfOffice = 'OutOfOffice',
}

/**
 * Out of office details for a user
 */
export interface OutOfOfficeDetails {
  /**
   * Start time of OOF period (ISO string)
   */
  startTime: string;

  /**
   * End time of OOF period (ISO string)
   */
  endTime: string;

  /**
   * OOF message to display
   */
  message: string;
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
   */
  customMessage?: string;

  /**
   * Optional out of office details
   * Only present when status is OutOfOffice
   */
  outOfOfficeDetails?: OutOfOfficeDetails;
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
   */
  customMessage?: string;

  /**
   * Optional out of office details
   * Only valid when status is OutOfOffice
   */
  outOfOfficeDetails?: OutOfOfficeDetails;
}

/**
 * Response handler for presence information
 */
class UserPresenceResponseHandler extends ResponseHandler<UserPresence, UserPresence> {
  public validate(response: UserPresence): boolean {
    if (response === undefined || !Object.values(PresenceStatus).includes(response.status)) {
      return false;
    }

    // Validate OOF details if present
    if (response.outOfOfficeDetails) {
      if (response.status !== PresenceStatus.OutOfOffice) {
        return false; // OOF details only valid with OOF status
      }

      const { startTime, endTime, message } = response.outOfOfficeDetails;
      if (!startTime || !endTime || !message || typeof message !== 'string') {
        return false;
      }

      // Validate date strings
      try {
        new Date(startTime).toISOString();
        new Date(endTime).toISOString();
      } catch {
        return false;
      }
    }

    return true;
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
 * - The custom message parameter is invalid
 * - The out of office details are invalid
 */
export function setPresence(params: SetPresenceParams): Promise<void> {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  validateStatus(params.status);
  validateCustomMessage(params.customMessage);
  validateOutOfOfficeDetails(params.status, params.outOfOfficeDetails);

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
  if (!upn || upn.trim().length === 0) {
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

/**
 * Validates that the custom message parameter is a string if provided
 * @param customMessage The custom message to validate
 * @throws Error if custom message is provided but not a string
 */
function validateCustomMessage(customMessage: unknown): void {
  if (customMessage !== undefined && typeof customMessage !== 'string') {
    throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: Custom message must be a string`);
  }
}

/**
 * Validates out of office details if provided
 * @param status Current presence status
 * @param details Out of office details to validate
 * @throws Error if details are invalid
 */
function validateOutOfOfficeDetails(status: PresenceStatus, details?: OutOfOfficeDetails): void {
  if (!details) {
    if (status === PresenceStatus.OutOfOffice) {
      throw new Error(
        `Error code: ${ErrorCode.INVALID_ARGUMENTS}, ` +
          'message: Out of office details required when status is OutOfOffice',
      );
    }
    return;
  }

  if (status !== PresenceStatus.OutOfOffice) {
    throw new Error(
      `Error code: ${ErrorCode.INVALID_ARGUMENTS}, ` +
        'message: Out of office details only valid when status is OutOfOffice',
    );
  }

  const { startTime, endTime, message } = details;

  if (!startTime || !endTime || !message) {
    throw new Error(
      `Error code: ${ErrorCode.INVALID_ARGUMENTS}, ` +
        'message: Out of office details must include startTime, endTime, and message',
    );
  }

  if (typeof message !== 'string') {
    throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: Out of office message must be a string`);
  }

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) {
      throw new Error(
        `Error code: ${ErrorCode.INVALID_ARGUMENTS}, ` + 'message: Out of office end time must be after start time',
      );
    }
  } catch {
    throw new Error(`Error code: ${ErrorCode.INVALID_ARGUMENTS}, message: Invalid date format for out of office times`);
  }
}
