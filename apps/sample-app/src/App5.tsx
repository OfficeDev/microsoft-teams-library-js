//import { teamsDarkTheme, ThemeInput, ThemePrepared } from '@fluentui/react-northstar';
import * as microsoftTeams from '@microsoft/teams-js';
import { app } from '@microsoft/teams-js';
import React, { ReactElement, useEffect, useState } from 'react';

import { ButtonDefaultExample } from './components/Button';
import { DropdownBasicExample } from './components/Dropdown';
import NewButton from './components/NewButton';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const App2 = (): ReactElement => {
  const [appContext, setAppContext] = useState<microsoftTeams.app.Context>();
  //const [appAppearance, setAppAppearance] = useState<string>('teamsDarkTheme');

  const [notifyLoadedRes, setNotifyLoadedRes] = React.useState('');
  const [notifySuccessRes, setNotifySuccessRes] = React.useState('');

  useEffect(() => {
    app.getContext().then(context => {
      setAppContext(context);
      //setAppAppearance(context.app.theme);
      app.notifySuccess();
    });

    //app.registerOnThemeChangeHandler(theme => {
    //  setAppAppearance(theme);
    //});
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await app.initialize();
        app.notifyAppLoaded();
        app.notifySuccess();
        const ctx = await app.getContext();
        setAppContext(ctx);
        //setAppAppearance(teamsDarkTheme);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [setAppContext]);

  const notifyLoaded = (): void => {
    app.notifyAppLoaded();
    setNotifyLoadedRes('called');
  };

  const notifySuccess = (): void => {
    app.notifySuccess();
    setNotifySuccessRes('called');
  };
  return (
    <div className="App">
      <h1 className="App-header"> Trial App 1-3 </h1>
      <DropdownBasicExample />
      <div className="Button">
        <p> Trial FluentUI Button</p>
        <ButtonDefaultExample />
      </div>
      {/* <p>{appAppearance}</p> */}
      <p>{JSON.stringify(appContext)}</p>
      <h1>{JSON.stringify(appContext?.app.sessionId)} </h1>
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
  );
};

export default App2;
