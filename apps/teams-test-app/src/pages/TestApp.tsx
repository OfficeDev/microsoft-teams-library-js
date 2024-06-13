import { IAppWindow } from '@microsoft/teams-js';
import React from 'react';

import AppAPIs from '../components/AppAPIs';
import AppEntityAPIs from '../components/AppEntityAPIs';
import AppInitializationAPIs from '../components/AppInitialization';
import AppInstallDialogAPIs from '../components/AppInstallDialog';
import AuthenticationAPIs from '../components/AuthenticationAPIs';
import BarCodeAPIs from '../components/BarCodeAPIs';
import CalendarAPIs from '../components/CalendarAPIs';
import CallAPIs from '../components/CallAPIs';
import ClipboardAPIs from '../components/Clipboard';
import CustomAPIs from '../components/Custom';
import DialogAPIs from '../components/DialogAPIs';
import DialogCardAPIs from '../components/DialogCardAPIs';
import DialogCardBotAPIs from '../components/DialogCardBotAPIs';
import DialogUpdateAPIs from '../components/DialogUpdateAPIs';
import DialogUrlAPIs from '../components/DialogUrlAPIs';
import DialogUrlBotAPIs from '../components/DialogUrlBotAPIs';
import DialogUrlParentCommunicationAPIs from '../components/DialogUrlParentCommunicationAPIs';
import GeoLocationAPIs from '../components/GeoLocationAPIs';
import Links from '../components/Links';
import LocationAPIs from '../components/LocationAPIs';
import LogAPIs from '../components/LogsAPIs';
import MailAPIs from '../components/MailAPIs';
import MarketplaceAPIs from '../components/MarketplaceAPIs';
import MediaAPIs from '../components/MediaAPIs';
import MeetingAPIs from '../components/MeetingAPIs';
import MenusAPIs from '../components/MenusAPIs';
import NestedAppAuthAPIs from '../components/NestedAppAuthAPIs';
import OtherAppStateChangedAPIs from '../components/OtherAppStateChangeAPIs';
import PagesAPIs from '../components/PagesAPIs';
import PagesAppButtonAPIs from '../components/PagesAppButtonAPIs';
import PagesBackStackAPIs from '../components/PagesBackStackAPIs';
import PagesConfigAPIs from '../components/PagesConfigAPIs';
import PagesCurrentAppAPIs from '../components/PagesCurrentAppAPIs';
import PagesTabsAPIs from '../components/PagesTabsAPIs';
import PeopleAPIs from '../components/PeopleAPIs';
import ChatAPIs from '../components/privateApis/ChatAPIs';
import ExternalAppAuthenticationAPIs from '../components/privateApis/ExternalAppAuthenticationAPIs';
import ExternalAppCardActionsAPIs from '../components/privateApis/ExternalAppCardActionsAPIs';
import ExternalAppCommandsAPIs from '../components/privateApis/ExternalAppCommandsAPIs';
import FilesAPIs from '../components/privateApis/FilesAPIs';
import FullTrustAPIs from '../components/privateApis/FullTrustAPIs';
import MeetingRoomAPIs from '../components/privateApis/MeetingRoomAPIs';
import MessageChannelAPIs from '../components/privateApis/MessageChannelAPIs';
import MonetizationAPIs from '../components/privateApis/MonetizationAPIs';
import NotificationAPIs from '../components/privateApis/NotificationAPIs';
import PrivateAPIs from '../components/privateApis/PrivateAPIs';
import TeamsAPIs from '../components/privateApis/TeamsAPIs';
import VideoExAPIs from '../components/privateApis/VideoEffectsExAPIs';
import ProfileAPIs from '../components/ProfileAPIs';
import RemoteCameraAPIs from '../components/RemoteCameraAPIs';
import SearchAPIs from '../components/SearchAPIs';
import SecondaryBrowserAPIs from '../components/SecondaryBrowserAPIs';
import SharingAPIs from '../components/SharingAPIs';
import StageViewAPIs from '../components/StageViewAPIs';
import TeamsCoreAPIs from '../components/TeamsCoreAPIs';
import ThirdPartyCloudStorageAPIs from '../components/ThirdPartyCloudStorageAPIs';
import CookieAccessComponent from '../components/ThirdPatryCookies';
import Version from '../components/Version';
import VideoAPIs from '../components/VideoEffectsApis';
import VisualMediaAPIs from '../components/VisualMediaAPIs';
import WebStorageAPIs from '../components/WebStorageAPIs';

export const TestApp: React.FC = () => {
  const dialogWindowRef = React.useRef<IAppWindow | null>(null);

  return (
    <>
      <div className="App-container">
        <AppAPIs />
        <AppInitializationAPIs />
        <AppInstallDialogAPIs />
        <AuthenticationAPIs />
        <AppEntityAPIs />
        {/* <BarCodeAPIs />
        <CalendarAPIs />
        <CallAPIs />
        <ChatAPIs />
        <ClipboardAPIs />
        <CookieAccessComponent />
        <CustomAPIs />
        <DialogAPIs />
        <DialogCardAPIs />
        <DialogCardBotAPIs />
        <DialogUpdateAPIs />
        <DialogUrlAPIs childWindowRef={dialogWindowRef} />
        <DialogUrlBotAPIs />
        <DialogUrlParentCommunicationAPIs childWindowRef={dialogWindowRef} />
        <ExternalAppAuthenticationAPIs />
        <ExternalAppCardActionsAPIs />
        <ExternalAppCommandsAPIs />
        <FilesAPIs />
        <FullTrustAPIs />
        <GeoLocationAPIs />
        <Links />
        <LocationAPIs />
        <LogAPIs />
        <MailAPIs />
        <MarketplaceAPIs />
        <MediaAPIs />
        <MeetingAPIs />
        <MeetingRoomAPIs />
        <MenusAPIs />
        <MessageChannelAPIs />
        <MonetizationAPIs />
        <NestedAppAuthAPIs />
        <NotificationAPIs /> */}
        <OtherAppStateChangedAPIs />
        <PagesAPIs />
        <PagesAppButtonAPIs />
        <PagesBackStackAPIs />
        <PagesConfigAPIs />
        <PagesCurrentAppAPIs />
        <PagesTabsAPIs />
        <PeopleAPIs />
        <PrivateAPIs />
        <ProfileAPIs />
        <RemoteCameraAPIs />
        <SearchAPIs />
        <SecondaryBrowserAPIs />
        <SharingAPIs />
        <WebStorageAPIs />
        <StageViewAPIs />
        <TeamsCoreAPIs />
        <TeamsAPIs />
        <ThirdPartyCloudStorageAPIs />
        <VideoAPIs />
        <VideoExAPIs />
        <VisualMediaAPIs />
      </div>
      <Version />
    </>
  );
};
