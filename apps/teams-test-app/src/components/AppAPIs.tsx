import { app, Context, executeDeepLink, getContext, registerOnThemeChangeHandler } from '@microsoft/teams-js';
import { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { ButtonForm } from './utils/ButtonForm/ButtonForm';
import { ModuleWrapper } from './utils/ModuleWrapper/ModuleWrapper';
import { SingleInputForm } from './utils/SingleInputForm/SingleInputForm';

const getContextWithPromise = async (): Promise<string> => {
  const context = await app.getContext();
  return JSON.stringify(context);
};

const getContextWithCallback = (setResult): void => {
  const callback = (context: Context): void => {
    setResult(JSON.stringify(context));
  };
  return getContext(callback);
};
const OGGetContext = (): ReactElement =>
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
      },
    },
  });

const GetContextV1 = (): ReactElement => (
  <ButtonForm
    name="getContextV1"
    buttonLabel="get context"
    label="Get Context V1"
    onClick={{ withCallback: getContextWithCallback, withPromise: getContextWithPromise }}
  />
);

const GetContextV2 = (): ReactElement => (
  <ButtonForm name="getContextV2" buttonLabel="get context" label="Get Context V2" onClick={getContextWithPromise} />
);

const OpenLink = (): ReactElement => (
  <SingleInputForm
    label="Open link"
    onClick={{
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: {
        withPromise: async input => {
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
    }}
    value={'dummyDeepLink'}
    name="openLink"
  />
);
const OGOpenLink = (): ReactElement =>
  ApiWithTextInput<string>({
    name: 'executeDeepLink2',
    title: 'Open Link',
    onClick: {
      validateInput: input => {
        if (typeof input !== 'string') {
          throw new Error('Input should be a string');
        }
      },
      submit: {
        withPromise: async input => {
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
const RegisterOnThemeChangeHandler = (): ReactElement => (
  <ButtonForm
    name="registerOnThemeChangeHandler"
    buttonLabel="Register theme change handler"
    label="Register On Theme Change Handler"
    onClick={{
      withPromise: async setResult => {
        app.registerOnThemeChangeHandler(setResult);
        return '';
      },
      withCallback: setResult => {
        registerOnThemeChangeHandler(setResult);
        setResult('');
      },
    }}
  />
);

const AppAPIs = (): ReactElement => (
  <ModuleWrapper heading="App">
    <GetContextV1 />
    <GetContextV2 />
    <OGGetContext />
    <OpenLink />
    <OGOpenLink />
    <RegisterOnThemeChangeHandler />
  </ModuleWrapper>
);

export default AppAPIs;
