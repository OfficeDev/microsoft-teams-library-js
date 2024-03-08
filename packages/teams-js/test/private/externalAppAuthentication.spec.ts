import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { externalAppAuthentication } from '../../src/private/externalAppAuthentication';
import { app } from '../../src/public/app';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../src/public/constants';
import { Utils } from '../utils';

describe('externalAppAuthentication', () => {
  let utils = new Utils();

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

  // This ID was randomly generated for the purpose of these tests
  const testAppId = '01b92759-b43a-4085-ac22-7772d94bb7a9';

  const testOriginalRequest: externalAppAuthentication.IOriginalRequestInfo = {
    requestType: externalAppAuthentication.OriginalRequestType.ActionExecuteInvokeRequest,
    type: 'Action.Execute',
    id: '1',
    verb: 'action',
    data: {},
  };
  const testOriginalRequestWithInvalidType: externalAppAuthentication.IOriginalRequestInfo = {
    requestType: externalAppAuthentication.OriginalRequestType.ActionExecuteInvokeRequest,
    type: 'INVALID_TYPE',
    id: '1',
    verb: 'action',
    data: {},
  };

  describe('authenticateAndResendRequest', () => {
    const testAuthRequest = {
      url: new URL('https://example.com'),
      width: 100,
      height: 100,
      isExternal: true,
    };
    const testResponse = {
      responseType: externalAppAuthentication.InvokeResponseType.ActionExecuteInvokeResponse,
      value: {},
      signature: 'test signature',
      statusCode: 200,
      type: 'test type',
    };
    const testError = {
      errorCode: 'INTERNAL_ERROR',
      message: 'test error message',
    };
    const allowedFrameContexts = [FrameContexts.content];

    it('should not allow calls before initialization', () => {
      return expect(() =>
        externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, testOriginalRequest),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect.assertions(1);
      try {
        externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, testOriginalRequest);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });

    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should return response on success with context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const promise = externalAppAuthentication.authenticateAndResendRequest(
            testAppId,
            testAuthRequest,
            testOriginalRequest,
          );
          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              testAppId,
              testOriginalRequest,
              testAuthRequest.url.href,
              testAuthRequest.width,
              testAuthRequest.height,
              testAuthRequest.isExternal,
            ]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, true, testResponse);
          }
          return expect(promise).resolves.toEqual(testResponse);
        });
        it(`should throw error on invalid original request with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          try {
            externalAppAuthentication.authenticateAndResendRequest(
              testAppId,
              testAuthRequest,
              testOriginalRequestWithInvalidType,
            );
          } catch (e) {
            expect(e).toEqual({
              errorCode: 'INTERNAL_ERROR',
              message: `Invalid action type ${testOriginalRequestWithInvalidType.type}. Action type must be "Action.Execute"`,
            });
          }
        });
        it(`should throw error from host on failure with context - ${frameContext}`, async () => {
          expect.assertions(3);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const promise = externalAppAuthentication.authenticateAndResendRequest(
            testAppId,
            testAuthRequest,
            testOriginalRequest,
          );
          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              testAppId,
              testOriginalRequest,
              testAuthRequest.url.href,
              testAuthRequest.width,
              testAuthRequest.height,
              testAuthRequest.isExternal,
            ]);
            utils.respondToMessage(message, false, testError);
          }
          return expect(promise).rejects.toEqual(testError);
        });
        it(`should throw error on invalid app ID with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const invalidAppId = 'invalidAppId';
          try {
            externalAppAuthentication.authenticateAndResendRequest(invalidAppId, testAuthRequest, testOriginalRequest);
          } catch (e) {
            expect(e).toEqual(new Error('App ID is not valid. Must be GUID format. App ID: ' + invalidAppId));
          }
        });
        it(`should throw error on original request info command ID exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'a'.repeat(65),
            parameters: [{ name: 'testName', value: 'testValue' }],
          };

          try {
            externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(new Error('originalRequestInfo.commandId exceeds the maximum size of 64 characters'));
          }
        });
        it(`should throw error on original request info parameters exceed max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [
              { name: 'testName1', value: 'testValue1' },
              { name: 'testName2', value: 'testValue2' },
              { name: 'testName3', value: 'testValue3' },
              { name: 'testName4', value: 'testValue4' },
              { name: 'testName5', value: 'testValue5' },
              { name: 'testName6', value: 'testValue6' },
            ],
          };

          try {
            externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(new Error('originalRequestInfo.parameters exceeds the maximum size of 5'));
          }
        });
        it(`should throw error on original request info parameter name exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [{ name: 'a'.repeat(65), value: 'testValue' }],
          };

          try {
            externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(
              new Error('originalRequestInfo.parameters.name exceeds the maximum size of 64 characters'),
            );
          }
        });
        it(`should throw error on original request info parameter value exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [{ name: 'testName', value: 'a'.repeat(513) }],
          };

          try {
            externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(
              new Error('originalRequestInfo.parameters.value exceeds the maximum size of 512 characters'),
            );
          }
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          return expect(() =>
            externalAppAuthentication.authenticateAndResendRequest(testAppId, testAuthRequest, testOriginalRequest),
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

  describe('authenticateWithSSO', () => {
    const testRequest = {
      claims: ['claims'],
      silent: true,
    };
    it('should not allow calls before initialization', () => {
      return expect(() => externalAppAuthentication.authenticateWithSSO(testAppId, {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect.assertions(1);
      try {
        externalAppAuthentication.authenticateWithSSO(testAppId, {});
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
    it('should throw error from host', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
      const testError = {
        errorCode: 'INTERNAL_ERROR',
        message: 'test error message',
      };
      const promise = externalAppAuthentication.authenticateWithSSO(testAppId, testRequest);

      const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSO');
      if (message && message.args) {
        expect(message).not.toBeNull();
        expect(message.args).toEqual([testAppId, testRequest.claims, testRequest.silent]);
        utils.respondToMessage(message, false, testError);
      }
      await expect(promise).rejects.toEqual(testError);
    });
    it('should resolve on success', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
      const promise = externalAppAuthentication.authenticateWithSSO(testAppId, testRequest);

      const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSO');
      if (message && message.args) {
        expect(message).not.toBeNull();
        expect(message.args).toEqual([testAppId, testRequest.claims, testRequest.silent]);
        utils.respondToMessage(message, true);
      }
      await expect(promise).resolves.toBeUndefined();
    });
  });

  describe('authenticateWithSSOAndResendRequest', () => {
    const testAuthRequest = {
      claims: ['claims'],
      silent: true,
    };
    it('should not allow calls before initialization', () => {
      return expect(() =>
        externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, testOriginalRequest),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, testOriginalRequest);
      } catch (e) {
        expect(e).toEqual(errorNotSupportedOnPlatform);
      }
    });
    const allowedFrameContexts = [FrameContexts.content];
    Object.values(FrameContexts).forEach((frameContext) => {
      if (allowedFrameContexts.includes(frameContext)) {
        it(`should throw error from host failure in context - ${frameContext}`, async () => {
          expect.assertions(3);
          const testError = {
            errorCode: 'INTERNAL_ERROR',
            message: 'test error message',
          };
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const promise = externalAppAuthentication.authenticateWithSSOAndResendRequest(
            testAppId,
            testAuthRequest,
            testOriginalRequest,
          );

          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSOAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              testAppId,
              testOriginalRequest,
              testAuthRequest.claims,
              testAuthRequest.silent,
            ]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, false, testError);
          }
          await expect(promise).rejects.toEqual(testError);
        });
        it(`should throw error on invalid original request with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(
              testAppId,
              testAuthRequest,
              testOriginalRequestWithInvalidType,
            );
          } catch (e) {
            expect(e).toEqual({
              errorCode: 'INTERNAL_ERROR',
              message: `Invalid action type ${testOriginalRequestWithInvalidType.type}. Action type must be "Action.Execute"`,
            });
          }
        });
        it(`should return response on success in context - ${frameContext}`, async () => {
          expect.assertions(3);
          const testResponse = {
            responseType: externalAppAuthentication.InvokeResponseType.ActionExecuteInvokeResponse,
            value: {},
            signature: 'test signature',
            statusCode: 200,
            type: 'test type',
          };
          await utils.initializeWithContext(FrameContexts.content);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const promise = externalAppAuthentication.authenticateWithSSOAndResendRequest(
            testAppId,
            testAuthRequest,
            testOriginalRequest,
          );

          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSOAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              testAppId,
              testOriginalRequest,
              testAuthRequest.claims,
              testAuthRequest.silent,
            ]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, true, testResponse);
          }
          await expect(promise).resolves.toEqual(testResponse);
        });
        it(`should throw error on invalid app ID with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const invalidAppId = 'invalidAppId';
          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(
              invalidAppId,
              testAuthRequest,
              testOriginalRequest,
            );
          } catch (e) {
            expect(e).toEqual(new Error('App ID is not valid. Must be GUID format. App ID: ' + invalidAppId));
          }
        });
        it(`should throw error on original request info command ID exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'a'.repeat(65),
            parameters: [{ name: 'testName', value: 'testValue' }],
          };

          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(new Error('originalRequestInfo.commandId exceeds the maximum size of 64 characters'));
          }
        });
        it(`should throw error on original request info parameters exceed max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [
              { name: 'testName1', value: 'testValue1' },
              { name: 'testName2', value: 'testValue2' },
              { name: 'testName3', value: 'testValue3' },
              { name: 'testName4', value: 'testValue4' },
              { name: 'testName5', value: 'testValue5' },
              { name: 'testName6', value: 'testValue6' },
            ],
          };

          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(new Error('originalRequestInfo.parameters exceeds the maximum size of 5'));
          }
        });
        it(`should throw error on original request info parameter name exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [{ name: 'a'.repeat(65), value: 'testValue' }],
          };

          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(
              new Error('originalRequestInfo.parameters.name exceeds the maximum size of 64 characters'),
            );
          }
        });
        it(`should throw error on original request info parameter value exceeds max size with context - ${frameContext}`, async () => {
          expect.assertions(1);
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          const originalRequest: externalAppAuthentication.IOriginalRequestInfo = {
            requestType: externalAppAuthentication.OriginalRequestType.QueryMessageExtensionRequest,
            commandId: 'testCommandId',
            parameters: [{ name: 'testName', value: 'a'.repeat(513) }],
          };

          try {
            externalAppAuthentication.authenticateWithSSOAndResendRequest(testAppId, testAuthRequest, originalRequest);
          } catch (e) {
            expect(e).toEqual(
              new Error('originalRequestInfo.parameters.value exceeds the maximum size of 512 characters'),
            );
          }
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          return expect(() =>
            externalAppAuthentication.authenticateWithSSOAndResendRequest(
              testAppId,
              testAuthRequest,
              testOriginalRequest,
            ),
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
  describe('isSupported', () => {
    it('should throw when library is not initialized', () => {
      return expect(() => externalAppAuthentication.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return true when externalAppCardActions capability is supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
      return expect(externalAppAuthentication.isSupported()).toEqual(true);
    });
    it('should return false when externalAppCardActions capability is not supported', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      return expect(externalAppAuthentication.isSupported()).toEqual(false);
    });
  });
});
