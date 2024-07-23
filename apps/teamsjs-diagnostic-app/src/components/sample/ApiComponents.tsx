import React from 'react';
import AppInstallDialogAPIs from './../../apis/AppInstallDialogApi';
import BarCodeAPIs from './../../apis/BarCodeApi';
import DialogAPIs from '../../apis/DialogApi';
import ChatAPIs from '../../apis/ChatApi';
import CallAPIs from '../../apis/CallApi';
import CalendarAPIs from '../../apis/CalendarApi';

export interface ApiComponent {
  title: string;
  name: string;
  inputType: 'text' | 'checkbox' | 'none';
  onClick: any;
  defaultInput?: string;
  defaultCheckboxState?: boolean;
  label?: string;
  options: string[];
  renderComponent?: (props: { apiComponent: ApiComponent; onDropToScenarioBox: (api: ApiComponent, func: string, input?: string) => void }) => JSX.Element;
}

const apiComponents: ApiComponent[] = [
  {
    title: 'App Install Dialog API',
    name: 'appInstallDialog',
    options: ['OpenAppInstallDialog', 'CheckAppInstallCapability'],
    defaultInput: JSON.stringify({
      appId: '957f8a7e-fbcd-411d-b69f-acb7eb58b515',
    }),
    inputType: 'text',
    onClick: () => console.log('App Install Dialog API called'),
    renderComponent: (props) => <AppInstallDialogAPIs {...props} />
  },
  {
    title: 'Bar Code API',
    name: 'barCode',
    options: ['CheckBarCodeCapability', 'ScanBarCode', 'HasBarCodePermission', 'RequestBarCodePermission'],
    defaultInput: '{}',
    inputType: 'text',
    onClick: () => console.log('Barcode API called'),
    renderComponent: (props) => <BarCodeAPIs {...props} />
  },
  {
    title: 'Calendar API',
    name: 'calendar',
    options: ['CheckCalendarCapability', 'ComposeMeeting', 'OpenCalendarItem'],
    inputType: 'text',
    onClick: () => console.log('Calendar API called'),
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
    renderComponent: (props) => <CalendarAPIs {...props} />
  },
  {
    title: 'Call API',
    name: 'call',
    options: ['CheckCallCapability', 'StartCall'],
    defaultInput: JSON.stringify({
      targets: ['user1', 'user2'],
      requestedModalities: ['video'],
      source: 'source',
    }),
    inputType: 'text',
    onClick: () => console.log('Call API called'),
    renderComponent: (props) => <CallAPIs {...props} />
  },
  {
    title: 'Chat API',
    name: 'chat',
    options: ['CheckChatCapability', 'OpenChat', 'OpenGroupChat', 'OpenConversation', 'CloseConversation', 'GetChatMembers'],
    inputType: 'text',
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
    options: ['CheckDialogCapability'],
    inputType: 'none',
    onClick: () => console.log('Dialog API called'),
    renderComponent: (props) => <DialogAPIs {...props} />
  },
  // Add more API components as needed
];

export default apiComponents;
