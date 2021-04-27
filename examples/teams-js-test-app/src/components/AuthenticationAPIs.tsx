import React, { ReactElement } from 'react';
import { authentication, core } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const AuthenticationAPIs = (): ReactElement => {
  const [registerAuthHandlersRes, setRegisterAuthHAndlerRes] = React.useState('');
  const [getTokenRes, setGetTokenRes] = React.useState('');
  const [getUserRes, setGetUserRes] = React.useState('');
  const [notifyFailureRes, setNotifyFailureRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');
  const [authenticateRes, setAuthenticateRes] = React.useState('');
  const [initializeRes, setInitializeRes] = React.useState('');

  const registerAuthenticationHandlers = (authParams: string): void => {
    authentication.registerAuthenticationHandlers(JSON.parse(authParams));
    setRegisterAuthHAndlerRes('called');
  };

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

  const authGetUser = (): void => {
    setGetUserRes('authentication.getUser()' + noHubSdkMsg);
    const userRequest = {
      successCallback: (user: authentication.UserProfile) => {
        setGetUserRes('Success: ' + JSON.stringify(user));
      },
      failureCallback: (reason: string) => {
        setGetUserRes('Failure: ' + reason);
      },
    };
    authentication.getUser(userRequest);
  };

  const authNotifyFailure = (reason: string): void => {
    authentication.notifyFailure(reason);
    setNotifyFailureRes('called');
  };

  const authNotifySuccess = (result: string): void => {
    authentication.notifySuccess(result);
    setNotifySuccessRes('called');
  };

  const initialize = (): void => {
    core.initialize();
    setInitializeRes('called');
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
        handleClick={initialize}
        output={initializeRes}
        hasInput={false}
        title="Initialize"
        name="initialize"
      />
      <BoxAndButton
        handleClickWithInput={registerAuthenticationHandlers}
        output={registerAuthHandlersRes}
        hasInput={true}
        title="register Authentication Handlers"
        name="registerAuthenticationHandlers"
      />
      <BoxAndButton
        handleClickWithInput={authGetToken}
        output={getTokenRes}
        hasInput={true}
        title="Get Auth Token"
        name="getAuthToken"
      />
      <BoxAndButton handleClick={authGetUser} output={getUserRes} hasInput={false} title="Get User" name="getUser" />
      <BoxAndButton
        handleClickWithInput={authNotifyFailure}
        output={notifyFailureRes}
        hasInput={true}
        title="authentication.notifyFailure"
        name="authentication.notifyFailure"
      />
      <BoxAndButton
        handleClickWithInput={authNotifySuccess}
        output={notifySuccessRes}
        hasInput={true}
        title="authentication.notifySuccess"
        name="authentication.notifySuccess"
      />
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
