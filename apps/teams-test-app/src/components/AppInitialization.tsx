import { app, appInitialization } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const NotifyLoaded = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appInitializationAppLoaded',
    title: 'appInitialization.appLoaded',
    onClick: {
      withPromise: async () => {
        app.notifyAppLoaded();
        return 'called';
      },
      withCallback: setResult => {
        appInitialization.notifyAppLoaded();
        setResult('called');
      },
    },
  });

const NotifySuccess = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appInitializationSuccess',
    title: 'appInitialization.success',
    onClick: {
      withPromise: async () => {
        app.notifySuccess();
        return 'called';
      },
      withCallback: setResult => {
        appInitialization.notifySuccess();
        setResult('called');
      },
    },
  });

const NotifyFailure = (): React.ReactElement =>
  ApiWithTextInput<app.FailedReason>({
    name: 'appInitializationFailure2',
    title: 'appInitialization.failure',
    onClick: {
      validateInput: input => {
        if (!input) {
          // this API actually allow for the input not to be provided
          return;
        }
        const acceptableValues = Object.values(app.FailedReason);
        if (!acceptableValues.includes(input)) {
          throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
        }
      },
      submit: {
        withPromise: async input => {
          app.notifyFailure({ reason: input || app.FailedReason.Other });
          return 'called';
        },
        withCallback: (input, setResult) => {
          appInitialization.notifyFailure({ reason: input || app.FailedReason.Other });
          setResult('called');
        },
      },
    },
  });

const NotifyExpectedFailure = (): React.ReactElement =>
  ApiWithTextInput<app.IExpectedFailureRequest>({
    name: 'appInitializationExpectedFailure',
    title: 'appInitialization.expectedFailure',
    onClick: {
      validateInput: input => {
        if (!input.reason) {
          input.reason = app.ExpectedFailureReason.Other;
        }
      },
      submit: {
        withPromise: async input => {
          app.notifyExpectedFailure(input);
          return 'called';
        },
        withCallback: (input, setResult) => {
          appInitialization.notifyExpectedFailure(input);
          setResult('called');
        },
      },
    },
  });

const AppInitializationAPIs = (): ReactElement => (
  <>
    <h1>appInitialization</h1>
    <NotifyLoaded />
    <NotifySuccess />
    <NotifyFailure />
    <NotifyExpectedFailure />
  </>
);

export default AppInitializationAPIs;
