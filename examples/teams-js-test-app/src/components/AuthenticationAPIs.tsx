import React from 'react';
import { authentication } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App";

const AuthenticationAPIs = () => {
  const [auth, setAuth] = React.useState("");
  const [authenticationNotifyFailure, setAuthenticationNotifyFailure] = React.useState("");
  const [authenticationNotifySucess, setAuthenticationNotifySucess] = React.useState("");
  const [authenticationAuthenticate, setAuthenticationAuthenticate] = React.useState("");

  const returnAuth = (authParams: any) => {
    setAuth("authentication.getToken()" + noHubSdkMsg);
    authParams = JSON.parse(authParams);
    try {
      authParams.successCallback = (token: string) => {
        setAuth("Success: " + token);
      };
      authParams.failureCallback = (reason: string) => {
        setAuth("Failure: " + reason);
      };
    } catch (e) {
      setAuth("No Auth");
    }
    authentication.getAuthToken(authParams);
  };

  const returnAuthenticationNotifyFailure = (reason: string) => {
    authentication.notifyFailure(reason);
    // TODO: return a feedback for users 
  };

  const returnAuthenticationNotifySucess = (result: string) => {
    authentication.notifySuccess(result);
    // TODO: return a feedback for users 
  };

  const returnAuthenticationAuthenticate = (authenticateParameters: any) => {
    setAuthenticationAuthenticate("authentication.authenticate()" + noHubSdkMsg);
    authenticateParameters = JSON.parse(authenticateParameters);
    try {
      authenticateParameters.successCallback = (token: string) => {
        setAuthenticationAuthenticate("Success: " + token);
      };
      authenticateParameters.failureCallback = (reason: string) => {
        setAuthenticationAuthenticate("Failure: " + reason);
      };
    } catch (e) {
      setAuthenticationAuthenticate("No Auth");
    }
    authentication.authenticate(authenticateParameters);
  };



  return (
    <>
      <BoxAndButton
        handleClick={returnAuth}
        output={auth}
        hasInput={true}
        title="Get Auth Token"
        name="getAuthToken"
      />
      <BoxAndButton
        handleClick={returnAuthenticationNotifyFailure}
        output={authenticationNotifyFailure}
        hasInput={true}
        title="authentication.notifyFailure"
        name="authentication.notifyFailure"
      />
      <BoxAndButton
        handleClick={returnAuthenticationNotifySucess}
        output={authenticationNotifySucess}
        hasInput={true}
        title="authentication.notifySucess"
        name="authentication.notifySucess"
      />
      <BoxAndButton
        handleClick={returnAuthenticationAuthenticate}
        output={authenticationAuthenticate}
        hasInput={true}
        title="authentication.authenticate"
        name="authentication.authenticate"
      />
    </>
  );
};

export default AuthenticationAPIs;
