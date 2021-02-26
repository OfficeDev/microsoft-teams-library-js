import React, { ReactElement } from 'react';
import { authentication } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const AuthenticationAPIs = (): ReactElement => {
  const [getTokenRes, setGetTokenRes] = React.useState('');
  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [authenticateRes, setAuthenticateRes] = React.useState('');

  const authGetToken = (unformattedAuthParams: string): void => {
    setGetTokenRes('authentication.getToken()' + noHubSdkMsg);
    const authParams: authentication.AuthenticateParameters = JSON.parse(unformattedAuthParams);
    try {
      authParams.successCallback = (result?: string) => {
        setGetTokenRes('Success: ' + result);
      };
      authParams.failureCallback = (reason?: string) => {
        setGetTokenRes('Failure: ' + reason);
      };
    } catch (e) {
      setGetTokenRes('No Auth');
    }
    authentication.getAuthToken(authParams);
  };

  const authNotifyFailure = (reason: string): void => {
    authentication.notifyFailure(reason);
    setNotifyFailureRes('called');
  };

  const authNotifySuccess = (result: string): void => {
    authentication.notifySuccess(result);
    setNotifySuccessRes('called');
  };

  const authAuthenticate = (unformattedAuthParams: string): void => {
    setAuthenticateRes('authentication.authenticate()' + noHubSdkMsg);
    const authParams: authentication.AuthenticateParameters = JSON.parse(unformattedAuthParams);
    try {
      authParams.successCallback = (token?: string) => {
        setAuthenticateRes('Success: ' + token);
      };
      authParams.failureCallback = (reason?: string) => {
        setAuthenticateRes('Failure: ' + reason);
      };
    } catch (e) {
      setAuthenticateRes('No Auth');
    }
    authentication.authenticate(authParams);
  };

  return (
    <>
      <BoxAndButton
        handleClick={authGetToken}
        output={getTokenRes}
        hasInput={true}
        title="Get Auth Token"
        name="getAuthToken"
      />
      <BoxAndButton
        handleClick={authNotifyFailure}
        output={notifyFailureRes}
        hasInput={true}
        title="authentication.notifyFailure"
        name="authentication.notifyFailure"
      />
      <BoxAndButton
        handleClick={authNotifySuccess}
        output={notifySuccessRes}
        hasInput={true}
        title="authentication.notifySuccess"
        name="authentication.notifySuccess"
      />
      <BoxAndButton
        handleClick={authAuthenticate}
        output={authenticateRes}
        hasInput={true}
        title="authentication.authenticate"
        name="authentication.authenticate"
      />
    </>
  );
};

export default AuthenticationAPIs;
