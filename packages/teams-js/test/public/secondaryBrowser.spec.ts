import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { ErrorCode, HostClientType, secondaryBrowser } from '../../src/public/index';
import { setUnitializedRuntime } from '../../src/public/runtime';
import { Utils } from '../utils';

/**
 * Test cases for inAppView Capability APIs
 */
describe('secondaryBrowser', () => {
  const validDialogUrl = new URL('https://www.example.com');

  // eslint-disable-next-line @microsoft/sdl/no-insecure-url
  const nonHttpsURL = new URL('ftp://www.example.com');

  const originalDefaultPlatformVersion = '1.6.0';
  let utils: Utils = new Utils();

  beforeEach(() => {
    utils = new Utils();
  });
  afterEach(() => {
    app._uninitialize();
  });

  const allowedContexts = [FrameContexts.content];

  describe('Testing secondaryBrowser isSupported', () => {
    it('should be supported after initialization', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { secondaryBrowser: {} } });
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
            expect.assertions(1);
            await utils.initializeWithContext(context);
            utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
            try {
              secondaryBrowser.open(validDialogUrl);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`secondaryBrowser call in default version of platform support fails. context: ${context}`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);
            utils.setClientSupportedSDKVersion(originalDefaultPlatformVersion);
            try {
              secondaryBrowser.open(validDialogUrl);
            } catch (e) {
              expect(e).toEqual(errorNotSupportedOnPlatform);
            }
          });

          it(`should not allow secondaryBrowser calls with undefined URL. context: ${context}`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.android);

            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            try {
              await secondaryBrowser.open(undefined as unknown as URL);
            } catch (e) {
              expect(e).toEqual({
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Invalid Url: Only https URL is allowed',
              });
            }
          });

          it(`should not allow secondaryBrowser calls with non-HTTPS URL. context: ${context}`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context, HostClientType.android);

            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            try {
              await secondaryBrowser.open(nonHttpsURL);
            } catch (e) {
              expect(e).toEqual({
                errorCode: ErrorCode.INVALID_ARGUMENTS,
                message: 'Invalid Url: Only https URL is allowed',
              });
            }
          });

          it(`secondaryBrowser calls with successful result. context: ${context}`, async () => {
            expect.assertions(4);
            await utils.initializeWithContext(context, HostClientType.android);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            const promise = secondaryBrowser.open(validDialogUrl);

            const message = utils.findMessageByFunc('secondaryBrowser.open');

            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toEqual(validDialogUrl.toString());
            }

            message && utils.respondToMessage(message, undefined as unknown, true);
            await expect(promise).resolves.toBeTruthy();
          });

          it(`secondaryBrowser calls with error context: ${context}`, async () => {
            expect.assertions(4);
            await utils.initializeWithContext(context, HostClientType.android);
            utils.setRuntimeConfig({
              apiVersion: 1,
              supports: { secondaryBrowser: {} },
            });

            const promise = secondaryBrowser.open(validDialogUrl);

            const message = utils.findMessageByFunc('secondaryBrowser.open');
            if (message && message.args) {
              expect(message).not.toBeNull();
              expect(message.args.length).toBe(1);
              expect(message.args[0]).toEqual(validDialogUrl.toString());
            }

            message && utils.respondToMessage(message, { errorCode: ErrorCode.INTERNAL_ERROR });

            await expect(promise).rejects.toEqual({ errorCode: ErrorCode.INTERNAL_ERROR });
          });
        } else {
          it(`should not allow open calls from the wrong context. context: ${context}`, async () => {
            expect.assertions(1);
            await utils.initializeWithContext(context);
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
