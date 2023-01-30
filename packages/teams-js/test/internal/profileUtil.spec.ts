import { validateShowProfileRequest } from '../../src/internal/profileUtil';
import { profile } from '../../src/public/profile';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('validateShowProfileRequest', () => {
  const validInput: profile.ShowProfileRequest = {
    persona: { identifiers: { Smtp: 'test@microsoft.com' }, displayName: 'test' },
    targetElementBoundingRect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect,
    triggerType: 'MouseHover',
  };

  it('should return false for empty input', () => {
    const [isValid, message] = validateShowProfileRequest(null);
    expect(isValid).toBeFalsy();
    expect(message).toBe('A request object is required');
  });

  it('should return false if modality is not a string', () => {
    const invalidModality = { ...validInput, modality: 1 as unknown } as profile.ShowProfileRequest;
    const [isValid, message] = validateShowProfileRequest(invalidModality);
    expect(isValid).toBeFalsy();
    expect(message).toBe('modality must be a string');
  });

  it('should return false if persona property is missing', () => {
    const missingPersona = { ...validInput, persona: undefined } as profile.ShowProfileRequest;
    const [isValid, message] = validateShowProfileRequest(missingPersona);
    expect(isValid).toBeFalsy();
    expect(message).toBe('persona object must be provided');
  });

  it('should return false if persona display name is not a string', () => {
    const invalidDisplayName = {
      ...validInput,
      persona: { ...validInput.persona, displayName: 1 as unknown },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidDisplayName);
    expect(isValid).toBeFalsy();
    expect(message).toBe('displayName must be a string');
  });

  it('should return false if persona identifiers property is missing', () => {
    const missingIdentifiers = {
      ...validInput,
      persona: { ...validInput.persona, identifiers: undefined },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(missingIdentifiers);
    expect(isValid).toBeFalsy();
    expect(message).toBe('persona identifiers object must be provided');
  });

  it('should return false if persona identifiers property is not an object', () => {
    const invalidIdentifiers = {
      ...validInput,
      persona: { ...validInput.persona, identifiers: 1 as unknown },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidIdentifiers);
    expect(isValid).toBeFalsy();
    expect(message).toBe('persona identifiers object must be provided');
  });

  it('should return false if targetBoundingRect property is missing', () => {
    const missingTargetBoundingRect = {
      ...validInput,
      targetElementBoundingRect: undefined,
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(missingTargetBoundingRect);
    expect(isValid).toBeFalsy();
    expect(message).toBe('targetElementBoundingRect must be a DOMRect');
  });

  it('should return false if targetBoundingRect property is not an object', () => {
    const invalidTargetBoundingRect = {
      ...validInput,
      targetElementBoundingRect: 1 as unknown,
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidTargetBoundingRect);
    expect(isValid).toBeFalsy();
    expect(message).toBe('targetElementBoundingRect must be a DOMRect');
  });

  it('should return false if triggerType property is missing', () => {
    const missingTriggerType = { ...validInput, triggerType: undefined } as profile.ShowProfileRequest;
    const [isValid, message] = validateShowProfileRequest(missingTriggerType);
    expect(isValid).toBeFalsy();
    expect(message).toBe('triggerType must be a valid string');
  });

  it('should return false if triggerType property is not a string', () => {
    const invalidTriggerType = { ...validInput, triggerType: 1 as unknown } as profile.ShowProfileRequest;
    const [isValid, message] = validateShowProfileRequest(invalidTriggerType);
    expect(isValid).toBeFalsy();
    expect(message).toBe('triggerType must be a valid string');
  });

  it('should return false if no identifiers were passed', () => {
    const noIdentifiers = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: {},
      },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(noIdentifiers);
    expect(isValid).toBeFalsy();
    expect(message).toBe('at least one valid identifier must be provided');
  });

  it('should return false if any identifiers are invalid', () => {
    const invalidAadObjectId = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { AadObjectId: 1 as unknown },
      },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidAadObjectId);
    expect(isValid).toBeFalsy();
    expect(message).toBe('AadObjectId identifier must be a string');
  });

  it('should return false if any identifiers are invalid', () => {
    const invalidSmtp = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { Smtp: 1 as unknown },
      },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidSmtp);
    expect(isValid).toBeFalsy();
    expect(message).toBe('Smtp identifier must be a string');
  });

  it('should return false if any identifiers are invalid', () => {
    const invalidUpn = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { Upn: 1 as unknown },
      },
    } as profile.ShowProfileRequest;

    const [isValid, message] = validateShowProfileRequest(invalidUpn);
    expect(isValid).toBeFalsy();
    expect(message).toBe('Upn identifier must be a string');
  });

  it('should return true for a valid input', () => {
    const [isValid, message] = validateShowProfileRequest(validInput);
    expect(isValid).toBeTruthy();
    expect(message).toBeUndefined();
  });
});
