import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { DOMMessageEvent } from '../../src/internal/interfaces';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, HostClientType, secondaryBrowser } from '../../src/public/index';
import { _minRuntimeConfigToUninitialize, setUnitializedRuntime } from '../../src/public/runtime';
import { FramelessPostMocks } from '../framelessPostMocks';

/**
 * Test cases for inAppView Capability APIs
 */
describe('secondaryBrowser', () => {
  const framelessPlatform = new FramelessPostMocks();
  const validDialogUrl = new URL('https://www.example.com');

  // eslint-disable-next-line @microsoft/sdl/no-insecure-url
  const nonHttpsURL = new URL('ftp://www.example.com');

  const originalDefaultPlatformVersion = '1.6.0';

  beforeEach(() => {
    framelessPlatform.messages = [];

    // Set a mock window for testing
    app._initialize(framelessPlatform.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      framelessPlatform.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  const allowedContexts = [FrameContexts.content];

  describe('Testing secondaryBrowser isSupported', () => {
    it('should be supported after initialization', async () => {
      expect.assertions(4);
      await framelessPlatform.initializeWithContext(FrameContexts.content, HostClientType.android);
      framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: { secondaryBrowser: {} } });
      expect(secondaryBrowser.isSupported()).toBe(true);
    });

    it('should not be supported before initialization', () => {
      setUnitializedRuntime();
      expect(() => secondaryBrowser.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    describe('Testing open API', () => {
      it('should not allow open calls before initialization', () => {
        expect(() => secondaryBrowser.open(validDialogUrl)).toThrowError(new Error(errorLibraryNotInitialized));
      });

      Object.values(FrameContexts).forEach((context) => {
        if (allowedContexts.some((allowedContext) => allowedContext === context)) {
          it(`should throw error when secondaryBrowser is not supported in runtime config. context: ${context}`, async () => {
            expect.assertions(4);
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              secondaryBrowser.open(validDialogUrl);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`secondaryBrowser call in default version of platform support fails. context: ${context}`, async () => {
            expect.assertions(4);
            await framelessPlatform.initializeWithContext(context);
            framelessPlatform.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            try {
              secondaryBrowser.open(validDialogUrl);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it('should throw error when secondaryBrowser is called on clientType other than Mobile', async () => {
            expect.assertions(4);
            await framelessPlatform.initializeWithContext(context, HostClientType.desktop);
            try {
              secondaryBrowser.open(validDialogUrl);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`should not allow secondaryBrowser calls with undefined URL. context: ${context}`, async () => {
            expect.assertions(4);
            await framelessPlatform.initializeWithContext(context, HostClientType.android);

            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            try {
              secondaryBrowser.open(undefined as unknown as URL);
            } catch (e) {
              expect(e).toEqual({
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Invalid Url: Only https URL is allowed',
              });
            }
          });

          it(`should not allow secondaryBrowser calls with non-HTTPS URL. context: ${context}`, async () => {
            expect.assertions(4);
            await framelessPlatform.initializeWithContext(context, HostClientType.android);

            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            try {
              secondaryBrowser.open(nonHttpsURL);
            } catch (e) {
              expect(e).toEqual({
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Invalid Url: Only https URL is allowed',
              });
            }
          });

          it(`secondaryBrowser calls with successful result. context: ${context}`, async () => {
            expect.assertions(7);
            await framelessPlatform.initializeWithContext(context, HostClientType.android);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            const promise = secondaryBrowser.open(validDialogUrl);

            const message = framelessPlatform.findMessageByFunc('secondaryBrowser.open');

            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message?.args?.length).toBe(1);
              expect(message?.args[0]).toEqual(validDialogUrl.toString());
            }

            const callbackId = message?.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [undefined, true],
              },
            } as DOMMessageEvent);

            await expect(promise).resolves.toEqual(true);
          });

          it(`secondaryBrowser calls with error context: ${context}`, async () => {
            expect.assertions(7);
            await framelessPlatform.initializeWithContext(context, HostClientType.android);
            framelessPlatform.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            const promise = secondaryBrowser.open(validDialogUrl);

            const message = framelessPlatform.findMessageByFunc('secondaryBrowser.open');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toEqual(validDialogUrl.toString());
            }

            const callbackId = message?.id;
            framelessPlatform.respondToMessage({
              data: {
                id: callbackId,
                args: [{ errorCode: ErrorCode.INTERNAL_ERROR }],
              },
            } as DOMMessageEvent);

            await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          });
        } else {
          it(`should not allow open calls from the wrong context. context: ${context}`, async () => {
            await framelessPlatform.initializeWithContext(context);
            expect(() => secondaryBrowser.open(validDialogUrl)).toThrowError(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedContexts,
              )}. Current context: "${context}".`,
            );
          });
        }
      });
    });
  });
});
