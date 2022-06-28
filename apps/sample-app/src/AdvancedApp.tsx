import './App.css';

import { Spinner, SpinnerSize } from '@fluentui/react';
import { Button } from '@fluentui/react-components';
import { FluentProvider, teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme } from '@fluentui/react-components';
import { app, authentication } from '@microsoft/teams-js';
import React, { useState } from 'react';

import { ProfileContent } from './components/Profile';
const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState<string>();

  React.useEffect(() => {
    (async () => {
      await app.initialize();
      setIsInitialized(true);
    })();
  }, [setIsInitialized]);

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async function handle() {
    const result = await authentication.authenticate({
      url: 'https://localhost:4003/?auth=1',
    });
    setAccessToken(result);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [context, setContext] = useState<app.Context>();
  const [Theme, setTheme] = useState('');

  React.useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        app.notifyAppLoaded();
        app.notifySuccess();
        const ctx = await app.getContext();
        setContext(ctx);
        const themeRn = (await app.getContext()).app.theme;
        setTheme(themeRn);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [setContext, setTheme]);

  if (Theme == 'default') {
    return (
      <>
        <FluentProvider theme={teamsLightTheme}>
          {isInitialized && !accessToken && <p className="App-header">Sample App</p> && (
            <p className="App-header2">(starting auth flow...)</p>
          )}

          {isInitialized && !accessToken && (
            <p className="first">
              <Button className="signInPrimary" appearance="primary" onClick={() => handle()}>
                Sign in
              </Button>
            </p>
          )}
          {isInitialized && accessToken && <ProfileContent accessToken={accessToken} />}
          {!isInitialized && <Spinner size={SpinnerSize.large} />}
        </FluentProvider>
      </>
    );
  } else if (Theme == 'dark') {
    return (
      <>
        <FluentProvider theme={teamsDarkTheme}>
          {isInitialized && !accessToken && <p className="App-header">Sample App</p> && (
            <p className="App-header2">(starting auth flow...)</p>
          )}

          {isInitialized && !accessToken && (
            <p className="first">
              <Button className="signInPrimary" appearance="primary" onClick={() => handle()}>
                Sign in
              </Button>
            </p>
          )}
          {isInitialized && accessToken && <ProfileContent accessToken={accessToken} />}
          {!isInitialized && <Spinner size={SpinnerSize.large} />}
        </FluentProvider>
      </>
    );
  } else {
    return (
      <>
        <FluentProvider theme={teamsHighContrastTheme}>
          {isInitialized && !accessToken && <p className="App-header">Sample App</p> && (
            <p className="App-header2">(starting auth flow...)</p>
          )}

          {isInitialized && !accessToken && (
            <p className="first">
              <Button className="signInPrimary" appearance="primary" onClick={() => handle()}>
                Sign in
              </Button>
            </p>
          )}
          {isInitialized && accessToken && <ProfileContent accessToken={accessToken} />}
          {!isInitialized && <Spinner size={SpinnerSize.large} />}
        </FluentProvider>
      </>
    );
  }
};

export default App;
