import './App.css';

import { Button, FluentProvider, Spinner, teamsLightTheme, Text, Theme } from '@fluentui/react-components';
import { app, authentication } from '@microsoft/teams-js';
import React, { useState } from 'react';

import { ProfileContent } from './components/Profile';
import { appInitializationFailed, getTheme } from './components/utils';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState<string>();

  React.useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        setIsInitialized(true);
      } catch (e) {
        appInitializationFailed();
      }
    })();
  }, [setIsInitialized]);

  const handle = React.useCallback(async () => {
    const result = await authentication.authenticate({
      url: 'https://localhost:4003/?auth=1',
    });
    setAccessToken(result);
  }, [setAccessToken]);

  const [currTheme, setCurrTheme] = useState<Theme>(teamsLightTheme);

  React.useEffect(() => {
    (async () => {
      try {
        app.isInitialized();
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
  }, [setCurrTheme]);

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
