import React, { ReactElement } from 'react';
import { app, Context, core, DeepLinkParameters } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const AppAPIs = (): ReactElement => {
  const [getContextRes, setGetContextRes] = React.useState('');
  const [getContextV2Res, setGetContextV2Res] = React.useState('');
  const [executeDeepLinkRes, setExecuteDeepLinkRes] = React.useState('');
  const [shareDeepLinkRes, setShareDeepLinkRes] = React.useState('');
  const [registerOnThemeChangeHandlerRes, setRegisterOnThemeChangeHandlerRes] = React.useState('');

  const getContext = (): void => {
    setGetContextRes('app.getContextOld()' + noHubSdkMsg);
    app.getContextOld().then((res: any) => {
      setGetContextRes(JSON.stringify(res));
    });
  };

  const getContextV2 = (): void => {
    setGetContextV2Res('app.getContext()' + noHubSdkMsg);
    app.getContext().then((res: Context) => {
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
    app.registerOnThemeChangeHandler((theme: string) => {
      setRegisterOnThemeChangeHandlerRes(theme);
    });
  };

  return (
    <>
      <h1>app</h1>
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

export default AppAPIs;
