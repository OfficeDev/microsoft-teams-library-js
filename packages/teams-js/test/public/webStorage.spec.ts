import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { ApiName } from '../../src/internal/telemetry';
import { clearWebStorageCachedHostNameForTests } from '../../src/internal/webStorageHelpers';
import { app, Context } from '../../src/public';
import { errorNotSupportedOnPlatform, FrameContexts, HostClientType, HostName } from '../../src/public/constants';
import * as webStorage from '../../src/public/webStorage';
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
    afterEach(() => {
      clearWebStorageCachedHostNameForTests();
    });

    it('should not allow calls before initialization', async () => {
      expect.assertions(1);

      utils.uninitializeRuntimeConfig();

      await webStorage
        .isWebStorageClearedOnUserLogOut()
        .catch((e) => expect(e).toMatchObject(new Error(errorLibraryNotInitialized)));
    });

    it('should throw errorNotSupportedOnPlatform if webStorage not supported in runtime config and isLegacyTeams is undefined', async () => {
      expect.assertions(1);

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig({ apiVersion: 1, supports: {} });

      await webStorage
        .isWebStorageClearedOnUserLogOut()
        .catch((e) => expect(e).toMatchObject(errorNotSupportedOnPlatform));
    });

    const enum RuntimeSource {
      LegacyTeams,
      NotLegacyTeams,
    }

    const enum GetContextCallExpectation {
      GetContextShouldBeCalled,
      GetContextShouldNotBeCalled,
    }

    async function callAndAnswerIsWebStorageClearedOnUserLogOut(
      hostClientType: HostClientType,
      hostName: HostName,
      runtimeSource: RuntimeSource,
      getContextCallExpectation: GetContextCallExpectation,
      webStorageMessageResponse: undefined | boolean, // undefined means no web storage message should be sent, a boolean value indicates how to respond when it is sent
    ): Promise<boolean> {
      await utils.initializeWithContext(FrameContexts.content, hostClientType);
      utils.setRuntimeConfig({
        apiVersion: 4,
        isLegacyTeams: runtimeSource === RuntimeSource.LegacyTeams,
        supports: { webStorage: {} },
      });

      const webStoragePromise = webStorage.isWebStorageClearedOnUserLogOut();

      if (getContextCallExpectation === GetContextCallExpectation.GetContextShouldBeCalled) {
        const getContextMessage = utils.findMessageByActionName(ApiName.PublicAPIs_GetContext);

        const contextResponse: Context = {
          entityId: '',
          hostName,
          hostClientType,
          locale: 'en-us',
        };

        await utils.respondToMessage(getContextMessage!, contextResponse);
      }

      if (webStorageMessageResponse !== undefined) {
        const webStorageMessage = await utils.waitUntilMessageIsSent(
          ApiName.WebStorage_IsWebStorageClearedOnUserLogOut,
        );
        await utils.respondToMessage(webStorageMessage, webStorageMessageResponse);
      }

      return webStoragePromise;
    }

    it('should return true; HOST: Teams, PLATFORM: iOS, TEAMS_LEGACY_RUNTIME: true', async () => {
      expect.assertions(1);

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.teams,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        undefined,
      );

      expect(result).toStrictEqual(true);
    });

    it('should return true; HOST: Teams, PLATFORM: iPadOS, TEAMS_LEGACY_RUNTIME: true', async () => {
      expect.assertions(1);

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ipados,
        HostName.teams,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        undefined,
      );

      expect(result).toStrictEqual(true);
    });

    it('should return true; HOST: Teams, PLATFORM: Android, TEAMS_LEGACY_RUNTIME: true', async () => {
      expect.assertions(1);

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.android,
        HostName.teams,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        undefined,
      );

      expect(result).toStrictEqual(true);
    });

    it('should return true; HOST: Not Teams, PLATFORM: iOS, TEAMS_LEGACY_RUNTIME: true, host returns: true', async () => {
      expect.assertions(1);

      const hostResponse = true;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.outlook,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return false; HOST: Not Teams, PLATFORM: Android, TEAMS_LEGACY_RUNTIME: true, host returns: false', async () => {
      expect.assertions(1);

      const hostResponse = false;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.android,
        HostName.office,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return false; HOST: Not Teams, PLATFORM: iOS, TEAMS_LEGACY_RUNTIME: true, host returns: false', async () => {
      expect.assertions(1);

      const hostResponse = false;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.outlookWin32,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return true; HOST: Not Teams, PLATFORM: Android, TEAMS_LEGACY_RUNTIME: false, host returns: true', async () => {
      expect.assertions(1);

      const hostResponse = true;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.android,
        HostName.orange,
        RuntimeSource.NotLegacyTeams,
        GetContextCallExpectation.GetContextShouldNotBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return true; HOST: Not Teams, PLATFORM: iOS, TEAMS_LEGACY_RUNTIME: false, host returns: true', async () => {
      expect.assertions(1);

      const hostResponse = true;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.places,
        RuntimeSource.NotLegacyTeams,
        GetContextCallExpectation.GetContextShouldNotBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return false; HOST: Not Teams, PLATFORM: Android, TEAMS_LEGACY_RUNTIME: false, host returns: false', async () => {
      expect.assertions(1);

      const hostResponse = false;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.android,
        HostName.teamsModern,
        RuntimeSource.NotLegacyTeams,
        GetContextCallExpectation.GetContextShouldNotBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should return false; HOST: Not Teams, PLATFORM: iOS, TEAMS_LEGACY_RUNTIME: false, host returns: false', async () => {
      expect.assertions(1);

      const hostResponse = false;

      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.office,
        RuntimeSource.NotLegacyTeams,
        GetContextCallExpectation.GetContextShouldNotBeCalled,
        hostResponse,
      );

      expect(result).toStrictEqual(hostResponse);
    });

    it('should not call getContext from the host more than once when it is called a second time if the host is Teams mobile and the Teams fallback runtime is being used', async () => {
      expect.assertions(1);

      await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.teams,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldBeCalled,
        undefined,
      );

      utils.messages = utils.messages.filter((message) => message.func !== ApiName.PublicAPIs_GetContext);
      // In this call, we should not receive a getContext call so this function will fail if there's no getContext message
      const result = await callAndAnswerIsWebStorageClearedOnUserLogOut(
        HostClientType.ios,
        HostName.teams,
        RuntimeSource.LegacyTeams,
        GetContextCallExpectation.GetContextShouldNotBeCalled,
        undefined,
      );

      expect(result).toStrictEqual(true);
    });
  });
});
