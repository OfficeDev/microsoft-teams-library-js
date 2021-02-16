import React from 'react';
import { core } from "@microsoft/teamsjs-app-sdk";
import BoxAndButton from "./BoxAndButton";
import { noHubSdkMsg } from "../App"

const CoreAPIs = () => {
  const [context, setContext] = React.useState("");
  const [executeDeepLink, setExecuteDeepLink] = React.useState("");
  const [shareDeepLink, setShareDeepLink] = React.useState("");
  const [registerOnThemeChangeHandler, setRegisterOnThemeChangeHandler] = React.useState("");

  const returnContext = () => {
    setContext("core.getContext()" + noHubSdkMsg);
    core.getContext((res: any) => {
      setContext(JSON.stringify(res));
    });
  };

  const returnExecuteDeepLink = (deepLink: string) => {
    setExecuteDeepLink("core.executeDeepLink()" + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string) => {
      if (!status) {
        if (reason) setExecuteDeepLink(reason);
      } else {
        setExecuteDeepLink("Completed");
      }
    };
    core.executeDeepLink(deepLink, onComplete);
  };

  const returnShareDeepLink = (deepLinkParams: any) => {
    deepLinkParams = JSON.parse(deepLinkParams);
    core.shareDeepLink(deepLinkParams);
    setShareDeepLink("called shareDeepLink.");
  };

  const returnRegisterOnThemeChangeHandler = () => {
    core.registerOnThemeChangeHandler((theme: string) => {
      setRegisterOnThemeChangeHandler(theme);
    });
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
        handleClick={returnRegisterOnThemeChangeHandler}
        output={registerOnThemeChangeHandler}
        hasInput={false}
        title="Register On Theme Change Handler"
        name="registerOnThemeChangeHandler"
      />
    </>
  );
};

export default CoreAPIs;
