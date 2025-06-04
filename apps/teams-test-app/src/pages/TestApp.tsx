import { IAppWindow } from '@microsoft/teams-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';

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
import HostEntityTabAPIs from '../components/HostEntityTabAPIs';
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
import CopilotAPIs from '../components/privateApis/CopilotAPIs';
import ExternalAppAuthenticationAPIs from '../components/privateApis/ExternalAppAuthenticationAPIs';
import ExternalAppAuthenticationForCEAAPIs from '../components/privateApis/ExternalAppAuthenticationForCEAAPIs';
import ExternalAppCardActionsAPIs from '../components/privateApis/ExternalAppCardActionsAPIs';
import ExternalAppCardActionsForCEAAPIs from '../components/privateApis/ExternalAppCardActionsForCEAAPIs';
import ExternalAppCardActionsForDAAPIs from '../components/privateApis/ExternalAppCardActionsForDAAPIs';
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
import StageViewSelfAPIs from '../components/StageViewSelfAPIs';
import StoreAPIs from '../components/StoreApis';
import TeamsCoreAPIs from '../components/TeamsCoreAPIs';
import ThirdPartyCloudStorageAPIs from '../components/ThirdPartyCloudStorageAPIs';
import CookieAccessComponent from '../components/ThirdPatryCookies';
import Version from '../components/Version';
import VideoAPIs from '../components/VideoEffectsApis';
import VisualMediaAPIs from '../components/VisualMediaAPIs';
import WebStorageAPIs from '../components/WebStorageAPIs';

export const appInitializationTestQueryParameter = 'appInitializationTest';
export const groupedModeQueryParameter = 'groupedMode'; // Define query parameter name for grouped mode

export const TestApp: React.FC = () => {
  const dialogWindowRef = useRef<IAppWindow | null>(null);
  const [iframeUrl, setIframeUrl] = useState<URL | null>(null);
  const [groupedMode, setGroupedMode] = useState(false); // Toggle between default and grouped mode
  const [visibleSections, setVisibleSections] = useState<string[]>([]); // Track multiple open sections
  const [hideButtons, setHideButtons] = useState(false); // New state to hide buttons

  const loadCurrentUrl = (): void => {
    setIframeUrl(new URL(window.location.href + `?${appInitializationTestQueryParameter}=true`));
  };

  // Function to toggle the visibility of a specific section
  const toggleSection = (sectionName: string): void => {
    setVisibleSections(
      (prev) =>
        prev.includes(sectionName)
          ? prev.filter((section) => section !== sectionName) // Hide section if already open
          : [...prev, sectionName], // Show section if not open
    );
  };

  // List of sections dynamically created from React elements
  const sections = useMemo(
    () => [
      { name: 'CopilotAPIs', component: <CopilotAPIs /> },
      { name: 'AppAPIs', component: <AppAPIs /> },
      { name: 'AppInitializationAPIs', component: <AppInitializationAPIs /> },
      { name: 'AppInstallDialogAPIs', component: <AppInstallDialogAPIs /> },
      { name: 'AuthenticationAPIs', component: <AuthenticationAPIs /> },
      { name: 'AppEntityAPIs', component: <AppEntityAPIs /> },
      { name: 'BarCodeAPIs', component: <BarCodeAPIs /> },
      { name: 'CalendarAPIs', component: <CalendarAPIs /> },
      { name: 'CallAPIs', component: <CallAPIs /> },
      { name: 'ChatAPIs', component: <ChatAPIs /> },
      { name: 'ClipboardAPIs', component: <ClipboardAPIs /> },
      { name: 'CookieAccessComponent', component: <CookieAccessComponent /> },
      { name: 'CustomAPIs', component: <CustomAPIs /> },
      { name: 'DialogAPIs', component: <DialogAPIs /> },
      { name: 'DialogCardAPIs', component: <DialogCardAPIs /> },
      { name: 'DialogCardBotAPIs', component: <DialogCardBotAPIs /> },
      { name: 'DialogUpdateAPIs', component: <DialogUpdateAPIs /> },
      { name: 'DialogUrlAPIs', component: <DialogUrlAPIs childWindowRef={dialogWindowRef} /> },
      { name: 'DialogUrlBotAPIs', component: <DialogUrlBotAPIs /> },
      {
        name: 'DialogUrlParentCommunicationAPIs',
        component: <DialogUrlParentCommunicationAPIs childWindowRef={dialogWindowRef} />,
      },
      { name: 'ExternalAppAuthenticationAPIs', component: <ExternalAppAuthenticationAPIs /> },
      { name: 'ExternalAppAuthenticationForCEAAPIs', component: <ExternalAppAuthenticationForCEAAPIs /> },
      { name: 'ExternalAppCardActionsAPIs', component: <ExternalAppCardActionsAPIs /> },
      { name: 'ExternalAppCardActionsForCEAAPIs', component: <ExternalAppCardActionsForCEAAPIs /> },
      { name: 'ExternalAppCardActionsForDAAPIs', component: <ExternalAppCardActionsForDAAPIs /> },
      { name: 'ExternalAppCommandsAPIs', component: <ExternalAppCommandsAPIs /> },
      { name: 'FilesAPIs', component: <FilesAPIs /> },
      { name: 'FullTrustAPIs', component: <FullTrustAPIs /> },
      { name: 'GeoLocationAPIs', component: <GeoLocationAPIs /> },
      { name: 'HostEntityTabAPIs', component: <HostEntityTabAPIs /> },
      { name: 'Links', component: <Links /> },
      { name: 'LocationAPIs', component: <LocationAPIs /> },
      { name: 'LogAPIs', component: <LogAPIs /> },
      { name: 'MailAPIs', component: <MailAPIs /> },
      { name: 'MarketplaceAPIs', component: <MarketplaceAPIs /> },
      { name: 'MediaAPIs', component: <MediaAPIs /> },
      { name: 'MeetingAPIs', component: <MeetingAPIs /> },
      { name: 'MeetingRoomAPIs', component: <MeetingRoomAPIs /> },
      { name: 'MenusAPIs', component: <MenusAPIs /> },
      { name: 'MessageChannelAPIs', component: <MessageChannelAPIs /> },
      { name: 'MonetizationAPIs', component: <MonetizationAPIs /> },
      { name: 'NestedAppAuthAPIs', component: <NestedAppAuthAPIs /> },
      { name: 'NotificationAPIs', component: <NotificationAPIs /> },
      { name: 'OtherAppStateChangedAPIs', component: <OtherAppStateChangedAPIs /> },
      { name: 'PagesAPIs', component: <PagesAPIs /> },
      { name: 'PagesAppButtonAPIs', component: <PagesAppButtonAPIs /> },
      { name: 'PagesBackStackAPIs', component: <PagesBackStackAPIs /> },
      { name: 'PagesConfigAPIs', component: <PagesConfigAPIs /> },
      { name: 'PagesCurrentAppAPIs', component: <PagesCurrentAppAPIs /> },
      { name: 'PagesTabsAPIs', component: <PagesTabsAPIs /> },
      { name: 'PeopleAPIs', component: <PeopleAPIs /> },
      { name: 'PrivateAPIs', component: <PrivateAPIs /> },
      { name: 'ProfileAPIs', component: <ProfileAPIs /> },
      { name: 'RemoteCameraAPIs', component: <RemoteCameraAPIs /> },
      { name: 'SearchAPIs', component: <SearchAPIs /> },
      { name: 'SecondaryBrowserAPIs', component: <SecondaryBrowserAPIs /> },
      { name: 'SharingAPIs', component: <SharingAPIs /> },
      { name: 'WebStorageAPIs', component: <WebStorageAPIs /> },
      { name: 'StageViewAPIs', component: <StageViewAPIs /> },
      { name: 'StageViewSelfAPIs', component: <StageViewSelfAPIs /> },
      { name: 'TeamsCoreAPIs', component: <TeamsCoreAPIs /> },
      { name: 'TeamsAPIs', component: <TeamsAPIs /> },
      { name: 'ThirdPartyCloudStorageAPIs', component: <ThirdPartyCloudStorageAPIs /> },
      { name: 'VideoAPIs', component: <VideoAPIs /> },
      { name: 'VideoExAPIs', component: <VideoExAPIs /> },
      { name: 'VisualMediaAPIs', component: <VisualMediaAPIs /> },
      { name: 'StoreAPIs', component: <StoreAPIs /> },
    ],
    [],
  );

  // Check URL for groupedMode parameter on component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const groupedModeParam = params.get(groupedModeQueryParameter);

    if (groupedModeParam) {
      setGroupedMode(true); // Automatically switch to grouped mode

      // Split the parameter by comma to support multiple sections
      const sectionsToOpen = groupedModeParam.split(',');

      // Find matching sections
      const matchingSections = sections
        .filter((section) => sectionsToOpen.some((param) => param.toLowerCase() === section.name.toLowerCase()))
        .map((section) => section.name);

      // If matching sections found, open them
      if (matchingSections.length > 0) {
        setVisibleSections(matchingSections);
        setHideButtons(true); // Hide buttons if sections are specified in query
      }
    }
  }, [sections]); // Include sections in the dependency array

  return (
    <>
      <button id="button_reload" onClick={() => window.location.reload()}>
        Reload This App
      </button>
      <button id="button_iframe" onClick={loadCurrentUrl}>
        Load Current URL in child Iframe for initialization testing
      </button>

      {/* Toggle between default and grouped mode */}
      <button onClick={() => setGroupedMode(!groupedMode)}>
        {groupedMode ? 'Show All Sections' : 'Switch to Grouped Mode'}
      </button>

      <div className="App-container">
        {iframeUrl !== null && (
          <div>
            IFRAME: <br></br>
            {/*eslint-disable-next-line @microsoft/sdl/react-iframe-missing-sandbox -- always use the sandbox attribute, but this is a test app and we fully control the content going into it, so it's okay not to here. */}
            <iframe src={iframeUrl.toString()} width="100%" height="500px" />
          </div>
        )}
        {/* Default mode: Show all sections */}
        {!groupedMode ? (
          <>
            {sections.map((section) => (
              <React.Fragment key={section.name}>{section.component}</React.Fragment>
            ))}
          </>
        ) : (
          <>
            {/* Grouped mode: Dynamically create buttons for each section */}
            {!hideButtons && (
              <>
                {sections.map((section) => (
                  <div key={section.name} className="section-content-in-grouped-mode">
                    <button className="section-button-in-grouped-mode" onClick={() => toggleSection(section.name)}>
                      {section.name}
                    </button>
                    {visibleSections.includes(section.name) && section.component}
                  </div>
                ))}
              </>
            )}

            {/* Only display visible sections if buttons are hidden */}
            {hideButtons && (
              <>
                {sections
                  .filter((section) => visibleSections.includes(section.name))
                  .map((section) => (
                    <div key={section.name}>{section.component}</div>
                  ))}
              </>
            )}
          </>
        )}
      </div>
      <Version />
    </>
  );
};
