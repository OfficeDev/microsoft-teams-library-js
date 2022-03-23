import { people, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithTextInput } from './utils';
import { SupportButton } from './utils/SupportButton/SupportButton';

const CheckPeopleCapability = (): React.ReactElement =>
  SupportButton({
    name: 'checkCapabilityPeople',
    module: 'People',
    isSupported: people.isSupported(),
  });

const SelectPeople = (): React.ReactElement =>
  ApiWithTextInput<people.PeoplePickerInputs | undefined>({
    name: 'selectPeople',
    title: 'Select People',
    onClick: {
      validateInput: input => {
        if (!input) {
          return; //API allows for no input to be provided
        }
        return;
      },
      submit: {
        withPromise: async input => {
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
  <>
    <h1>people</h1>
    <SelectPeople />
    <CheckPeopleCapability />
  </>
);

export default PeopleAPIs;
