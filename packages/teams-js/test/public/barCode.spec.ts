import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { barCode } from '../../src/public/barCode';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType } from '../../src/public/constants';
import { ErrorCode } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, setUnitializedRuntime } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for barCode APIs
 */
describe('barCode', () => {
  const mobilePlatformMock = new FramelessPostMocks();
  const defaultPlatformVersion = '1.6.0';

  const allowedContexts = [FrameContexts.content, FrameContexts.task];

  beforeEach(() => {
    mobilePlatformMock.messages = [];

    // Set a mock window for testing
    app._initialize(mobilePlatformMock.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      mobilePlatformMock.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  const barCodeConfig = {
    timeOutIntervalInSec: 30,
  };

  describe('isSupported', () => {
    it('should throw if called before initialization', () => {
      setUnitializedRuntime();
      expect(() => barCode.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('Testing scanBarCode API', () => {
    it('should not allow scanBarCode calls before initialization', () => {
      expect(() => barCode.scanBarCode(barCodeConfig)).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when barCode is not supported in runtime config. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          await expect(barCode.scanBarCode(barCodeConfig)).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('scanBarCode call in default version of platform support fails', async () => {
          await mobilePlatformMock.initializeWithContext(FrameContexts.content, HostClientType.android);
          mobilePlatformMock.setClientSupportedSDKVersion(defaultPlatformVersion);
          expect(() => barCode.scanBarCode(barCodeConfig)).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('scanBarCode calls with successful result', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.scanBarCode(barCodeConfig);

          const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          expect(message.args[0]).toEqual(barCodeConfig);

          const callbackId = message.id;
          const response = 'scannedCode';
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, response],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(response);
        });

        it('scanBarCode rejects promise with Error when error received from host', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.scanBarCode(barCodeConfig);

          const message = mobilePlatformMock.findMessageByFunc('media.scanBarCode');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toEqual(barCodeConfig);

          const callbackId = message.id;
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.OPERATION_TIMED_OUT }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.OPERATION_TIMED_OUT });
        });

        it('should not allow scanBarCode calls with invalid timeOutIntervalInSec', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const barCodeConfig = {
            timeOutIntervalInSec: 0,
          };
          await expect(barCode.scanBarCode(barCodeConfig)).rejects.toEqual({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
          });
        });

        it('should allow scanBarCode calls when timeOutIntervalInSec is not passed in config params', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const barCodeConfig: barCode.BarCodeConfig = {};
          await expect(barCode.scanBarCode(barCodeConfig)).resolves;
        });
      } else {
        it(`should not allow scanBarCode calls from the wrong context. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          expect(() => barCode.scanBarCode(barCodeConfig)).rejects.toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing HasPermisison API', () => {
    it('should not allow hasPermission calls before initialization', () => {
      return expect(() => barCode.hasPermission()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it(`should throw error when barCode is not supported in runtime config. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            barCode.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('hasPermission call in default version of platform support fails', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          expect(() => barCode.hasPermission()).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it('hasPermission call with successful result', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.hasPermission();

          const message = mobilePlatformMock.findMessageByFunc('permissions.has');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe('media');

          const callbackId = message.id;
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('HasPermission rejects promise with Error when error received from host', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.hasPermission();

          const message = mobilePlatformMock.findMessageByFunc('permissions.has');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe('media');

          const callbackId = message.id;
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });
      } else {
        it(`should not allow hasPermission calls from the wrong context. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          expect(() => barCode.hasPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });

  describe('Testing RequestPermisison API', () => {
    Object.values(FrameContexts).forEach((context) => {
      if (allowedContexts.some((allowedContext) => allowedContext === context)) {
        it('should not allow requestPermission calls before initialization', () => {
          expect(() => barCode.requestPermission()).toThrowError(new Error(errorLibraryNotInitialized));
        });

        it('requestPermission call in default version of platform support fails', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          mobilePlatformMock.setClientSupportedSDKVersion(defaultPlatformVersion);
          expect(() => barCode.requestPermission()).rejects.toEqual(errorNotSupportedOnPlatform);
        });

        it(`should throw error when barCode is not supported in runtime config. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: {} });
          expect.assertions(4);
          try {
            barCode.hasPermission();
          } catch (e) {
            expect(e).toEqual(errorNotSupportedOnPlatform);
          }
        });

        it('requestPermission call with successful result', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.requestPermission();

          const message = mobilePlatformMock.findMessageByFunc('permissions.request');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);

          expect(message.args[0]).toBe('media');

          const callbackId = message.id;
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [undefined, true],
            },
          } as DOMMessageEvent);

          await expect(promise).resolves.toBe(true);
        });

        it('requestPermission rejects promise with Error when error received from host', async () => {
          await mobilePlatformMock.initializeWithContext(context);
          mobilePlatformMock.setRuntimeConfig({ apiVersion: 1, supports: { permissions: {}, barCode: {} } });
          const promise = barCode.requestPermission();

          const message = mobilePlatformMock.findMessageByFunc('permissions.request');
          expect(message).not.toBeNull();
          expect(message.args.length).toBe(1);
          expect(message.args[0]).toBe('media');

          const callbackId = message.id;
          mobilePlatformMock.respondToMessage({
            data: {
              id: callbackId,
              args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
            },
          } as DOMMessageEvent);

          await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
        });
      } else {
        it(`should not allow requestPermission calls from the wrong context. context: ${context}`, async () => {
          await mobilePlatformMock.initializeWithContext(context);
          expect(() => barCode.requestPermission()).toThrowError(
            `This call is only allowed in following contexts: ${JSON.stringify(
              allowedContexts,
            )}. Current context: "${context}".`,
          );
        });
      }
    });
  });
});
