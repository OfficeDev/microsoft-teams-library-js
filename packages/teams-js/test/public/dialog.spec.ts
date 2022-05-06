import { app } from '../../src/public/app';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { DialogSize } from '../../src/public/interfaces';
import { BotUrlDialogInfo, UrlDialogInfo } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

describe('Dialog', () => {
  // Use to send a mock message from the app.

  const framedMock = new Utils();
  const framelessMock = new FramelessPostMocks();
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const emptyCallback = (): void => {};

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
      framedMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('open', () => {
    const urlDialogInfo: UrlDialogInfo = {
      url: 'someUrl',
      size: {
        height: DialogDimension.Small,
        width: DialogDimension.Small,
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => dialog.open(urlDialogInfo)).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            dialog.open(urlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should pass along entire urlDialogInfo parameter in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          const urlDialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          dialog.open(urlDialogInfo, () => {
            return;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.getDialogInfoFromUrlDialogInfo(urlDialogInfo)]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            dialog.open(urlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should pass along entire urlDialogInfo parameter in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          const urlDialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          dialog.open(urlDialogInfo, () => {
            return;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.getDialogInfoFromUrlDialogInfo(urlDialogInfo)]);
        });

        it(`FRAMED: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.open(urlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.open(urlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMED: should initiate the post message to dialog. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.sendMessageToDialog('exampleMessage');
          const message = framedMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });

        it(`FRAMELESS: should initiate the post message to dialog. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.sendMessageToDialog('exampleMessage');
          const message = framelessMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.open(urlDialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });

        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          expect(() => dialog.open(urlDialogInfo)).toThrowError(
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
          it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(1);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should throw error when dialog.update is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
            expect.assertions(1);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should successfully pass dimensions in context: ${context}`, async () => {
            await framedMock.initializeWithContext(context);

            dialog.update.resize(dimensions);
            const resizeMessage = framedMock.findMessageByFunc('tasks.updateTask');
            expect(resizeMessage).not.toBeNull();
            expect(resizeMessage.args).toEqual([dimensions]);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should throw error when dialog.update is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
            expect.assertions(4);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should successfully pass dimensions in context: ${context}`, async () => {
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
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            dialog.submit('someResult', ['someAppId', 'someOtherAppId']);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should successfully pass result and appIds parameters when called from ${JSON.stringify(
          context,
        )}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.submit('someResult', ['someAppId', 'someOtherAppId']);
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            dialog.submit('someResult', ['someAppId', 'someOtherAppId']);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
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
        it(`FRAMED: should successfully pass results when no appIds parameters are provided ${JSON.stringify(
          context,
        )}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.submit('someResult');
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', []]);
        });

        it(`FRAMELESS: should successfully pass results when no appIds parameters are provided ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.submit('someResult');
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', []]);
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
    const botUrlDialogInfo: BotUrlDialogInfo = {
      url: 'someUrl',
      size: {
        height: DialogDimension.Small,
        width: DialogDimension.Small,
      },
      completionBotId: 'botId',
    };

    it('should not allow calls before initialization', () => {
      expect(() => dialog.bot.open(botUrlDialogInfo)).toThrowError('The library has not yet been initialized');
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach(context => {
      if (allowedContexts.some(allowedContext => allowedContext === context)) {
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            dialog.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should throw error when dialog.bot is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
          expect.assertions(1);
          try {
            dialog.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          const botUrlDialogInfo: BotUrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
            completionBotId: 'botId',
          };
          dialog.bot.open(botUrlDialogInfo, () => {
            return;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo)]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            dialog.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should throw error when dialog.bot is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: { dialog: {} } });
          expect.assertions(4);
          try {
            dialog.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          const botUrlDialogInfo: BotUrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
            completionBotId: 'botId',
          };
          dialog.bot.open(botUrlDialogInfo, () => {
            return;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo)]);
        });

        it(`FRAMED: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.bot.open(botUrlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.bot.open(botUrlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.bot.open(botUrlDialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });

        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          expect(() => dialog.bot.open(botUrlDialogInfo)).toThrowError(
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

  describe('sendMessageToDialog', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => dialog.sendMessageToDialog('message')).toThrowError('The library has not yet been initialized');
    });

    Object.values(FrameContexts).forEach(frameContext => {
      if (allowedContexts.some(allowedContexts => allowedContexts === frameContext)) {
        it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(1);
          try {
            dialog.sendMessageToDialog('exampleMessage');
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should initiate the post message to Child: ${frameContext}`, async () => {
          await framedMock.initializeWithContext(frameContext);
          dialog.sendMessageToDialog('exampleMessage');
          const message = framedMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            dialog.sendMessageToDialog('exampleMessage');
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should initiate the post message to Child: ${frameContext}`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          dialog.sendMessageToDialog('exampleMessage');
          const message = framelessMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });
      } else {
        it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          expect(() => dialog.sendMessageToDialog('message')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${frameContext}".`,
          );
        });

        it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          expect(() => dialog.sendMessageToDialog('message')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${frameContext}".`,
          );
        });
      }
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
          it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(1);
            try {
              dialog.sendMessageToParentFromDialog('exampleMessage');
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should initiate the post message to Parent: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage');
            const message = framedMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              dialog.sendMessageToParentFromDialog('exampleMessage');
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should initiate the post message to Parent: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            dialog.sendMessageToParentFromDialog('exampleMessage');
            const message = framelessMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });
        } else {
          it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(() => dialog.sendMessageToParentFromDialog('message')).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });

          it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
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
    const allowedContexts = [FrameContexts.task];

    it('should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => dialog.registerOnMessageFromParent(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    Object.keys(FrameContexts)
      .map(k => FrameContexts[k])
      .forEach(frameContext => {
        if (frameContext === FrameContexts.task) {
          it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(1);
            try {
              dialog.registerOnMessageFromParent(emptyCallback);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should initiate the registration call: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            dialog.registerOnMessageFromParent(emptyCallback);
            const message = framedMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
            expect.assertions(4);
            try {
              dialog.registerOnMessageFromParent(emptyCallback);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should initiate the registration call: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            dialog.registerOnMessageFromParent(emptyCallback);
            const message = framelessMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });
        } else {
          it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(() => dialog.registerOnMessageFromParent(emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });

          it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(() => dialog.registerOnMessageFromParent(emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
  });
});
