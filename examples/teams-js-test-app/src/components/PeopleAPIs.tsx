import React, { ReactElement } from 'react';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';
import { people, SdkError } from '@microsoft/teamsjs-app-sdk';

const PeopleAPIs = (): ReactElement => {
  const [selectPeopleRes, setSelectPeopleRes] = React.useState('');

  const selectPeople = (peoplePickerInputsStr: string): void => {
    const callback = (error: SdkError, people: people.PeoplePickerResult[]): void => {
      if (error != null) {
        setSelectPeopleRes(people.toString());
      } else {
        setSelectPeopleRes('Error code: ' + error);
      }
    };
    setSelectPeopleRes('people.selectPeople' + noHubSdkMsg);
    if (peoplePickerInputsStr) {
      people.selectPeople(callback, JSON.parse(peoplePickerInputsStr));
    } else {
      people.selectPeople(callback);
    }
  };

  return (
    <>
      <BoxAndButton
        handleClickWithInput={selectPeople}
        output={selectPeopleRes}
        hasInput={true}
        title="Select People"
        name="selectPeople"
      />
    </>
  );
};

export default PeopleAPIs;
