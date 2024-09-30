import { validateEmailAddress } from '../internal/emailAddressValidation';

/**
 * Represents a validated email.
 *
 * @hidden
 * Hide from docs.
 */
export class EmailAddress {
  public constructor(private readonly val: string) {
    validateEmailAddress(val);
  }

  public toString(): string {
    return this.val;
  }
}
