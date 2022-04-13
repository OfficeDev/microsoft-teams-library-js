import { util } from 'prettier';
import { chat, OpenConversationRequest, OpenGroupChatRequest, OpenSingleChatRequest } from '../../src/private/chat';
import { ErrorCode, FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
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
      app._uninitialize();
    }
  });

  describe('openConversation', () => {
    it('should not allow calls before initialization', () => {
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      return expect(chat.conversation.openConversation(conversationRequest)).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      return expect(chat.conversation.openConversation(conversationRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should throw error if not supported in runtime config', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      utils.setRuntimeConfig({ apiVersion: 1, supports: { chat: {} } });
      expect(() => chat.conversation.openConversation(conversationRequest)).rejects.toThrowError('Not supported');
      //   JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }),
      // );
    });

    it('should successfully pass conversationRequest', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };

      chat.conversation.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });

    it('should successfully pass conversationRequest in a personal scope', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        channelId: 'someChannelId',
        entityId: 'someEntityId',
      };

      chat.conversation.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });

    it('conversationRequest with empty strings should succeed', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: '',
        title: '',
        entityId: '',
      };

      chat.conversation.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });
  });

  describe('closeConversation', () => {
    it('should not allow calls before initialization', () => {
      expect(() => chat.conversation.closeConversation()).toThrowError('The library has not yet been initialized');
    });

    it('should throw error if not supported in runtime config', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { chat: {} } });
      expect(() => chat.conversation.closeConversation()).toThrowError(
        JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }),
      );
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      expect(() => chat.conversation.closeConversation()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });
  });

  describe('getChatMembers', () => {
    it('should not allow calls before initialization', () => {
      return expect(chat.getChatMembers()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should throw error if it is not supported in runtime config', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = chat.getChatMembers();
      expect(promise).rejects.toThrowError(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
    });

    it('should successfully get chat members', async () => {
      await utils.initializeWithContext('content');

      const promise = chat.getChatMembers();

      const getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
      expect(getChatMembersMessage).not.toBeNull();
      utils.respondToMessage(getChatMembersMessage, {});
      return expect(promise).resolves;
    });
  });

  describe('openChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      return expect(chat.openChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should throw error if it is not supported in runtime config', async () => {
      const chatRequest: OpenSingleChatRequest = {
        user: 'someUPN',
        message: 'someMessage',
      };
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = chat.openChat(chatRequest);
      expect(promise).rejects.toThrowError(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
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

    it('should successfully pass chatRequest', async () => {
      await utils.initializeWithContext('content');
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
  });

  describe('openGroupChat', () => {
    it('should not allow calls before initialization', () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      return expect(chat.openGroupChat(chatRequest)).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should throw error if it is not supported in runtime config', async () => {
      const chatRequest: OpenGroupChatRequest = {
        users: ['someUPN', 'someUPN2'],
        message: 'someMessage',
      };
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = chat.openGroupChat(chatRequest);
      expect(promise).rejects.toThrowError(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
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

    it('should successfully pass chatRequest', async () => {
      await utils.initializeWithContext('content');
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
  });
});
