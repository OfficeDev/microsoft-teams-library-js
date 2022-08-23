import { app, Context, executeDeepLink, getContext, registerOnThemeChangeHandler } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ModuleWrapper } from './utils/ModuleWrapper';

const GetContext = (): ReactElement =>
  ApiWithoutInput({
    name: 'getContextV2',
    title: 'Get Context',
    onClick: {
      withPromise: async () => {
        const context = await app.getContext();
        return JSON.stringify(context);
      },
      withCallback: (setResult) => {
        const callback = (context: Context): void => {
          setResult(JSON.stringify(context));
        };
        getContext(callback);
      },
    },
  });

const OpenLink = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'executeDeepLink2',
    title: 'Open Link',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: {
        withPromise: async (input) => {
          await app.openLink(input);
          return 'Completed';
        },
        withCallback: (input, setResult) => {
          const onComplete = (status: boolean, reason?: string): void => {
            if (!status) {
              if (reason) {
                setResult(JSON.stringify(reason));
              } else {
                setResult("Status is false but there's not reason?! This shouldn't happen.");
              }
            } else {
              setResult('Completed');
            }
          };
          executeDeepLink(input, onComplete);
        },
      },
    },
  });

const RegisterOnThemeChangeHandler = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerOnThemeChangeHandler',
    title: 'Register On Theme Change Handler',
    onClick: {
      withPromise: async (setResult) => {
        app.registerOnThemeChangeHandler(setResult);
        return '';
      },
      withCallback: (setResult) => {
        registerOnThemeChangeHandler(setResult);
        setResult('');
      },
    },
  });

const AppAPIs = (): ReactElement => (
  <ModuleWrapper title="App">
    <GetContext />
    <OpenLink />
    <RegisterOnThemeChangeHandler />
  </ModuleWrapper>
);

export default AppAPIs;
