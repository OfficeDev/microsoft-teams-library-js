import {
  app,
  Context,
  core,
  DeepLinkParameters,
  executeDeepLink,
  getContext,
  shareDeepLink,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const GetContext = (): ReactElement =>
  ApiWithoutInput({
    name: 'getContextV2',
    title: 'Get Context',
    onClick: {
      withPromise: async () => {
        const context = await app.getContext();
        return JSON.stringify(context);
      },
      withCallback: setResult => {
        const callback = (context: Context): void => {
          setResult(JSON.stringify(context));
        };
        getContext(callback);
        return 'getContext()' + noHostSdkMsg;
      },
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
      submit: {
        withPromise: async input => {
          await core.executeDeepLink(input);
          return 'Completed';
        },
        withCallback: input => {
          executeDeepLink(input);
          return 'Completed';
        },
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
      submit: {
        withPromise: async input => {
          await core.shareDeepLink(input);
          return 'called shareDeepLink';
        },
        withCallback: input => {
          shareDeepLink(input);
          return 'called shareDeepLink';
        },
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
