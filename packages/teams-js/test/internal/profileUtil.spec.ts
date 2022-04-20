import { validateShowProfileRequest } from '../../src/internal/profileUtil';
import { profile } from '../../src/public/profile';

describe('validateShowProfileRequest', () => {
  const validInput: profile.ShowProfileRequest = {
    persona: { identifiers: { PersonaType: 'User', Smtp: 'test@microsoft.com' }, displayName: 'test' },
    targetElementBoundingRect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 } as DOMRect,
    triggerType: 'MouseHover',
  };

  it('should return false for empty input', () => {
    expect(validateShowProfileRequest(null)).toBeFalsy();
  });

  it('should return false if persona property is missing', () => {
    const missingPersona = { ...validInput, persona: undefined } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(missingPersona)).toBeFalsy();
  });

  it('should return false if persona display name is not a string', () => {
    const invalidDisplayName = {
      ...validInput,
      persona: { ...validInput.persona, displayName: (1 as unknown) as unknown },
    } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(invalidDisplayName)).toBeFalsy();
  });

  it('should return false if persona identifiers property is missing', () => {
    const missingIdentifiers = {
      ...validInput,
      persona: { ...validInput.persona, identifiers: undefined },
    } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(missingIdentifiers)).toBeFalsy();
  });

  it('should return false if persona identifiers property is not an object', () => {
    const invalidIdentifiers = {
      ...validInput,
      persona: { ...validInput.persona, identifiers: (1 as unknown) as unknown },
    } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(invalidIdentifiers)).toBeFalsy();
  });

  it('should return false if targetBoundingRect property is missing', () => {
    const missingTargetBoundingRect = {
      ...validInput,
      targetElementBoundingRect: undefined,
    } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(missingTargetBoundingRect)).toBeFalsy();
  });

  it('should return false if targetBoundingRect property is not an object', () => {
    const invalidTargetBoundingRect = {
      ...validInput,
      targetElementBoundingRect: 1 as unknown,
    } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(invalidTargetBoundingRect)).toBeFalsy();
  });

  it('should return false if triggerType property is missing', () => {
    const missingTriggerType = { ...validInput, triggerType: undefined } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(missingTriggerType)).toBeFalsy();
  });

  it('should return false if triggerType property is not a string', () => {
    const invalidTriggerType = { ...validInput, triggerType: 1 as unknown } as profile.ShowProfileRequest;
    expect(validateShowProfileRequest(invalidTriggerType)).toBeFalsy();
  });

  it('should return false if persona type property is missing', () => {
    const missingPersonaType = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { ...validInput.persona.identifiers, PersonaType: undefined },
      },
    } as profile.ShowProfileRequest;

    expect(validateShowProfileRequest(missingPersonaType)).toBeFalsy();
  });

  it('should return false if persona type property is not a string', () => {
    const invalidPersonaType = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { ...validInput.persona.identifiers, PersonaType: 1 as unknown },
      },
    } as profile.ShowProfileRequest;

    expect(validateShowProfileRequest(invalidPersonaType)).toBeFalsy();
  });

  it('should return false if no identifiers were passed', () => {
    const noIdentifiers = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { PersonaType: validInput.persona.identifiers.PersonaType },
      },
    } as profile.ShowProfileRequest;

    expect(validateShowProfileRequest(noIdentifiers)).toBeFalsy();
  });

  it('should return false if any identifiers are invalid', () => {
    const invalidAadObjectId = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { AadObjectId: 1 as unknown, PersonaType: validInput.persona.identifiers.PersonaType },
      },
    } as profile.ShowProfileRequest;

    const invalidSmtp = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { Smtp: 1 as unknown, PersonaType: validInput.persona.identifiers.PersonaType },
      },
    } as profile.ShowProfileRequest;

    const invalidTeamsMri = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { TeamsMri: 1 as unknown, PersonaType: validInput.persona.identifiers.PersonaType },
      },
    } as profile.ShowProfileRequest;

    const invalidUpn = {
      ...validInput,
      persona: {
        ...validInput.persona,
        identifiers: { Upn: 1 as unknown, PersonaType: validInput.persona.identifiers.PersonaType },
      },
    } as profile.ShowProfileRequest;

    expect(validateShowProfileRequest(invalidAadObjectId)).toBeFalsy();
    expect(validateShowProfileRequest(invalidSmtp)).toBeFalsy();
    expect(validateShowProfileRequest(invalidTeamsMri)).toBeFalsy();
    expect(validateShowProfileRequest(invalidUpn)).toBeFalsy();
  });

  it('should return true for a valid input', () => {
    expect(validateShowProfileRequest(validInput)).toBeTruthy();
  });
});
