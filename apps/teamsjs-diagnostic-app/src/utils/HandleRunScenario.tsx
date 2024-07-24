import { AdaptiveCardDialogInfo, barCode, people, profile, stageView } from '@microsoft/teams-js';
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
import { pages_CheckCapability, pages_GetConfig, pages_NavigateCrossDomain, pages_NavigateToApp, pages_RegisterFocusEnterHandler, pages_RegisterFullScreenChangeHandler, pages_SetCurrentFrame, pages_ShareDeepLink } from '../apis/PagesApi';
import { profile_CheckProfileCapability, profile_ShowProfile } from '../apis/ProfileApi';
import { search_CloseSearch, search_RegisterHandlers } from '../apis/SearchApi';
import { clipboard_CheckClipboardCapability, clipboard_CopyImage, clipboard_CopyText, clipboard_Paste } from '../apis/ClipboardApi';
import { geolocation_CheckGeoLocationCapability, geolocation_CheckGeoLocationMapCapability, geolocation_ChooseLocation, geolocation_GetCurrentLocation } from '../apis/GeolocationApi';
import { sharing_CheckSharingCapability, sharing_ShareWebContent } from '../apis/SharingApi';
import { stageView_CheckStageViewCapability, stageView_OpenStageView } from '../apis/StageViewApi';
import { people_CheckPeopleCapability, people_SelectPeople } from '../apis/PeopleApi';

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

    case 'pages':
        switch (func) {
          case 'CheckCapability':
            result = await pages_CheckCapability();
            break;
            case 'NavigateCrossDomain':
              if (typeof input === 'string') {
                try {
                  await pages_NavigateCrossDomain(input);
                } catch (error) {
                  console.log('Invalid input format for NavigateCrossDomain', error);
                  throw new Error('Invalid input format for NavigateCrossDomain');
                }
              } else {
                throw new Error('Input must be a string for NavigateCrossDomain');
              }
              break;
          case 'NavigateToApp':
            if (input) {
              try {
                const parsedInput = JSON.parse(input);
                result = await pages_NavigateToApp(parsedInput);
              } catch (error) {
                console.log('Invalid input format for NavigateToApp');
                throw new Error('Invalid input format for NavigateToApp');
              }
            } else {
              throw new Error('Input is required for NavigateToApp');
            }
            break;
          case 'ShareDeepLink':
            if (input) {
              try {
                const parsedInput = JSON.parse(input);
                result = await pages_ShareDeepLink(parsedInput);
              } catch (error) {
                console.log('Invalid input format for ShareDeepLink');
                throw new Error('Invalid input format for ShareDeepLink');
              }
            } else {
              throw new Error('Input is required for ShareDeepLink');
            }
            break;
          case 'SetCurrentFrame':
            if (input) {
              try {
                const parsedInput = JSON.parse(input);
                result = await pages_SetCurrentFrame(parsedInput);
              } catch (error) {
                console.log('Invalid input format for SetCurrentFrame');
                throw new Error('Invalid input format for SetCurrentFrame');
              }
            } else {
              throw new Error('Input is required for SetCurrentFrame');
            }
            break;
          case 'GetConfig':
            result = await pages_GetConfig();
            break;
          case 'RegisterFocusEnterHandler':
            result = await pages_RegisterFocusEnterHandler();
            break;
          case 'RegisterFullScreenChangeHandler':
            result = await pages_RegisterFullScreenChangeHandler();
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;

    case 'profile':
    switch (func) {
      case 'CheckProfileCapability':
        result = await profile_CheckProfileCapability;
        break;
        case 'ShowProfile':
      try {
        if (!input) {
          throw new Error('Input value for ShowProfile is missing.');
        }

        const showProfileRequest: profile.ShowProfileRequest = JSON.parse(input);

        await profile_ShowProfile(showProfileRequest);
        result = 'Profile displayed successfully.';
      } catch (error: unknown) {
        if (error instanceof Error) {
          result = `Error displaying profile: ${error.message}`;
        } else {
          result = `Unknown error occurred: ${String(error)}`;
        }
      }
      break;

    default:
      result = `Function ${func} is not recognized for profile API.`;
      break;
  }
  break;

  case 'search':
    switch (func) {
      case 'RegisterHandlers':
        result = await search_RegisterHandlers();
        break;
      case 'CloseSearch':
          try {
            result = await search_CloseSearch();
          } catch (error) {
            console.error('Error closing search:', error);
            throw error;
          }
          break;
          default:
            result = `Function ${func} is not recognized for profile API.`;
            break;
      }
      break;

      case 'clipboard':
        switch (func) {
          case 'CheckClipboardCapability':
            try {
              result = await clipboard_CheckClipboardCapability();
            } catch (error) {
              console.log('Error checking clipboard capability:', error);
              throw error;
            }
            break;
            case 'CopyText':
              if (input) {
                try {
                  const parsedInput = JSON.parse(input);
                  if (typeof parsedInput === 'object' && 'text' in parsedInput) {
                    result = await clipboard_CopyText(parsedInput);
                  } else {
                    throw new Error('Error: Parsed input for CopyText is not valid');
                  }
                } catch (error) {
                  console.error('Error copying text:', error);
                  throw error
                }
              } else {
                throw new Error('Error: Input is required for CopyText');
              }
              break;
            case 'CopyImage':
              if (input) {
                try {
                  const parsedInput = JSON.parse(input);
                  if (typeof parsedInput === 'object' && 'mimeType' in parsedInput) {
                    result = await clipboard_CopyImage(parsedInput);
                  } else {
                    throw new Error('Error: Parsed input for CopyImage is not valid');
                  }
                } catch (error) {
                  console.log('Error copying image:', error);
                  throw error;
                }
              } else {
                throw new Error('Error: Input is required for CopyImage');
              }
          break;
          case 'Paste':
            try {
              result = await clipboard_Paste();
            } catch (error) {
              console.error('Error pasting from clipboard:', error);
              result = `Error: ${error}`;
            }
            break;
          default:
            console.error('Unknown function:', func);
            result = `Unknown function: ${func}`;
            break;
        }
        break;

        case 'geolocation':
        switch (func) {
          case 'CheckGeoLocationCapability':
            result = await geolocation_CheckGeoLocationCapability();
            break;
            case 'CheckGeoLocationMapCapability':
              result = await geolocation_CheckGeoLocationMapCapability();
              break;
          case 'GetCurrentLocation':
            result = await geolocation_GetCurrentLocation();
            break;
          case 'ChooseLocation':
            result = await geolocation_ChooseLocation();
            break;
          default:
            throw new Error(`Unknown function ${func} for ${api.title}`);
        }
        break;

        case 'sharing':
          switch (func) {
            case 'CheckSharingCapability':
              result = await sharing_CheckSharingCapability();
              break;
            case 'ShareWebContent':
              if (input) {
                try {
                  const parsedInput = JSON.parse(input);
                  result = await sharing_ShareWebContent(parsedInput);
                } catch (error) {
                  console.log('Invalid input format for ShareWebContent');
                  throw new Error('Invalid input format for ShareWebContent');
                }
              } else {
                throw new Error('Input is required for ShareWebContent');
              }
              break;
            default:
              throw new Error(`Unknown function ${func} for ${api.title}`);
          }
          break;
  
        default:
          throw new Error(`Unknown API ${api.name}`);

          case 'stageView':
            switch (func) {
              case 'CheckStageViewCapability':
                result = await stageView_CheckStageViewCapability();
                break;
              case 'OpenStageView':
                if (input) {
                  try {
                    const parsedInput = JSON.parse(input);
                    const { appId, contentUrl, threadId, title, websiteUrl, entityId, openMode } = parsedInput;
                    result = await stageView_OpenStageView({
                      appId,
                      contentUrl,
                      threadId,
                      title,
                      websiteUrl,
                      entityId,
                      openMode: openMode || stageView.StageViewOpenMode.modal
                    });
                  } catch (error) {
                    console.error('Invalid input format for OpenStageView', error);
                    throw new Error('Invalid input format for OpenStageView');
                  }
                } else {
                  throw new Error('Input is required for OpenStageView');
                }
                break;
              default:
                throw new Error(`Unknown function ${func} for ${api.title}`);
            }
            break;

            case 'people':
              switch (func) {
                case 'CheckPeopleCapability':
                  result = await people_CheckPeopleCapability();
                  break;
                case 'SelectPeople':
                    try {
                      // Check if input is provided and is a valid JSON string
                      const parsedInput = input ? JSON.parse(input) : undefined;
                  
                      result = await people_SelectPeople(parsedInput);
                  
                    } catch (error) {
                      if (error instanceof SyntaxError) {
                        console.log('Invalid input format for SelectPeople');
                        throw new Error('Invalid input format for SelectPeople');
                      } else {
                        console.log('Error during SelectPeople operation');
                        throw new Error('Error during SelectPeople operation');
                      }
                    }
                    break;
                  
                  default:
                    throw new Error(`Unknown function ${func} for ${api.title}`);
                  
              }
              break;
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
