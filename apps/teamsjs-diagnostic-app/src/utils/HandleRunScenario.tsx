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
    console.log(`Running scenario for ${api.name} - Function: ${func}`);
    try {
      switch (api.name) {
        case 'appInstallDialog':
          switch (func) {
            case 'CheckAppInstallCapability':
              const capabilityResult = await appInstallDialog_CheckAppInstallCapability();
              console.log(`CheckAppInstallCapability result:`, capabilityResult);
              return capabilityResult;
            case 'OpenAppInstallDialog':
              console.log(`Opening App Install Dialog with input:`, input);
              const dialogResult = await appInstallDialog_OpenAppInstallDialog(input);
              console.log(`OpenAppInstallDialog result:`, dialogResult);
              return dialogResult;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        case 'barCode':
          switch (func) {
            case 'checkBarCodeCapability':
              const barcodeCapability = await barCode_checkBarCodeCapability();
              console.log(`CheckBarCodeCapability result:`, barcodeCapability);
              return barcodeCapability;
            case 'scanBarCode':
              console.log(`Scanning Barcode with input:`, input);
              const barcodeResult = await barCode_scanBarCode(input);
              console.log(`ScanBarCode result:`, barcodeResult);
              return barcodeResult;
            case 'hasBarCodePermission':
              const hasPermission = await barCode_hasBarCodePermission();
              console.log(`HasBarCodePermission result:`, hasPermission);
              return hasPermission;
            case 'requestBarCodePermission':
              const permissionResult = await barCode_requestBarCodePermission();
              console.log(`RequestBarCodePermission result:`, permissionResult);
              return permissionResult;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        case 'calendar':
          switch (func) {
            case 'CheckCalendarCapability':
              const calendarCapability = await calendar_CheckCalendarCapability();
              console.log(`CheckCalendarCapability result:`, calendarCapability);
              return calendarCapability;
            case 'OpenCalendar':
              console.log(`Opening Calendar item with input:`, input);
              const calendarResult = await calendar_OpenCalendarItem(input);
              console.log(`OpenCalendar result:`, calendarResult);
              return calendarResult;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        case 'call':
          switch (func) {
            case 'CheckCallCapability':
              const callCapability = await call_CheckCallCapability();
              console.log(`CheckCallCapability result:`, callCapability);
              return callCapability;
            case 'StartCall':
              console.log(`Starting call with input:`, input);
              const callResult = await call_StartCall(input);
              console.log(`StartCall result:`, callResult);
              return callResult;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        case 'chat':
          switch (func) {
            case 'CheckChatCapability':
              const chatCapability = await chat_CheckChatCapability();
              console.log(`CheckChatCapability result:`, chatCapability);
              return chatCapability;
            case 'OpenChat':
              console.log(`Opening Chat with input:`, input);
              const openChatResult = await chat_OpenChat(input);
              console.log(`OpenChat result:`, openChatResult);
              return openChatResult;
            case 'OpenGroupChat':
              console.log(`Opening Group Chat with input:`, input);
              const openGroupChatResult = await chat_OpenGroupChat(input);
              console.log(`OpenGroupChat result:`, openGroupChatResult);
              return openGroupChatResult;
            case 'OpenConversation':
              console.log(`Opening Conversation with input:`, input);
              const openConversationResult = await chat_OpenConversation(input);
              console.log(`OpenConversation result:`, openConversationResult);
              return openConversationResult;
            case 'CloseConversation':
              console.log(`Closing Conversation`);
              const closeConversationResult = await chat_CloseConversation();
              console.log(`CloseConversation result:`, closeConversationResult);
              return closeConversationResult;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        case 'dialog':
          switch (func) {
            case 'CheckDialogCapability':
              const dialogCapability = await dialog_CheckDialogCapability();
              console.log(`CheckDialogCapability result:`, dialogCapability);
              return dialogCapability;
            default:
              throw new Error(`Unknown function ${func} for ${api.name}`);
          }
        default:
          throw new Error(`Unknown API component ${api.name}`);
      }
    } catch (error) {
      console.error(`Error running scenario for ${api.name} - Function: ${func}`, error);
      throw error;
    }
  };
