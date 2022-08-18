import { teamsDeepLinkHost, teamsDeepLinkProtocol } from './constants';
import {
  teamsDeepLinkAttendeesUrlParameterName,
  teamsDeepLinkContentUrlParameterName,
  teamsDeepLinkEndTimeUrlParameterName,
  teamsDeepLinkMessageUrlParameterName,
  teamsDeepLinkSourceUrlParameterName,
  teamsDeepLinkStartTimeUrlParameterName,
  teamsDeepLinkSubjectUrlParameterName,
  teamsDeepLinkTopicUrlParameterName,
  teamsDeepLinkUrlPathForAppInstall,
  teamsDeepLinkUrlPathForCalendar,
  teamsDeepLinkUrlPathForCall,
  teamsDeepLinkUrlPathForChat,
  teamsDeepLinkUsersUrlParameterName,
  teamsDeepLinkWithVideoUrlParameterName,
} from './deepLinkConstants';

export function createTeamsDeepLinkForChat(users: string[], topic?: string, message?: string): string {
  if (users.length === 0) {
    throw new Error('Must have at least one user when creating a chat deep link');
  }

  const usersSearchParameter =
    `${teamsDeepLinkUsersUrlParameterName}=` + users.map((user) => encodeURIComponent(user)).join(',');
  const topicSearchParameter =
    topic === undefined ? '' : `&${teamsDeepLinkTopicUrlParameterName}=${encodeURIComponent(topic)}`;
  const messageSearchParameter =
    message === undefined ? '' : `&${teamsDeepLinkMessageUrlParameterName}=${encodeURIComponent(message)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForChat}?${usersSearchParameter}${topicSearchParameter}${messageSearchParameter}`;
}

export function createTeamsDeepLinkForCall(targets: string[], withVideo?: boolean, source?: string): string {
  if (targets.length === 0) {
    throw new Error('Must have at least one target when creating a call deep link');
  }
  const usersSearchParameter =
    `${teamsDeepLinkUsersUrlParameterName}=` + targets.map((user) => encodeURIComponent(user)).join(',');
  const withVideoSearchParameter =
    withVideo === undefined ? '' : `&${teamsDeepLinkWithVideoUrlParameterName}=${encodeURIComponent(withVideo)}`;
  const sourceSearchParameter =
    source === undefined ? '' : `&${teamsDeepLinkSourceUrlParameterName}=${encodeURIComponent(source)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForCall}?${usersSearchParameter}${withVideoSearchParameter}${sourceSearchParameter}`;
}

export function createTeamsDeepLinkForCalendar(
  attendees?: string[],
  startTime?: string,
  endTime?: string,
  subject?: string,
  content?: string,
): string {
  const attendeeSearchParameter =
    attendees === undefined
      ? ''
      : `${teamsDeepLinkAttendeesUrlParameterName}=` +
        attendees.map((attendee) => encodeURIComponent(attendee)).join(',');
  const startTimeSearchParameter =
    startTime === undefined ? '' : `&${teamsDeepLinkStartTimeUrlParameterName}=${encodeURIComponent(startTime)}`;
  const endTimeSearchParameter =
    endTime === undefined ? '' : `&${teamsDeepLinkEndTimeUrlParameterName}=${encodeURIComponent(endTime)}`;
  const subjectSearchParameter =
    subject === undefined ? '' : `&${teamsDeepLinkSubjectUrlParameterName}=${encodeURIComponent(subject)}`;
  const contentSearchParameter =
    content === undefined ? '' : `&${teamsDeepLinkContentUrlParameterName}=${encodeURIComponent(content)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForCalendar}?${attendeeSearchParameter}${startTimeSearchParameter}${endTimeSearchParameter}${subjectSearchParameter}${contentSearchParameter}`;
}

export function createTeamsDeepLinkForAppInstallDialog(appId: string): string {
  if (!appId) {
    throw new Error('App ID must be set when creating an app install dialog deep link');
  }
  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForAppInstall}${encodeURIComponent(
    appId,
  )}`;
}
