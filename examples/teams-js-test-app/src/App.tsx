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

  return (
    <>
      <BoxAndButton
        handleClick={returnContext}
        output={context}
        hasInput={false}
        title="Get Context"
      />
      <BoxAndButton
        handleClick={returnAuth}
        output={auth}
        hasInput={true}
        title="Get Auth Token"
      />
      <BoxAndButton
        handleClick={returnExecuteDeepLink}
        output={executeDeepLink}
        hasInput={true}
        title="Execute Deep Link"
      />
    </>
  );
};

export default App;
