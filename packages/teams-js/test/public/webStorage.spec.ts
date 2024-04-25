import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName } from '../../src/internal/telemetry';
import { FrameContexts } from '../../src/public/constants';
import {
  generateVersionBasedTeamsRuntimeConfig,
  mapTeamsVersionToSupportedCapabilities,
  versionAndPlatformAgnosticTeamsRuntimeConfig,
} from '../../src/public/runtime';
import { webStorage } from '../../src/public/webStorage';
import { Utils } from '../utils';

describe('webStorage', () => {
  const utils = new Utils();
  describe('webStorage.isSupported', () => {
    it('webStorage.isSupported should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => webStorage.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
  });

  describe('webStorage.isWebStorageClearedOnUserLogOut', () => {
    it('should not allow calls before initialization', async () => {
      expect.assertions(1);

      await webStorage
        .isWebStorageClearedOnUserLogOut()
        .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
    });

    it('should return true if host returns true', async () => {
      expect.assertions(1);
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: { webStorage: {} } });

      const apiCallPromise = webStorage.isWebStorageClearedOnUserLogOut();
      const apiCallMessage = utils.findMessageByActionName(ApiName.WebStorage_IsWebStorageClearedOnUserLogOut);

      const messageResponseData = true;
      await utils.respondToMessage(apiCallMessage, messageResponseData);

      const result = await apiCallPromise;
      expect(result).toStrictEqual(true);
    });
  });
});
