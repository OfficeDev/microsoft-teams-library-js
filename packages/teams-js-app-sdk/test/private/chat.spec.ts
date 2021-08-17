import { OpenConversationRequest } from '../../src/public/interfaces';
import { chat } from '../../src/private/chat';
import { Utils } from '../utils';
import { app } from '../../src/public/app';

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
      expect(() => chat.openConversation(conversationRequest)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      expect(() => chat.openConversation(conversationRequest)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should successfully pass conversationRequest', async () => {
      await utils.initializeWithContext('content');
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };

      chat.openConversation(conversationRequest);

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

      chat.openConversation(conversationRequest);

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

      chat.openConversation(conversationRequest);

      const openConversationMessage = utils.findMessageByFunc('conversations.openConversation');
      expect(openConversationMessage).not.toBeNull();
      expect(openConversationMessage.args).toEqual([conversationRequest]);
    });
  });

  describe('closeConversation', () => {
    it('should not allow calls before initialization', () => {
      expect(() => chat.closeConversation()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');
      expect(() => chat.closeConversation()).toThrowError("This call is not allowed in the 'settings' context");
    });
  });

  describe('getChatMembers', () => {
    it('should not allow calls before initialization', () => {
      expect(() =>
        chat.getChatMembers(() => {
          return;
        }),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should successfully get chat members', async () => {
      await utils.initializeWithContext('content');

      let callbackCalled = false;
      chat.getChatMembers(() => {
        callbackCalled = true;
      });

      let getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
      expect(getChatMembersMessage).not.toBeNull();
      utils.respondToMessage(getChatMembersMessage, {});
      expect(callbackCalled).toBe(true);
    });
  });

  it('should allow calls with empty callback', async () => {
    await utils.initializeWithContext('content');

    chat.getChatMembers(null);

    let getChatMembersMessage = utils.findMessageByFunc('getChatMembers');
    expect(getChatMembersMessage).not.toBeNull();
    utils.respondToMessage(getChatMembersMessage, {});
  });
});
