import AppInstallDialogAPIs from './../../apis/AppInstallDialogApi';
import BarCodeAPIs from './../../apis/BarCodeApi';
import DialogAPIs from '../../apis/DialogApi';
import ChatAPIs from '../../apis/ChatApi';
import CallAPIs from '../../apis/CallApi';
import CalendarAPIs from '../../apis/CalendarApi';
import DialogCardAPIs from '../../apis/DialogCardApi';
import PagesAPIs from '../../apis/PagesApi';
import ProfileAPIs from '../../apis/ProfileApi';
import SearchAPIs from '../../apis/SearchApi';
import ClipboardAPIs from '../../apis/ClipboardApi';
import GeolocationAPIs from '../../apis/GeolocationApi';
import SharingAPIs from '../../apis/SharingApi';
import StageViewAPIs from '../../apis/StageViewApi';
import { stageView } from '@microsoft/teams-js';
import PeopleAPIs from '../../apis/PeopleApi';
import MenusAPIs from '../../apis/MenusApi';
import PagesTabsAPIs from '../../apis/PagesTabsApi';
import TeamsCoreAPIs from '../../apis/TeamsCoreApi';
import SecondaryBrowserAPIs from '../../apis/SecondaryBrowserApi';

export interface ApiComponent {
  title: string;
  name: string;
  functions: {
    name: string;
    requiresInput: boolean;
  }[];
  defaultInput?: string;
  onClick: any;
  renderComponent?: (props: { apiComponent: ApiComponent; onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void }) => JSX.Element;
}

const apiComponents: ApiComponent[] = [
  {
    title: 'App Install Dialog API',
    name: 'appInstallDialog',
    functions: [
      { name: 'OpenAppInstallDialog', requiresInput: true },
      { name: 'CheckAppInstallCapability', requiresInput: false },
    ],
    defaultInput: JSON.stringify({ 
      OpenAppInstallDialog: {appId: '957f8a7e-fbcd-411d-b69f-acb7eb58b515'} }),
    onClick: () => console.log('App Install Dialog API called'),
    renderComponent: (props) => <AppInstallDialogAPIs {...props} />
  },
  {
    title: 'Bar Code API',
    name: 'barCode',
    functions: [
      { name: 'CheckBarCodeCapability', requiresInput: false },
      { name: 'ScanBarCode', requiresInput: true },
      { name: 'HasBarCodePermission', requiresInput: false },
    ],
    defaultInput: JSON.stringify({
      ScanBarCode: '{}' }),
    onClick: () => console.log('Barcode API called'),
    renderComponent: (props) => <BarCodeAPIs {...props} />
  },
  {
    title: 'Calendar API',
    name: 'calendar',
    functions: [
      { name: 'CheckCalendarCapability', requiresInput: false },
      { name: 'ComposeMeeting', requiresInput: true },
      { name: 'OpenCalendarItem', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      ComposeMeeting: {
        attendees: ['attendees'],
        startTime: 'startTime',
        endTime: 'endTime',
        subject: 'subject',
        content: 'content',
      },
      OpenCalendarItem: {
        itemId: '123',
      },
    }),
    onClick: () => console.log('Calendar API called'),
    renderComponent: (props) => <CalendarAPIs {...props} />
  },
  {
    title: 'Call API',
    name: 'call',
    functions: [
      { name: 'CheckCallCapability', requiresInput: false },
      { name: 'StartCall', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      StartCall: {
        targets: ['user1', 'user2'],
        requestedModalities: ['video'],
        source: 'source',
      }
    }),
    onClick: () => console.log('Call API called'),
    renderComponent: (props) => <CallAPIs {...props} />
  },
  {
    title: 'Chat API',
    name: 'chat',
    functions: [
      { name: 'CheckChatCapability', requiresInput: false },
      { name: 'OpenChat', requiresInput: true },
      { name: 'OpenGroupChat', requiresInput: true },
      { name: 'OpenConversation', requiresInput: true },
      { name: 'CloseConversation', requiresInput: false },
    ],
    defaultInput: JSON.stringify({
      OpenChat: {
        user: 'testUpn',
        message: 'testMessage',
      },
      OpenGroupChat: {
        users: ['testUpn1', 'testUpn2'],
        message: 'testMessage',
      },
      OpenConversation: {
        entityId: 'entityId1',
        title: 'title1',
        subEntityId: 'subEntityId1',
      },
    }),
    onClick: () => console.log('Chat API called'),
    renderComponent: (props) => <ChatAPIs {...props} />
  },
  {
    title: 'Dialog API',
    name: 'dialog',
    functions: [
      { name: 'CheckDialogCapability', requiresInput: false },
    ],
    onClick: () => console.log('Dialog API called'),
    renderComponent: (props) => <DialogAPIs {...props} />
  },
  {
    title: 'DialogCard API',
    name: 'dialogCard',
    functions: [
      { name: 'CheckDialogAdaptiveCardCapability', requiresInput: false },
      { name: 'OpenAdaptiveCardDialog', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      OpenAdaptiveCardDialog:{
      card: {
        type: "AdaptiveCard",
        version: "1.0",
        body: [
          {
            type: "TextBlock",
            text: "Hello, Adaptive Card!"
          }
        ]
      }
  } }),
    onClick: () => console.log('DialogCard API called'),
    renderComponent: (props) => <DialogCardAPIs {...props} />
  },
  {
    title: 'Pages API',
    name: 'pages',
    functions: [
      { name: 'CheckCapability', requiresInput: false },
      { name: 'GetConfig', requiresInput: false },
      { name: 'NavigateCrossDomain', requiresInput: true },
      { name: 'NavigateToApp', requiresInput: true },
      { name: 'ShareDeepLink', requiresInput: true },
      { name: 'RegisterFocusEnterHandler', requiresInput: false },
      { name: 'SetCurrentFrame', requiresInput: true },
      { name: 'RegisterFullScreenChangeHandler', requiresInput: false }
    ],
    defaultInput: JSON.stringify({
      NavigateCrossDomain: 'https://localhost:4000',
      NavigateToApp: {
        appId: 'appIdA',
        pageId: 'pageIdB',
        webUrl: 'webUrlC',
        subPageId: 'subPageIdD',
        channelId: 'channelIdE',
      },
    ShareDeepLink: {
        subEntityId: 'subEntityIdA',
        subEntityLabel: 'subEntityLabelB',
        subEntityWebUrl: 'subEntityWebUrlC',
        subPageId: 'subPageIdD',
        subPageLabel: 'subPageLabelE',
        subPageWebUrl: 'subPageWebUrlF',
      },
      SetCurrentFrame: {
        websiteUrl: 'https://www.bing.com',
        contentUrl: 'https://www.bing.com',
      },
    }),
    onClick: () => console.log('Pages API called'),
    renderComponent: (props) => <PagesAPIs {...props} />
  },
  {
    title: 'Profile API',
    name: 'profile',
    functions: [
      { name: 'CheckProfileCapability', requiresInput: false },
      { name: 'ShowProfile', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      ShowProfile: {
      modality: 'Card',
      persona: {
        identifiers: {
          Smtp: 'test@microsoft.com',
        },
      },
      targetElementBoundingRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      triggerType: 'MouseClick',
  } }),
    onClick: () => console.log('Profile API called'),
    renderComponent: (props) => <ProfileAPIs {...props} />
  },
  {
    title: 'Search API',
    name: 'search',
    functions: [
      { name: 'RegisterHandlers', requiresInput: false },
      { name: 'CloseSearch', requiresInput: false }
    ],
    onClick: () => console.log('Search API called'),
    renderComponent: (props) => <SearchAPIs {...props} />
  },
  {
    title: 'Clipboard API',
    name: 'clipboard',
    functions: [
      { name: 'CheckClipboardCapability', requiresInput: false },
      { name: 'CopyText', requiresInput: true },
      { name: 'CopyImage', requiresInput: true },
      { name: 'Paste', requiresInput: false }
    ],
    defaultInput: JSON.stringify({
      CopyText: { text: 'copy this test' },
      CopyImage: { mimeType: 'image/jpeg' }
    }),    
    onClick: () => console.log('Clipboard API called'),
    renderComponent: (props) => <ClipboardAPIs {...props} />
  },
  {
    title: 'GeolocationAPI',
    name: 'geolocation',
    functions: [
      { name: 'CheckGeoLocationCapability', requiresInput: false },
      { name: 'CheckGeoLocationMapCapability', requiresInput: false },
      { name: 'HasGeoLocationPermission', requiresInput: false },
      { name: 'RequestGeoLocationPermission', requiresInput: false },
      { name: 'GetCurrentLocation', requiresInput: false },
      { name: 'ChooseLocation', requiresInput: false },
    ],
    onClick: () => console.log('Geolocation API called'),
    renderComponent: (props) => <GeolocationAPIs {...props} />
  },
  {
    title: 'Sharing API',
    name: 'sharing',
    functions: [
      { name: 'CheckSharingCapability', requiresInput: false },
      { name: 'ShareWebContent', requiresInput: true }
    ],
    defaultInput: JSON.stringify({
      ShareWebContent: {
      content: [
        {
          type: 'URL',
          url: 'https://www.bing.com',
          message: 'Bing message',
          preview: false,
        },
      ],
  } }),    
    onClick: () => console.log('Sharing API called'),
    renderComponent: (props) => <SharingAPIs {...props} />
  },
  {
    title: 'StageView API',
    name: 'stageView',
    functions: [
      { name: 'CheckStageViewCapability', requiresInput: false },
      { name: 'OpenStageView', requiresInput: true }
    ],
    defaultInput: JSON.stringify({
      OpenStageView: {
      appId: 'appId1',
      contentUrl: 'contentUrl1',
      threadId: 'threadId1',
      title: 'title1',
      websiteUrl: 'websiteUrl1',
      entityId: 'entityId1',
      openMode: stageView.StageViewOpenMode.modal,
  } }), 
    onClick: () => console.log('StageView API called'),
    renderComponent: (props) => <StageViewAPIs {...props} />
  },
  {
    title: 'People API',
    name: 'people',
    functions: [
      { name: 'CheckPeopleCapability', requiresInput: false },
      { name: 'SelectPeople', requiresInput: true }
    ],
    defaultInput: JSON.stringify({
      SelectPeople: {
      title: 'Select people',
      setSelected: ['id1', 'id2', 'id3'],
      openOrgWideSearchInChatOrChannel: true,
      singleSelect: true,
    } }),
    onClick: () => console.log('People API called'),
    renderComponent: (props) => <PeopleAPIs {...props} />
  },
  {
    title: 'Menus API',
    name: 'menus',
    functions: [
      { name: 'CheckMenusCapability', requiresInput: false },
      { name: 'SetUpViews', requiresInput: true },
      { name: 'SetNavBarMenu', requiresInput: true },
      { name: 'ShowActionMenu', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      SetUpViews: { id: 'AAA', title: 'BBB', contentDescription: 'CCC' },
      SetNavBarMenu: { id: 'AAA', title: 'BBB', icon: 'CCC', enabled: true, selected: false },
      ShowActionMenu: {
        title: 'Title',
        items: [{ id: 'AAA', title: 'BBB', icon: 'CCC', enabled: true, selected: false }]
      }
    }),
    onClick: () => console.log('Menus API called'),
    renderComponent: (props) => <MenusAPIs {...props} />
  },
  {
    title: 'PagesTabs API',
    name: 'pagesTabs',
    functions: [
      { name: 'CheckPagesTabsCapability', requiresInput: false },
      { name: 'NavigateToTab', requiresInput: true },
      { name: 'GetTabInstances', requiresInput: true },
      { name: 'GetMruTabInstances', requiresInput: true },
    ],
    defaultInput: JSON.stringify({
      NavigateToTab: {
        tabName: 'tab1',
        internalTabInstanceId: 'internalTab1',
        lastViewUnixEpochTime: '0',
        entityId: 'entity1',
        channelid: 'channel1',
        channelName: 'channelName1',
        channelIsFavorite: false,
        teamId: 'team1',
        teamName: 'teamName1',
        teamIsFavorite: false,
        groupId: 'group1',
        url: 'https://localhost:4000',
        websiteUrl: 'https://localhost:4000',
      },
      GetTabInstances: { favoriteChannelOnly: false, favoriteTeamsOnly: false },
      GetMruTabInstances: { favoriteChannelOnly: false, favoriteTeamsOnly: false }
    }),
    onClick: () => console.log('PagesTabs API called'),
    renderComponent: (props) => <PagesTabsAPIs {...props} />
  },
  {
    title: 'TeamsCore API',
    name: 'teamsCore',
    functions: [
      { name: 'CheckTeamsCoreCapability', requiresInput: false },
      { name: 'EnablePrintCapability', requiresInput: false },
      { name: 'Print', requiresInput: false },
      { name: 'RegisterOnLoadHandler', requiresInput: false },
      { name: 'RegisterBeforeUnloadHandler', requiresInput: true }
    ],
    defaultInput: JSON.stringify ({ 
      RegisterBeforeUnloadHandler: '4' }),
    onClick: () => console.log('TeamsCore API called'),
    renderComponent: (props) => <TeamsCoreAPIs {...props} />
  },
  {
    title: 'SecondaryBrowser API',
    name: 'secondaryBrowser',
    functions: [
      { name: 'CheckSecondaryBrowserCapability', requiresInput: false },
      { name: 'Open', requiresInput: true },
    ],
    defaultInput: JSON.stringify({ Open: "https://www.bing.com" }),
    onClick: () => console.log('SecondaryBrowser API called'),
    renderComponent: (props) => <SecondaryBrowserAPIs {...props} />
  },
];

export default apiComponents;
