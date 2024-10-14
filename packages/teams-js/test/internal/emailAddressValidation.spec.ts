import { validateEmailAddress } from '../../src/internal/emailAddressValidation';

describe('emailAddressValidation', () => {
  const invalidEmails = ['domain.com', 'name.domain@com', 'name@domain', '', null];
  invalidEmails.forEach((invalidEmail) => {
    it('should throw errors for invalid email addresses', () => {
      expect(() => validateEmailAddress(invalidEmail)).toThrow('Input email address does not have the correct format.');
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
      expect(() => validateEmailAddress(validEmail)).not.toThrow(
        'Input email address does not have the correct format.',
      );
    });
  });
});
