import './App.css';

import { app } from '@microsoft/teams-js';
import React, { ReactElement, useState } from 'react';

import { ButtonDefaultExample } from './components/Button';
import { DropdownBasicExample } from './components/Dropdown';
import NewButton from './components/NewButton';

// import AppInitialization from './components/AppInitialization';

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';

const App = (): ReactElement => {
  const [context, setContext] = useState<app.Context>();

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

  return (
    <>
      <div className="App">
        <h1> Trial App 1-3 </h1>
        <DropdownBasicExample />
        <div className="Button">
          <p> Trial FluentUI Button</p>
          <ButtonDefaultExample />
        </div>
        <p>{JSON.stringify(context)}</p>
        <h1>{JSON.stringify(context?.app.sessionId)} </h1>
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
    </>
  );
};

export default App;
