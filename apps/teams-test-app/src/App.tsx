import './App.css';

import { app, appInitialization, initialize } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import AppAPIs from './components/AppAPIs';
import AppEntityAPIs from './components/AppEntityAPIs';
import AppInitializationAPIs from './components/AppInitialization';
import AppInstallDialogAPIs from './components/AppInstallDialog';
import AuthenticationAPIs from './components/AuthenticationAPIs';
import CalendarAPIs from './components/CalendarAPIs';
import CallAPIs from './components/CallAPIs';
import DialogAPIs from './components/DialogAPIs';
import LocationAPIs from './components/LocationAPIs';
import LogAPIs from './components/LogsAPIs';
import MailAPIs from './components/MailAPIs';
import MediaAPIs from './components/MediaAPIs';
import MeetingAPIs from './components/MeetingAPIs';
import MenusAPIs from './components/MenusAPIs';
import PagesAPIs from './components/PagesAPIs';
import PagesAppButtonAPIs from './components/PagesAppButtonAPIs';
import PagesBackStackAPIs from './components/PagesBackStackAPIs';
import PagesConfigAPIs from './components/PagesConfigAPIs';
import PagesTabsAPIs from './components/PagesTabsAPIs';
import PeopleAPIs from './components/PeopleAPIs';
import BotAPIs from './components/privateApis/BotAPIs';
import ChatAPIs from './components/privateApis/ChatAPIs';
import FilesAPIs from './components/privateApis/FilesAPIs';
import FullTrustAPIs from './components/privateApis/FullTrustAPIs';
import MeetingRoomAPIs from './components/privateApis/MeetingRoomAPIs';
import MonetizationAPIs from './components/privateApis/MonetizationAPIs';
import NotificationAPIs from './components/privateApis/NotificationAPIs';
import PrivateAPIs from './components/privateApis/PrivateAPIs';
import TeamsAPIs from './components/privateApis/TeamsAPIs';
import RemoteCameraAPIs from './components/RemoteCameraAPIs';
import SharingAPIs from './components/SharingAPIs';
import StageViewAPIs from './components/StageViewAPIs';
import TeamsCoreAPIs from './components/TeamsCoreAPIs';
import { getTestBackCompat } from './components/utils/getTestBackCompat';

const urlParams = new URLSearchParams(window.location.search);

// This is added for custom initialization when app can be initialized based upon a trigger/click.
if (!urlParams.has('customInit') || !urlParams.get('customInit')) {
  if (getTestBackCompat()) {
    initialize();
  } else {
    app.initialize();
  }
}

// for AppInitialization tests we need a way to stop the Test App from sending these
// we do it by adding appInitializationTest=true to query string
if (
  (urlParams.has('customInit') && urlParams.get('customInit')) ||
  (urlParams.has('appInitializationTest') && urlParams.get('appInitializationTest'))
) {
  console.info('Not calling appInitialization because part of App Initialization Test run');
} else {
  if (getTestBackCompat()) {
    appInitialization.notifyAppLoaded();
    appInitialization.notifySuccess();
  } else {
    app.notifyAppLoaded();
    app.notifySuccess();
  }
}

export const noHostSdkMsg = ' was called, but there was no response from the Host SDK.';

/**
 * Generates and returns an error message explaining that a string input was expected
 * to be parsed into a JSON object but there was a parsing error.
 * If there is an example JSON object provided, it gives the keys needed in a
 * correctly formatted JSON object parameter of the desired function. If possible,
 * it is recommended to provide this example to this function.
 *
 * @param [example] Example object of the type to generate the error message about.
 * @returns A message to the user to fix their input. Provides an example if there is any.
 */
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const generateJsonParseErrorMsg = (example?: Record<string, any>): string => {
  if (example) {
    return `Please JSON format your input. Your input should contain at least ${Object.keys(
      example,
    )}. For example, ${JSON.stringify(example)}`;
  } else {
    return 'Please JSON format your input. If you\'ve ensured your input is JSON formatted but are still getting this message, please also ensure that your input contains all necessary keys, etc.';
  }
};

/**
 * Generates and returns a message for confirming registration attempt of a handler, callback, etc.
 * Takes in the trigger condition for the handler to provide in the message to the user.
 *
 * @param changeCause the trigger condition for the handler to fire.
 * @returns A message to user to show confirmation of handler registration attempt.
 */
export const generateRegistrationMsg = (changeCause: string): string => {
  return `Registration attempt has been initiated. If successful, this message will change when ${changeCause}.`;
};

enum API {
  ALL = 'All',
  APP = 'App',
  APP_INIT = 'App Initialization',
  APP_INSTALL = 'App Install Dialog',
  AUTH = 'Authentication',
  APP_ENTITY = 'App Entity',
  BOT = 'Bot',
  CALENDAR = 'Calendar',
  CALL = 'Call',
  CHAT = 'Chat',
  DIALOG = 'Dialog',
  FILES = 'Files',
  FULL_TRUST = 'Full Trust APIs',
  LOCATION = 'Location',
  LOG = 'Logs',
  MAIL = 'Mail',
  MEDIA = 'Media',
  MEETING = 'Meeting',
  MEETING_ROOM = 'Meeting Room',
  MENUS = 'Menus',
  MONETIZATION = 'Monetization',
  NOTIFICATIONS = 'Notifications',
  PAGES = 'Pages',
  PAGES_APP_BUTTON = 'Pages.appButton',
  PAGES_BACKSTACK = 'Pages.backStack',
  PAGES_CONFIG = 'Pages.config',
  PAGES_TABS = 'Pages.tabs',
  PEOPLE = 'People',
  PRIVATE = 'Private APIs',
  REMOTE_CAMERA = 'Remote Camera',
  SHARING = 'Sharing',
  STAGE_VIEW = 'Stage View',
  TEAMS_CORE = 'Teams Core',
  TEAMS = 'Teams APIs',
}

const App = (): ReactElement => {
  const [showApiSelector, setShowApiSelector] = React.useState(false);
  const [showApi, setShowApi] = React.useState<API>(API.ALL);
  const shouldShowApi = (api: API): boolean => showApi === API.ALL || showApi === api;
  return (
    <>
      <button onClick={() => setShowApiSelector(prev => !prev)}>Show capability</button>
      {showApiSelector &&
        Object.values(API).map(value => (
          <div key={value}>
            <a
              key={value}
              onClick={() => {
                setShowApi(value);
                setShowApiSelector(false);
              }}
            >
              {value}
            </a>
          </div>
        ))}
      {shouldShowApi(API.APP) && <AppAPIs />}
      {shouldShowApi(API.APP_INIT) && <AppInitializationAPIs />}
      {shouldShowApi(API.APP_INSTALL) && <AppInstallDialogAPIs />}
      {shouldShowApi(API.AUTH) && <AuthenticationAPIs />}
      {shouldShowApi(API.APP_ENTITY) && <AppEntityAPIs />}
      {shouldShowApi(API.BOT) && <BotAPIs />}
      {shouldShowApi(API.CALENDAR) && <CalendarAPIs />}
      {shouldShowApi(API.CALL) && <CallAPIs />}
      {shouldShowApi(API.CHAT) && <ChatAPIs />}
      {shouldShowApi(API.DIALOG) && <DialogAPIs />}
      {shouldShowApi(API.FILES) && <FilesAPIs />}
      {shouldShowApi(API.FULL_TRUST) && <FullTrustAPIs />}
      {shouldShowApi(API.LOCATION) && <LocationAPIs />}
      {shouldShowApi(API.LOG) && <LogAPIs />}
      {shouldShowApi(API.MAIL) && <MailAPIs />}
      {shouldShowApi(API.MEDIA) && <MediaAPIs />}
      {shouldShowApi(API.MEETING) && <MeetingAPIs />}
      {shouldShowApi(API.MEETING_ROOM) && <MeetingRoomAPIs />}
      {shouldShowApi(API.MENUS) && <MenusAPIs />}
      {shouldShowApi(API.MONETIZATION) && <MonetizationAPIs />}
      {shouldShowApi(API.NOTIFICATIONS) && <NotificationAPIs />}
      {shouldShowApi(API.PAGES) && <PagesAPIs />}
      {shouldShowApi(API.PAGES_APP_BUTTON) && <PagesAppButtonAPIs />}
      {shouldShowApi(API.PAGES_BACKSTACK) && <PagesBackStackAPIs />}
      {shouldShowApi(API.PAGES_CONFIG) && <PagesConfigAPIs />}
      {shouldShowApi(API.PAGES_TABS) && <PagesTabsAPIs />}
      {shouldShowApi(API.PEOPLE) && <PeopleAPIs />}
      {shouldShowApi(API.PRIVATE) && <PrivateAPIs />}
      {shouldShowApi(API.REMOTE_CAMERA) && <RemoteCameraAPIs />}
      {shouldShowApi(API.SHARING) && <SharingAPIs />}
      {shouldShowApi(API.STAGE_VIEW) && <StageViewAPIs />}
      {shouldShowApi(API.TEAMS_CORE) && <TeamsCoreAPIs />}
      {shouldShowApi(API.TEAMS) && <TeamsAPIs />}
    </>
  );
};

export default App;
