import {
  deepLinkUrlPathForChat,
  messageUrlParameterName,
  topicUrlParameterName,
  usersUrlParameterName,
} from './chatConstants';
import { teamsDeepLinkHost, teamsDeepLinkProtocol } from './constants';

export function createTeamsDeepLinkForChat(users: string[], topic?: string, message?: string): string {
  if (users.length === 0) {
    throw new Error('Must have at least one user when creating a chat deep link');
  }

  const usersSearchParameter = `${usersUrlParameterName}=` + users.map(user => encodeURIComponent(user)).join(',');
  const topicSearchParameter = topic === undefined ? '' : `&${topicUrlParameterName}=${encodeURIComponent(topic)}`;
  const messageSearchParameter =
    message === undefined ? '' : `&${messageUrlParameterName}=${encodeURIComponent(message)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${deepLinkUrlPathForChat}?${usersSearchParameter}${topicSearchParameter}${messageSearchParameter}`;
}
