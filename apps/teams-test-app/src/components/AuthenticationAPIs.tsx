import { app, authentication } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
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
    onClick: {
      validateInput: () => {
        return; //This API can have no input
      },
      submit: {
        withPromise: async authParams => {
          const params = authParams;
          const result = await authentication.getAuthToken(params);
          return 'Success: ' + JSON.stringify(result);
        },
        withCallback: (authParams, setResult) => {
          const callback = (result: string): void => {
            setResult(result);
          };
          const authRequest: authentication.AuthTokenRequest = {
            successCallback: callback,
            failureCallback: callback,
            ...authParams,
          };
          authentication.getAuthToken(authRequest);
          return 'getAuthToken()' + noHostSdkMsg;
        },
      },
    },
  });

const GetUser = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'getUser',
    title: 'Get User',
    onClick: {
      withPromise: async () => {
        const user = await authentication.getUser();
        return 'Success: ' + JSON.stringify(user);
      },
      withCallback: setResult => {
        const successCallback = (user: authentication.UserProfile): void => {
          setResult(JSON.stringify(user));
        };
        const failureCallback = (reason: string): void => {
          setResult(reason);
        };
        const userRequest: authentication.UserRequest = {
          successCallback: successCallback,
          failureCallback: failureCallback,
        };
        authentication.getUser(userRequest);
        return 'getUser()' + noHostSdkMsg;
      },
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
      submit: {
        withPromise: async authParams => {
          const token = await authentication.authenticate(authParams);
          return 'Success: ' + token;
        },
        withCallback: authParams => {
          authentication.authenticate(authParams);
          return 'autheticate()' + noHostSdkMsg;
        },
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
