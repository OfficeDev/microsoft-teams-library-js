import { ApiComponent } from '../components/sample/ApiComponents';
import {
  appInstallDialog_CheckAppInstallCapability,
  appInstallDialog_OpenAppInstallDialog
} from '../apis/AppInstallDialogApi';
import {
  barCode_checkBarCodeCapability,
  barCode_hasBarCodePermission,
  barCode_requestBarCodePermission,
  barCode_scanBarCode
} from '../apis/BarCodeApi';
import {
  calendar_CheckCalendarCapability,
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
import {
  dialog_CheckDialogCapability
} from '../apis/DialogApi';

export const handleRunScenario = async (api: ApiComponent, func: string, input?: any) => {
  console.log(`Starting ${func} for ${api.title} with input:`, input);

  try {
    let result;
    switch (api.name) {
      case 'appInstallDialog':
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
        break;
      case 'barCode':
        switch (func) {
          case 'checkBarCodeCapability':
            result = await barCode_checkBarCodeCapability();
            break;
          case 'scanBarCode':
            result = await barCode_scanBarCode(input);
            break;
          case 'hasBarCodePermission':
            result = await barCode_hasBarCodePermission();
            break;
          case 'requestBarCodePermission':
            result = await barCode_requestBarCodePermission();
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;
      case 'calendar':
        switch (func) {
          case 'CheckCalendarCapability':
            result = await calendar_CheckCalendarCapability();
            break;
          case 'OpenCalendar':
            result = await calendar_OpenCalendarItem(input);
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;
      case 'call':
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
        break;
      case 'chat':
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
        break;
      case 'dialog':
        switch (func) {
          case 'CheckDialogCapability':
            result = await dialog_CheckDialogCapability();
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;
      default:
        throw new Error(`Unknown API component ${api.title}`);
    }
    return result;
  } catch (error) {
    console.error(`Error executing ${func} of ${api.title}:`, error);
    throw error;
  }
};
