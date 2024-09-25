import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { ExternalAppErrorCode } from '../../src/private/constants';
import { externalAppCommands } from '../../src/private/externalAppCommands';
import { FrameContexts } from '../../src/public';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import { Utils } from '../utils';

describe('externalAppCommands', () => {
  let utils = new Utils();

  // This ID was randomly generated for the purpose of these tests
  const mockAppId = '01b92759-b43a-4085-ac22-7772d94bb7a9';
  const mockCommandId = 'mock-command-id';
  const mockExtractedParam: Record<string, string> = { mock_key: 'mock_value' };

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

  describe('Testing ExternalAppCommands.processActionCommand API', () => {
    it('should not allow calls before initialization', () => {
      return expect(() =>
        externalAppCommands.processActionCommand(mockAppId, mockCommandId, mockExtractedParam),
      ).rejects.toThrowError(new Error(errorLibraryNotInitialized));
    });
    const allowedFrameContexts = [FrameContexts.content];
    const testError = {
      errorCode: ExternalAppErrorCode.INTERNAL_ERROR,
      message: 'mockErrorMessage',
    };
    const mockResponse: externalAppCommands.ITextActionCommandResponse = {
      taskModuleClosedReason: 'Done',
      resultType: 'text',
      text: 'mock-text',
    };

    it('should throw error when externalAppCommands capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        await externalAppCommands.processActionCommand(mockAppId, mockCommandId, mockExtractedParam);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should resolve when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          const promise = externalAppCommands.processActionCommand(mockAppId, mockCommandId, mockExtractedParam);
          const message = utils.findMessageByFunc('externalAppCommands.processActionCommand');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([mockAppId, mockCommandId, mockExtractedParam]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, null, mockResponse);
          }
          try {
            const response = await promise;
            return expect(response).toEqual(mockResponse);
          } catch (e) {
            return expect(e).toBeNull();
          }
        });
        it(`should throw error from host when called from context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          const promise = externalAppCommands.processActionCommand(mockAppId, mockCommandId, mockExtractedParam);
          const message = utils.findMessageByFunc('externalAppCommands.processActionCommand');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([mockAppId, mockCommandId, mockExtractedParam]);
            utils.respondToMessage(message, testError, null);
          }
          try {
            const response = await promise;
            return expect(response).toEqual(testError);
          } catch (e) {
            return expect(e).toEqual(testError);
          }
        });
        it(`should throw error on invalid app ID if it contains script tag with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          const invalidAppId = 'invalidAppIdWith<script>alert(1)</script>';
          await expect(
            async () => await externalAppCommands.processActionCommand(invalidAppId, mockCommandId, mockExtractedParam),
          ).rejects.toThrowError(/script/i);
        });
        it(`should throw error on invalid app ID if it contains non printable ASCII characters with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          const invalidAppId = 'appId\u0000';
          await expect(
            async () => await externalAppCommands.processActionCommand(invalidAppId, mockCommandId, mockExtractedParam),
          ).rejects.toThrowError(/characters/i);
        });
        it(`should throw error on invalid app ID if its size exceeds 256 characters with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          const invalidAppId = 'a'.repeat(257);
          await expect(
            async () => await externalAppCommands.processActionCommand(invalidAppId, mockCommandId, mockExtractedParam),
          ).rejects.toThrowError(/length/i);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
          return expect(() =>
            externalAppCommands.processActionCommand(mockAppId, mockCommandId, mockExtractedParam),
          ).rejects.toThrowError(
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
      return expect(() => externalAppCommands.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return true when externalAppCommands capability is supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppCommands: {} } });
      return expect(externalAppCommands.isSupported()).toEqual(true);
    });
    it('should return false when externalAppCommands capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      return expect(externalAppCommands.isSupported()).toEqual(false);
    });
  });
});
