import {
  AdaptiveCardDialogInfo,
  barCode,
  profile,
  stageView
} from '@microsoft/teams-js';

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
import { dialogCard_CheckDialogAdaptiveCardCapability, dialogCard_OpenAdaptiveCardDialog } from '../apis/DialogCardApi';
import { ApiComponent } from '../components/sample/ApiComponents';
import {
  pages_CheckCapability,
  pages_GetConfig,
  pages_NavigateCrossDomain,
  pages_NavigateToApp,
  pages_RegisterFocusEnterHandler,
  pages_RegisterFullScreenChangeHandler,
  pages_SetCurrentFrame,
  pages_ShareDeepLink
} from '../apis/PagesApi';

import { profile_CheckProfileCapability, profile_ShowProfile } from '../apis/ProfileApi';
import { search_CloseSearch, search_RegisterHandlers } from '../apis/SearchApi';
import { clipboard_CheckClipboardCapability, clipboard_CopyImage, clipboard_CopyText, clipboard_Paste } from '../apis/ClipboardApi';
import {
  geolocation_CheckGeoLocationCapability,
  geolocation_CheckGeoLocationMapCapability,
  geolocation_ChooseLocation,
  geolocation_GetCurrentLocation,
  geolocation_HasGeoLocationPermission,
  geolocation_RequestGeoLocationPermission
} from '../apis/GeolocationApi';

import { sharing_CheckSharingCapability, sharing_ShareWebContent } from '../apis/SharingApi';
import { stageView_CheckStageViewCapability, stageView_OpenStageView } from '../apis/StageViewApi';
import { people_CheckPeopleCapability, people_SelectPeople } from '../apis/PeopleApi';
import { menus_CheckMenusCapability, menus_SetNavBarMenu, menus_SetUpViews, menus_ShowActionMenu } from '../apis/MenusApi';
import {
  pagesTabs_CheckPagesTabsCapability,
  pagesTabs_GetMruTabInstances,
  pagesTabs_GetTabInstances,
  pagesTabs_NavigateToTab
} from '../apis/PagesTabsApi';

import {
  teamsCore_CheckTeamsCoreCapability,
  teamsCore_EnablePrintCapability,
  teamsCore_Print,
  teamsCore_RegisterBeforeUnloadHandler,
  teamsCore_RegisterOnLoadHandler
} from '../apis/TeamsCoreApi';

import { secondaryBrowser_CheckSecondaryBrowserCapability, secondaryBrowser_Open } from '../apis';

const appInstallDialogHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckAppInstallCapability':
      return await appInstallDialog_CheckAppInstallCapability();
    case 'OpenAppInstallDialog':
      if (input) {
        const parsedInput: AppInstallDialogInput = JSON.parse(input);
        return await appInstallDialog_OpenAppInstallDialog(parsedInput);
      } else {
        throw new Error('Input is required for OpenAppInstallDialog');
      }
    default:
      throw new Error(`Unknown function ${func} for App Install Dialog API`);
  }
};

const barCodeHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckBarCodeCapability':
      return await barCode_CheckBarCodeCapability();
    case 'ScanBarCode':
      if (input) {
        try {
          const parsedInput: barCode.BarCodeConfig = JSON.parse(input);
          return await barCode_ScanBarCode(parsedInput);
        } catch (error) {
          throw new Error('Invalid input format for ScanBarCode');
        }
      } else {
        throw new Error('Input is required for ScanBarCode');
      }
    case 'HasBarCodePermission':
      return await barCode_HasBarCodePermission();
    default:
      throw new Error(`Unknown function ${func} for BarCode API`);
  }
};

const calendarHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckCalendarCapability':
      return await calendar_CheckCalendarCapability();
    case 'ComposeMeeting':
      if (input) {
        return await calendar_ComposeMeeting(input);
      } else {
        throw new Error('Input is required for ComposeMeeting');
      }
    case 'OpenCalendarItem':
      if (input) {
        return await calendar_OpenCalendarItem(input);
      } else {
        throw new Error('Input is required for OpenCalendarItem');
      }
    default:
      throw new Error(`Unknown function ${func} for Calendar API`);
  }
};

const callHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckCallCapability':
      return await call_CheckCallCapability();
    case 'StartCall':
      if (input) {
        return await call_StartCall(input);
      } else {
        throw new Error('Input is required for StartCall');
      }
    default:
      throw new Error(`Unknown function ${func} for Call API`);
  }
};

const chatHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckChatCapability':
      return await chat_CheckChatCapability();
    case 'OpenChat':
      if (input) {
        return await chat_OpenChat(input);
      } else {
        throw new Error('Input is required for OpenChat');
      }
    case 'OpenGroupChat':
      if (input) {
        return await chat_OpenGroupChat(input);
      } else {
        throw new Error('Input is required for OpenGroupChat');
      }
    case 'OpenConversation':
      if (input) {
        return await chat_OpenConversation(input);
      } else {
        throw new Error('Input is required for OpenConversation');
      }
    case 'CloseConversation':
      return await chat_CloseConversation();
    default:
      throw new Error(`Unknown function ${func} for Chat API`);
  }
};

const dialogHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckDialogCapability':
      return await dialog_CheckDialogCapability();
    default:
      throw new Error(`Unknown function ${func} for Dialog API`);
  }
};

const dialogCardHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckDialogAdaptiveCardCapability':
      return await dialogCard_CheckDialogAdaptiveCardCapability();
    case 'OpenAdaptiveCardDialog':
      if (input) {
        try {
          const parsedInput: AdaptiveCardDialogInfo = JSON.parse(input);
          return await dialogCard_OpenAdaptiveCardDialog(parsedInput);
        } catch (error) {
          console.log('Invalid input format for OpenAdaptiveCardDialog');
          throw new Error('Invalid input format for OpenAdaptiveCardDialog');
        }
      } else {
        throw new Error('Input is required for OpenAdaptiveCardDialog');
      }
      default:
        throw new Error(`Unknown function ${func} for Dialog Card API`);
    }
};

const pagesHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckCapability':
      return await pages_CheckCapability();
      case 'NavigateCrossDomain':
        if (typeof input === 'string') {
          try {
            return await pages_NavigateCrossDomain(input);
          } catch (error) {
            console.log('Invalid input format for NavigateCrossDomain', error);
            throw new Error('Invalid input format for NavigateCrossDomain');
          }
        } else {
          throw new Error('Input must be a string for NavigateCrossDomain');
        }
    case 'NavigateToApp':
      if (input) {
        try {
          const parsedInput = JSON.parse(input);
          return await pages_NavigateToApp(parsedInput);
        } catch (error) {
          console.log('Invalid input format for NavigateToApp');
          throw new Error('Invalid input format for NavigateToApp');
        }
      } else {
        throw new Error('Input is required for NavigateToApp');
      }
    case 'ShareDeepLink':
      if (input) {
        try {
          const parsedInput = JSON.parse(input);
          return await pages_ShareDeepLink(parsedInput);
        } catch (error) {
          console.log('Invalid input format for ShareDeepLink');
          throw new Error('Invalid input format for ShareDeepLink');
        }
      } else {
        throw new Error('Input is required for ShareDeepLink');
      }
    case 'SetCurrentFrame':
      if (input) {
        try {
          const parsedInput = JSON.parse(input);
          return await pages_SetCurrentFrame(parsedInput);
        } catch (error) {
          console.log('Invalid input format for SetCurrentFrame');
          throw new Error('Invalid input format for SetCurrentFrame');
        }
      } else {
        throw new Error('Input is required for SetCurrentFrame');
      }
    case 'GetConfig':
      return await pages_GetConfig();
    case 'RegisterFocusEnterHandler':
      return await pages_RegisterFocusEnterHandler();
    case 'RegisterFullScreenChangeHandler':
      return await pages_RegisterFullScreenChangeHandler();
    default:
      throw new Error(`Unknown function ${func} for Pages API`);
  }
};

const profileHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckProfileCapability':
      return await profile_CheckProfileCapability;
    case 'ShowProfile':
    try {
      if (!input) {
        throw new Error('Input value for ShowProfile is missing.');
      }

      const showProfileRequest: profile.ShowProfileRequest = JSON.parse(input);
      return await profile_ShowProfile(showProfileRequest);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error displaying profile: ${error.message}`);
      } else {
        throw new Error(`Unknown error occurred: ${String(error)}`);
      }
    }
    default:
      throw new Error(`Unknown function ${func} for Profile API`);
  }
};

const searchHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'RegisterHandlers':
      return await search_RegisterHandlers();
    case 'CloseSearch':
        try {
          return await search_CloseSearch();
        } catch (error) {
          console.error('Error closing search:', error);
          throw error;
        }
    default:
      throw new Error(`Unknown function ${func} for Search API`);
  }
};

const clipboardHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckClipboardCapability':
      try {
        return await clipboard_CheckClipboardCapability();
      } catch (error) {
        console.log('Error checking clipboard capability:', error);
        throw error;
      }
      case 'CopyText':
        if (input) {
          try {
            const parsedInput = JSON.parse(input);
            if (typeof parsedInput === 'object' && 'text' in parsedInput) {
              return await clipboard_CopyText(parsedInput);
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
      case 'CopyImage':
        if (input) {
          try {
            const parsedInput = JSON.parse(input);
            if (typeof parsedInput === 'object' && 'mimeType' in parsedInput) {
              return await clipboard_CopyImage(parsedInput);
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
      case 'Paste':
        try {
          return await clipboard_Paste();
        } catch (error) {
          throw new Error('Error pasting from clipboard');
        }
      default:
        throw new Error(`Unknown function ${func} for Clipboard API`);
    }
};

const geolocationHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckGeoLocationCapability':
      return await geolocation_CheckGeoLocationCapability();
    case 'CheckGeoLocationMapCapability':
      return await geolocation_CheckGeoLocationMapCapability();
    case 'HasGeoLocationPermission':
      return await geolocation_HasGeoLocationPermission();
    case 'RequestGeoLocationPermission':
      return await geolocation_RequestGeoLocationPermission();
    case 'GetCurrentLocation':
      return await geolocation_GetCurrentLocation();
    case 'ChooseLocation':
      return await geolocation_ChooseLocation();
    default:
      throw new Error(`Unknown function ${func} for Geolocation API`);
  }
};

const sharingHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckSharingCapability':
      return await sharing_CheckSharingCapability();
    case 'ShareWebContent':
      if (input) {
        try {
          const parsedInput = JSON.parse(input);
          return await sharing_ShareWebContent(parsedInput);
        } catch (error) {
          console.log('Invalid input format for ShareWebContent');
          throw new Error('Invalid input format for ShareWebContent');
        }
      } else {
        throw new Error('Input is required for ShareWebContent');
      }
    default:
      throw new Error(`Unknown function ${func} for Sharing API`);
  }
};

const stageViewHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckStageViewCapability':
      return await stageView_CheckStageViewCapability();
    case 'OpenStageView':
      if (input) {
        try {
          const parsedInput = JSON.parse(input);
          const { appId, contentUrl, threadId, title, websiteUrl, entityId, openMode } = parsedInput;
          return await stageView_OpenStageView({
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
    default:
      throw new Error(`Unknown function ${func} for Stage View API`);
  }
};

const peopleHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckPeopleCapability':
      return await people_CheckPeopleCapability();
    case 'SelectPeople':
        try {
          // Check if input is provided and is a valid JSON string
          const parsedInput = input ? JSON.parse(input) : undefined;
          return await people_SelectPeople(parsedInput);
        } catch (error) {
          if (error instanceof SyntaxError) {
            console.log('Invalid input format for SelectPeople');
            throw new Error('Invalid input format for SelectPeople');
          } else {
            console.log('Error during SelectPeople operation');
            throw new Error('Error during SelectPeople operation');
          }
        }
      default:
        throw new Error(`Unknown function ${func} for People API`);
    }
};

const menusHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckMenusCapability':
      return await menus_CheckMenusCapability();
    case 'SetUpViews':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await menus_SetUpViews(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for SetUpViews');
          throw new Error('Invalid input format for SetUpViews');
        } else {
          throw new Error('Error during SetUpViews operation');
        }
      }
    case 'SetNavBarMenu':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await menus_SetNavBarMenu(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for SetNavBarMenu');
          throw new Error('Invalid input format for SetNavBarMenu');
        } else {
          throw new Error('Error during SetNavBarMenu operation');
        }
      }
    case 'ShowActionMenu':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await menus_ShowActionMenu(parsedInput);
      } catch (error) {
          if (error instanceof SyntaxError) {
            console.log('Invalid input format for ShowActionMenu');
            throw new Error('Invalid input format for ShowActionMenu');
          } else {
            throw new Error('Error during ShowActionMenu operation');
          }
      }
    default:
      throw new Error(`Unknown function ${func} for Menus API`);
    }
};

const pagesTabsHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckPagesTabsCapability':
      return await pagesTabs_CheckPagesTabsCapability();
    case 'NavigateToTab':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await pagesTabs_NavigateToTab(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for NavigateToTab:', error);
          throw new Error('Invalid input format for NavigateToTab');
        } else {
          throw new Error('Error during NavigateToTab operation');
        }
      }
    case 'GetTabInstances':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await pagesTabs_GetTabInstances(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for GetTabInstances');
          throw new Error('Invalid input format for GetTabInstances');
        } else {
          throw new Error('Error during GetTabInstances operation');
        }
      }
    case 'GetMruTabInstances':
      try {
        const parsedInput = input ? JSON.parse(input) : undefined;
        return await pagesTabs_GetMruTabInstances(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for GetMruTabInstances');
          throw new Error('Invalid input format for GetMruTabInstances');
        } else {
          throw new Error('Error during GetMruTabInstances operation');
        }
      }
      default:
        throw new Error(`Unknown function ${func} for Pages Tabs API`);
    }
};

const teamsCoreHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckTeamsCoreCapability':
      return await teamsCore_CheckTeamsCoreCapability();
    case 'EnablePrintCapability':
      try {
        return await teamsCore_EnablePrintCapability();
      } catch (error) {
        throw new Error('Error during EnablePrintCapability operation');
      }
    case 'Print':
      try {
        return await teamsCore_Print();
      } catch (error) {
        throw new Error('Error during Print operation');
      }
    case 'RegisterOnLoadHandler':
      try {
        return await teamsCore_RegisterOnLoadHandler();
      } catch (error) {
        throw new Error('Error during RegisterOnLoadHandler operation');
      }
    case 'RegisterBeforeUnloadHandler':
      try {
        const parsedInput = input ? JSON.parse(input) : '';
        return await teamsCore_RegisterBeforeUnloadHandler(parsedInput);
      } catch (error) {
        if (error instanceof SyntaxError) {
          console.log('Invalid input format for RegisterBeforeUnloadHandler:', error);
          throw new Error('Invalid input format for RegisterBeforeUnloadHandler');
        } else {
          throw new Error('Error during RegisterBeforeUnloadHandler operation');
        }
      }
      default:
        throw new Error(`Unknown function ${func} for Teams Core API`);
    }
};

const secondaryBrowserHandler = async (func: string, input?: string) => {
  switch (func) {
    case 'CheckSecondaryBrowserCapability':
      return await secondaryBrowser_CheckSecondaryBrowserCapability();
    case 'Open':
      try {
        const parsedInput = input ? JSON.parse(input) : '';
        return await secondaryBrowser_Open(parsedInput)
      } catch (error) {
        throw new Error('Error during Open operation');
      }
      default:
        throw new Error(`Unknown function ${func} for Secondary Browser API`);
    }
};

export const handleRunScenario = async (api: ApiComponent, func: string, input?: string) => {
  try {
    switch (api.name) {
      case 'appInstallDialog':
        return await appInstallDialogHandler(func, input);
      case 'barCode':
        return await barCodeHandler(func, input);
      case 'calendar':
        return await calendarHandler(func, input);
      case 'call':
        return await callHandler(func, input);
      case 'chat':
        return await chatHandler(func, input);
      case 'dialog':
        return await dialogHandler(func, input);
      case 'dialogCard':
        return await dialogCardHandler(func, input);
      case 'pages':
        return await pagesHandler(func, input);
      case 'profile':
        return await profileHandler(func, input);
      case 'search':
        return await searchHandler(func, input);
      case 'clipboard':
        return await clipboardHandler(func, input);
      case 'geolocation':
        return await geolocationHandler(func, input);
      case 'sharing':
        return await sharingHandler(func, input);
      case 'stageView':
        return await stageViewHandler(func, input);
      case 'people':
        return await peopleHandler(func, input);
      case 'menus':
        return await menusHandler(func, input);
      case 'pagesTabs':
        return await pagesTabsHandler(func, input);
      case 'teamsCore':
        return await teamsCoreHandler(func, input);
      case 'secondaryBrowser':
        return await secondaryBrowserHandler(func, input);
      default:
        throw new Error(`Unknown API ${api.name}`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
