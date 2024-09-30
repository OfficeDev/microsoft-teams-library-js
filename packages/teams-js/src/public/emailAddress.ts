/**
 * Represents a validated email.
 *
 * @hidden
 * Hide from docs.
 */
export class EmailAddress {
  public constructor(private readonly val: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.val)) {
      throw new Error('Input email address does not have the correct format.');
    }
  }

  public toString(): string {
    return this.val;
  }
}
