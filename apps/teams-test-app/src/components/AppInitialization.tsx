import { app } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const NotifyLoaded = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appInitializationAppLoaded',
    title: 'appInitialization.appLoaded',
    onClick: async () => {
      app.notifyAppLoaded();
      return 'called';
    },
  });

const NotifySuccess = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appInitializationSuccess',
    title: 'appInitialization.success',
    onClick: async () => {
      app.notifySuccess();
      return 'called';
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
      submit: async input => {
        app.notifyFailure({ reason: input || app.FailedReason.Other });
        return 'called';
      },
    },
  });

const NotifyExpectedFailure = (): React.ReactElement =>
  ApiWithTextInput<app.ExpectedFailureReason>({
    name: 'appInitializationExpectedFailure',
    title: 'appInitialization.expectedFailure',
    onClick: {
      validateInput: input => {
        if (!input) {
          // this API actually allow for the input not to be provided
          return;
        }
        const acceptableValues = Object.values(app.ExpectedFailureReason);
        if (!acceptableValues.includes(input)) {
          throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
        }
      },
      submit: async input => {
        app.notifyExpectedFailure({ reason: input || app.ExpectedFailureReason.Other });
        return 'called';
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
