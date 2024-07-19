import {
  appInstallDialog_CheckAppInstallCapability,
  appInstallDialog_OpenAppInstallDialog
} from '../apis/AppInstallDialogApi';
import {
  barCode_HasBarCodePermission,
  barCode_RequestBarCodePermission,
  barCode_ScanBarCode,
} from '../apis/BarCodeApi';
import {
  calendar_CheckCalendarCapability,
  calendar_ComposeMeeting,
  calendar_OpenCalendarItem
} from '../apis/CalendarApi';
import {
  call_CheckCallCapability,
  call_StartCall
} from '../apis/CallApi';
import {
  chat_CheckChatCapability,
  chat_CloseConversation,
  chat_OpenChat,
  chat_OpenConversation,
  chat_OpenGroupChat
} from '../apis/ChatApi';
import { dialog_CheckDialogCapability } from '../apis/DialogApi';
import { ApiComponent } from '../components/sample/ApiComponents';

export const handleRunScenario = async (api: ApiComponent, func: string, input?: string) => {
  try {
    if (api.name === 'appInstallDialog') {
      switch (func) {
        case 'CheckAppInstallCapability':
          return await appInstallDialog_CheckAppInstallCapability();
        case 'OpenAppInstallDialog':
          return await appInstallDialog_OpenAppInstallDialog(input);
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'barCode') {
      switch (func) {
        case 'scanBarCode':
          return await barCode_ScanBarCode(input);
        case 'hasBarCodePermission':
          return await barCode_HasBarCodePermission();
        case 'requestBarCodePermission':
          return await barCode_RequestBarCodePermission();
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'calendar') {
      switch (func) {
        case 'CheckCalendarCapability':
          return await calendar_CheckCalendarCapability();
        case 'ComposeMeeting':
          return await calendar_ComposeMeeting(input);
        case 'OpenCalendarItem':
          return await calendar_OpenCalendarItem(input);
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'call') {
      switch (func) {
        case 'CheckCallCapability':
          return await call_CheckCallCapability();
        case 'StartCall':
          return await call_StartCall(input);
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'chat') {
      switch (func) {
        case 'CheckChatCapability':
          return await chat_CheckChatCapability();
        case 'OpenChat':
          return await chat_OpenChat(input);
        case 'OpenGroupChat':
          return await chat_OpenGroupChat(input);
        case 'OpenConversation':
          return await chat_OpenConversation(input);
        case 'CloseConversation':
          return await chat_CloseConversation();
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'dialog') {
      switch (func) {
        case 'CheckDialogCapability':
          return await dialog_CheckDialogCapability();
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else {
      throw new Error(`Unknown API component ${api.title}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Handle the error appropriately
      console.log(error.message || 'An error occurred while executing the API function.');
    } else {
      // Handle unexpected error types
      console.log('An unknown error occurred.');
    }
  }
};
