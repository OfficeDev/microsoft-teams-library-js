import { AdaptiveCardDialogInfo, barCode } from '@microsoft/teams-js';
import {
  appInstallDialog_CheckAppInstallCapability,
  appInstallDialog_OpenAppInstallDialog,
  AppInstallDialogInput
} from '../apis/AppInstallDialogApi';
import {
  barCode_CheckBarCodeCapability,
  barCode_HasBarCodePermission,
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
import { dialogCard_CheckDialogAdaptiveCardCapability, dialogCard_OpenAdaptiveCardDialog } from '../apis/DialogCardApi';

export const handleRunScenario = async (api: ApiComponent, func: string, input?: string) => {
  try {
    let result;

    switch (api.name) {
      case 'appInstallDialog':
        switch (func) {
          case 'CheckAppInstallCapability':
            result = await appInstallDialog_CheckAppInstallCapability();
            break;
          case 'OpenAppInstallDialog':
            if (input) {
              const parsedInput: AppInstallDialogInput = JSON.parse(input);
              result = await appInstallDialog_OpenAppInstallDialog(parsedInput);
            } else {
              throw new Error('Input is required for OpenAppInstallDialog');
            }
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;

        case 'barCode':
          switch (func) {
            case 'CheckBarCodeCapability':
              result = await barCode_CheckBarCodeCapability();
              break;
            case 'ScanBarCode':
              if (input) {
                try {
                  const parsedInput: barCode.BarCodeConfig = JSON.parse(input);
                  result = await barCode_ScanBarCode(parsedInput);
                } catch (error) {
                  throw new Error('Invalid input format for ScanBarCode');
                }
              } else {
                throw new Error('Input is required for ScanBarCode');
              }
              break;  
            case 'HasBarCodePermission':
              result = await barCode_HasBarCodePermission();
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
            case 'ComposeMeeting':
              if (input) {
                result = await calendar_ComposeMeeting(input);
              } else {
                throw new Error('Input is required for ComposeMeeting');
              }
              break;
            case 'OpenCalendarItem':
              if (input) {
                result = await calendar_OpenCalendarItem(input);
              } else {
                throw new Error('Input is required for OpenCalendarItem');
              }
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
            if (input) {
              result = await call_StartCall(input);
            } else {
              throw new Error('Input is required for StartCall');
            }
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
            if (input) {
              result = await chat_OpenChat(input);
            } else {
              throw new Error('Input is required for OpenChat');
            }
            break;
          case 'OpenGroupChat':
            if (input) {
              result = await chat_OpenGroupChat(input);
            } else {
              throw new Error('Input is required for OpenGroupChat');
            }
            break;
          case 'OpenConversation':
            if (input) {
              result = await chat_OpenConversation(input);
            } else {
              throw new Error('Input is required for OpenConversation');
            }
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

        case 'dialogCard':
        switch (func) {
          case 'CheckDialogAdaptiveCardCapability':
            result = await dialogCard_CheckDialogAdaptiveCardCapability();
            break;
            case 'OpenAdaptiveCardDialog':
              if (input) {
                try {
                  const parsedInput: AdaptiveCardDialogInfo = JSON.parse(input);
                  result = await dialogCard_OpenAdaptiveCardDialog(parsedInput);
                } catch (error) {
                  console.log('Invalid input format for OpenAdaptiveCardDialog');
                  throw new Error('Invalid input format for OpenAdaptiveCardDialog');
                }
              } else {
                throw new Error('Input is required for OpenAdaptiveCardDialog');
              }
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
    if (error instanceof Error) {
      console.error(`Error occurred: ${error.message}`);
      throw error;
    } else {
      console.error('An unknown error occurred.');
      throw new Error('An unknown error occurred.');
    }
  }
};
