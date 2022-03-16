import { app } from '../../src/public/app';
import { DialogDimension, FrameContexts } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { BotUrlDialogInfo, DialogInfo, UrlDialogInfo } from '../../src/public/interfaces';
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

        it(`should invoke callback with error. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          utils.respondToMessage(openMessage, 'someError');
          expect(callbackCalled).toBe(true);
        });

        it(`Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          utils.sendMessage('messageForParent', messageFromChild);
          const handlerMessage = utils.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`should invoke callback with result. context: ${context} `, async () => {
          await utils.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          utils.respondToMessage(openMessage, null, 'someResult');
          expect(callbackCalled).toBe(true);
        });

        describe('send a message to dialog using returned function from dialog.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`should successfully send the post the message to dialog. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = utils.findMessageByFunc('messageForChild');
            utils.respondToMessage(message, true);
            expect(message).not.toBeUndefined();
          });

          it(`should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = utils.findMessageByFunc('messageForChild');
            utils.respondToMessage(message, false, error);
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

  describe('resize', () => {
    it('should not allow calls before initialization', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => dialog.resize({} as any)).toThrowError('The library has not yet been initialized');
    });

    it('should successfully pass DialogInfo in Task context', async () => {
      await utils.initializeWithContext('task');
      const dialogInfo = { width: 10, height: 10 };
      dialog.resize(dialogInfo);
      const resizeMessage = utils.findMessageByFunc('tasks.updateTask');
      expect(resizeMessage).not.toBeNull();
      expect(resizeMessage.args).toEqual([dialogInfo]);
    });

    it('should throw an error if extra properties are provided', async () => {
      await utils.initializeWithContext('task');
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
      expect(() => dialog.open(dialogInfo)).toThrowError('The library has not yet been initialized');
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
          dialog.open(dialogInfo, () => {
            return;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`should invoke callback with error. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          utils.respondToMessage(openMessage, 'someError');
          expect(callbackCalled).toBe(true);
        });

        it(`Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await utils.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          utils.sendMessage('messageForParent', messageFromChild);
          const handlerMessage = utils.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`should invoke callback with result. context: ${context} `, async () => {
          await utils.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = utils.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          utils.respondToMessage(openMessage, null, 'someResult');
          expect(callbackCalled).toBe(true);
        });

        describe('send a message to dialog using returned function from dialog.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`should successfully send the post the message to dialog. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = utils.findMessageByFunc('messageForChild');
            utils.respondToMessage(message, true);
            expect(message).not.toBeUndefined();
          });

          it(`should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await utils.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = utils.findMessageByFunc('messageForChild');
            utils.respondToMessage(message, false, error);
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
});
