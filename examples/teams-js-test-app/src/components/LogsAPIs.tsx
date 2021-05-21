import React, { ReactElement } from 'react';
import { logs } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { generateRegistrationMsg } from '../App';

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
