import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ApiName } from '../../src/internal/telemetry';
import { ExternalAppErrorCode } from '../../src/private/constants';
import { externalAppCardActions } from '../../src/private/externalAppCardActions';
import { externalAppCardActionsForCEA } from '../../src/private/externalAppCardActionsForCEA';
import { AppId, FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { Utils } from '../utils';

describe('externalAppCardActionsForCEA', () => {
  let utils = new Utils();

  // This ID was randomly generated for the purpose of these tests
  const testAppId = new AppId('01b92759-b43a-4085-ac22-7772d94bb7a9');
  const testConversationId = '61f7f08d-477b-42b8-9c36-44eabb58eb92';

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
      expect.assertions(1);
      try {
        await externalAppCardActionsForCEA.processActionSubmit(testAppId, testConversationId, testActionSubmitPayload);
      } catch (e) {
        expect(e).toEqual(new Error(errorLibraryNotInitialized));
      }
    });

    it('should throw error when externalAppCardActionsForCEA capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        await externalAppCardActionsForCEA.processActionSubmit(testAppId, testConversationId, testActionSubmitPayload);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });

          const promise = externalAppCardActionsForCEA.processActionSubmit(
            testAppId,
            testConversationId,
            testActionSubmitPayload,
          );

          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId.toString(), testConversationId, testActionSubmitPayload]);
            utils.respondToMessage(message, undefined);
          }

          await expect(promise).resolves.toBeUndefined();
        });

        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });
          const promise = externalAppCardActionsForCEA.processActionSubmit(
            testAppId,
            testConversationId,
            testActionSubmitPayload,
          );
          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId.toString(), testConversationId, testActionSubmitPayload]);
            utils.respondToMessage(message, testError);
          }
          await expect(promise).rejects.toEqual(testError);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });

          await expect(
            externalAppCardActionsForCEA.processActionSubmit(testAppId, testConversationId, testActionSubmitPayload),
          ).rejects.toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedFrameContexts,
              )}. Current context: "${frameContext}".`,
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
      expect.assertions(1);
      try {
        await externalAppCardActionsForCEA.processActionOpenUrl(testAppId, testConversationId, testUrl);
      } catch (e) {
        expect(e).toEqual(new Error(errorLibraryNotInitialized));
      }
    });

    it('should throw error when externalAppCardActionsForCEA capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });

      try {
        await externalAppCardActionsForCEA.processActionOpenUrl(testAppId, testConversationId, testUrl);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });

          const promise = externalAppCardActionsForCEA.processActionOpenUrl(testAppId, testConversationId, testUrl);

          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId.toString(), testConversationId, testUrl.href]);
            utils.respondToMessage(message, null, testResponse);
          }

          await expect(promise).resolves.toEqual(testResponse);
        });

        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });

          const promise = externalAppCardActionsForCEA.processActionOpenUrl(testAppId, testConversationId, testUrl);

          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([testAppId.toString(), testConversationId, testUrl.href]);
            utils.respondToMessage(message, testError, null);
          }

          await expect(promise).rejects.toEqual(testError);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });

          await expect(
            externalAppCardActionsForCEA.processActionOpenUrl(testAppId, testConversationId, testUrl),
          ).rejects.toThrowError(
            new Error(
              `This call is only allowed in following contexts: ${JSON.stringify(
                allowedFrameContexts,
              )}. Current context: "${frameContext}".`,
            ),
          );
        });
      }
    });
  });

  describe('isSupported', () => {
    it('should throw when library is not initialized', () => {
      return expect(() => externalAppCardActionsForCEA.isSupported()).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should return true when externalAppCardActionsForCEA capability is supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForCEA: {} } });
      return expect(externalAppCardActionsForCEA.isSupported()).toEqual(true);
    });
    it('should return false when externalAppCardActionsForCEA capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      return expect(externalAppCardActionsForCEA.isSupported()).toEqual(false);
    });
  });
});
