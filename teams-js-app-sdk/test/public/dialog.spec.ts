import { DialogInfo } from '../../src/public/interfaces';
import { DialogDimension } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { Utils } from '../utils';
import { core } from '../../src/public/publicAPIs';

describe('Dialog', () => {
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
    if (core._uninitialize) {
      core._uninitialize();
    }
  });

  describe('oepn', () => {
    it('should not allow calls before initialization', () => {
      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should not allow calls from dialog context', () => {
      utils.initializeWithContext('dialog');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError("This call is not allowed in the 'dialog' context");
    });

    it('should pass along entire DialogInfo parameter in sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      const dialogInfo: DialogInfo = {
        card: 'someCard',
        fallbackUrl: 'someFallbackUrl',
        height: DialogDimension.Large,
        width: DialogDimension.Large,
        title: 'someTitle',
        url: 'someUrl',
        completionBotId: 'someCompletionBotId',
      };

      dialog.open(dialogInfo, () => {
        return;
      });

      const openMessage = utils.findMessageByFunc('tasks.startTask');
      expect(openMessage).not.toBeNull();
      expect(openMessage.args).toEqual([dialogInfo]);
    });

    it('should pass along entire DialogInfo parameter in content', () => {
      utils.initializeWithContext('content');

      const dialogInfo: DialogInfo = {
        card: 'someCard',
        fallbackUrl: 'someFallbackUrl',
        height: DialogDimension.Large,
        width: DialogDimension.Large,
        title: 'someTitle',
        url: 'someUrl',
        completionBotId: 'someCompletionBotId',
      };

      dialog.open(dialogInfo, () => {
        return;
      });

      const openMessage = utils.findMessageByFunc('tasks.startTask');
      expect(openMessage).not.toBeNull();
      expect(openMessage.args).toEqual([dialogInfo]);
    });

    it('should invoke callback with result', () => {
      utils.initializeWithContext('content');

      let callbackCalled = false;
      const dialogInfo: DialogInfo = {};
      dialog.open(dialogInfo, (err, result) => {
        expect(err).toBeNull();
        expect(result).toBe('someResult');
        callbackCalled = true;
      });

      const openMessage = utils.findMessageByFunc('tasks.startTask');
      expect(openMessage).not.toBeNull();
      utils.respondToMessage(openMessage, null, 'someResult');
      expect(callbackCalled).toBe(true);
    });

    it('should invoke callback with error', () => {
      utils.initializeWithContext('content');

      let callbackCalled = false;
      const dialogInfo: DialogInfo = {};
      dialog.open(dialogInfo, (err, result) => {
        expect(err).toBe('someError');
        expect(result).toBeUndefined();
        callbackCalled = true;
      });

      const openMessage = utils.findMessageByFunc('tasks.startTask');
      expect(openMessage).not.toBeNull();
      utils.respondToMessage(openMessage, 'someError');
      expect(callbackCalled).toBe(true);
    });
  });

  describe('resize', () => {
    it('should not allow calls before initialization', () => {
      // tslint:disable-next-line:no-any
      expect(() => dialog.resize({} as any)).toThrowError('The library has not yet been initialized');
    });

    it('should successfully pass DialogInfo in sidePanel context', () => {
      utils.initializeWithContext('sidePanel');
      const dialogInfo = { width: 10, height: 10 };

      dialog.resize(dialogInfo);

      const resizeMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(resizeMessage).not.toBeNull();
      expect(resizeMessage.args).toEqual([dialogInfo]);
    });

    it('should successfully pass DialogInfo in Dialog context', () => {
      utils.initializeWithContext('dialog');
      const dialogInfo = { width: 10, height: 10 };

      dialog.resize(dialogInfo);

      const resizeMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(resizeMessage).not.toBeNull();
      expect(resizeMessage.args).toEqual([dialogInfo]);
    });

    it('should throw an error if extra properties are provided', () => {
      utils.initializeWithContext('dialog');
      const dialogInfo = { width: 10, height: 10, title: 'anything' };

      expect(() => dialog.resize(dialogInfo)).toThrowError(
        'resize requires a dialogInfo argument containing only width and height',
      );
    });
  });

  describe('submit', () => {
    it('should not allow calls before initialization', () => {
      expect(() => dialog.submit()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', () => {
      utils.initializeWithContext('settings');

      expect(() => dialog.submit()).toThrowError("This call is not allowed in the 'settings' context");
    });

    it('should not allow calls from authentication context', () => {
      utils.initializeWithContext('authentication');

      expect(() => dialog.submit()).toThrowError("This call is not allowed in the 'authentication' context");
    });

    it('should not allow calls from remove context', () => {
      utils.initializeWithContext('remove');

      expect(() => dialog.submit()).toThrowError("This call is not allowed in the 'remove' context");
    });

    it('should successfully pass result and appIds parameters when called from sidePanel context', () => {
      utils.initializeWithContext('sidePanel');

      dialog.submit('someResult', ['someAppId', 'someOtherAppId']);

      const submitMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitMessage).not.toBeNull();
      expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should successfully pass result and appIds parameters when called from Dialog context', () => {
      utils.initializeWithContext('dialog');

      dialog.submit('someResult', ['someAppId', 'someOtherAppId']);

      const submitMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitMessage).not.toBeNull();
      expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should handle a single string passed as appIds parameter', () => {
      utils.initializeWithContext('dialog');

      dialog.submit('someResult', 'someAppId');

      const submitMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitMessage).not.toBeNull();
      expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
    });
  });
});
