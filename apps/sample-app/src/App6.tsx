import './App.css';

import { AddIcon, EmailIcon } from '@fluentui/react-icons-northstar';
import { Provider } from '@fluentui/react-northstar';
import { Button } from '@fluentui/react-northstar';
import { app } from '@microsoft/teams-js';
import React, { ReactElement, useState } from 'react';

import { ButtonDefaultExample } from './components/Button';
import { DropdownBasicExample } from './components/Dropdown';
import BtnExample from './components/FluentButton';
import NewButton from './components/NewButton';
// import AppInitialization from './components/AppInitialization';

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';

const theme = {
  siteVariables: {
    brand: 'darkred',
    brand04: '#943670',
    gray08: '##943670',
    gray06: '#f4c2c2',
    gray03: '#757575',
  },
  componentVariables: {
    Button: {
      height: '10px',
      minWidth: '10px',
      borderRadius: '8px',
      color: 'darkred',
      primaryBackgroundColor: 'darkred',
      secondaryColor: '#f#943670',
      secondaryBorderColor: 'transparent',
      secondaryBackgroundColor: '#943670',
      secondaryBackgroundColorHover: '#943670',
    },
  },
  componentStyles: {
    Button: {
      icon: {
        fontSize: '5px',
      },
    },
  },
};

const App6 = (): ReactElement => {
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
  //let appTheme: PartialTheme;

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
  {
    /*
  if (context?.app.host.name == 'Teams') {
    if (context.app.theme == 'default') {
      appTheme = teamsTheme;
    } else {
      appTheme = teamsThemeDark;
    }
  } else {
    appTheme = outlookTheme;
  } */
  }
  return (
    <>
      <Provider theme={theme}>
        <Button primary>Branding</Button>
        <div>
          <Button content="Button" />
          <Button icon={<AddIcon />} iconOnly primary />
          <Button
            icon={<EmailIcon />}
            styles={{
              color: 'green',
            }}
            content="Send email"
            secondary
          />
        </div>
        <div className="App">
          <h1> Trial App </h1>
          <BtnExample />
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
      </Provider>
    </>
  );
};

export default App6;
