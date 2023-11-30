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

  describe('authenticateWithSSO', () => {
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
    it('success', async () => {
      const testRequest = {
        resources: ['resources'],
        claims: ['claims'],
        silent: true,
      };
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 2, supports: { externalAppAuthentication: {} } });
      const promise = externalAppAuthentication.authenticateWithSSO('appId', testRequest);

      const message = utils.findMessageByFunc('externalAppAuthentication.authenticateWithSSO');
      if (message && message.args) {
        expect(message).not.toBeNull();
        expect(message.args).toEqual(['appId', testRequest.resources, testRequest.claims, testRequest.silent]);
        utils.respondToMessage(message, true);
      }
      expect(promise).resolves;
    });
  });
});
