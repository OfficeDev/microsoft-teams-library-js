import { generateGUID, validateUuid } from '../internal/utils';
import { ISerializable } from './serializable.interface';

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Represents a UUID (Universally Unique Identifier) object.
 * This class provides a way to generate, validate, and represent UUIDs as strings.
 */
export class UUID implements ISerializable {
  /**
   * Creates an instance of the UUID class.
   * If no UUID string is provided, a new UUID is generated.
   *
   * @param {string} [uuid=generateGUID()] - The UUID string. Defaults to a newly generated UUID.
   * @throws {Error} - Throws an error if the provided UUID is invalid.
   */
  public constructor(private readonly uuid: string = generateGUID()) {
    validateUuid(uuid);
  }

  /**
   * Returns the UUID as a string.
   *
   * @returns {string} - The UUID string.
   */
  public toString(): string {
    return this.uuid;
  }

  /**
   * @returns A serializable representation of an uuid, used for passing uuids to the host.
   */
  public serialize(): object | string {
    return this.toString();
  }
}

/**
 * @hidden
 * Checks if the incoming id is an instance of ValidatedSafeString
 * @param id An object to check if it's an instance of ValidatedSafeString
 * @throws Error with a message describing the violation
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateUuidInstance(id: UUID): void {
  if (!(id instanceof UUID)) {
    throw new Error(`Potential id (${JSON.stringify(id)}) is invalid; it is not an instance of UUID class.`);
  }
}
