import { validateSafeContent } from '../internal/idValidation';
import { ISerializable } from './serializable.interface';

/**
 * A strongly typed class used to represent a "valid" string id.
 */
export class ValidatedStringId implements ISerializable {
  /**
   * Creates a strongly-typed Id from a string
   *
   * @param idAsString An id represented as a string
   * @throws Error with a message describing the exact validation violation
   */
  public constructor(private readonly idAsString: string) {
    validateSafeContent(idAsString);
  }

  /**
   * @hidden
   * @internal
   *
   * @returns A serializable representation of an AppId, used for passing AppIds to the host.
   */
  public serialize(): object | string {
    return this.toString();
  }

  /**
   * Returns the app id as a string
   */
  public toString(): string {
    return this.idAsString;
  }
}
