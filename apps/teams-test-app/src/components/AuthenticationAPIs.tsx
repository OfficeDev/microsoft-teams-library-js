import { app, authentication } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

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

const AuthenticationAPIs = (): ReactElement => (
  <>
    <h1>authentication</h1>
    <Initialize />
    <GetAuthToken />
    <GetUser />
    <NotifyFailure />
    <NotifySuccess />
    <Authenticate />
  </>
);

export default AuthenticationAPIs;
