import { people } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

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
      const result = input ? await people.selectPeople(input) : people.selectPeople();
      return JSON.stringify(result);
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
