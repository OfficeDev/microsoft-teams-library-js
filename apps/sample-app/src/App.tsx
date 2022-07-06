import './App.css';

import { Button, FluentProvider, Spinner, teamsLightTheme, Text, Theme } from '@fluentui/react-components';
import { app, authentication } from '@microsoft/teams-js';
import React, { useState } from 'react';

import { ProfileContent } from './components/Profile';
import { appInitializationFailed, getTheme } from './components/utils';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState<string>();
  const [currTheme, setCurrTheme] = useState<Theme>(teamsLightTheme);

  React.useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        setIsInitialized(true);
        app.notifyAppLoaded();
        app.notifySuccess();
        const context = await app.getContext();
        const themeNow = getTheme(context?.app?.theme);
        setCurrTheme(themeNow);
        app.registerOnThemeChangeHandler(function(theme) {
          setCurrTheme(getTheme(theme));
        });
      } catch (e) {
        appInitializationFailed();
      }
    })();
  }, [setIsInitialized, setCurrTheme]);

  const handle = React.useCallback(async () => {
    const currURL = window.location.href;
    const result = await authentication.authenticate({
      url: new URL('/?auth=1', currURL).toString(),
    });
    setAccessToken(result);
  }, [setAccessToken]);

  return (
    <FluentProvider theme={currTheme}>
      {isInitialized && !accessToken && (
        <div className="appMainPage">
          <Text as="p">Sample App</Text>
          <div>
            <Text as="p">
              <Button appearance="primary" onClick={() => handle()}>
                Sign in
              </Button>
            </Text>
          </div>
        </div>
      )}
      {isInitialized && accessToken && <ProfileContent accessToken={accessToken} />}
      {!isInitialized && <Spinner />}
    </FluentProvider>
  );
};

export default App;
