import { people, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { getTestBackCompat } from './utils/getTestBackCompat';

const CheckPeopleCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityPeople',
    title: 'Check People Call',
    onClick: async () => `People module ${people.isSupported() ? 'is' : 'is not'} supported`,
  });

const SelectPeople = (): React.ReactElement =>
  ApiWithTextInput<people.PeoplePickerInputs | undefined>({
    name: 'selectPeople',
    title: 'Select People',
    onClick: async input => {
      if (getTestBackCompat()) {
        let result = '';
        const displayResults = (error: SdkError, people: people.PeoplePickerResult[]): void => {
          if (error) {
            result = 'error';
          }
          result = JSON.stringify(people);
        };
        input ? people.selectPeople(displayResults, input) : people.selectPeople(displayResults);
        return result;
      } else {
        const result = input ? await people.selectPeople(input) : people.selectPeople();
        return JSON.stringify(result);
      }
    },
  });

const PeopleAPIs = (): ReactElement => (
  <>
    <h1>people</h1>
    <SelectPeople />
    <CheckPeopleCapability />
  </>
);

export default PeopleAPIs;
