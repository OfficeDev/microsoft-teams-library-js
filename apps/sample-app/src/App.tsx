import './App.css';

import { Button, FluentProvider, LargeTitle, Spinner, teamsLightTheme, Text, Theme } from '@fluentui/react-components';
import { app, authentication } from '@microsoft/teams-js';
import React, { useState } from 'react';

import { ProfileContent } from './components/Profile';
import { appInitializationFailed, getThemeOther, getThemeTeams } from './components/utils';

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
        // Learn more about 'app' namespace from the link below
        //https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/using-teams-client-sdk?tabs=javascript%2Cmanifest-teams-toolkit#differentiate-your-app-experience
        if (context?.app?.host?.name === 'Teams') {
          const themeNow = getThemeTeams(context?.app?.theme);
          setCurrTheme(themeNow);
          app.registerOnThemeChangeHandler(function (theme) {
            setCurrTheme(getThemeTeams(theme));
          });
        } else {
          const themeNow = getThemeOther(context?.app?.theme);
          setCurrTheme(themeNow);
          app.registerOnThemeChangeHandler(function (theme) {
            setCurrTheme(getThemeOther(theme));
          });
        }
      } catch (e) {
        alert('Initialization Error: App should be sideloaded onto a host');
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
          <div className="appMainPage-sub-container">
            <LargeTitle block> My Day </LargeTitle>
          </div>
          <div className="appMainPage-sub-container">
            <Text as="p">
              <Button appearance="primary" onClick={() => handle()} tabIndex={0}>
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
