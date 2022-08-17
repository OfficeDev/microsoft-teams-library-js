import {
  teamsDarkTheme,
  teamsHighContrastTheme,
  teamsLightTheme,
  Theme,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { Message } from '@microsoft/microsoft-graph-types';
import { app, call, chat, mail, OpenSingleChatRequest } from '@microsoft/teams-js';

import { MessageListItem } from './Emails';
import { AvatarItem } from './PeopleAvatars';

export const getThemeTeams = (themeNow: string): Theme => {
  switch (themeNow) {
    case 'dark':
      return teamsDarkTheme;
      break;
    case 'contrast':
      return teamsHighContrastTheme;
      break;
    default:
      return teamsLightTheme;
  }
};
export const getThemeOther = (themeNow: string): Theme => {
  switch (themeNow) {
    case 'dark':
      return webDarkTheme;
      break;
    default:
      return webLightTheme;
  }
};
export function appInitializationFailed(): void {
  app.notifyFailure({
    reason: app.FailedReason.Other,
    message: 'App initialization failed',
  });
}

export function getDates(): [string, string] {
  const current = new Date();
  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const currDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
  const tomorrowDate = tomorrow.getFullYear() + '-' + (tomorrow.getMonth() + 1) + '-' + tomorrow.getDate();
  return [currDate, tomorrowDate];
}

export const handleAudioCall = async (a: AvatarItem): Promise<void> => {
  const callParams: call.StartCallParams = {
    targets: [`${a.id}`],
  };
  const result = await call.startCall(callParams);
  return alert(result);
};
export const handleVideoCall = async (a: AvatarItem): Promise<void> => {
  const callParams: call.StartCallParams = {
    targets: [`${a.id}`],
    requestedModalities: [call.CallModalities.Video],
  };
  const result = await call.startCall(callParams);
  return alert(result);
};
export const handleMessage = async (a: AvatarItem): Promise<void> => {
  const chatParams: OpenSingleChatRequest = {
    user: a.id || '',
  };
  await chat.openChat(chatParams);
};
export const handleMail = async (a: AvatarItem): Promise<void> => {
  const mailParams: mail.ComposeMailParams = {
    type: mail.ComposeMailType.New,
    toRecipients: [`${a.id}`],
  };
  await mail.composeMail(mailParams);
};

const convertRestIdtoEwsId = (restId: string): string => {
  let retId = restId.replace(/_/g, '+');
  retId = retId.replace(/-/g, '/');
  return retId;
};

export const handleOpenMailItem = async (emailItem: MessageListItem): Promise<void> => {
  const convertedID = convertRestIdtoEwsId(emailItem.key || '');
  const openMailParams: mail.OpenMailItemParams = {
    itemId: convertedID,
  };
  await mail.openMailItem(openMailParams);
};
export const shouldShowMeeting = (meeting: Message): boolean => {
  return meeting['showAs'] !== 'free' && !meeting['isCancelled'];
};
