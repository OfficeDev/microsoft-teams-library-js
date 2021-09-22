import { people } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { noHubSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const PeopleAPIs = (): ReactElement => {
  const [selectPeopleRes, setSelectPeopleRes] = React.useState('');

  const selectPeople = (peoplePickerInputsStr: string): void => {
    setSelectPeopleRes('people.selectPeople' + noHubSdkMsg);
    (peoplePickerInputsStr ? people.selectPeople(JSON.parse(peoplePickerInputsStr)) : people.selectPeople())
      .then(people => setSelectPeopleRes(JSON.stringify(people)))
      .catch(error => setSelectPeopleRes('Error code: ' + error));
  };

  return (
    <>
      <h1>people</h1>
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
