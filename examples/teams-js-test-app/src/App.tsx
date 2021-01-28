import React from "react";
import "./App.css";
import {core, appInitialization, authentication} from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./components/BoxAndButton";

core.initialize();
appInitialization.notifyAppLoaded();

const App = () => {
  const [context, setContext] = React.useState("");
  const [auth, setAuth] = React.useState("");
  const [executeDeepLink, setExecuteDeepLink] = React.useState("");
  const [shareDeepLink, setShareDeepLink] = React.useState("");
  const [authenticationNotifyFailure, setAuthenticationNotifyFailure] = React.useState("");
  const [authenticationNotifySucess, setAuthenticationNotifySucess] = React.useState("");
  const [authenticationAuthenticate, setAuthenticationAuthenticate] = React.useState("");

  const returnContext = () => {
    let textResult = "No Context";
    core.getContext((res: any) => {
      textResult = JSON.stringify(res);
      setContext(textResult);
    });
  };

  const returnAuth = (authParams: any) => {
    let textResult = "No Auth";
    authParams = JSON.parse(authParams);
    try {
      authParams.successCallback = (token: string) => {
        setAuth("Success: " + token);
      };
      authParams.failureCallback = (reason: string) => {
        setAuth("Failure: " + reason);
      };
    } catch (e) {
      setAuth(textResult);
    }
    authentication.getAuthToken(authParams);
  };

  const returnExecuteDeepLink = (deepLink: string) => {
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setExecuteDeepLink(reason);
      } else {
        setExecuteDeepLink("Completed");
      }
    };
    core.executeDeepLink(deepLink, onComplete);
  };
  
  const returnShareDeepLink = (deepLinkParams: any) => {
    deepLinkParams = JSON.parse(deepLinkParams);
    core.shareDeepLink(deepLinkParams);
    // TODO: return a feedback for users 
  };

  const returnAuthenticationNotifyFailure = (reason?: string, callbackUrl?: string) => {
    authentication.notifyFailure(reason, callbackUrl);
     // TODO: return a feedback for users 
  };

  const returnAuthenticationNotifySucess = (result?: string, callbackUrl?: string) => {
    authentication.notifySuccess(result, callbackUrl);
     // TODO: return a feedback for users 
  };

  const returnAuthenticationAuthenticate = (authenticateParameters: any) => {
    let textResult = "";
    authenticateParameters = JSON.parse(authenticateParameters);
    try {
      authenticateParameters.successCallback = (token: string) => {
        setAuth("Success: " + token);
      };
      authenticateParameters.failureCallback = (reason: string) => {
        setAuth("Failure: " + reason);
      };
    } catch(e) {
       setAuthenticationAuthenticate(textResult);
    }
    authentication.authenticate(authenticateParameters);
  };

  return (
    <>
      <BoxAndButton
        handleClick={returnContext}
        output={context}
        hasInput={false}
        title="Get Context"
        name="getContext"
      />
      <BoxAndButton
        handleClick={returnAuth}
        output={auth}
        hasInput={true}
        title="Get Auth Token"
        name="getAuthToken"
      />
      <BoxAndButton
        handleClick={returnExecuteDeepLink}
        output={executeDeepLink}
        hasInput={true}
        title="Execute Deep Link"
        name="executeDeepLink"
      />
      <BoxAndButton
        handleClick={returnShareDeepLink}
        output={shareDeepLink}
        hasInput={true}
        title="Share Deep Link"
        name="ShareDeepLink"
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

export default App;
