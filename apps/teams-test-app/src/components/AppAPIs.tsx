import { app } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const GetContext = (): ReactElement =>
  ApiWithoutInput({
    name: 'getContextV2',
    title: 'Get Context',
    onClick: async () => {
      const context = await app.getContext();
      return JSON.stringify(context);
    },
  });

const OpenLink = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'executeDeepLink2',
    title: 'Open Link',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async input => {
        await app.openLink(input);
        return 'Completed';
      },
    },
  });

const RegisterOnThemeChangeHandler = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerOnThemeChangeHandler',
    title: 'Register On Theme Change Handler',
    onClick: async setResult => {
      app.registerOnThemeChangeHandler(setResult);
      return '';
    },
  });

const AppAPIs = (): ReactElement => (
  <>
    <h1>app</h1>
    <GetContext />
    <OpenLink />
    <RegisterOnThemeChangeHandler />
  </>
);

export default AppAPIs;
