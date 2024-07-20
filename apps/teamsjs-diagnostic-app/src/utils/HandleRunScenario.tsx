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
    let result;
    if (api.name === 'appInstallDialog') {
      switch (func) {
        case 'CheckAppInstallCapability':
          result = await appInstallDialog_CheckAppInstallCapability();
          break;
        case 'OpenAppInstallDialog':
          result = await appInstallDialog_OpenAppInstallDialog(input);
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'barCode') {
      switch (func) {
        case 'scanBarCode':
          result = await barCode_ScanBarCode(input);
          break;
        case 'hasBarCodePermission':
          result = await barCode_HasBarCodePermission();
          break;
        case 'requestBarCodePermission':
          result = await barCode_RequestBarCodePermission();
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'calendar') {
      switch (func) {
        case 'CheckCalendarCapability':
          result = await calendar_CheckCalendarCapability();
          break;
        case 'ComposeMeeting':
          result = await calendar_ComposeMeeting(input);
          break;
        case 'OpenCalendarItem':
          result = await calendar_OpenCalendarItem(input);
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'call') {
      switch (func) {
        case 'CheckCallCapability':
          result = await call_CheckCallCapability();
          break;
        case 'StartCall':
          result = await call_StartCall(input);
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'chat') {
      switch (func) {
        case 'CheckChatCapability':
          result = await chat_CheckChatCapability();
          break;
        case 'OpenChat':
          result = await chat_OpenChat(input);
          break;
        case 'OpenGroupChat':
          result = await chat_OpenGroupChat(input);
          break;
        case 'OpenConversation':
          result = await chat_OpenConversation(input);
          break;
        case 'CloseConversation':
          result = await chat_CloseConversation();
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else if (api.name === 'dialog') {
      switch (func) {
        case 'CheckDialogCapability':
          result = await dialog_CheckDialogCapability();
          break;
        default:
          throw new Error(`Unknown function ${func} for ${api.title}`);
      }
    } else {
      throw new Error(`Unknown API component ${api.title}`);
    }

    // Log the result if needed
    console.log(`Result for ${func} on ${api.title}:`, result);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      // Log the error message and rethrow it
      console.error(`Error occurred: ${error.message}`);
      throw error;
    } else {
      // Log unexpected error types and rethrow
      console.error('An unknown error occurred.');
      throw new Error('An unknown error occurred.');
    }
  }
};
