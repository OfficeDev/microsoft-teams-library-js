import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ApiName } from '../../src/internal/telemetry';
import { ExternalAppErrorCode } from '../../src/private/constants';
import * as externalAppCardActionsForDA from '../../src/private/externalAppCardActionsForDA';
import { AppId, FrameContexts, UUID } from '../../src/public';
import * as app from '../../src/public/app/app';
import { DialogDimension, errorNotSupportedOnPlatform } from '../../src/public/constants';
import { Utils } from '../utils';
describe('externalAppCardActionsForDA', () => {
  let utils = new Utils();
  // These ID were randomly generated for the purpose of these tests
  const testAppId = new AppId('01b92759-b43a-4085-ac22-7772d94bb7a9');
  const testTraceId = new UUID('123e4567-e89b-12d3-a456-426614174000');
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
    const serializedInput = [null, null];
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
        it(`should throw error if the traceId is not an instance of UUID class - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
          try {
            await externalAppCardActionsForDA.processActionOpenUrlDialog(
              testAppId,
              testActionOpenUrlDialogInfo,
              {} as unknown as UUID,
            );
          } catch (e) {
            expect(e).toEqual(new Error('Potential id ({}) is invalid; it is not an instance of UUID class.'));
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
            expect(message.args).toEqual([
              testAppId.serialize(),
              new externalAppCardActionsForDA.SerializableActionOpenUrlDialogInfo(
                testActionOpenUrlDialogInfo,
              ).serialize(),
              testTraceId.serialize(),
              null,
              null,
            ]);
            utils.respondToMessage(message, undefined);
          }
          await expect(promise).resolves.toBeUndefined();
        });
        it(`from frame context ${frameContext} it should pass card argument if present`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
          externalAppCardActionsForDA.processActionOpenUrlDialog(testAppId, testActionOpenUrlDialogInfo, testTraceId, {
            id: 'testCardId',
          });
          const message = utils.findMessageByActionName(ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog);
          expect(message.args?.[3]).toEqual({ id: 'testCardId' });
        });
        it(`from frame context ${frameContext} it should pass action argument if present`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCardActionsForDA: {} } });
          externalAppCardActionsForDA.processActionOpenUrlDialog(
            testAppId,
            testActionOpenUrlDialogInfo,
            testTraceId,
            undefined,
            {
              title: 'testActionTitle',
            },
          );
          const message = utils.findMessageByActionName(ApiName.ExternalAppCardActionsForDA_ProcessActionOpenUrlDialog);
          expect(message.args?.[4]).toEqual({ title: 'testActionTitle' });
        });
        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(2);
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
