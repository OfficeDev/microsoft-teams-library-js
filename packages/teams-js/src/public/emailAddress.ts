import { validateEmailAddress } from '../internal/emailAddressValidation';

/**
 * Represents a validated email.
 */
export class EmailAddress {
  /** Represents the input email address string */
  private readonly val: string;

  public constructor(val: string) {
    this.val = val;
    validateEmailAddress(val);
  }

  /**
   * Retrieve the validated email address as a string.
   */
  public toString(): string {
    return this.val;
  }
}
