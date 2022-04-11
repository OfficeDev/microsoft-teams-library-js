import {
  deepLinkUrlPathForChat,
  messageUrlParameterName,
  topicUrlParameterName,
  usersUrlParameterName,
} from '../../src/internal/chatConstants';
import { createTeamsDeepLinkForChat } from '../../src/internal/chatUtilities';
import { teamsDeepLinkHost, teamsDeepLinkProtocol } from '../../src/internal/constants';

describe('chatUtilities', () => {
  describe('createTeamsDeepLinkForChat', () => {
    const user1 = 'user1';
    const user2 = 'user2first user2last';
    const user3 = 'my name has & special characters in = it';
    const topic = 'this is &= a topic !! with some % characters # that can be $tricky';
    const message = 'a message with &&&& some = ? special + characters in it';

    function validateChatDeepLinkPrefix(chatDeepLink: URL): void {
      expect(chatDeepLink.protocol.toLowerCase() === teamsDeepLinkProtocol);
      expect(chatDeepLink.host.toLowerCase() === teamsDeepLinkHost);
      expect(chatDeepLink.pathname.toLowerCase() === deepLinkUrlPathForChat);
    }

    function validateChatDeepLinkUsers(chatDeepLink: URL, expectedUsers: string[]): void {
      const searchParams = chatDeepLink.searchParams;
      const userUrlValues: string[] = searchParams.getAll(usersUrlParameterName);
      expect(userUrlValues).toHaveLength(1);

      const users: string[] = userUrlValues[0].split(',');
      expect(users).toHaveLength(expectedUsers.length);

      for (const expectedUser of expectedUsers) {
        expect(users).toContain(expectedUser);
      }
    }

    function validateChatDeepLinkTopic(chatDeepLink: URL, expectedTopic?: string): void {
      const searchParams = chatDeepLink.searchParams;
      const topicUrlValues: string[] = searchParams.getAll(topicUrlParameterName);

      if (expectedTopic !== undefined) {
        expect(topicUrlValues).toHaveLength(1);
        const topic: string = topicUrlValues[0];
        expect(topic).toEqual(expectedTopic);
      } else {
        expect(topicUrlValues).toHaveLength(0);
      }
    }

    function validateChatDeepLinkMessage(chatDeepLink: URL, expectedMessage?: string): void {
      const searchParams = chatDeepLink.searchParams;
      const messageUrlValues: string[] = searchParams.getAll(messageUrlParameterName);

      if (expectedMessage !== undefined) {
        expect(messageUrlValues).toHaveLength(1);
        const message: string = messageUrlValues[0];
        expect(message).toEqual(expectedMessage);
      } else {
        expect(messageUrlValues).toHaveLength(0);
      }
    }

    it('should create a deep link for a single user with no topic and no message', () => {
      const userList: string[] = [user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateChatDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for a multiple users with no topic and no message', () => {
      const userList: string[] = [user1, user2, user3];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateChatDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for one user with the given message', () => {
      const userList: string[] = [user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, undefined, message));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateChatDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, undefined);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, message);
    });

    it('should create a deep link for multiple users with the given topic', () => {
      const userList: string[] = [user3, user1, user2];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, topic, undefined));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateChatDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, topic);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, undefined);
    });

    it('should create a deep link for multiple users with the given topic and message', () => {
      const userList: string[] = [user3, user2, user1];
      const generatedChatDeepLinkUrl = new URL(createTeamsDeepLinkForChat(userList, topic, message));

      validateChatDeepLinkPrefix(generatedChatDeepLinkUrl);
      validateChatDeepLinkUsers(generatedChatDeepLinkUrl, userList);
      validateChatDeepLinkTopic(generatedChatDeepLinkUrl, topic);
      validateChatDeepLinkMessage(generatedChatDeepLinkUrl, message);
    });

    it('should throw an error when given no users', () => {
      expect.assertions(1);

      expect(() => createTeamsDeepLinkForChat([], topic, message)).toThrowError();
    });
  });
});
