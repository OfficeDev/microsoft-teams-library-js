import { core } from '../../src/public/publicAPIs';
import { pages } from '../../src/public/pages';
import { Utils } from '../utils';

describe('teamsjsAppSDK-TeamsAPIs', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;

    // Set a mock window for testing
    core._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (core._uninitialize) {
      core._uninitialize();
    }
  });

  describe('enterFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => pages.fullTrust.enterFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from task context', () => {
      utils.initializeWithContext('task');

      expect(() => pages.fullTrust.enterFullscreen()).toThrowError("This call is not allowed in the 'task' context");
    });

    it('should successfully enter fullscreen', () => {
      utils.initializeWithContext('content');

      pages.fullTrust.enterFullscreen();

      const enterFullscreenMessage = utils.findMessageByFunc('enterFullscreen');
      expect(enterFullscreenMessage).not.toBeNull();
    });
  });

  describe('exitFullscreen', () => {
    it('should not allow calls before initialization', () => {
      expect(() => pages.fullTrust.exitFullscreen()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from task context', () => {
      utils.initializeWithContext('task');

      expect(() => pages.fullTrust.exitFullscreen()).toThrowError("This call is not allowed in the 'task' context");
    });

    it('should successfully exit fullscreen', () => {
      utils.initializeWithContext('content');

      pages.fullTrust.exitFullscreen();

      const exitFullscreenMessage = utils.findMessageByFunc('exitFullscreen');
      expect(exitFullscreenMessage).not.toBeNull();
    });
  });
});
