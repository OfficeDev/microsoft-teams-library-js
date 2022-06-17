import './App.css';

import { PartialTheme, ThemeProvider } from '@fluentui/react';
import { app } from '@microsoft/teams-js';
import React, { ReactElement, useState } from 'react';

import { ButtonDefaultExample } from './components/Button';
import { DropdownBasicExample } from './components/Dropdown';
import NewButton from './components/NewButton';

// import AppInitialization from './components/AppInitialization';

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';
const teamsTheme: PartialTheme = {
  palette: {
    themePrimary: '#5f0bb3',
    themeLighterAlt: 'white',
    themeLighter: 'white',
  },
};
const teamsThemeDark: PartialTheme = {
  palette: {
    themePrimary: 'black',
    themeSecondary: 'gray',
    themeDarker: 'black',
    themeDarkAlt: 'black',
  },
};

const outlookTheme: PartialTheme = {
  palette: {
    themePrimary: 'blue',
  },
};

const App3 = (): ReactElement => {
  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');

  const notifyLoaded = (): void => {
    app.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    app.notifySuccess();
    setNotifySuccessRes('called');
  };
  let appTheme: PartialTheme;

  const [context, setContext] = useState<app.Context>();

  React.useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        app.notifyAppLoaded();
        app.notifySuccess();
        const ctx = await app.getContext();
        setContext(ctx);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [setContext]);

  if (context?.app.host.name == 'Teams') {
    if (context.app.theme == 'default') {
      appTheme = teamsTheme;
    } else {
      appTheme = teamsThemeDark;
    }
  } else {
    appTheme = outlookTheme;
  }
  return (
    <>
      <ThemeProvider theme={appTheme}>
        <div className="App">
          <h1> Trial App </h1>
          <div className="dropdown">
            <DropdownBasicExample />
          </div>
          <div className="Button">
            <p> Trial FluentUI Button</p>
            <ButtonDefaultExample />
          </div>
          <p>Session Id is - {JSON.stringify(context?.app.sessionId)} </p>
          <br />
          <NewButton
            handleClick={notifyLoaded}
            output={notifyLoadedRes}
            title="appInitialization.appLoaded"
            name="appInitializationAppLoaded"
          />
          <br />
          <NewButton
            handleClick={notifySuccess}
            output={notifySuccessRes}
            title="appInitialization.success"
            name="appInitializationSuccess"
          />
        </div>
      </ThemeProvider>
    </>
  );
};

export default App3;
