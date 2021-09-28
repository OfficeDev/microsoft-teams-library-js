import { logs } from '@microsoft/teamsjs-app-sdk';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const LogsAPIs = (): ReactElement => {
  const [registerGetLogHandlerRes, setRegisterGetLogHandlerRes] = React.useState('');

  const registerGetLogHandler = (): void => {
    setRegisterGetLogHandlerRes(generateRegistrationMsg('it is invoked to get the app log'));
    const log = 'App log string';
    const handler = (): string => {
      setRegisterGetLogHandlerRes('Success');
      return log;
    };
    logs.registerGetLogHandler(handler);
  };

  return (
    <>
      <h1>logs</h1>
      <BoxAndButton
        handleClick={registerGetLogHandler}
        output={registerGetLogHandlerRes}
        hasInput={false}
        title="Register Get Log Handler"
        name="registerGetLogHandler"
      />
    </>
  );
};

export default LogsAPIs;
