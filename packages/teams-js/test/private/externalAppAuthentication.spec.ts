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
        externalAppAuthentication.authenticateAndResendRequest('appId', testAuthRequest, testOriginalRequest),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect.assertions(1);
      try {
        externalAppAuthentication.authenticateAndResendRequest('appId', testAuthRequest, testOriginalRequest);
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
            'appId',
            testAuthRequest,
            testOriginalRequest,
          );
          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              'appId',
              testOriginalRequest,
              testAuthRequest.url.toString(),
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
              'appId',
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
            'appId',
            testAuthRequest,
            testOriginalRequest,
          );
          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              'appId',
              testOriginalRequest,
              testAuthRequest.url.toString(),
              testAuthRequest.width,
              testAuthRequest.height,
              testAuthRequest.isExternal,
            ]);
            utils.respondToMessage(message, false, testError);
          }
          return expect(promise).rejects.toEqual(testError);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          return expect(() =>
            externalAppAuthentication.authenticateAndResendRequest('appId', testAuthRequest, testOriginalRequest),
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
      return expect(() => externalAppAuthentication.authenticateWithSSO('appId', {})).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });
    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      expect.assertions(1);
      try {
        externalAppAuthentication.authenticateWithSSO('appId', {});
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
      const promise = externalAppAuthentication.authenticateWithSSO('appId', testRequest);

      const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSO');
      if (message && message.args) {
        expect(message).not.toBeNull();
        expect(message.args).toEqual(['appId', testRequest.claims, testRequest.silent]);
        utils.respondToMessage(message, false, testError);
      }
      await expect(promise).rejects.toEqual(testError);
    });
    it('should resolve on success', async () => {
      expect.assertions(3);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
      const promise = externalAppAuthentication.authenticateWithSSO('appId', testRequest);

      const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSO');
      if (message && message.args) {
        expect(message).not.toBeNull();
        expect(message.args).toEqual(['appId', testRequest.claims, testRequest.silent]);
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
        externalAppAuthentication.authenticateWithSSOAndResendRequest('appId', testAuthRequest, testOriginalRequest),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should throw error when externalAppAuthentication is not supported in runtime config.', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: {} });
      try {
        externalAppAuthentication.authenticateWithSSOAndResendRequest('appId', testAuthRequest, testOriginalRequest);
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
            'appId',
            testAuthRequest,
            testOriginalRequest,
          );

          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSOAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              'appId',
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
              'appId',
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
            'appId',
            testAuthRequest,
            testOriginalRequest,
          );

          const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSOAndResendRequest');
          if (message && message.args) {
            expect(message).not.toBeNull();
            expect(message.args).toEqual([
              'appId',
              testOriginalRequest,
              testAuthRequest.claims,
              testAuthRequest.silent,
            ]);
            // eslint-disable-next-line strict-null-checks/all
            utils.respondToMessage(message, true, testResponse);
          }
          await expect(promise).resolves.toEqual(testResponse);
        });
      } else {
        it(`should not allow calls from ${frameContext} context`, async () => {
          await utils.initializeWithContext(frameContext);
          utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
          return expect(() =>
            externalAppAuthentication.authenticateWithSSOAndResendRequest(
              'appId',
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
