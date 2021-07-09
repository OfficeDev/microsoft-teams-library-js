import React, { ReactElement } from 'react';
import { Context, core, DeepLinkParameters } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const CoreAPIs = (): ReactElement => {
  const [getContextRes, setGetContextRes] = React.useState('');
  const [getContextV2Res, setGetContextV2Res] = React.useState('');
  const [executeDeepLinkRes, setExecuteDeepLinkRes] = React.useState('');
  const [shareDeepLinkRes, setShareDeepLinkRes] = React.useState('');
  const [registerOnThemeChangeHandlerRes, setRegisterOnThemeChangeHandlerRes] = React.useState('');

  const getContext = (): void => {
    setGetContextRes('core.getContextOld()' + noHubSdkMsg);
    core.getContextOld().then((res: any) => {
      setGetContextRes(JSON.stringify(res));
    });
  };

  const getContextV2 = (): void => {
    setGetContextV2Res('core.getContext()' + noHubSdkMsg);
    core.getContext().then((res: Context) => {
      setGetContextV2Res(JSON.stringify(res));
    });
  };

  const executeDeepLink = (deepLink: string): void => {
    setExecuteDeepLinkRes('core.executeDeepLink()' + noHubSdkMsg);
    core
      .executeDeepLink(deepLink)
      .then(() => setExecuteDeepLinkRes('Completed'))
      .catch(reason => setExecuteDeepLinkRes(reason));
  };

  const shareDeepLink = (deepLinkParamsInput: string): void => {
    const deepLinkParams: DeepLinkParameters = JSON.parse(deepLinkParamsInput);
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
      <h1>core</h1>
      <BoxAndButton
        handleClick={getContext}
        output={getContextRes}
        hasInput={false}
        title="Get Context"
        name="getContext"
      />
      <BoxAndButton
        handleClick={getContextV2}
        output={getContextV2Res}
        hasInput={false}
        title="Get Context"
        name="getContextV2"
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
