import React, { ReactElement } from 'react';
import './App.css';
import { core, appInitialization } from '@microsoft/teamsjs-app-sdk';
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

core.initialize();
appInitialization.notifyAppLoaded();
export const noHubSdkMsg = ' was called, but there was no response from the Hub SDK.';

const App = (): ReactElement => {
  return (
    <>
      <AuthenticationAPIs />
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
    </>
  );
};

export default App;
