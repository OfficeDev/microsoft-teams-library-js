import { app } from '../../src/public/app';
import { DialogDimension, FrameContexts } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { DialogSize } from '../../src/public/interfaces';
import { BotUrlDialogInfo, UrlDialogInfo } from '../../src/public/interfaces';
import { Utils } from '../utils';
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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const emptyCallback = (): void => {};

    const dialogInfo: UrlDialogInfo = {
      url: 'someUrl',
      size: {
        height: DialogDimension.Small,
        width: DialogDimension.Small,
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => dialog.open(dialogInfo)).toThrowError('The library has not yet been initialized');
    });
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const dialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          dialog.open(dialogInfo, () => {
            return;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          utils.messages = [];
          await utils.initializeWithContext(context);
          dialog.open(dialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = utils.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
        });

        describe('send a message to dialog using returned function from dialog.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`should successfully send the post the message to dialog. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage');
            const message = utils.findMessageByFunc('messageForChild');
            expect(message).not.toBeUndefined();
          });
        });
      } else {
        it(`should not allow calls from context ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect(() => dialog.open(dialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
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
    describe('dialog.update.isSupported function', () => {
      it('dialog.update.isSupported should return false if the runtime says dialog is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });
      it('dialog.update.isSupported should return false if the runtime says dialog.update is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });
      it('dialog.update.isSupported should return true if the runtime says dialog and dialog.update is supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: { update: {} } } });
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
  describe('dialog.isSupported function', () => {
    it('dialog.isSupported should return false if the runtime says dialog is not supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(dialog.isSupported()).not.toBeTruthy();
    });

    it('dialog.update.isSupported should return true if the runtime says dialog is supported', () => {
      utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
      expect(dialog.isSupported()).toBeTruthy();
    });
  });

  describe('Open dialog with bot', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const emptyCallback = (): void => {};

    const dialogInfo: BotUrlDialogInfo = {
      url: 'someUrl',
      size: {
        height: DialogDimension.Small,
        width: DialogDimension.Small,
      },
      completionBotId: 'botId',
    };

    it('should not allow calls before initialization', () => {
      expect(() => dialog.bot.open(dialogInfo)).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await utils.initializeWithContext(context);
          const dialogInfo: BotUrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
            completionBotId: 'botId',
          };
          dialog.bot.open(dialogInfo, () => {
            return;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          utils.messages = [];
          await utils.initializeWithContext(context);
          dialog.bot.open(dialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = utils.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
        });

        describe('send a message to dialog using returned function from dialog.bot.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`should successfully send the post the message to dialog. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.bot.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage');
            const message = utils.findMessageByFunc('messageForChild');
            expect(message).not.toBeUndefined();
          });
        });
      } else {
        it(`should not allow calls from context ${context}`, async () => {
          await utils.initializeWithContext(context);
          expect(() => dialog.bot.open(dialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
    });

    describe('dialog.bot.isSupported function', () => {
      it('dialog.bot.isSupported should return false if the runtime says dialog is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(dialog.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.bot.isSupported should return false if the runtime says dialog.bot is not supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
        expect(dialog.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.bot.isSupported should return true if the runtime says dialog and dialog.bot is supported', () => {
        utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: { bot: {} } } });
        expect(dialog.bot.isSupported()).toBeTruthy();
      });
    });
  });

  describe('sendMessageToParentFromDialog', () => {
    const allowedContexts = [FrameContexts.task];
    it('should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => dialog.sendMessageToParentFromDialog('message')).toThrowError(
        'The library has not yet been initialized',
      );
    });

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        if (frameContext === FrameContexts.task) {
          it(`should successfully send the message to Parent: ${frameContext}`, async () => {
            await utils.initializeWithContext(frameContext);
            utils.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
            dialog.sendMessageToParentFromDialog('exampleMessage');
            const message = utils.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
          });
        } else {
          it(`should not allow calls from ${frameContext} context`, async () => {
            await utils.initializeWithContext(frameContext);
            expect(() => dialog.sendMessageToParentFromDialog('message')).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
  });

  describe('registerOnMessageFromParent', () => {
    it('should successfully register the handler.', async () => {
      let returnedMessage: string;
      let handlerCalled = false;
      await utils.initializeWithContext('content');
      const messageFromParent = 'messageFromParent';
      dialog.registerOnMessageFromParent(messageFromParent => {
        handlerCalled = true;
        returnedMessage = messageFromParent;
      });
      const message = utils.findMessageByFunc('registerHandler');
      utils.sendMessage('messageForChild', messageFromParent);
      expect(message).not.toBeNull();
      expect(handlerCalled).toBe(true);
      expect(returnedMessage).toEqual(messageFromParent);
    });
  });
});
