import React from "react";
import "./App.css";
import {core, appInitialization, authentication, teamsCore, settings} from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./components/BoxAndButton";

core.initialize();
appInitialization.notifyAppLoaded();

const App = () => {
  // **************************  TODO: FIX THE STATE NAMES ******************************
  const [context, setContext] = React.useState("");
  const [auth, setAuth] = React.useState("");
  const [executeDeepLink, setExecuteDeepLink] = React.useState("");
  const [getSettings, setGetSettings] = React.useState("");
  const [registerOnSaveHandler, setRegisterOnSaveHandler] = React.useState("");
  const [setSettings, setSetSettings] = React.useState("");
  const [setValidityState, setSetValidityState] = React.useState("");
  const [registerOnRemoveHandler, setRegisterOnRemoveHandler] = React.useState("");
  const [shareDeepLink, setShareDeepLink] = React.useState("");
  const [authenticationNotifyFailure, setAuthenticationNotifyFailure] = React.useState("");
  const [authenticationNotifySucess, setAuthenticationNotifySucess] = React.useState("");
  const [authenticationAuthenticate, setAuthenticationAuthenticate] = React.useState("");
  const [registerOnThemeChangeHandler, setRegisterOnThemeChangeHandler] = React.useState("");
  const [registerChangeSettingsHandler, setRegisterChangeSettingsHandler] = React.useState("");
  const [registerAppButtonClickHandler, setRegisterAppButtonClickHandler] = React.useState("");
  const [registerAppButtonHoverEnterHandler, setRegisterAppButtonHoverEnterHandler] = React.useState("");
  const [registerAppButtonHoverLeaveHandler, setRegisterAppButtonHoverLeaveHandler] = React.useState("");


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

  const returnRegisterOnThemeChangeHandler = () => {
    core.registerOnThemeChangeHandler((theme: string) => {
      setRegisterOnThemeChangeHandler(theme);
    });
  }; 

  const returnRegisterChangeSettingsHandler = () => {
    setRegisterChangeSettingsHandler("App SDK call registerChangeSettingsHandler() was called, but there was no action from the Hub SDK.");
    teamsCore.registerChangeSettingsHandler(() => {
      setRegisterChangeSettingsHandler("successfully called");
    });
  }; 

  const returnRegisterAppButtonClickHandler = () => {
    setRegisterAppButtonClickHandler("App SDK call registerAppButtonClickHandler() was called, but there was no action from the Hub SDK.");
    teamsCore.registerAppButtonClickHandler(() => {
      setRegisterAppButtonClickHandler("successfully called");
    });
  }; 

  const returnRegisterAppButtonHoverEnterHandler = () => {
    setRegisterAppButtonHoverEnterHandler("App SDK call registerAppButtonHoverEnterHandler() was called, but there was no action from the Hub SDK.");
    teamsCore.registerAppButtonHoverEnterHandler(() => {
      setRegisterAppButtonHoverEnterHandler("successfully called");
    });
  }; 

  const returnRegisterAppButtonHoverLeaveHandler = () => {
    setRegisterAppButtonHoverLeaveHandler("App SDK call registerAppButtonHoverLeaveHandler() was called, but there was no action from the Hub SDK.");
    teamsCore.registerAppButtonHoverLeaveHandler(() => {
      setRegisterAppButtonHoverLeaveHandler("successfully called");
    });
  }; 
  
  const returnSettings = () => {
    setGetSettings("App SDK call settings.getSettings() was called, but there was no action from the Hub SDK.");
    const onComplete = (instanceSettings: any) => {
      setGetSettings(instanceSettings);
    }
    settings.getSettings(onComplete);
  };

  const returnRegisterOnSaveHandler = () => {
    settings.registerOnSaveHandler((saveEvent: any) => {
      setRegisterOnSaveHandler("Save event received.");
      saveEvent.notifySuccess();
    });
  };

  const returnSetSettings = (instanceSettings: any) => {
    setSetSettings("App SDK call settings.setSettings() was called, but there was no action from the Hub SDK.");
    const onComplete = (output: any) => {
      setSetSettings(output);
    }
    settings.setSettings(instanceSettings, onComplete);
  };

  const returnSetValidityState = (validityState: string) => {
    settings.setValidityState(validityState == 'true');
    setSetValidityState("Set validity state to " + (validityState == 'true'));
  };

  const returnRegisterOnRemoveHandler = () => {
    setRegisterOnRemoveHandler("App SDK call registerOnRemoveHandler() was called, but there was no action from the Hub SDK.");
    settings.registerOnRemoveHandler((removeEvent: any) => {
      setRegisterOnRemoveHandler("Remove handler called.")
    })
  }

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
      <BoxAndButton
        handleClick={returnRegisterOnThemeChangeHandler}
        output={registerOnThemeChangeHandler}
        hasInput={false}
        title="Register On Theme Change Handler"
        name="registerOnThemeChangeHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterChangeSettingsHandler}
        output={registerChangeSettingsHandler}
        hasInput={false}
        title="Register Change Settings Handler"
        name="registerChangeSettingsHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonClickHandler}
        output={registerAppButtonClickHandler}
        hasInput={false}
        title="Register App Button Click Handler"
        name="registerAppButtonClickHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonHoverEnterHandler}
        output={registerAppButtonHoverEnterHandler}
        hasInput={false}
        title="Register App Button Hover Enter Handler"
        name="registerAppButtonHoverEnterHandler"
      />
      <BoxAndButton
        handleClick={returnRegisterAppButtonHoverLeaveHandler}
        output={registerAppButtonHoverLeaveHandler}
        hasInput={false}
        title="Register App Button Hover Leave Handler"
        name="registerAppButtonHoverLeaveHandler"
      />
      <BoxAndButton
        handleClick={returnSettings}
        output={getSettings}
        hasInput={false}
        title="Get Settings"
        name="settings.getSettings"
      />
      <BoxAndButton
        handleClick={returnRegisterOnSaveHandler}
        output={registerOnSaveHandler}
        hasInput={false}
        title="Set RegisterOnSaveHandler"
        name="settings.registerOnSaveHandler"
      />
      <BoxAndButton
        handleClick={returnSetSettings}
        output={setSettings}
        hasInput={true}
        title="Set Settings"
        name="settings.setSettings"
      />
      <BoxAndButton
        handleClick={returnSetValidityState}
        output={setValidityState}
        hasInput={true}
        title="Set Validity State"
        name="settings.setValidityState"
      />
      <BoxAndButton
        handleClick={returnRegisterOnRemoveHandler}
        output={registerOnRemoveHandler}
        hasInput={false}
        title="Register On Remove Handler"
        name="settings.registerOnRemoveHandler"
      />
    </>
  );
};

export default App;
