import { app, appInitialization } from '@microsoft/teams-js';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ButtonForm } from './utils/ButtonForm/ButtonForm';
import { getTestBackCompat } from './utils/getTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper/ModuleWrapper';
import { RadioButtonGroup } from './utils/RadioButtonGroup/RadioButtonGroup';

const OGNotifyLoaded = (): ReactElement =>
  ApiWithoutInput({
    name: 'OGappInitializationAppLoaded',
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

const NotifyLoaded = (): JSX.Element => (
  <ButtonForm
    name="appInitializationAppLoaded"
    label={'Notify App Loaded'}
    onClick={{
      withPromise: async () => {
        app.notifyAppLoaded();
        return 'called';
      },
      withCallback: setResult => {
        appInitialization.notifyAppLoaded();
        setResult('called');
      },
    }}
  />
);

const OGNotifySuccess = (): ReactElement =>
  ApiWithoutInput({
    name: 'OGappInitializationSuccess',
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

const NotifySuccess = (): JSX.Element => (
  <ButtonForm
    name="appInitializationSuccess"
    label="Notify of Success"
    onClick={{
      withPromise: async () => {
        app.notifySuccess();
        return 'called';
      },
      withCallback: setResult => {
        appInitialization.notifySuccess();
        setResult('called');
      },
    }}
  />
);

const OGNotifyFailure = (): ReactElement =>
  ApiWithTextInput<app.FailedReason | appInitialization.FailedReason>({
    name: 'appInitializationFailure',
    title: 'appInitialization.failure',
    onClick: {
      validateInput: input => {
        if (!input) {
          // this API actually allow for the input not to be provided
          return;
        }
        const acceptableValues = getTestBackCompat()
          ? Object.values(appInitialization.FailedReason)
          : Object.values(app.FailedReason);
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
          appInitialization.notifyFailure({
            reason: input || appInitialization.FailedReason.Other,
          });
          setResult('called');
        },
      },
    },
  });

const NotifyFailure = (): JSX.Element => {
  const acceptableValues = getTestBackCompat()
    ? [Object.values(appInitialization.FailedReason)]
    : Object.values(app.FailedReason);

  const radioInputs = Object.values(acceptableValues).concat('Invalid Option');

  return (
    <RadioButtonGroup
      name="appInitializationFailure"
      label="Notify Failure"
      onClick={{
        validateInput: input => {
          if (!input) {
            // this API actually allow for the input not to be provided
            return;
          }

          if (!Object.values(acceptableValues).includes(input)) {
            throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
          }
        },
        submit: {
          withPromise: async (input: app.FailedReason) => {
            app.notifyFailure({ reason: input });
            return 'called';
          },
          withCallback: (input: app.FailedReason, setResult) => {
            appInitialization.notifyFailure({
              reason: input,
            });
            setResult('called');
          },
        },
      }}
      items={radioInputs}
      buttonLabel="initialize failure"
    />
  );
};
const NotifyExpectedFailure = (): JSX.Element => {
  const acceptableValues = getTestBackCompat()
    ? [Object.values(appInitialization.ExpectedFailureReason)]
    : Object.values(app.ExpectedFailureReason);

  const radioInputs = Object.values(acceptableValues).concat('Invalid Option');

  return (
    <RadioButtonGroup
      name="appInitializationExpectedFailure"
      label="Notify Expected Failure"
      onClick={{
        validateInput: input => {
          if (!input) {
            // this API actually allow for the input not to be provided
            return;
          }

          if (!Object.values(acceptableValues).includes(input)) {
            throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
          }
        },
        submit: {
          withPromise: async (input: app.ExpectedFailureReason) => {
            app.notifyExpectedFailure({ reason: input });
            return 'called';
          },
          withCallback: (input: app.ExpectedFailureReason, setResult) => {
            appInitialization.notifyExpectedFailure({
              reason: input,
            });
            setResult('called');
          },
        },
      }}
      items={radioInputs}
      buttonLabel="initialize expected failure"
    />
  );
};

const OGNotifyExpectedFailure = (): ReactElement =>
  ApiWithTextInput<app.ExpectedFailureReason | appInitialization.ExpectedFailureReason>({
    name: 'OGappInitializationExpectedFailure',
    title: 'appInitialization.expectedFailure',
    onClick: {
      validateInput: input => {
        const acceptableValues = getTestBackCompat()
          ? Object.values(appInitialization.ExpectedFailureReason)
          : Object.values(app.ExpectedFailureReason);
        if (!acceptableValues.includes(input)) {
          throw new Error(`input must be one of: ${JSON.stringify(acceptableValues)}`);
        }
      },
      submit: {
        withPromise: async input => {
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

const AppInitializationAPIs = forwardRef(
  (_props, ref: ForwardedRef<HTMLDivElement>): ReactElement => (
    <ModuleWrapper ref={ref} heading="appInitialization">
      <OGNotifyLoaded />
      <NotifyLoaded />
      <OGNotifySuccess />
      <NotifySuccess />
      <OGNotifyFailure />
      <NotifyFailure />
      <OGNotifyExpectedFailure />
      <NotifyExpectedFailure />
    </ModuleWrapper>
  ),
);

AppInitializationAPIs.displayName = 'AppInitializationAPIs';
export default AppInitializationAPIs;
