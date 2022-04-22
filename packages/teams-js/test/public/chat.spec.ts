import { app } from '../../src/public/app';
import { chat, OpenGroupChatRequest, OpenSingleChatRequest } from '../../src/public/chat';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import {
  validateChatDeepLinkMessage,
  validateChatDeepLinkPrefix,
  validateChatDeepLinkTopic,
  validateDeepLinkUsers,
} from '../internal/deepLinkUtilities.spec';
import { Utils } from '../utils';

describe('chat', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('openChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('openChat should throw error if chat capability is not supported in runtime config', async () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = chat.openChat(chatRequest);
      expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should successfully pass chatRequest to non-legacy Teams host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };

      chat.openChat(chatRequest);

      const chatResponse = {
        members: 'someUPN',
        message: 'someMessage',
      };

      const openChatMessage = utils.findMessageByFunc('chat.openChat');
      expect(openChatMessage).not.toBeNull();
      expect(openChatMessage.args).toEqual([chatResponse]);
    });

    it('should successfully pass chatRequest to legacy Teams host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { chat: {} } });

      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };

      const promise: Promise<void> = chat.openChat(chatRequest);

      const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
      expect(executeDeepLinkMessage).not.toBeNull();
      expect(executeDeepLinkMessage.args).toHaveLength(1);

      const chatDeepLink: URL = new URL(executeDeepLinkMessage.args[0]);
      validateChatDeepLinkPrefix(chatDeepLink);
      validateDeepLinkUsers(chatDeepLink, [chatRequest.user]);
      validateChatDeepLinkMessage(chatDeepLink, chatRequest.message);

      utils.respondToMessage(executeDeepLinkMessage, true);
      await expect(promise).resolves.not.toThrow();
    });
  });

  describe('openGroupChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('openGroupChat should throw error if chat capability is not supported in runtime config', async () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = chat.openGroupChat(chatRequest);
      expect(promise).rejects.toEqual(errorNotSupportedOnPlatform);
    });

    it('should not allow calls when no members are provided', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: [],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('OpenGroupChat Failed: No users specified');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should successfully pass chatRequest to non-legacy Teams host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: false, supports: { chat: {} } });

      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
        topic: 'someTopic',
      };

      const chatResponse = {
        members: ['someUPN', 'someUPN2'],
        message: 'someMessage',
        topic: 'someTopic',
      };

      chat.openGroupChat(chatRequest);

      const openChatMessage = utils.findMessageByFunc('chat.openChat');
      expect(openChatMessage).not.toBeNull();
      expect(openChatMessage.args).toEqual([chatResponse]);
    });

    it('should successfully pass chatRequest to legacy Teams host', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, isLegacyTeams: true, supports: { chat: {} } });

      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
        topic: 'someTopic',
      };

      const promise: Promise<void> = chat.openGroupChat(chatRequest);

      const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
      expect(executeDeepLinkMessage).not.toBeNull();
      expect(executeDeepLinkMessage.args).toHaveLength(1);

      const chatDeepLink: URL = new URL(executeDeepLinkMessage.args[0]);
      validateChatDeepLinkPrefix(chatDeepLink);
      validateDeepLinkUsers(chatDeepLink, chatRequest.users);
      validateChatDeepLinkMessage(chatDeepLink, chatRequest.message);
      validateChatDeepLinkTopic(chatDeepLink, chatRequest.topic);

      utils.respondToMessage(executeDeepLinkMessage, true);
      await expect(promise).resolves.not.toThrow();
    });
  });
});
