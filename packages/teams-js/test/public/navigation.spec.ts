import { navigateBack, navigateCrossDomain, navigateToTab, returnFocus } from '../../src/public/navigation';
import { _uninitialize } from '../../src/public/publicAPIs';
import { Utils } from '../utils';

describe('MicrosoftTeams-Navigation', () => {
  // Use to send a mock message from the app.
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;
  });
  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      _uninitialize();
    }
  });

  describe('returnFocus', () => {
    it('should successfully returnFocus', async () => {
      await utils.initializeWithContext('content');

      returnFocus(true);

      const returnFocusMessage = utils.findMessageByFunc('returnFocus');
      expect(returnFocusMessage).not.toBeNull();
      expect(returnFocusMessage.args.length).toBe(1);
      expect(returnFocusMessage.args[0]).toBe(true);
    });
  });
  describe('navigateCrossDomain', () => {
    it('should not allow calls before initialization', () => {
      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => navigateCrossDomain('https://valid.origin.com')).toThrowError(
        "This call is not allowed in the 'authentication' context",
      );
    });

    it('should allow calls from content context', async () => {
      await utils.initializeWithContext('content');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should allow calls from stage context', async () => {
      await utils.initializeWithContext('stage');

      navigateCrossDomain('https://valid.origin.com');
    });

    it('should successfully navigate cross-origin', async () => {
      await utils.initializeWithContext('content');

      navigateCrossDomain('https://valid.origin.com');

      const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
      expect(navigateCrossDomainMessage).not.toBeNull();
      expect(navigateCrossDomainMessage.args.length).toBe(1);
      expect(navigateCrossDomainMessage.args[0]).toBe('https://valid.origin.com');
    });

    it('should throw on invalid cross-origin navigation request', done => {
      utils.initializeWithContext('settings').then(() => {
        navigateCrossDomain('https://invalid.origin.com', (success, reason) => {
          expect(success).toBeFalsy();
          expect(reason).toBe(
            'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.',
          );
          done();
        });

        const navigateCrossDomainMessage = utils.findMessageByFunc('navigateCrossDomain');
        expect(navigateCrossDomainMessage).not.toBeNull();
        expect(navigateCrossDomainMessage.args.length).toBe(1);
        expect(navigateCrossDomainMessage.args[0]).toBe('https://invalid.origin.com');

        utils.respondToMessage(navigateCrossDomainMessage, false);
      });
    });
    it('should register the navigateBack action', () => {
      utils.initializeWithContext('content');
      navigateBack();
      const navigateBackMessage = utils.findMessageByFunc('navigateBack');
      expect(navigateBackMessage).not.toBeNull();
    });
    it('should register the navigateToTab action', () => {
      utils.initializeWithContext('content');
      navigateToTab(null);
      const navigateToTabMsg = utils.findMessageByFunc('navigateToTab');
      expect(navigateToTabMsg).not.toBeNull();
    });
  });
});
