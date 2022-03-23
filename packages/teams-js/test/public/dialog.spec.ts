import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { DialogDimension, FrameContexts } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { DialogSize } from '../../src/public/interfaces';
import { BotUrlDialogInfo, UrlDialogInfo } from '../../src/public/interfaces';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('Dialog', () => {
  // Use to send a mock message from the app.

  const framedMock = new Utils();
  const framelessMock = new FramelessPostMocks();

  beforeEach(() => {
    framedMock.processMessage = null;
    framedMock.messages = [];
    framelessMock.messages = [];
    framedMock.childMessages = [];
    framedMock.childWindow.closed = false;
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
        it(`FRAMED: should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          const dialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          dialog.open(dialogInfo, () => {
            return;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`FRAMELESS: should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          const dialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          dialog.open(dialogInfo, () => {
            return;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`FRAMED: should invoke callback with error. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framedMock.respondToMessage(openMessage, 'someError');
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMELESS: should invoke callback with error. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framelessMock.respondToMessage({
            data: {
              id: openMessage.id,
              args: ['someError'],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMED: Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          framedMock.sendMessage('messageForParent', messageFromChild);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`FRAMELESS: Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          framelessMock.respondToMessage({
            data: {
              func: 'messageForParent',
              args: [messageFromChild],
            },
          } as DOMMessageEvent);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`FRAMED: should invoke callback with result. context: ${context} `, async () => {
          await framedMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framedMock.respondToMessage(openMessage, null, 'someResult');
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMELESS: should invoke callback with result. context: ${context} `, async () => {
          await framelessMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framelessMock.respondToMessage({
            data: {
              id: openMessage.id,
              args: [null, 'someResult'],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
        });

        describe('send a message to dialog using returned function from dialog.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`FRAMED: should successfully send the post the message to dialog. context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framedMock.findMessageByFunc('messageForChild');
            framedMock.respondToMessage(message, true);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully send the post the message to dialog. context: ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framelessMock.findMessageByFunc('messageForChild');

            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [true, null],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMED: should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framedMock.findMessageByFunc('messageForChild');
            framedMock.respondToMessage(message, false, error);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framelessMock.findMessageByFunc('messageForChild');
            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [false, error],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.open(dialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
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
          it(`FRAMED: should successfully pass DialogInfo in context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);

            dialog.update.resize(dimensions);
            const resizeMessage = framedMock.findMessageByFunc('tasks.updateTask');
            expect(resizeMessage).not.toBeNull();
            expect(resizeMessage.args).toEqual([dimensions]);
          });
          it(`FRAMELESS: should successfully pass DialogInfo in context: ${context}`, async () => {
            await framelessMock.initializeWithContext(context);

            dialog.update.resize(dimensions);
            const resizeMessage = framelessMock.findMessageByFunc('tasks.updateTask');
            expect(resizeMessage).not.toBeNull();
            expect(resizeMessage.args).toEqual([dimensions]);
          });
        } else {
          it(`FRAMED: should not allow calls from ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            expect(() => dialog.update.resize(dimensions)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
          it(`FRAMELESS: should not allow calls from ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
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
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });
      it('dialog.update.isSupported should return false if the runtime says dialog.update is not supported', () => {
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });
      it('dialog.update.isSupported should return true if the runtime says dialog and dialog.update is supported', () => {
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: { update: {} } } });
        expect(dialog.update.isSupported()).toBeTruthy();
      });
    });
  });
  describe('submit', () => {
    it('should not allow calls before initialization', () => {
      expect(() => dialog.submit()).toThrowError('The library has not yet been initialized');
    });
    const allowedContexts = [
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.meetingStage,
    ];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContexts => allowedContexts === context)) {
        it(`FRAMED: should successfully pass result and appIds parameters when called from ${JSON.stringify(
          context,
        )}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.submit('someResult', ['someAppId', 'someOtherAppId']);
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
        });

        it(`FRAMELESS: should successfully pass result and appIds parameters when called from ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.submit('someResult', ['someAppId', 'someOtherAppId']);
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
        });

        it(`FRAMED: should handle a single string passed as appIds parameter ${JSON.stringify(context)}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.submit('someResult', 'someAppId');
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
        });

        it(`FRAMELESS: should handle a single string passed as appIds parameter ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.submit('someResult', 'someAppId');
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
        });
      } else {
        it(`FRAMED: should not allow calls from context context: ${JSON.stringify(context)}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.submit()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
    });
  });
  describe('dialog.isSupported function', () => {
    it('dialog.isSupported should return false if the runtime says dialog is not supported', () => {
      framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(dialog.isSupported()).not.toBeTruthy();
    });

    it('dialog.update.isSupported should return true if the runtime says dialog is supported', () => {
      framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
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
      expect(() => dialog.open(dialogInfo)).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`FRAMED: should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
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
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`FRAMELESS: should pass along entire DialogInfo parameter in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
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
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialogInfo]);
        });

        it(`FRAMED: should invoke callback with error. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framedMock.respondToMessage(openMessage, 'someError');
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMELESS: should invoke callback with error. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBe('someError');
            expect(resultObj.result).toBeUndefined();
            callbackCalled = true;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framelessMock.respondToMessage({
            data: {
              id: openMessage.id,
              args: ['someError'],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMED: Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          framedMock.sendMessage('messageForParent', messageFromChild);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`FRAMELESS: Should register messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          const messageFromChild = 'MessageFromChild';
          let returnedMessage: string;
          let handlerCalled = false;
          dialog.open(dialogInfo, emptyCallback, messageFromChild => {
            handlerCalled = true;
            returnedMessage = messageFromChild;
          });
          framelessMock.respondToMessage({
            data: {
              func: 'messageForParent',
              args: [messageFromChild],
            },
          } as DOMMessageEvent);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerCalled).toBe(true);
          expect(returnedMessage).toEqual(messageFromChild);
        });

        it(`FRAMED: should invoke callback with result. context: ${context} `, async () => {
          await framedMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framedMock.respondToMessage(openMessage, null, 'someResult');
          expect(callbackCalled).toBe(true);
        });

        it(`FRAMELESS: should invoke callback with result. context: ${context} `, async () => {
          await framelessMock.initializeWithContext(context);
          let callbackCalled = false;
          dialog.open(dialogInfo, resultObj => {
            expect(resultObj.err).toBeNull();
            expect(resultObj.result).toBe('someResult');
            callbackCalled = true;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          framelessMock.respondToMessage({
            data: {
              id: openMessage.id,
              args: [null, 'someResult'],
            },
          } as DOMMessageEvent);
          expect(callbackCalled).toBe(true);
        });

        describe('send a message to dialog using returned function from dialog.open API call', () => {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          const emptyCallback = (): void => {};
          it(`FRAMED: should successfully send the post the message to dialog. context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framedMock.findMessageByFunc('messageForChild');
            framedMock.respondToMessage(message, true);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully send the post the message to dialog. context: ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framelessMock.findMessageByFunc('messageForChild');
            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [true, null],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMED: should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framedMock.findMessageByFunc('messageForChild');
            framedMock.respondToMessage(message, false, error);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully receive the error message if the post message to dialog fails. context: ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            const error = 'some Error Occured';
            const sendMessageToDialogHandler = dialog.open(dialogInfo, emptyCallback, emptyCallback);
            sendMessageToDialogHandler('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framelessMock.findMessageByFunc('messageForChild');
            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [false, error],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.open(dialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
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
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
        expect(dialog.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.bot.isSupported should return false if the runtime says dialog.bot is not supported', () => {
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
        expect(dialog.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.bot.isSupported should return true if the runtime says dialog and dialog.bot is supported', () => {
        framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: { bot: {} } } });
        expect(dialog.bot.isSupported()).toBeTruthy();
      });
    });
  });

  describe('sendMessageToParentFromDialog', () => {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const emptyCallback = () => {
      return;
    };
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
          it(`FRAMED: should successfully send the message to Parent: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framedMock.findMessageByFunc('messageForParent');
            framedMock.respondToMessage(message, true);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully send the message to Parent: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage', (success, reason) => {
              expect(success).toBeTruthy();
              expect(reason).toBeNull;
            });
            const message = framelessMock.findMessageByFunc('messageForParent');
            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [true, null],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMED: should successfully throws the error if the message fails to send: ${frameContext}`, async () => {
            const error = 'some Error Occured';
            await framedMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framedMock.findMessageByFunc('messageForParent');
            framedMock.respondToMessage(message, false, error);
            expect(message).not.toBeUndefined();
          });

          it(`FRAMELESS: should successfully throws the error if the message fails to send: ${frameContext}`, async () => {
            const error = 'some Error Occured';
            await framelessMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage', (success, reason) => {
              expect(success).toBeFalsy();
              expect(reason).toBe(error);
            });
            const message = framelessMock.findMessageByFunc('messageForParent');
            framelessMock.respondToMessage({
              data: {
                id: message.id,
                args: [false, error],
              },
            } as DOMMessageEvent);
            expect(message).not.toBeUndefined();
          });
        } else {
          it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(() => dialog.sendMessageToParentFromDialog('message', emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
          it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(() => dialog.sendMessageToParentFromDialog('message', emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
  });

  describe('registerOnMessageFromParent', () => {
    it('FRAMED: should successfully register the handler.', async () => {
      let returnedMessage: string;
      let handlerCalled = false;
      await framedMock.initializeWithContext('content');
      const messageFromParent = 'messageFromParent';
      dialog.registerOnMessageFromParent(messageFromParent => {
        handlerCalled = true;
        returnedMessage = messageFromParent;
      });
      const message = framedMock.findMessageByFunc('registerHandler');
      framedMock.sendMessage('messageForChild', messageFromParent);
      expect(message).not.toBeNull();
      expect(handlerCalled).toBe(true);
      expect(returnedMessage).toEqual(messageFromParent);
    });

    it('FRAMELESS: should successfully register the handler.', async () => {
      let returnedMessage: string;
      let handlerCalled = false;
      await framelessMock.initializeWithContext('content');
      const messageFromParent = 'messageFromParent';
      dialog.registerOnMessageFromParent(messageFromParent => {
        handlerCalled = true;
        returnedMessage = messageFromParent;
      });
      const message = framelessMock.findMessageByFunc('registerHandler');
      framelessMock.respondToMessage({
        data: {
          func: 'messageForChild',
          args: [messageFromParent],
        },
      } as DOMMessageEvent);
      expect(message).not.toBeNull();
      expect(handlerCalled).toBe(true);
      expect(returnedMessage).toEqual(messageFromParent);
    });
  });
});
