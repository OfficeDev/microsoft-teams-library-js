export function validateEmailAddress(emailString: string | null | undefined): void {
  const emailIsEmptyOrUndefined = emailString ? emailString.length <= 0 : true;
  const atIndex = emailString?.indexOf('@');
  const periodIndexAfterAt = emailString?.indexOf('.', atIndex);

  if (emailIsEmptyOrUndefined || atIndex === -1 || periodIndexAfterAt === -1) {
    throw new Error('Input email address does not have the correct format.');
  }
}
