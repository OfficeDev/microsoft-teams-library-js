import { conversation, OpenConversationRequest } from '../../src/private/conversation';
import { app } from '../../src/public/app';
import { Utils } from '../utils';

describe('conversation', () => {
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
      return expect(conversation.openConversation(conversationRequest)).rejects.toThrowError(
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
      return expect(conversation.openConversation(conversationRequest)).rejects.toThrowError(
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

      conversation.openConversation(conversationRequest);

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

      conversation.openConversation(conversationRequest);

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

      conversation.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });
  });

  describe('closeConversation', () => {
    it('should not allow calls before initialization', () => {
      expect(() => conversation.closeConversation()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      expect(() => conversation.closeConversation()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });
  });

  describe('getChatMembers', () => {
    it('should not allow calls before initialization', () => {
      return expect(conversation.getChatMembers()).rejects.toThrowError('The library has not yet been initialized');
    });

    it('should successfully get chat members', async () => {
      await utils.initializeWithContext('content');

      const promise = conversation.getChatMembers();

      const getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
      expect(getChatMembersMessage).not.toBeNull();
      utils.respondToMessage(getChatMembersMessage, {});
      return expect(promise).resolves;
    });
  });
});
