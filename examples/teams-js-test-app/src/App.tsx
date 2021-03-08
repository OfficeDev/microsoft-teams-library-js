import React, { ReactElement } from 'react';
import './App.css';
import { core, appInitialization } from '@microsoft/teamsjs-app-sdk';
import AppInitializationAPIs from './components/AppInitialization';
import AuthenticationAPIs from './components/AuthenticationAPIs';
import CalendarAPIs from './components/CalendarAPIs';
import ConversationsAPIs from './components/ConversationsAPIs';
import CoreAPIs from './components/CoreAPIs';
import LocationAPIs from './components/LocationAPIs';
import MediaAPIs from './components/MediaAPIs';
import NavigationAPIs from './components/NavigationAPIs';
import PrivateAPIs from './components/PrivateAPIs';
import SettingsAPIs from './components/SettingsAPIs';
import TasksAPIs from './components/TasksAPIs';
import TeamsCoreAPIs from './components/TeamsCoreAPIs';
import MailAPIs from './components/MailAPIs';
import NotificationAPIs from './components/privateApis/NotificationAPIs';

core.initialize();

// for AppInitialization tests we need a way to stop the Test App from sending these
// we do it by adding appInitializationTest=true to query string
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('appInitializationTest') && urlParams.get('appInitializationTest')) {
  console.info('Not calling appInitialization because part of App Initialization Test run');
} else {
  appInitialization.notifyAppLoaded();
  appInitialization.notifySuccess();
}

export const noHubSdkMsg = ' was called, but there was no response from the Hub SDK.';

const App = (): ReactElement => {
  return (
    <>
      <AuthenticationAPIs />
      <AppInitializationAPIs />
      <CalendarAPIs />
      <MailAPIs />
      <ConversationsAPIs />
      <CoreAPIs />
      <LocationAPIs />
      <MediaAPIs />
      <NavigationAPIs />
      <PrivateAPIs />
      <SettingsAPIs />
      <TasksAPIs />
      <TeamsCoreAPIs />
      <NotificationAPIs />
    </>
  );
};

export default App;
