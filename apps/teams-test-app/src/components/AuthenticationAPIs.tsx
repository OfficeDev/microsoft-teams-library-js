import { app, authentication } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';
import { ApiWithoutInput, ApiWithTextInput } from './utils';

const Initialize = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'initialize',
    title: 'Initialize',
    onClick: async () => {
      await app.initialize();
      return 'called';
    },
  });

const GetAuthToken = (): React.ReactElement =>
  ApiWithTextInput<authentication.AuthTokenRequestParameters>({
    name: 'getAuthToken',
    title: 'Get Auth Token',
    onClick: async authParams => {
      const result = await authentication.getAuthToken(authParams);
      return 'Success: ' + JSON.stringify(result);
    },
  });

const GetUser = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getUser',
    title: 'Get User',
    onClick: async () => {
      const user = await authentication.getUser();
      return 'Success: ' + JSON.stringify(user);
    },
  });

const NotifyFailure = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'authentication.notifyFailure2',
    title: 'authentication.notifyFailure',
    onClick: async input => {
      authentication.notifyFailure(input);
      return 'called';
    },
  });

const NotifySuccess = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'authentication.notifySuccess2',
    title: 'authentication.notifySuccess',
    onClick: async input => {
      authentication.notifySuccess(input);
      return 'called';
    },
  });

const Authenticate = (): React.ReactElement =>
  ApiWithTextInput<authentication.AuthenticatePopUpParameters>({
    name: 'authentication.authenticate2',
    title: 'authentication.authenticate',
    onClick: {
      validateInput: input => {
        if (!input.url) {
          throw new Error('url is required');
        }
      },
      submit: async authParams => {
        const token = await authentication.authenticate(authParams);
        return 'Success: ' + token;
      },
    },
  });

const AuthenticationAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version

  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [authenticateRes, setAuthenticateRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const authNotifyFailure = (reason: string): void => {
    authentication.notifyFailure(reason);
    setNotifyFailureRes('called');
  };

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const authNotifySuccess = (result: string): void => {
    authentication.notifySuccess(result);
    setNotifySuccessRes('called');
  };

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const authAuthenticate = (unformattedAuthParams: string): void => {
    setAuthenticateRes('authentication.authenticate()' + noHostSdkMsg);
    const authParams: authentication.AuthenticatePopUpParameters = JSON.parse(unformattedAuthParams);
    authentication
      .authenticate(authParams)
      .then(token => setAuthenticateRes('Success: ' + token))
      .catch((reason: Error) => setAuthenticateRes('Failure: ' + reason.message));
  };
  return (
    <>
      <h1>authentication</h1>
      <Initialize />
      <GetAuthToken />
      <GetUser />
      <NotifyFailure />
      <NotifySuccess />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={authNotifyFailure}
        output={notifyFailureRes}
        hasInput={true}
        title="authentication.notifyFailure"
        name="authentication.notifyFailure"
      />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={authNotifySuccess}
        output={notifySuccessRes}
        hasInput={true}
        title="authentication.notifySuccess"
        name="authentication.notifySuccess"
      />
      <Authenticate />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={authAuthenticate}
        output={authenticateRes}
        hasInput={true}
        title="authentication.authenticate"
        name="authentication.authenticate"
      />
    </>
  );
};

export default AuthenticationAPIs;
