import { generateGUID, validateUuid } from '../internal/utils';

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Represents a UUID (Universally Unique Identifier) object.
 * This class provides a way to generate, validate, and represent UUIDs as strings.
 */
export class UUID {
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
}

export default UUID;
