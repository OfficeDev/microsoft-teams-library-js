import React, { ReactElement } from 'react';
import { Context, core, DeepLinkParameters } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const CoreAPIs = (): ReactElement => {
  const [getContextRes, setGetContextRes] = React.useState('');
  const [executeDeepLinkRes, setExecuteDeepLinkRes] = React.useState('');
  const [shareDeepLinkRes, setShareDeepLinkRes] = React.useState('');
  const [registerOnThemeChangeHandlerRes, setRegisterOnThemeChangeHandlerRes] = React.useState('');

  const getContext = (): void => {
    setGetContextRes('core.getContext()' + noHubSdkMsg);
    core.getContext((res: Context) => {
      setGetContextRes(JSON.stringify(res));
    });
  };

  const executeDeepLink = (deepLink: string): void => {
    setExecuteDeepLinkRes('core.executeDeepLink()' + noHubSdkMsg);
    const onComplete = (status: boolean, reason?: string): void => {
      if (!status) {
        if (reason) {
          setExecuteDeepLinkRes(reason);
        }
      } else {
        setExecuteDeepLinkRes('Completed');
      }
    };
    core.executeDeepLink(deepLink, onComplete);
  };

  const shareDeepLink = (deepLinkParamsInput: string): void => {
    let deepLinkParams: DeepLinkParameters = JSON.parse(deepLinkParamsInput);
    core.shareDeepLink(deepLinkParams);
    setShareDeepLinkRes('called shareDeepLink.');
  };

  const registerOnThemeChangeHandler = (): void => {
    core.registerOnThemeChangeHandler((theme: string) => {
      setRegisterOnThemeChangeHandlerRes(theme);
    });
  };

  return (
    <>
      <BoxAndButton
        handleClick={getContext}
        output={getContextRes}
        hasInput={false}
        title="Get Context"
        name="getContext"
      />
      <BoxAndButton
        handleClickWithInput={executeDeepLink}
        output={executeDeepLinkRes}
        hasInput={true}
        title="Execute Deep Link"
        name="executeDeepLink"
      />
      <BoxAndButton
        handleClickWithInput={shareDeepLink}
        output={shareDeepLinkRes}
        hasInput={true}
        title="core.shareDeepLink"
        name="core.shareDeepLink"
      />
      <BoxAndButton
        handleClick={registerOnThemeChangeHandler}
        output={registerOnThemeChangeHandlerRes}
        hasInput={false}
        title="Register On Theme Change Handler"
        name="registerOnThemeChangeHandler"
      />
    </>
  );
};

export default CoreAPIs;
