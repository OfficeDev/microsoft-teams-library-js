import { app, Context, core, DeepLinkParameters, getContext } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { getTestBackCompat } from './utils/getTestBackCompat';

const GetContext = (): ReactElement =>
  ApiWithoutInput({
    name: 'getContextV2',
    title: 'Get Context',
    onClick: async () => {
      if (getTestBackCompat()) {
        let result = '';
        const displayResults = (context: Context): void => {
          result = JSON.stringify(context);
        };
        getContext(displayResults);
        return result;
      }
      const context = await app.getContext();
      return JSON.stringify(context);
    },
  });

const ExecuteDeepLink = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'executeDeepLink2',
    title: 'Execute Deep Link',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: async input => {
        await core.executeDeepLink(input);
        return 'Completed';
      },
    },
  });

const ShareDeepLink = (): ReactElement =>
  ApiWithTextInput<DeepLinkParameters>({
    name: 'core.shareDeepLink',
    title: 'core.shareDeepLink',
    onClick: {
      validateInput: input => {
        if (!input.subEntityId || !input.subEntityLabel) {
          throw new Error('subEntityId and subEntityLabel are required.');
        }
      },
      submit: async input => {
        await core.shareDeepLink(input);
        return 'called shareDeepLink';
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
    <ExecuteDeepLink />
    <ShareDeepLink />
    <RegisterOnThemeChangeHandler />
  </>
);

export default AppAPIs;
