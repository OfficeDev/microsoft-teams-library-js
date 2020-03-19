import { OpenConversationRequest } from '../../src/public/interfaces';
import { conversations } from '../../src/private/conversations';
import { Utils } from '../utils';
import { _uninitialize } from '../../src/public/publicAPIs';

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
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('openConversation', () => {
    it('should not allow calls before initialization', () => {
      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      expect(() => conversations.openConversation(conversationRequest)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      const conversationRequest: OpenConversationRequest = {
        subEntityId: 'someEntityId',
        title: 'someTitle',
        entityId: 'someEntityId',
      };
      expect(() => conversations.openConversation(conversationRequest)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should successfully pass conversationRequest', () => {
      utils.initializeWithContext('content');
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

    it('should successfully pass conversationRequest in a personal scope', () => {
      utils.initializeWithContext('content');
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
  });

  describe('closeConversation', () => {
    it('should not allow calls before initialization', () => {
      expect(() => conversations.closeConversation()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');
      expect(() => conversations.closeConversation()).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });
  });
});
