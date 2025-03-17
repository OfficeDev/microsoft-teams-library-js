import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ApiName } from '../../src/internal/telemetry';
import { ExternalAppErrorCode } from '../../src/private/constants';
import * as externalAppCardActionsForDA from '../../src/private/externalAppCardActionsForDA';
import { AppId, FrameContexts } from '../../src/public';
import * as app from '../../src/public/app/app';
import { DialogDimension, errorNotSupportedOnPlatform } from '../../src/public/constants';
import { ValidatedStringId } from '../../src/public/validatedStringId';
import { Utils } from '../utils';

describe('externalAppCardActionsForDA', () => {
  let utils = new Utils();

  // This ID was randomly generated for the purpose of these tests
  const testAppId = new AppId('01b92759-b43a-4085-ac22-7772d94bb7a9');
  const testTraceId = new ValidatedStringId('61f7f08d-477b-42b8-9c36-44eabb58eb92');

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

  describe('processActionOpenUrlDialog', () => {
    const allowedFrameContexts = [FrameContexts.content];
    const testActionOpenUrlDialogInfo = {
      title: 'testTitle',
      url: new URL('https://www.example.com'),
      size: {
        width: 100,
        height: DialogDimension.Large,
      },
    };
    const serializedInput = [
      testAppId.serialize(),
      testActionOpenUrlDialogInfo.url.href,
      testActionOpenUrlDialogInfo.title,
      testActionOpenUrlDialogInfo.size.height,
      testActionOpenUrlDialogInfo.size.width,
      testTraceId.serialize(),
    ];
    const testError = {
      errorCode: ExternalAppErrorCode.INTERNAL_ERROR,
      message: 'testMessage',
    };

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);
      try {
        await externalAppCardActionsForDA.processActionOpenUrlDialog(
          testAppId,
          testActionOpenUrlDialogInfo,
          testTraceId,
        );
      } catch (e) {
        expect(e).toEqual(new Error(errorLibraryNotInitialized));
      }
    });

    it('should throw error when externalAppCardActionsForDA capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        await externalAppCardActionsForDA.processActionOpenUrlDialog(
          testAppId,
          testActionOpenUrlDialogInfo,
          testTraceId,
        );
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should throw error if the appId is not an instance of AppId class - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
          try {
            await externalAppCardActionsForDA.processActionOpenUrlDialog(
              {} as unknown as AppId,
              testActionOpenUrlDialogInfo,
              testTraceId,
            );
          } catch (e) {
            expect(e).toEqual(
              new Error('Potential app id ([object Object]) is invalid; it is not an instance of AppId class.'),
            );
          }
        });

        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });

          const promise = externalAppCardActionsForDA.processActionOpenUrlDialog(
            testAppId,
            testActionOpenUrlDialogInfo,
            testTraceId,
          );

          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual(serializedInput);
            utils.respondToMessage(message, undefined);
          }

          await expect(promise).resolves.toBeUndefined();
        });

        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
          const promise = externalAppCardActionsForDA.processActionOpenUrlDialog(
            testAppId,
            testActionOpenUrlDialogInfo,
            testTraceId,
          );
          const message = utils.findMessageByFunc(ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog);
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual(serializedInput);
            utils.respondToMessage(message, testError);
          }
          await expect(promise).rejects.toThrowError(
            new Error(`${testError.errorCode}, message: ${testError.message ?? 'None'}`),
          );
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });

          await expect(
            externalAppCardActionsForDA.processActionOpenUrlDialog(testAppId, testActionOpenUrlDialogInfo, testTraceId),
          ).rejects.toThrow(
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
      return expect(() => externalAppCardActionsForDA.isSupported()).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should return true when externalAppCardActionsForDA capability is supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
      return expect(externalAppCardActionsForDA.isSupported()).toEqual(true);
    });
    it('should return false when externalAppCardActionsForDA capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      return expect(externalAppCardActionsForDA.isSupported()).toEqual(false);
    });
  });
});
