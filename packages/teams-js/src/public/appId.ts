import { validateStringAsAppId } from '../internal/appIdValidation';
import { ISerializable } from './serializable.interface';

/**
 * A strongly-typed class used to represent a "valid" app id.
 *
 * Valid is a relative term, in this case. Truly valid app ids are UUIDs as documented in the schema:
 * https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema#id
 * However, there are some older internal/hard-coded apps which violate this schema and use names like
 * com.microsoft.teamspace.tab.youtube. For compatibility with these legacy apps, we unfortunately cannot
 * securely and completely validate app ids as UUIDs. Based on this, the validation is limited to checking
 * for script tags, length, and non-printable characters. Validation will be updated in the future to ensure
 * the app id is a valid UUID as legacy apps update.
 */
export class AppId implements ISerializable {
  /**
   * Creates a strongly-typed AppId from a string
   *
   * @param appIdAsString An app id represented as a string
   * @throws Error with a message describing the exact validation violation
   */
  public constructor(private readonly appIdAsString: string) {
    validateStringAsAppId(appIdAsString);
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
    return this.appIdAsString;
  }
}
