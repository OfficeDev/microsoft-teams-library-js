import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { doesHandlerExist } from '../../src/internal/handlers';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import {
  DialogDimension,
  errorNotSupportedOnPlatform,
  FrameContexts,
  minAdaptiveCardVersion,
} from '../../src/public/constants';
import { dialog } from '../../src/public/dialog';
import { AdaptiveCardDialogInfo, BotAdaptiveCardDialogInfo, DialogSize } from '../../src/public/interfaces';
import { BotUrlDialogInfo, UrlDialogInfo } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

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
      expect(() => dialog.url.open(urlDialogInfo)).toThrowError(errorLibraryNotInitialized);
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            dialog.url.open(urlDialogInfo);
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
          dialog.url.open(urlDialogInfo, () => {
            return;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.url.getDialogInfoFromUrlDialogInfo(urlDialogInfo)]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(4);
          try {
            dialog.url.open(urlDialogInfo);
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
          dialog.url.open(urlDialogInfo, () => {
            return;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.url.getDialogInfoFromUrlDialogInfo(urlDialogInfo)]);
        });

        it(`FRAMED: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.url.open(urlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.url.open(urlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMED: should initiate the post message to dialog. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.url.sendMessageToDialog('exampleMessage');
          const message = framedMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });

        it(`FRAMELESS: should initiate the post message to dialog. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.url.sendMessageToDialog('exampleMessage');
          const message = framelessMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });
        it(`FRAMED: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
          framedMock.initializeWithContext(context).then(() => {
            expect.assertions(2);
            const urlDialogInfo: UrlDialogInfo = {
              url: 'someUrl',
              size: { height: DialogDimension.Large, width: DialogDimension.Large },
              title: 'someTitle',
              fallbackUrl: 'someFallbackUrl',
            };
            const submitString = 'succesfullySubmit';

            dialog.url.open(urlDialogInfo, (result: dialog.ISdkResponse): void => {
              expect(result.result).toBe(submitString);
              expect(result.err).toBeFalsy();
              done();
            });
            const message = framedMock.findMessageByFunc('tasks.startTask');

            framedMock.respondToMessage(message, undefined, submitString);
          });
        });

        it(`Frameless: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
          framelessMock.initializeWithContext(context).then(() => {
            expect.assertions(5);
            const urlDialogInfo: UrlDialogInfo = {
              url: 'someUrl',
              size: { height: DialogDimension.Large, width: DialogDimension.Large },
              title: 'someTitle',
              fallbackUrl: 'someFallbackUrl',
            };
            const submitString = 'succesfullySubmit';
            dialog.url.open(urlDialogInfo, (result: dialog.ISdkResponse) => {
              expect(result.result).toBe(submitString);
              expect(result.err).toBeFalsy();
              done();
            });
            const message = framelessMock.findMessageByFunc('tasks.startTask');

            const callbackId = message.id;
            framelessMock.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, submitString],
              },
            } as DOMMessageEvent);
          });
        });

        it(`FRAMED: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
          framedMock.initializeWithContext(context).then(() => {
            expect.assertions(2);
            const urlDialogInfo: UrlDialogInfo = {
              url: 'someUrl',
              size: { height: DialogDimension.Large, width: DialogDimension.Large },
              title: 'someTitle',
              fallbackUrl: 'someFallbackUrl',
            };
            const error = { errorCode: 500, message: 'Internal Error Occured' };

            dialog.url.open(urlDialogInfo, (result: dialog.ISdkResponse): void => {
              expect(result.result).toBeFalsy();
              expect(result.err).toBe(error);
              done();
            });
            const message = framedMock.findMessageByFunc('tasks.startTask');

            framedMock.respondToMessage(message, error, undefined);
          });
        });

        it(`Frameless: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
          framelessMock.initializeWithContext(context).then(() => {
            expect.assertions(5);
            const urlDialogInfo: UrlDialogInfo = {
              url: 'someUrl',
              size: { height: DialogDimension.Large, width: DialogDimension.Large },
              title: 'someTitle',
              fallbackUrl: 'someFallbackUrl',
            };
            dialog.url.open(urlDialogInfo, (result: dialog.ISdkResponse) => {
              expect(result.result).toBeFalsy();
              expect(result.err).toBe(error);
              done();
            });
            const error = { errorCode: 500, message: 'Internal Error Occured' };
            const message = framelessMock.findMessageByFunc('tasks.startTask');

            const callbackId = message.id;
            framelessMock.respondToMessage({
              data: {
                id: callbackId,
                args: [error, undefined],
              },
            } as DOMMessageEvent);
          });
        });

        it(`FRAMELESS: Should successfully unregister the messageForParent handler when dialog is closed. ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);

          expect.assertions(5);

          const urlDialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          const submitString = 'succesfullySubmit';

          dialog.url.open(urlDialogInfo, undefined, emptyCallback);
          const message = framelessMock.findMessageByFunc('tasks.startTask');
          expect(doesHandlerExist('messageForParent')).toBeTruthy();
          const callbackId = message.id;
          framelessMock.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, submitString],
            },
          } as DOMMessageEvent);
          expect(doesHandlerExist('messageForParent')).toBeFalsy();
        });

        it(`FRAMED: Should successfully unregister the messageForParent handler when dialog is closed. ${context} context`, async () => {
          await framedMock.initializeWithContext(context);

          expect.assertions(2);

          const urlDialogInfo: UrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
          };
          const submitString = 'succesfullySubmit';

          dialog.url.open(urlDialogInfo, undefined, emptyCallback);
          expect(doesHandlerExist('messageForParent')).toBeTruthy();
          const message = framedMock.findMessageByFunc('tasks.startTask');

          framedMock.respondToMessage(message, null, submitString);
          expect(doesHandlerExist('messageForParent')).toBeFalsy();
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.url.open(urlDialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });

        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          expect(() => dialog.url.open(urlDialogInfo)).toThrowError(
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
        expect(() => dialog.update.resize({} as any)).toThrowError(errorLibraryNotInitialized);
      });
      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
          it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(1);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should throw error when dialog.update is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
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
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(4);
            try {
              dialog.update.resize(dimensions);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should throw error when dialog.update is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
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
      it('dialog.update.isSupported should return false if the runtime says dialog is not supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });

      it('dialog.update.isSupported should return false if the runtime says dialog.update is not supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
        expect(dialog.update.isSupported()).not.toBeTruthy();
      });

      it('dialog.update.isSupported should return true if the runtime says dialog and dialog.update is supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { update: {} } } });
        expect(dialog.update.isSupported()).toBeTruthy();
      });

      it('dialog.update.isSupported should throw before initialization', () => {
        framedMock.uninitializeRuntimeConfig();
        expect(() => dialog.update.isSupported()).toThrowError(errorLibraryNotInitialized);
      });
    });
  });
  describe('submit', () => {
    it('should not allow calls before initialization', () => {
      expect(() => dialog.url.submit()).toThrowError(errorLibraryNotInitialized);
    });
    const allowedContexts = [FrameContexts.content, FrameContexts.task];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === context)) {
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            dialog.url.submit('someResult', ['someAppId', 'someOtherAppId']);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should successfully pass result and appIds parameters when called from ${JSON.stringify(
          context,
        )}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.url.submit('someResult', ['someAppId', 'someOtherAppId']);
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(4);
          try {
            dialog.url.submit('someResult', ['someAppId', 'someOtherAppId']);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should successfully pass result and appIds parameters when called from ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.url.submit('someResult', ['someAppId', 'someOtherAppId']);
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId', 'someOtherAppId']]);
        });

        it(`FRAMED: should handle a single string passed as appIds parameter ${JSON.stringify(context)}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.url.submit('someResult', 'someAppId');
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
        });

        it(`FRAMELESS: should handle a single string passed as appIds parameter ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.url.submit('someResult', 'someAppId');
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', ['someAppId']]);
        });
        it(`FRAMED: should successfully pass results when no appIds parameters are provided ${JSON.stringify(
          context,
        )}`, async () => {
          await framedMock.initializeWithContext(context);
          dialog.url.submit('someResult');
          const submitMessage = framedMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', []]);
        });

        it(`FRAMELESS: should successfully pass results when no appIds parameters are provided ${JSON.stringify(
          context,
        )}`, async () => {
          await framelessMock.initializeWithContext(context);
          dialog.url.submit('someResult');
          const submitMessage = framelessMock.findMessageByFunc('tasks.completeTask');
          expect(submitMessage).not.toBeNull();
          expect(submitMessage.args).toEqual(['someResult', []]);
        });
      } else {
        it(`FRAMED: should not allow calls from context context: ${JSON.stringify(context)}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.url.submit()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
    });
  });
  describe('dialog.isSupported function', () => {
    it('dialog.isSupported should return false if the runtime says dialog is not supported', async () => {
      await framedMock.initializeWithContext(FrameContexts.content);
      framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect(dialog.isSupported()).not.toBeTruthy();
    });

    it('dialog.update.isSupported should return true if the runtime says dialog is supported', async () => {
      await framedMock.initializeWithContext(FrameContexts.content);
      framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
      expect(dialog.isSupported()).toBeTruthy();
    });
    it('dialog.update.isSupported should throw before initialization', () => {
      framedMock.uninitializeRuntimeConfig();
      expect(() => dialog.update.isSupported()).toThrowError(errorLibraryNotInitialized);
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
      expect(() => dialog.url.bot.open(botUrlDialogInfo)).toThrowError(errorLibraryNotInitialized);
    });

    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            dialog.url.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should throw error when dialog.url.bot is not supported in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
          expect.assertions(1);
          try {
            dialog.url.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          const botUrlDialogInfo: BotUrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
            completionBotId: 'botId',
          };
          dialog.url.bot.open(botUrlDialogInfo, () => {
            return;
          });
          const openMessage = framedMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.url.getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo)]);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(4);
          try {
            dialog.url.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should throw error when dialog.url.bot is not supported in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
          expect.assertions(4);
          try {
            dialog.url.bot.open(botUrlDialogInfo);
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          const botUrlDialogInfo: BotUrlDialogInfo = {
            url: 'someUrl',
            size: { height: DialogDimension.Large, width: DialogDimension.Large },
            title: 'someTitle',
            fallbackUrl: 'someFallbackUrl',
            completionBotId: 'botId',
          };
          dialog.url.bot.open(botUrlDialogInfo, () => {
            return;
          });
          const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
          expect(openMessage).not.toBeNull();
          expect(openMessage.args).toEqual([dialog.url.getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo)]);
        });

        it(`FRAMED: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          dialog.url.bot.open(botUrlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framedMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: Should initiate the registration for messageFromChildHandler if it is passed. context: ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          dialog.url.bot.open(botUrlDialogInfo, emptyCallback, emptyCallback);
          const handlerMessage = framelessMock.findMessageByFunc('registerHandler');
          expect(handlerMessage).not.toBeNull();
          expect(handlerMessage.args).toStrictEqual(['messageForParent']);
        });

        it(`FRAMELESS: Should successfully unregister the messageForParent handler when dialog is closed. ${context} context`, async () => {
          await framelessMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          expect.assertions(5);
          const submitString = 'succesfullySubmit';
          dialog.url.bot.open(botUrlDialogInfo, undefined, emptyCallback);
          const message = framelessMock.findMessageByFunc('tasks.startTask');
          expect(doesHandlerExist('messageForParent')).toBeTruthy();
          const callbackId = message.id;
          framelessMock.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, submitString],
            },
          } as DOMMessageEvent);
          expect(doesHandlerExist('messageForParent')).toBeFalsy();
        });

        it(`FRAMED: Should successfully unregister the messageForParent handler when dialog is closed. ${context} context`, async () => {
          await framedMock.initializeWithContext(context);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
          expect.assertions(2);

          const submitString = 'succesfullySubmit';
          dialog.url.bot.open(botUrlDialogInfo, undefined, emptyCallback);
          expect(doesHandlerExist('messageForParent')).toBeTruthy();
          const message = framedMock.findMessageByFunc('tasks.startTask');

          framedMock.respondToMessage(message, null, submitString);
          expect(doesHandlerExist('messageForParent')).toBeFalsy();
        });

        it(`FRAMED: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
          framedMock.initializeWithContext(context).then(() => {
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
            expect.assertions(2);

            const submitString = 'succesfullySubmit';

            dialog.url.bot.open(botUrlDialogInfo, (result: dialog.ISdkResponse): void => {
              expect(result.result).toBe(submitString);
              expect(result.err).toBeFalsy();
              done();
            });
            const message = framedMock.findMessageByFunc('tasks.startTask');

            framedMock.respondToMessage(message, undefined, submitString);
          });
        });

        it(`FRAMELESS: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
          framelessMock.initializeWithContext(context).then(() => {
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
            const submitString = 'succesfullySubmit';
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            dialog.url.bot.open(botUrlDialogInfo, (result: dialog.ISdkResponse) => {
              expect(result.result).toBe(submitString);
              expect(result.err).toBeFalsy();
              done();
            });
            const message = framelessMock.findMessageByFunc('tasks.startTask');

            const callbackId = message.id;
            framelessMock.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, submitString],
              },
            } as DOMMessageEvent);
          });
        });

        it(`FRAMED: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
          framedMock.initializeWithContext(context).then(() => {
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
            expect.assertions(2);
            const error = { errorCode: 500, message: 'Internal Error Occured' };
            dialog.url.bot.open(botUrlDialogInfo, (result: dialog.ISdkResponse): void => {
              expect(result.result).toBeFalsy();
              expect(result.err).toBe(error);
              done();
            });
            const message = framedMock.findMessageByFunc('tasks.startTask');

            framedMock.respondToMessage(message, error, undefined);
          });
        });

        it(`FRAMELESS: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
          framelessMock.initializeWithContext(context).then(() => {
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
            dialog.url.bot.open(botUrlDialogInfo, (result: dialog.ISdkResponse) => {
              expect(result.result).toBeFalsy();
              expect(result.err).toBe(error);
              done();
            });
            const error = { errorCode: 500, message: 'Internal Error Occured' };
            const message = framelessMock.findMessageByFunc('tasks.startTask');

            const callbackId = message.id;
            framelessMock.respondToMessage({
              data: {
                id: callbackId,
                args: [error, undefined],
              },
            } as DOMMessageEvent);
          });
        });
      } else {
        it(`FRAMED: should not allow calls from context ${context}`, async () => {
          await framedMock.initializeWithContext(context);
          expect(() => dialog.url.bot.open(botUrlDialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });

        it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
          await framelessMock.initializeWithContext(context);
          expect(() => dialog.url.bot.open(botUrlDialogInfo)).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: ${JSON.stringify(context)}.`,
          );
        });
      }
    });

    describe('dialog.url.bot.isSupported function', () => {
      it('dialog.url.bot.isSupported should return false if the runtime says dialog is not supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(dialog.url.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.url.bot.isSupported should return false if the runtime says dialog.url.bot is not supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
        expect(dialog.url.bot.isSupported()).not.toBeTruthy();
      });

      it('dialog.url.bot.isSupported should return false if the runtime says dialog and dialog.url is supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: {} } } });
        expect(dialog.url.bot.isSupported()).toBeFalsy();
      });

      it('dialog.url.bot.isSupported should return true if the runtime says dialog and dialog.url.bot is supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { url: { bot: {} } } } });
        expect(dialog.url.bot.isSupported()).toBeTruthy();
      });

      it('dialog.url.bot.isSupported should throw before initialization', () => {
        framedMock.uninitializeRuntimeConfig();
        expect(() => dialog.url.bot.isSupported()).toThrowError(errorLibraryNotInitialized);
      });
    });
  });

  describe('sendMessageToDialog', () => {
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    it('should not allow calls before initialization', () => {
      expect.assertions(1);
      expect(() => dialog.url.sendMessageToDialog('message')).toThrowError(errorLibraryNotInitialized);
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedContexts.some((allowedContexts) => allowedContexts === frameContext)) {
        it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(1);
          try {
            dialog.url.sendMessageToDialog('exampleMessage');
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMED: should initiate the post message to Child: ${frameContext}`, async () => {
          await framedMock.initializeWithContext(frameContext);
          dialog.url.sendMessageToDialog('exampleMessage');
          const message = framedMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });

        it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect.assertions(4);
          try {
            dialog.url.sendMessageToDialog('exampleMessage');
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it(`FRAMELESS: should initiate the post message to Child: ${frameContext}`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          dialog.url.sendMessageToDialog('exampleMessage');
          const message = framelessMock.findMessageByFunc('messageForChild');
          expect(message).not.toBeUndefined();
          expect(message.args).toStrictEqual(['exampleMessage']);
        });
      } else {
        it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
          await framedMock.initializeWithContext(frameContext);
          expect(() => dialog.url.sendMessageToDialog('message')).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${frameContext}".`,
          );
        });

        it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
          await framelessMock.initializeWithContext(frameContext);
          expect(() => dialog.url.sendMessageToDialog('message')).toThrowError(
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
      expect(() => dialog.url.sendMessageToParentFromDialog('message')).toThrowError(errorLibraryNotInitialized);
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        if (frameContext === FrameContexts.task) {
          it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(1);
            try {
              dialog.url.sendMessageToParentFromDialog('exampleMessage');
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should initiate the post message to Parent: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            dialog.url.sendMessageToParentFromDialog('exampleMessage');
            const message = framedMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(4);
            try {
              dialog.url.sendMessageToParentFromDialog('exampleMessage');
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should initiate the post message to Parent: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            dialog.url.sendMessageToParentFromDialog('exampleMessage');
            const message = framelessMock.findMessageByFunc('messageForParent');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['exampleMessage']);
          });
        } else {
          it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(() => dialog.url.sendMessageToParentFromDialog('message')).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });

          it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(() => dialog.url.sendMessageToParentFromDialog('message')).toThrowError(
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
      expect(() => dialog.url.registerOnMessageFromParent(emptyCallback)).toThrowError(errorLibraryNotInitialized);
    });

    Object.keys(FrameContexts)
      .map((k) => FrameContexts[k])
      .forEach((frameContext) => {
        if (frameContext === FrameContexts.task) {
          it(`FRAMED: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(1);
            try {
              dialog.url.registerOnMessageFromParent(emptyCallback);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should initiate the registration call: ${frameContext}`, async () => {
            await framedMock.initializeWithContext(frameContext);
            dialog.url.registerOnMessageFromParent(emptyCallback);
            const message = framedMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(4);
            try {
              dialog.url.registerOnMessageFromParent(emptyCallback);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should initiate the registration call: ${frameContext}`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            dialog.url.registerOnMessageFromParent(emptyCallback);
            const message = framelessMock.findMessageByFunc('registerHandler');
            expect(message).not.toBeUndefined();
            expect(message.args).toStrictEqual(['messageForChild']);
          });
        } else {
          it(`FRAMED: should not allow calls from ${frameContext} context`, async () => {
            await framedMock.initializeWithContext(frameContext);
            expect(() => dialog.url.registerOnMessageFromParent(emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });

          it(`FRAMELESS: should not allow calls from ${frameContext} context`, async () => {
            await framelessMock.initializeWithContext(frameContext);
            expect(() => dialog.url.registerOnMessageFromParent(emptyCallback)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${frameContext}".`,
            );
          });
        }
      });
  });

  describe('Testing dialog.adaptiveCard', () => {
    const renderCard = {
      type: 'AdaptiveCard',
      version: '1.0',
      body: [
        {
          type: 'Image',
          url: 'http://adaptivecards.io/content/adaptive-card-50.png',
        },
        {
          type: 'TextBlock',
          text: 'Hello **Adaptive Cards!**',
        },
      ],
      actions: [
        {
          type: 'Action.OpenUrl',
          title: 'Learn more',
          url: 'http://adaptivecards.io',
        },
        {
          type: 'Action.OpenUrl',
          title: 'GitHub',
          url: 'http://github.com/Microsoft/AdaptiveCards',
        },
      ],
    };
    const allowedContexts = [FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage];
    describe('Testing dialog.adaptiveCard.open', () => {
      const adaptiveCardDialogInfo: AdaptiveCardDialogInfo = {
        card: JSON.stringify(renderCard),
        size: {
          height: DialogDimension.Small,
          width: DialogDimension.Small,
        },
        title: 'someAdaptiveCard',
      };

      it('should not allow calls before initialization', () => {
        expect(() => dialog.adaptiveCard.open(adaptiveCardDialogInfo)).toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(1);
            try {
              dialog.adaptiveCard.open(adaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should throw error when dialog is supported and adaptiveCard is not in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
            expect.assertions(1);
            try {
              dialog.adaptiveCard.open(adaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should pass along entire adaptiveCardDialogInfo parameter in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({
              apiVersion: 2,
              hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
              supports: { dialog: { card: {} } },
            });
            dialog.adaptiveCard.open(adaptiveCardDialogInfo, () => {
              return;
            });
            const openMessage = framedMock.findMessageByFunc('tasks.startTask');
            expect(openMessage).not.toBeNull();
            expect(openMessage.args).toEqual([
              dialog.adaptiveCard.getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo),
            ]);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(4);
            try {
              dialog.adaptiveCard.open(adaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should throw error when dialog is supported and adaptiveCard is not in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
            expect.assertions(4);
            try {
              dialog.adaptiveCard.open(adaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should pass along entire adaptiveCardDialogInfo parameter in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({
              apiVersion: 2,
              hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
              supports: { dialog: { card: {} } },
            });
            dialog.adaptiveCard.open(adaptiveCardDialogInfo, () => {
              return;
            });
            const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
            expect(openMessage).not.toBeNull();
            expect(openMessage.args).toEqual([
              dialog.adaptiveCard.getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo),
            ]);
          });

          it(`FRAMED: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
            framedMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: {} } },
              });
              expect.assertions(2);
              const submitString = 'succesfullySubmit';

              dialog.adaptiveCard.open(adaptiveCardDialogInfo, (result: dialog.ISdkResponse): void => {
                expect(result.result).toBe(submitString);
                expect(result.err).toBeFalsy();
                done();
              });
              const message = framedMock.findMessageByFunc('tasks.startTask');

              framedMock.respondToMessage(message, undefined, submitString);
            });
          });

          it(`Frameless: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
            framelessMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: {} } },
              });
              expect.assertions(5);
              const submitString = 'succesfullySubmit';
              dialog.adaptiveCard.open(adaptiveCardDialogInfo, (result: dialog.ISdkResponse) => {
                expect(result.result).toBe(submitString);
                expect(result.err).toBeFalsy();
                done();
              });
              const message = framelessMock.findMessageByFunc('tasks.startTask');

              const callbackId = message.id;
              framelessMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [undefined, submitString],
                },
              } as DOMMessageEvent);
            });
          });

          it(`FRAMED: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
            framedMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: {} } },
              });
              expect.assertions(2);
              const error = { errorCode: 500, message: 'Internal Error Occured' };

              dialog.adaptiveCard.open(adaptiveCardDialogInfo, (result: dialog.ISdkResponse): void => {
                expect(result.result).toBeFalsy();
                expect(result.err).toBe(error);
                done();
              });
              const message = framedMock.findMessageByFunc('tasks.startTask');

              framedMock.respondToMessage(message, error, undefined);
            });
          });

          it(`Frameless: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
            framelessMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: {} } },
              });
              expect.assertions(5);
              dialog.adaptiveCard.open(adaptiveCardDialogInfo, (result: dialog.ISdkResponse) => {
                expect(result.result).toBeFalsy();
                expect(result.err).toBe(error);
                done();
              });
              const error = { errorCode: 500, message: 'Internal Error Occured' };
              const message = framelessMock.findMessageByFunc('tasks.startTask');

              const callbackId = message.id;
              framelessMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [error, undefined],
                },
              } as DOMMessageEvent);
            });
          });
        } else {
          it(`FRAMED: should not allow calls from context ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            expect(() => dialog.adaptiveCard.open(adaptiveCardDialogInfo)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });

          it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            expect(() => dialog.adaptiveCard.open(adaptiveCardDialogInfo)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });
    });

    describe('Testing dialog.adaptiveCard.isSupported function', () => {
      it('dialog.adaptiveCard.isSupported should return false if the runtime says dialog is not supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
        expect(dialog.adaptiveCard.isSupported()).not.toBeTruthy();
      });

      it('dialog.adaptiveCard.isSupported should return false if the runtime says dialog is supported and adaptiveCard is not', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({
          apiVersion: 2,
          hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
          supports: { dialog: {} },
        });
        expect(dialog.adaptiveCard.isSupported()).not.toBeTruthy();
      });

      it('dialog.adaptiveCard.isSupported should return true if the runtime says dialog and adaptiveCard is supported', async () => {
        await framedMock.initializeWithContext(FrameContexts.content);
        framedMock.setRuntimeConfig({
          apiVersion: 2,
          hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
          supports: { dialog: { card: {} } },
        });
        expect(dialog.adaptiveCard.isSupported()).toBeTruthy();
      });

      it('dialog.adaptiveCard.isSupported should throw before initialization', () => {
        framedMock.uninitializeRuntimeConfig();
        expect(() => dialog.adaptiveCard.isSupported()).toThrowError(errorLibraryNotInitialized);
      });
    });

    describe('Testing dialog.adaptiveCard.bot function', () => {
      const botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo = {
        card: JSON.stringify(renderCard),
        completionBotId: 'someBotID',
        size: {
          height: DialogDimension.Small,
          width: DialogDimension.Small,
        },
        title: 'someAdaptiveCard',
      };

      it('should not allow calls before initialization', () => {
        expect(() => dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo)).toThrowError(errorLibraryNotInitialized);
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`FRAMED: should throw error when dialog is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(1);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should throw error when dialog is supported and adaptiveCard is not in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
            expect.assertions(1);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should throw error when dialog.adaptiveCard.bot is not supported in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { card: {} } } });
            expect.assertions(1);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMED: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
            await framedMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({
              apiVersion: 2,
              hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
              supports: { dialog: { card: { bot: {} } } },
            });
            dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, () => {
              return;
            });
            const openMessage = framedMock.findMessageByFunc('tasks.startTask');
            expect(openMessage).not.toBeNull();
            expect(openMessage.args).toEqual([
              dialog.adaptiveCard.getDialogInfoFromBotAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo),
            ]);
          });

          it(`FRAMELESS: should throw error when dialog is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
            expect.assertions(4);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should throw error when dialog.adaptiveCard is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: {} } });
            expect.assertions(4);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should throw error when dialog.adaptiveCard.bot is not supported in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({ apiVersion: 2, supports: { dialog: { card: {} } } });
            expect.assertions(4);
            try {
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`FRAMELESS: should pass along entire botUrlDialogInfo parameter in ${context} context`, async () => {
            await framelessMock.initializeWithContext(context);
            framedMock.setRuntimeConfig({
              apiVersion: 2,
              hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
              supports: { dialog: { card: { bot: {} } } },
            });
            dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, () => {
              return;
            });
            const openMessage = framelessMock.findMessageByFunc('tasks.startTask');
            expect(openMessage).not.toBeNull();
            expect(openMessage.args).toEqual([
              dialog.adaptiveCard.getDialogInfoFromBotAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo),
            ]);
          });

          it(`FRAMED: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
            framedMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: { bot: {} } } },
              });
              expect.assertions(2);

              const submitString = 'succesfullySubmit';

              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, (result: dialog.ISdkResponse): void => {
                expect(result.result).toBe(submitString);
                expect(result.err).toBeFalsy();
                done();
              });
              const message = framedMock.findMessageByFunc('tasks.startTask');

              framedMock.respondToMessage(message, undefined, submitString);
            });
          });

          it(`FRAMELESS: Should successfully call the callback with result when dialog is closed. ${context} context`, (done) => {
            framelessMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: { bot: {} } } },
              });
              const submitString = 'succesfullySubmit';
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, (result: dialog.ISdkResponse) => {
                expect(result.result).toBe(submitString);
                expect(result.err).toBeFalsy();
                done();
              });
              const message = framelessMock.findMessageByFunc('tasks.startTask');

              const callbackId = message.id;
              framelessMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [undefined, submitString],
                },
              } as DOMMessageEvent);
            });
          });

          it(`FRAMED: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
            framedMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: { bot: {} } } },
              });
              expect.assertions(2);

              const error = { errorCode: 500, message: 'Internal Error Occured' };

              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, (result: dialog.ISdkResponse): void => {
                expect(result.result).toBeFalsy();
                expect(result.err).toBe(error);
                done();
              });
              const message = framedMock.findMessageByFunc('tasks.startTask');

              framedMock.respondToMessage(message, error, undefined);
            });
          });

          it(`FRAMELESS: Should successfully call the callback with error when dialog is closed. ${context} context`, (done) => {
            framelessMock.initializeWithContext(context).then(() => {
              framedMock.setRuntimeConfig({
                apiVersion: 2,
                hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
                supports: { dialog: { card: { bot: {} } } },
              });
              dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo, (result: dialog.ISdkResponse) => {
                expect(result.result).toBeFalsy();
                expect(result.err).toBe(error);
                done();
              });
              const error = { errorCode: 500, message: 'Internal Error Occured' };
              const message = framelessMock.findMessageByFunc('tasks.startTask');

              const callbackId = message.id;
              framelessMock.respondToMessage({
                data: {
                  id: callbackId,
                  args: [error, undefined],
                },
              } as DOMMessageEvent);
            });
          });
        } else {
          it(`FRAMED: should not allow calls from context ${context}`, async () => {
            await framedMock.initializeWithContext(context);
            expect(() => dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });

          it(`FRAMELESS: should not allow calls from context ${context}`, async () => {
            await framelessMock.initializeWithContext(context);
            expect(() => dialog.adaptiveCard.bot.open(botAdaptiveCardDialogInfo)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: ${JSON.stringify(context)}.`,
            );
          });
        }
      });

      describe('Testing dialog.adaptiveCard.bot.isSupported function', () => {
        it('dialog.adaptiveCard.bot.isSupported should return false if the runtime says dialog is not supported', async () => {
          await framedMock.initializeWithContext(FrameContexts.content);
          framedMock.setRuntimeConfig({ apiVersion: 2, supports: {} });
          expect(dialog.adaptiveCard.bot.isSupported()).not.toBeTruthy();
        });

        it('dialog.adaptiveCard.bot.isSupported should return false if the runtime says dialog.adaptiveCard is not supported', async () => {
          await framedMock.initializeWithContext(FrameContexts.content);
          framedMock.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: {} },
          });
          expect(dialog.adaptiveCard.bot.isSupported()).not.toBeTruthy();
        });

        it('dialog.adaptiveCard.bot.isSupported should return false if the runtime says dialog.adaptiveCard.bot is not supported', async () => {
          await framedMock.initializeWithContext(FrameContexts.content);
          framedMock.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: {} },
          });
          expect(dialog.adaptiveCard.bot.isSupported()).not.toBeTruthy();
        });

        it('dialog.adaptiveCard.bot.isSupported should return false if the runtime says dialog.url.bot is not supported', async () => {
          await framedMock.initializeWithContext(FrameContexts.content);
          framedMock.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: {} },
          });
          expect(dialog.adaptiveCard.bot.isSupported()).not.toBeTruthy();
        });

        it('dialog.adaptiveCard.bot.isSupported should return true if the runtime says dialog.adaptiveCard.bot is supported', async () => {
          await framedMock.initializeWithContext(FrameContexts.content);
          framedMock.setRuntimeConfig({
            apiVersion: 2,
            hostVersionsInfo: { adaptiveCardSchemaVersion: minAdaptiveCardVersion },
            supports: { dialog: { card: { bot: {} } } },
          });
          expect(dialog.adaptiveCard.bot.isSupported()).toBeTruthy();
        });

        it('dialog.adaptiveCard.bot.isSupported should throw before initialization', () => {
          framedMock.uninitializeRuntimeConfig();
          expect(() => dialog.adaptiveCard.bot.isSupported()).toThrowError(errorLibraryNotInitialized);
        });
      });
    });
  });
});
