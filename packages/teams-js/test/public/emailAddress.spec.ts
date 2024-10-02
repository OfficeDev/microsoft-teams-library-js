import { EmailAddress } from '../../src/public';

describe('emailAddress', () => {
  const invalidEmails = ['domain.com', 'name.domain@com', 'name@domain'];
  invalidEmails.forEach((invalidEmail) => {
    it('should throw errors for invalid email addresses', () => {
      expect(() => new EmailAddress(invalidEmail)).toThrowError(
        'Input email address does not have the correct format.',
      );
    });
  });
  const validEmails = [
    'email@domain.com',
    'firstname+lastname@domain.com',
    '123@domain.com',
    'name@domain.subdomain.com',
  ];
  validEmails.forEach((validEmail) => {
    it('should not throw errors for valid email addresses', () => {
      const email = new EmailAddress(validEmail);
      expect(email.toString()).toBe(validEmail);
    });
  });
});
