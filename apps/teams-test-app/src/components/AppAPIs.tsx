import { app, core, DeepLinkParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const GetContext = (): ReactElement =>
  ApiWithoutInput({
    title: 'Get Context',
    name: 'getContextV2',
    onClick: async () => {
      const context = await app.getContext();
      return JSON.stringify(context);
    },
  });

const ExecuteDeepLink = (): ReactElement =>
  ApiWithTextInput<string>({
    title: 'Execute Deep Link',
    name: 'executeDeepLink',
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
    title: 'core.shareDeepLink',
    name: 'core.shareDeepLink',
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
