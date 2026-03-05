import {
  app,
  Context,
  executeDeepLink,
  getContext,
  HostToAppPerformanceMetrics,
  registerOnThemeChangeHandler,
  ResumeContext,
} from '@microsoft/teams-js';
import React, { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { urlParams } from '../App';
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

const RegisterHostToAppPerformanceMetricsHandler = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerHostToAppPerformanceMetricsHandler',
    title: 'Register Host to App performance metrics handler',
    onClick: async (setResult) => {
      const handler = (v: HostToAppPerformanceMetrics): void => {
        console.log(v);
        setResult(JSON.stringify(v));
      };
      app.registerHostToAppPerformanceMetricsHandler(handler);
      return 'Registered callback!';
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

const RegisterOnPromptHandler = (): ReactElement =>
  ApiWithoutInput({
    name: 'registerOnPromptHandler',
    title: 'Register On Prompt Change Handler',
    onClick: {
      withPromise: async (setResult) => {
        app.registerOnPromptHandler(setResult);
        return '';
      },
      withCallback: (setResult) => {
        alert('This API is not expected to be called in this test app.');
        // registerOnPromptHandler(setResult);
        setResult('');
      },
    },
  });

const RegisterOnContextChangeHandler = (): React.ReactElement => {
  return ApiWithoutInput({
    name: 'RegisterOnContextChangeHandler',
    title: 'Register OnContextChange Handler',
    onClick: async (setResult) => {
      app.registerOnContextChangeHandler((context: app.Context): void => {
        setResult('successfully called with context:' + JSON.stringify(context));
      });
      return 'registered';
    },
  });
};

const RegisterOnResumeHandler = (): React.ReactElement => {
  const navigate = useNavigate();
  return ApiWithoutInput({
    name: 'RegisterOnResumeHandler',
    title: 'Register On Resume Handler',
    onClick: async (setResult) => {
      app.lifecycle.registerOnResumeHandler((context: ResumeContext): void => {
        setResult('successfully called with context:' + JSON.stringify(context));
        // get the route from the context
        const route = context.contentUrl;
        // navigate to the correct path based on URL
        navigate(route.pathname);
        if (!urlParams.has('customInit') || !urlParams.get('customInit')) {
          app.notifySuccess();
        }
      });

      return 'registered';
    },
  });
};

const RegisterBeforeSuspendOrTerminateHandler = (): React.ReactElement =>
  ApiWithTextInput<number>({
    name: 'RegisterBeforeSuspendOrTerminateHandler',
    title: 'Register Before Suspend/Terminate Handler',
    onClick: {
      validateInput: (input) => {
        if (typeof input !== 'number') {
          throw new Error('input should be a number');
        }
      },
      submit: async (delay: number, setResult: (result: string) => void) => {
        app.lifecycle.registerBeforeSuspendOrTerminateHandler(() => {
          return new Promise<void>((resolve) => {
            setTimeout(() => {
              setResult('beforeSuspendOrTerminate received');
              resolve();
            }, delay);
          });
        });
        return 'registered';
      },
    },
    defaultInput: '3000',
  });
const AppAPIs = (): ReactElement => (
  <ModuleWrapper title="App">
    <GetContext />
    <OpenLink />
    <RegisterHostToAppPerformanceMetricsHandler />
    <RegisterOnThemeChangeHandler />
    <RegisterOnPromptHandler />
    <RegisterBeforeSuspendOrTerminateHandler />
    <RegisterOnResumeHandler />
    <RegisterOnContextChangeHandler />
  </ModuleWrapper>
);

export default AppAPIs;
