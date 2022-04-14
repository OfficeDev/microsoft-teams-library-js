import { conversations, OpenConversationRequest } from '../../src/private/conversations';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';

describe('conversations', () => {
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
      return expect(conversations.openConversation(conversationRequest)).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('conversation capability is not supported', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      utils.setRuntimeConfig({ apiVersion: 1, supports: { chat: {} } });
      expect(() => conversations.openConversation(conversationRequest)).rejects.toThrowError(
        errorNotSupportedOnPlatform,
      );
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      return expect(conversations.openConversation(conversationRequest)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should successfully pass conversationRequest', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };

      conversations.openConversation(conversationRequest);

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

      conversations.openConversation(conversationRequest);

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

      conversations.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });
  });

  describe('closeConversation', () => {
    it('should not allow calls before initialization', () => {
      expect(() => conversations.closeConversation()).toThrowError('The library has not yet been initialized');
    });

    it('should throw error if not supported in runtime config', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { chat: {} } });
      expect(() => conversations.closeConversation()).toThrowError(errorNotSupportedOnPlatform);
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      expect(() => conversations.closeConversation()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });
  });

  describe('getChatMembers', () => {
    it('should not allow calls before initialization', () => {
      return expect(conversations.getChatMembers()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should throw error if it is not supported in runtime config', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      const promise = conversations.getChatMembers();
      expect(promise).rejects.toThrowError(errorNotSupportedOnPlatform);
    });

    it('should successfully get chat members', async () => {
      await utils.initializeWithContext('content');

      const promise = conversations.getChatMembers();

      const getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
      expect(getChatMembersMessage).not.toBeNull();
      utils.respondToMessage(getChatMembersMessage, {});
      return expect(promise).resolves;
    });
  });
});
