import { app, core, DeepLinkParameters } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const AppAPIs = (): ReactElement => {
  const [getContextV2Res, setGetContextV2Res] = React.useState('');
  const [executeDeepLinkRes, setExecuteDeepLinkRes] = React.useState('');
  const [shareDeepLinkRes, setShareDeepLinkRes] = React.useState('');
  const [registerOnThemeChangeHandlerRes, setRegisterOnThemeChangeHandlerRes] = React.useState('');

  const getContextV2 = (): void => {
    setGetContextV2Res('app.getContext()' + noHostSdkMsg);
    app.getContext().then((res: app.Context) => {
      setGetContextV2Res(JSON.stringify(res));
    });
  };

  const executeDeepLink = (deepLink: string): void => {
    setExecuteDeepLinkRes('core.executeDeepLink()' + noHostSdkMsg);
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
