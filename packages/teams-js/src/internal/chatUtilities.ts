import {
  teamsDeepLinkMessageUrlParameterName,
  teamsDeepLinkTopicUrlParameterName,
  teamsDeepLinkUrlPathForChat,
  teamsDeepLinkUsersUrlParameterName,
} from './chatConstants';
import { teamsDeepLinkHost, teamsDeepLinkProtocol } from './constants';

export function createTeamsDeepLinkForChat(users: string[], topic?: string, message?: string): string {
  if (users.length === 0) {
    throw new Error('Must have at least one user when creating a chat deep link');
  }

  const usersSearchParameter =
    `${teamsDeepLinkUsersUrlParameterName}=` + users.map(user => encodeURIComponent(user)).join(',');
  const topicSearchParameter =
    topic === undefined ? '' : `&${teamsDeepLinkTopicUrlParameterName}=${encodeURIComponent(topic)}`;
  const messageSearchParameter =
    message === undefined ? '' : `&${teamsDeepLinkMessageUrlParameterName}=${encodeURIComponent(message)}`;

  return `${teamsDeepLinkProtocol}://${teamsDeepLinkHost}${teamsDeepLinkUrlPathForChat}?${usersSearchParameter}${topicSearchParameter}${messageSearchParameter}`;
}
