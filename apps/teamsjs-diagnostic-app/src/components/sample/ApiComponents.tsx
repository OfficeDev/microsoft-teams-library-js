export interface ApiComponent {
  title: string;
  name: string;
  inputType: 'text' | 'checkbox' | 'none';
  onClick: any;
  defaultInput?: string;
  defaultCheckboxState?: boolean;
  label?: string;
  options: string[];
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
  },
  {
    title: 'Bar Code API',
    name: 'barCode',
    options: ['CheckBarCodeCapability', 'ScanBarCode', 'HasBarCodePermission', 'RequestBarCodePermission'],
    defaultInput: '{}',
    inputType: 'text',
    onClick: () => console.log('Barcode API called'),
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
  },
  {
    title: 'Dialog API',
    name: 'dialog',
    options: ['CheckDialogCapability'],
    inputType: 'none',
    onClick: () => console.log('Dialog API called'),
  },
  // Add more API components as needed
];

export default apiComponents;
