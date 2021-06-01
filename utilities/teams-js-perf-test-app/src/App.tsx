import React, { ReactElement } from 'react';
import './App.css';
import { core, appInitialization } from '@microsoft/teamsjs-app-sdk';
import AppInitialization from './components/AppInitialization';

core.initialize();
appInitialization.notifyAppLoaded();
appInitialization.notifySuccess();

export const noHubSdkMsg = ' was called, but there was no response from the Hub SDK.';

const App = (): ReactElement => {
  return (
    <>
      <AppInitialization />
    </>
  );
};

export default App;
