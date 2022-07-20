import { teamsDarkTheme, teamsHighContrastTheme, teamsLightTheme, Theme } from '@fluentui/react-components';
import { app, calendar, call, chat, mail, OpenSingleChatRequest } from '@microsoft/teams-js';

import { MessageListItem } from './Emails';
import { AvatarItem } from './PeopleAvatars';
export const getTheme = (themeNow: string): Theme => {
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

// function to check if capabiltiies are supported, if so
// add to list and return that list to peopleAvatar function

export function getSupportedCapabilities(): string[] {
  const capabilities: string[] = [];
  if (call.isSupported()) {
    capabilities.push('Call');
  }
  if (chat.isSupported()) {
    capabilities.push('Message');
  }
  if (mail.isSupported()) {
    capabilities.push('Mail');
  }
  if (calendar.isSupported()) {
    capabilities.push('Calendar');
  }
  return capabilities;
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

export const handleOpenMailItem = async (emailItem: MessageListItem): Promise<void> => {
  if (!mail.isSupported()) {
    alert('open mail item is not supported');
  } else {
    const openMailParams: mail.OpenMailItemParams = {
      itemId: emailItem.key || '',
    };
    await mail.openMailItem(openMailParams);
  }
};
