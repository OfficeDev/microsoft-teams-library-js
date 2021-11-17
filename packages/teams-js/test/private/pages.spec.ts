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

  describe('enterFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => pages.fullTrust.enterFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "remove".',
      );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "task".',
      );
    });

    it('should successfully enter fullscreen', async () => {
      await utils.initializeWithContext('content');

      pages.fullTrust.enterFullscreen();

      const enterFullscreenMessage = utils.findMessageByFunc('enterFullscreen');
      expect(enterFullscreenMessage).not.toBeNull();
    });
  });

  describe('exitFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => pages.fullTrust.exitFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "remove".',
      );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "task".',
      );
    });

    it('should successfully exit fullscreen', async () => {
      await utils.initializeWithContext('content');

      pages.fullTrust.exitFullscreen();

      const exitFullscreenMessage = utils.findMessageByFunc('exitFullscreen');
      expect(exitFullscreenMessage).not.toBeNull();
    });
  });
});
