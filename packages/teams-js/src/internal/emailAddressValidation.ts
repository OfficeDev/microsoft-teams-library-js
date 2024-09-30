export function validateEmailAddress(emailString: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailString)) {
    throw new Error('Input email address does not have the correct format.');
  }
}
