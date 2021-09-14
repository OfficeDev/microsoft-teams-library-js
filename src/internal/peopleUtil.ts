import { people } from '../public/people';

/**
 * Returns true if the people picker params are valid and false otherwise
 */
export function validatePeoplePickerInput(peoplePickerInputs: people.PeoplePickerInputs): boolean {
  if (peoplePickerInputs) {
    if (peoplePickerInputs.title) {
      if (typeof peoplePickerInputs.title !== 'string') {
        return false;
      }
    }

    if (peoplePickerInputs.setSelected) {
      if (typeof peoplePickerInputs.setSelected !== 'object') {
        return false;
      }
    }

    if (peoplePickerInputs.openOrgWideSearchInChatOrChannel) {
      if (typeof peoplePickerInputs.openOrgWideSearchInChatOrChannel !== 'boolean') {
        return false;
      }
    }
    if (peoplePickerInputs.singleSelect) {
      if (typeof peoplePickerInputs.singleSelect !== 'boolean') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Validates the request parameters
 * @param openCardRequest The request parameters
 * @returns true if the parameters are valid, false otherwise
 */
export function validateOpenCardRequest(openCardRequest: people.OpenCardRequest): boolean {
  if (!openCardRequest || !openCardRequest.cardParameters || !openCardRequest.cardParameters.personaInfo) {
    return false;
  }

  if (!validatePersonaIdentifiers(openCardRequest.cardParameters.personaInfo.identifiers)) {
    return false;
  }

  if (
    !openCardRequest.cardParameters.openCardTriggerType ||
    typeof openCardRequest.cardParameters.openCardTriggerType !== 'string'
  ) {
    return false;
  }

  if (!openCardRequest.targetBoundingRect || typeof openCardRequest.targetBoundingRect !== 'object') {
    return false;
  }

  if (openCardRequest.cardParameters.behavior && openCardRequest.cardParameters.behavior !== 'object') {
    return false;
  }

  return true;
}

function validatePersonaIdentifiers(identifiers: people.PersonaIdentifiers): boolean {
  if (!identifiers || typeof identifiers !== 'object') {
    return false;
  }

  if (!identifiers.PersonaType || typeof identifiers.PersonaType !== 'string') {
    return false;
  }

  // Validate at least one identifier was passed.
  if (!identifiers.AadObjectId && !identifiers.Smtp && !identifiers.TeamsMri && !identifiers.Upn) {
    return false;
  }

  return true;
}
