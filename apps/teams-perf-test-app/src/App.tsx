import './App.css';

import { app } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import AppInitialization from './components/AppInitialization';

app.initialize();
app.notifyAppLoaded();
app.notifySuccess();

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';

const App = (): ReactElement => {
  return (
    <>
      <AppInitialization />
    </>
  );
};

export default App;
