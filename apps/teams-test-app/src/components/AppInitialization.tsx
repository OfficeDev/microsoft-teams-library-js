import { app, appInitialization } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const NotifyLoaded = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'appInitializationAppLoaded',
    title: 'appInitialization.appLoaded',
    onClick: {
      withPromise: async () => {
        app.notifyAppLoaded();
        return 'called';
      },
      withCallback: (setResult) => {
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
      withCallback: (setResult) => {
        appInitialization.notifySuccess();
        setResult('called');
      },
    },
  });

const NotifyFailure = (): React.ReactElement =>
  ApiWithTextInput<app.FailedReason | appInitialization.FailedReason>({
    name: 'appInitializationFailure2',
    title: 'appInitialization.failure',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          // this API actually allow for the input not to be provided
          return;
        }
        const acceptableValues = isTestBackCompat()
          ? Object.values(appInitialization.FailedReason)
          : Object.values(app.FailedReason);
        if (!acceptableValues.includes(input)) {
          throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
        }
      },
      submit: {
        withPromise: async (input) => {
          app.notifyFailure({ reason: input || app.FailedReason.Other });
          return 'called';
        },
        withCallback: (input, setResult) => {
          appInitialization.notifyFailure({
            reason: input || appInitialization.FailedReason.Other,
          });
          setResult('called');
        },
      },
    },
  });

const NotifyExpectedFailure = (): React.ReactElement =>
  ApiWithTextInput<app.ExpectedFailureReason | appInitialization.ExpectedFailureReason>({
    name: 'appInitializationExpectedFailure',
    title: 'appInitialization.expectedFailure',
    onClick: {
      validateInput: (input) => {
        const acceptableValues = isTestBackCompat()
          ? Object.values(appInitialization.ExpectedFailureReason)
          : Object.values(app.ExpectedFailureReason);
        if (!acceptableValues.includes(input)) {
          throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
        }
      },
      submit: {
        withPromise: async (input) => {
          app.notifyExpectedFailure({ reason: input || app.ExpectedFailureReason.Other });
          return 'called';
        },
        withCallback: (input, setResult) => {
          appInitialization.notifyExpectedFailure({ reason: input || app.ExpectedFailureReason.Other });
          setResult('called');
        },
      },
    },
  });

const AppInitializationAPIs = (): ReactElement => (
  <ModuleWrapper title="AppInitialization">
    <NotifyLoaded />
    <NotifySuccess />
    <NotifyFailure />
    <NotifyExpectedFailure />
  </ModuleWrapper>
);

export default AppInitializationAPIs;
