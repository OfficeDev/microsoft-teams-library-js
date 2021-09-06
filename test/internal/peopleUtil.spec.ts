import { validateOpenCardRequest, validatePeoplePickerInput } from '../../src/internal/peopleUtil';
import { people } from '../../src/public/people';

describe('peopleUtil', () => {
  /**
   * Validate People Picker selectPeople Input
   */
  it('test selectPeople success with null param', () => {
    const result = validatePeoplePickerInput(null);
    expect(result).toBeTruthy();
  });

  it('test selectPeople success with undefined param', () => {
    const result = validatePeoplePickerInput(undefined);
    expect(result).toBeTruthy();
  });

  it('test success case for selectPeople with valid input params', () => {
    const peoplePickerInputs: people.PeoplePickerInputs = {
      title: 'Hello World',
      setSelected: ['12345678'],
      openOrgWideSearchInChatOrChannel: true,
      singleSelect: true,
    };
    const result = validatePeoplePickerInput(peoplePickerInputs);
    expect(result).toBeTruthy();
  });

  describe('validateOpenCardRequest', () => {
    const validInput: people.OpenCardRequest = {
      targetBoundingRect: { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 },
      parameters: {
        personaInfo: { identifiers: { PersonaType: 'User', Smtp: 'test@microsoft.com' } },
        openCardTriggerType: 'MouseHover',
      },
    };

    it('should return false for empty input', () => {
      expect(validateOpenCardRequest(null)).toBeFalsy();
    });

    it('should return false if targetBoundingRect property is missing', () => {
      const missingTargetBoundingRect = { ...validInput.parameters } as any;
      expect(validateOpenCardRequest(missingTargetBoundingRect)).toBeFalsy();
    });

    it('should return false if parameters property is missing', () => {
      const missingParameters = { ...validInput.targetBoundingRect } as any;
      expect(validateOpenCardRequest(missingParameters)).toBeFalsy();
    });

    it('should return false if openCardTriggerType property is missing', () => {
      const missingOpenCardTriggerType = {
        ...validInput.targetBoundingRect,
        parameters: { ...validInput.parameters, openCardTriggerType: undefined },
      } as any;

      expect(validateOpenCardRequest(missingOpenCardTriggerType)).toBeFalsy();
    });

    it('should return false if PersonaType identifier is missing', () => {
      const missingPersonaType = {
        ...validInput,
        parameters: {
          ...validInput.parameters,
          personaInfo: {
            ...validInput.parameters.personaInfo,
            identifiers: { ...validInput.parameters.personaInfo.identifiers, PersonaType: undefined },
          },
        },
      } as any;

      expect(validateOpenCardRequest(missingPersonaType)).toBeFalsy();
    });

    it('should return false if no identifiers are provided', () => {
      const missingIdentifier = {
        ...validInput,
        parameters: {
          ...validInput.parameters,
          personaInfo: {
            ...validInput.parameters.personaInfo,
            identifiers: { PersonaType: 'User' },
          },
        },
      } as any;

      expect(validateOpenCardRequest(missingIdentifier)).toBeFalsy();
    });

    it('should return false if behavior is invalid', () => {
      const missingIdentifier = {
        ...validInput,
        parameters: { ...validInput.parameters, behavior: 'invalid' },
      } as any;

      expect(validateOpenCardRequest(missingIdentifier)).toBeFalsy();
    });

    it('should return true for a valid input', () => {
      expect(validateOpenCardRequest(validInput)).toBeTruthy();
    });
  });
});
