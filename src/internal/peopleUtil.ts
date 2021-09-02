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

export function validateOpenCardRequest(openCardRequest: people.OpenCardRequest): boolean {
  return !!openCardRequest;
}