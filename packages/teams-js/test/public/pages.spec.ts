import { app } from '../../src/public/app';
import { pages } from '../../src/public/pages';
import { Utils } from '../utils';

describe('AppSDK-TeamsAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('navigateToApp', () => {
    const navigateToAppParams: pages.NavigateToAppParams = {
      appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
      pageId: 'tasklist123',
      webUrl: 'https://tasklist.example.com/123',
      channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
      subPageId: 'task456',
    };

    it('should not allow calls before initialization', () => {
      expect(() => pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => pages.navigateToApp(navigateToAppParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","settings","task","stage","meetingStage"]. Current context: "authentication".',
      );
    });

    it('should successfully send the navigateToApp message', async () => {
      await utils.initializeWithContext('content');
      utils.setRuntimeConfig({ apiVersion: 1, supports: { pages: {} } });

      const promise = pages.navigateToApp(navigateToAppParams);

      const navigateToAppMessage = utils.findMessageByFunc('pages.navigateToApp');
      utils.respondToMessage(navigateToAppMessage, true);
      await promise;

      expect(navigateToAppMessage).not.toBeNull();
      expect(navigateToAppMessage.args[0]).toStrictEqual(navigateToAppParams);
    });

    it('should successfully send an executeDeepLink message for legacy teams clients', async () => {
      await utils.initializeWithContext('content');

      const promise = pages.navigateToApp(navigateToAppParams);

      const executeDeepLinkMessage = utils.findMessageByFunc('executeDeepLink');
      utils.respondToMessage(executeDeepLinkMessage, true);
      await promise;

      expect(executeDeepLinkMessage).not.toBeNull();
      expect(executeDeepLinkMessage.args[0]).toBe(
        'https://teams.microsoft.com/l/entity/fe4a8eba-2a31-4737-8e33-e5fae6fee194/tasklist123?webUrl=https%3A%2F%2Ftasklist.example.com%2F123&context=%7B%22channelId%22%3A%2219%3Acbe3683f25094106b826c9cada3afbe0%40thread.skype%22%2C%22subEntityId%22%3A%22task456%22%7D',
      );
    });
  });
});
