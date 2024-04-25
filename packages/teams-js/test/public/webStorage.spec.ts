import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName } from '../../src/internal/telemetry';
import { app } from '../../src/public';
import { FrameContexts, errorNotSupportedOnPlatform } from '../../src/public/constants';
import { webStorage } from '../../src/public/webStorage';
import { Utils } from '../utils';

describe('webStorage', () => {
  let utils: Utils;

  beforeEach(() => {
    utils = new Utils();
    utils.mockWindow.parent = undefined;
    utils.messages = [];
  });

  afterEach(() => {
    app._uninitialize();
    jest.clearAllMocks();
  });

  describe('webStorage.isSupported', () => {
    it('webStorage.isSupported should throw if called before initialization', () => {
      expect.assertions(1);

      utils.uninitializeRuntimeConfig();
      expect(() => webStorage.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('webStorage.isSupported should return false if webStorage not supported in runtime', async () => {
      expect.assertions(1);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });
      expect(webStorage.isSupported()).not.toBeTruthy();
    });

    it('webStorage.isSupported should return true if webStorage supported in runtime', async () => {
      expect.assertions(1);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });
      expect(webStorage.isSupported()).toBeTruthy();
    });
  });

  describe('webStorage.isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', async () => {
      expect.assertions(1);

      utils.uninitializeRuntimeConfig();

      await webStorage
        .isWebStorageClearedOnUserLogOut()
        .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
    });

    it('should throw errorNotSupportedOnPlatform if webStorage not supported in runtime config', async () => {
      expect.assertions(1);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await webStorage
        .isWebStorageClearedOnUserLogOut()
        .catch((e) => expect(e).toMatchObject(errorNotSupportedOnPlatform));
    });

    async function testForReturnValue(returnValueToTest: boolean): Promise<void> {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });

      const apiCallPromise = webStorage.isWebStorageClearedOnUserLogOut();
      const apiCallMessage = utils.findMessageByActionName(ApiName.WebStorage_IsWebStorageClearedOnUserLogOut);

      const messageResponseData = returnValueToTest;
      await utils.respondToMessage(apiCallMessage, messageResponseData);

      const result = await apiCallPromise;
      expect(result).toStrictEqual(returnValueToTest);
    }

    it('should return true if host returns true', async () => {
      await testForReturnValue(true);
    });

    it('should return false if host returns false', async () => {
      await testForReturnValue(false);
    });
  });
});
