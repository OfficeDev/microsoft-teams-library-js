import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { SdkError } from '../../src/public/interfaces';
import { monetization } from '../../src/public/monetization';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

const allowedContexts = [FrameContexts.content];

describe('Testing monetization capability', () => {
  describe('Framed - monetization test', () => {
    describe('monetization_v1', () => {
      const framedPlatformMock = new Utils();

      beforeEach(() => {
        framedPlatformMock.messages = [];
        app._initialize(framedPlatformMock.mockWindow);
      });

      afterEach(() => {
        // Reset the object since it's a singleton
        if (app._uninitialize) {
          framedPlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
          app._uninitialize();
        }
      });

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
              await framedPlatformMock.initializeWithContext(context);
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
          await framedPlatformMock.initializeWithContext('content');
          framedPlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(() => monetization.openPurchaseExperience(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('should successfully execute callback and sdkError should be null', async () => {
          await framedPlatformMock.initializeWithContext(FrameContexts.content);
          monetization.openPurchaseExperience((error: SdkError | null) => {
            expect(error).toBeNull();
          });
          const message = framedPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();
          framedPlatformMock.respondToMessage(message);
        });
      });
    });

    describe('monetization_v2', () => {
      const framelessPlatformMock = new FramelessPostMocks();
      const utils = new Utils();

      beforeEach(() => {
        framelessPlatformMock.messages = [];
        // Set a mock window for testing
        app._initialize(framelessPlatformMock.mockWindow);
      });

      afterEach(() => {
        // Reset the object since it's a singleton
        if (app._uninitialize) {
          utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
          app._uninitialize();
        }
      });

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
              await framelessPlatformMock.initializeWithContext(context);
              expect(() => monetization.openPurchaseExperience()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });

        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await framelessPlatformMock.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(3);
          try {
            monetization.openPurchaseExperience();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('should successfully execute and not throw any error', async () => {
          await framelessPlatformMock.initializeWithContext(FrameContexts.content);
          const promise = monetization.openPurchaseExperience();
          const message = framelessPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();

          const callbackId = message.id;
          framelessPlatformMock.respondToMessage({
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

  describe('Frameless - monetization test', () => {
    describe('monetization_v1', () => {
      const framelessPlatformMock = new FramelessPostMocks();
      const utils = new Utils();

      beforeEach(() => {
        framelessPlatformMock.messages = [];
        app._initialize(framelessPlatformMock.mockWindow);
      });

      afterEach(() => {
        // Reset the object since it's a singleton
        if (app._uninitialize) {
          utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
          app._uninitialize();
        }
      });

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
              await framelessPlatformMock.initializeWithContext(context);
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
          await framelessPlatformMock.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect(() => monetization.openPurchaseExperience(() => {})).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('should successfully execute callback and sdkError should be null', async () => {
          await framelessPlatformMock.initializeWithContext(FrameContexts.content);
          monetization.openPurchaseExperience((error: SdkError | null) => {
            expect(error).toBeNull();
          });
          const message = framelessPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();

          const callbackId = message.id;
          framelessPlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [null, undefined],
            },
          } as DOMMessageEvent);
        });
      });
    });

    describe('monetization_v2', () => {
      const framelessPlatformMock = new FramelessPostMocks();
      const utils = new Utils();

      beforeEach(() => {
        framelessPlatformMock.messages = [];
        // Set a mock window for testing
        app._initialize(framelessPlatformMock.mockWindow);
      });

      afterEach(() => {
        // Reset the object since it's a singleton
        if (app._uninitialize) {
          utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
          app._uninitialize();
        }
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
              await framelessPlatformMock.initializeWithContext(context);
              expect(() => monetization.openPurchaseExperience()).toThrowError(
                `This call is only allowed in following contexts: ${JSON.stringify(
                  allowedContexts,
                )}. Current context: "${context}".`,
              );
            });
          }
        });

        it('openPurchaseExperience should throw error when monetization is not supported. context: content', async () => {
          await framelessPlatformMock.initializeWithContext('content');
          utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(3);
          try {
            monetization.openPurchaseExperience();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('should successfully execute and not throw any error', async () => {
          await framelessPlatformMock.initializeWithContext(FrameContexts.content);
          const promise = monetization.openPurchaseExperience();
          const message = framelessPlatformMock.findMessageByFunc('monetization.openPurchaseExperience');
          expect(message).not.toBeNull();

          const callbackId = message.id;
          framelessPlatformMock.respondToMessage({
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
