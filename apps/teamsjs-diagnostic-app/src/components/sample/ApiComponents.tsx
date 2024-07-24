import React from 'react';
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
    defaultInput: JSON.stringify({ appId: '957f8a7e-fbcd-411d-b69f-acb7eb58b515' }),
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
    defaultInput: '{}',
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
      targets: ['user1', 'user2'],
      requestedModalities: ['video'],
      source: 'source',
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
    }),
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
    }),
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
];

export default apiComponents;
