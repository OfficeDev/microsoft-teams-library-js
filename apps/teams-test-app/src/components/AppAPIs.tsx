import { app, core, DeepLinkParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
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
    name: 'executeDeepLink2',
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

const AppAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [executeDeepLinkRes, setExecuteDeepLinkRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const executeDeepLink = (deepLink: string): void => {
    setExecuteDeepLinkRes('core.executeDeepLink()' + noHostSdkMsg);
    core
      .executeDeepLink(deepLink)
      .then(() => setExecuteDeepLinkRes('Completed'))
      .catch(reason => setExecuteDeepLinkRes(reason));
  };

  return (
    <>
      <h1>app</h1>
      <GetContext />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={executeDeepLink}
        output={executeDeepLinkRes}
        hasInput={true}
        title="Execute Deep Link"
        name="executeDeepLink"
      />
      <ExecuteDeepLink />
      <ShareDeepLink />
      <RegisterOnThemeChangeHandler />
    </>
  );
};

export default AppAPIs;
