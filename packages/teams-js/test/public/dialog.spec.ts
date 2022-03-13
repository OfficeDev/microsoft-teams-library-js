import { DialogInfo, DialogSize } from '../../src/public/interfaces';
import { DialogDimension, FrameContexts } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { Utils } from '../utils';
import { app } from '../../src/public/app';

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
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('open', () => {
    it('should not allow calls before initialization', () => {
      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "remove".',
      );
    });

    it('should not allow calls from task context', async () => {
      await utils.initializeWithContext('task');

      const dialogInfo: DialogInfo = {};
      expect(() => dialog.open(dialogInfo)).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","meetingStage"]. Current context: "task".',
      );
    });

    it('should pass along entire DialogInfo parameter in sidePanel context', async () => {
      await utils.initializeWithContext('sidePanel');

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

    it('should pass along entire DialogInfo parameter in content', async () => {
      await utils.initializeWithContext('content');

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

    it('should invoke callback with result', async () => {
      await utils.initializeWithContext('content');

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

    it('should invoke callback with error', async () => {
      await utils.initializeWithContext('content');

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
  describe('Update', () => {
    describe('resize function', () => {
      const allowedContexts = [
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.task,
        FrameContexts.meetingStage,
      ];
      const dimensions: DialogSize = { width: 10, height: 10 };

      it('should not allow calls before initialization', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => dialog.update.resize({} as any)).toThrowError('The library has not yet been initialized');
      });
      Object.values(FrameContexts).forEach(context => {
        if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
          it(`should successfully pass DialogInfo in context: ${context}`, async () => {
            await utils.initializeWithContext(context);

            dialog.update.resize(dimensions);
            const resizeMessage = utils.findMessageByFunc('tasks.updateTask');
            expect(resizeMessage).not.toBeNull();
            console.log([dimensions.width, dimensions.height]);
            expect(resizeMessage.args).toEqual([dimensions]);
          });
        } else {
          it(`should not allow calls from ${context} context`, async () => {
            await utils.initializeWithContext(context);
            expect(() => dialog.update.resize(dimensions)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
    describe('isSupported function', () => {
      it('dialog.update.isSupported should return false if the runtime says dialog is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });

      it('dialog.update.isSupported should return true if the runtime says dialog is supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
        expect(dialog.update.isSupported()).toBeTruthy();
      });
    });
  });

  describe('submit', () => {
    it('should not allow calls before initialization', () => {
      expect(() => dialog.submit()).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls from settings context', async () => {
      await utils.initializeWithContext('settings');

      expect(() => dialog.submit()).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","task","meetingStage"]. Current context: "settings".',
      );
    });

    it('should not allow calls from authentication context', async () => {
      await utils.initializeWithContext('authentication');

      expect(() => dialog.submit()).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","task","meetingStage"]. Current context: "authentication".',
      );
    });

    it('should not allow calls from remove context', async () => {
      await utils.initializeWithContext('remove');

      expect(() => dialog.submit()).toThrowError(
        'This call is only allowed in following contexts: ["content","sidePanel","task","meetingStage"]. Current context: "remove".',
      );
    });

    it('should successfully pass result and appIds parameters when called from Task context', async () => {
      await utils.initializeWithContext('task');

      dialog.submit('someResult', ['someAppId', 'someOtherAppId']);

      const submitMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitMessage).not.toBeNull();
      expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
    });

    it('should handle a single string passed as appIds parameter', async () => {
      await utils.initializeWithContext('task');

      dialog.submit('someResult', 'someAppId');

      const submitMessage = utils.findMessageByFunc('tasks.completeTask');
      expect(submitMessage).not.toBeNull();
      expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
    });
  });
});
