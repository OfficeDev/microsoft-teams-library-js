import { people, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

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
    onClick: {
      validateInput: (input) => {
        if (!input) {
          return; //API allows for no input to be provided
        }
        return;
      },
      submit: {
        withPromise: async (input) => {
          const result = input ? await people.selectPeople(input) : people.selectPeople();
          return JSON.stringify(result);
        },
        withCallback: (input, setResult) => {
          const callback = (error: SdkError, people: people.PeoplePickerResult[]): void => {
            if (error) {
              setResult(JSON.stringify(error));
            } else {
              setResult(JSON.stringify(people));
            }
          };
          if (input) {
            people.selectPeople(callback, input);
          } else {
            people.selectPeople(callback);
          }
        },
      },
    },
  });

const PeopleAPIs = (): ReactElement => (
  <ModuleWrapper title="People">
    <SelectPeople />
    <CheckPeopleCapability />
  </ModuleWrapper>
);

export default PeopleAPIs;
