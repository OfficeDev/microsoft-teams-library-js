import { logs } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateRegistrationMsg } from '../App';
import { ApiWithoutInput } from './utils';

const RegisterGetLogHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'registerGetLogHandler',
    title: 'Register Get Log Handler',
    onClick: async setResult => {
      logs.registerGetLogHandler(() => {
        setResult('Success');
        return 'App log string';
      });
      return generateRegistrationMsg('it is invoked to get the app log');
    },
  });

const LogsAPIs = (): ReactElement => (
  <>
    <h1>logs</h1>
    <RegisterGetLogHandler />
  </>
);

export default LogsAPIs;
