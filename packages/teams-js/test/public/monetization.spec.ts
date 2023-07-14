import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { SdkError } from '../../src/public/interfaces';
import { monetization } from '../../src/public/monetization';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

const allowedContexts = [FrameContexts.content];

describe('Testing monetization capability', () => {
  describe('Framed - monetization test', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
    });
    describe('monetization_v1', () => {
      describe('openPurchaseExperience', () => {
        it('should not allow calls before initialization', () => {
          expect(() =>
            monetization.openPurchaseExperience(() => {
              return;
            }),
          ).toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (!allowedContexts.some((allowedContext) => allowedContext == context)) {
            it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
              await utils.initializeWithContext(context);
              expect(() => {
                monetization.openPurchaseExperience((error: SdkError | null) => {
                  expect(error).toBeNull();
                });
              }).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await utils.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(() => monetization.openPurchaseExperience(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('should successfully execute callback and sdkError should be null', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          monetization.openPurchaseExperience((error: SdkError | null) => {
            expect(error).toBeNull();
          });
          const message = utils.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();
          utils.respondToMessage(message);
        });
      });
    });

    describe('monetization_v2', () => {
      describe('isSupported', () => {
        it('should throw if called before initialization', () => {
          utils.uninitializeRuntimeConfig();
          expect(() => monetization.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
        });
      });

      describe('openPurchaseExperience', () => {
        it('should not allow calls before initialization', () => {
          expect(() => monetization.openPurchaseExperience(undefined)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (!allowedContexts.some((allowedContext) => allowedContext == context)) {
            it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
              await utils.initializeWithContext(context);
              expect(() => monetization.openPurchaseExperience()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });

        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await utils.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            monetization.openPurchaseExperience();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });
      });
    });
  });

  describe('Frameless - monetization test', () => {
    let utils: Utils = new Utils();
    beforeEach(() => {
      utils = new Utils();
      utils.mockWindow.parent = undefined;
      utils.messages = [];
    });
    afterEach(() => {
      app._uninitialize();
      GlobalVars.isFramelessWindow = false;
    });
    describe('monetization_v1', () => {
      describe('openPurchaseExperience', () => {
        it('should not allow calls before initialization', () => {
          expect(() =>
            monetization.openPurchaseExperience(() => {
              return;
            }),
          ).toThrowError(new Error(errorLibraryNotInitialized));
        });

        Object.values(FrameContexts).forEach((context) => {
          if (!allowedContexts.some((allowedContext) => allowedContext == context)) {
            it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
              await utils.initializeWithContext(context);
              expect(() => {
                monetization.openPurchaseExperience((error: SdkError | null) => {
                  expect(error).toBeNull();
                });
              }).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });
        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await utils.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(() => monetization.openPurchaseExperience(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('should successfully execute callback and sdkError should be null', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          monetization.openPurchaseExperience((error: SdkError | null) => {
            expect(error).toBeNull();
          });
          const message = utils.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [null, undefined],
            },
          } as DOMMessageEvent);
        });
      });
    });

    describe('monetization_v2', () => {
      describe('openPurchaseExperience', () => {
        it('should not allow calls before initialization', () => {
          expect(() => monetization.openPurchaseExperience(undefined)).toThrowError(
            new Error(errorLibraryNotInitialized),
          );
        });

        Object.values(FrameContexts).forEach((context) => {
          if (!allowedContexts.some((allowedContext) => allowedContext == context)) {
            it(`should to not allow to initialize FramContext with context: ${context}.`, async () => {
              await utils.initializeWithContext(context);
              expect(() => monetization.openPurchaseExperience()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });

        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await utils.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          try {
            monetization.openPurchaseExperience();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('should successfully execute and not throw any error', async () => {
          await utils.initializeWithContext(FrameContexts.content);
          const promise = monetization.openPurchaseExperience();
          const message = utils.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();

          const callbackId = message.id;
          utils.respondToFramelessMessage({
            data: {
              id: callbackId,
              args: [null, true],
            },
          } as DOMMessageEvent);
          await expect(promise).resolves.not.toThrow();
          await expect(promise).resolves.toBe(true);
        });
      });
    });
  });
});
