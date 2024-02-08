import {
  app,
  Context,
  executeDeepLink,
  getContext,
  registerOnThemeChangeHandler,
  ResumeContext,
} from '@microsoft/teams-js';
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
    defaultInput: '"https://teams.microsoft.com/l/call/0/0?users=testUser1,testUser2&withVideo=true&source=test"',
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

const RegisterOnResumeHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'RegisterOnResumeHandler',
    title: 'Register On Resume Handler',
    onClick: async (setResult) => {
      app.lifecycle.registerOnResumeHandler((context: ResumeContext): void => {
        setResult('successfully called with context:' + JSON.stringify(context));
        app.notifySuccess();
      });

      return 'registered';
    },
  });

const RegisterBeforeSuspendOrTerminateHandler = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'RegisterBeforeSuspendOrTerminateHandler',
    title: 'Register Before Suspend/Terminate Handler',
    onClick: async (setResult) => {
      app.lifecycle.registerBeforeSuspendOrTerminateHandler((): void => {
        setResult('beforeSuspendOrTerminate received');
      });

      return 'registered';
    },
  });

const AppAPIs = (): ReactElement => (
  <ModuleWrapper title="App">
    <GetContext />
    <OpenLink />
    <RegisterOnThemeChangeHandler />
    <RegisterBeforeSuspendOrTerminateHandler />
    <RegisterOnResumeHandler />
  </ModuleWrapper>
);

export default AppAPIs;
