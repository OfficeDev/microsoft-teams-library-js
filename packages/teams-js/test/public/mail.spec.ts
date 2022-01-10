import { GlobalVars } from '../../src/internal/globalVars';
import { app } from '../../src/public/app';
import { mail } from '../../src/public/mail';
import { pages } from '../../src/public/pages';
import { Utils } from '../utils';

describe('mail', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    GlobalVars.frameContext = undefined;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('openMailItem', () => {
    const navigateToAppParams: pages.NavigateToAppParams = {
      appId: 'fe4a8eba-2a31-4737-8e33-e5fae6fee194',
      pageId: 'tasklist123',
      webUrl: 'https://tasklist.example.com/123',
      channelId: '19:cbe3683f25094106b826c9cada3afbe0@thread.skype',
      subPageId: 'task456',
    };

    const openMailItemParams: mail.OpenMailItemParams = {
      itemId: '',
    };

    it('should not allow calls before initialization', () => {
      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "remove".',
      );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "task".',
      );
    });

    it('should not allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "sidePanel".',
      );
    });

    it('should not allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "stage".',
      );
    });

    it('should not allow calls from meetingStage context', async () => {
      await utils.initializeWithContext('meetingStage');

      expect(() => mail.openMailItem(openMailItemParams)).rejects.toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "meetingStage".',
      );
    });

    // it('should not allow calls if runtime does not support mail', async () => {
    //   await utils.initializeWithContext('stage');

    //   expect(async () => await mail.openMailItem(openMailItemParams)).rejects.toThrowError(
    //     'This call is only allowed in following contexts: ["content"]. Current context: "stage".',
    //   );
    // });

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
