import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ExternalAppErrorCode } from '../../src/private/constants';
import { externalAppCardActions } from '../../src/private/externalAppCardActions';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { Utils } from '../utils';

describe('externalAppCardActions', () => {
  let utils = new Utils();

  // This ID was randomly generated for the purpose of these tests
  const testAppId = '01b92759-b43a-4085-ac22-7772d94bb7a9';

  beforeEach(() => {
    utils = new Utils();
    utils.mockWindow.parent = undefined;
    utils.messages = [];
    GlobalVars.isFramelessWindow = false;
  });

  afterEach(() => {
    app._uninitialize();
    jest.clearAllMocks();
  });

  describe('processActionSubmit', () => {
    const allowedFrameContexts = [FrameContexts.content];
    const testActionSubmitPayload = {
      id: 'testId',
      data: {},
    };
    const testError = {
      errorCode: ExternalAppErrorCode.INTERNAL_ERROR,
      message: 'testMessage',
    };
    it('should not allow calls before initialization', async () => {
      return expect(() => externalAppCardActions.processActionSubmit(testAppId, testActionSubmitPayload)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should throw error when externalAppCardActions capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        await externalAppCardActions.processActionSubmit(testAppId, testActionSubmitPayload);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const promise = externalAppCardActions.processActionSubmit(testAppId, testActionSubmitPayload);
          const message = utils.findMessageByFunc('externalAppCardActions.processActionSubmit');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId, testActionSubmitPayload]);
            utils.respondToMessage(message, [true, undefined]);
          }
          return expect(promise).resolves.toBeUndefined();
        });
        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const promise = externalAppCardActions.processActionSubmit(testAppId, testActionSubmitPayload);
          const message = utils.findMessageByFunc('externalAppCardActions.processActionSubmit');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId, testActionSubmitPayload]);
            utils.respondToMessage(message, false, testError);
          }
          return expect(promise).rejects.toEqual(testError);
        });
        it(`should throw error on invalid app ID if it contains script tag. context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'invalidAppIdWith<script>alert(1)</script>';
          await expect(
            async () => await externalAppCardActions.processActionSubmit(invalidAppId, testActionSubmitPayload),
          ).rejects.toThrowError(/script/i);
        });
        it(`should throw error on invalid app ID if it contains non printable ASCII characters. context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'appId\u0000';
          await expect(
            async () => await externalAppCardActions.processActionSubmit(invalidAppId, testActionSubmitPayload),
          ).rejects.toThrowError(/characters/i);
        });
        it(`should throw error on invalid app ID if it its size exceeds 256 characters. context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'a'.repeat(257);
          await expect(
            async () => await externalAppCardActions.processActionSubmit(invalidAppId, testActionSubmitPayload),
          ).rejects.toThrowError(/length/i);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          return expect(() =>
            externalAppCardActions.processActionSubmit(testAppId, testActionSubmitPayload),
          ).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(allowedFrameContexts)}. ` +
                `Current context: "${frameContext}".`,
            ),
          );
        });
      }
    });
  });

  describe('processActionOpenUrl', () => {
    const allowedFrameContexts = [FrameContexts.content];
    const testUrl = new URL('https://example.com');
    const testError = {
      errorCode: externalAppCardActions.ActionOpenUrlErrorCode.INTERNAL_ERROR,
      message: 'testMessage',
    };
    const testResponse = externalAppCardActions.ActionOpenUrlType.DeepLinkDialog;
    it('should not allow calls before initialization', async () => {
      return expect(() => externalAppCardActions.processActionOpenUrl(testAppId, testUrl)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should throw error when externalAppCardActions capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        await externalAppCardActions.processActionOpenUrl(testAppId, testUrl);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const promise = externalAppCardActions.processActionOpenUrl(testAppId, testUrl, {
            name: 'composeExtensions',
          });
          const message = utils.findMessageByFunc('externalAppCardActions.processActionOpenUrl');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId, testUrl.href, { name: 'composeExtensions' }]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, null, testResponse);
          }
          return expect(promise).resolves.toEqual(testResponse);
        });
        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const promise = externalAppCardActions.processActionOpenUrl(testAppId, testUrl);
          const message = utils.findMessageByFunc('externalAppCardActions.processActionOpenUrl');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId, testUrl.href, null]);
            utils.respondToMessage(message, testError, null);
          }
          return expect(promise).rejects.toEqual(testError);
        });
        it(`should throw error on invalid app ID if it contains script tag with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'invalidAppIdwith<script>alert(1)</script>';
          await expect(
            async () => await externalAppCardActions.processActionOpenUrl(invalidAppId, testUrl),
          ).rejects.toThrowError(/script/i);
        });
        it(`should throw error on invalid app ID if it contains non printable ASCII characters with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'appId\u0000';
          await expect(
            async () => await externalAppCardActions.processActionOpenUrl(invalidAppId, testUrl),
          ).rejects.toThrowError(/characters/i);
        });
        it(`should throw error on invalid app ID if its size exceeds 256 characters with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          const invalidAppId = 'a'.repeat(257);
          await expect(
            async () => await externalAppCardActions.processActionOpenUrl(invalidAppId, testUrl),
          ).rejects.toThrowError(/length/i);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
          return expect(() => externalAppCardActions.processActionOpenUrl(testAppId, testUrl)).toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(allowedFrameContexts)}. ` +
                `Current context: "${frameContext}".`,
            ),
          );
        });
      }
    });
  });
  describe('isSupported', () => {
    it('should throw when library is not initialized', () => {
      return expect(() => externalAppCardActions.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return true when externalAppCardActions capability is supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActions: {} } });
      return expect(externalAppCardActions.isSupported()).toEqual(true);
    });
    it('should return false when externalAppCardActions capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      return expect(externalAppCardActions.isSupported()).toEqual(false);
    });
  });
});
