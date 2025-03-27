import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, FrameContexts, HostClientType, nestedAppAuth } from '../../src/public';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

/**
 * Test cases for nested app auth APIs
 */
describe('nestedAppAuth', () => {
  const utils = new Utils();
  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('isNAAChannelRecommended', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => nestedAppAuth.isNAAChannelRecommended()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return true if isNAAChannelRecommended set to true in runtime object', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeTruthy();
    });

    it('should return false if isNAAChannelRecommended set to false in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    it('should return false if isNAAChannelRecommended not present in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    describe('should return false when isNAAChannelRecommended is false across different host clients', () => {
      const hostClients = [HostClientType.macos, HostClientType.desktop, HostClientType.web];

      hostClients.forEach((hostClient) => {
        it(`${hostClient} client`, async () => {
          await utils.initializeWithContext(FrameContexts.content, hostClient);
          const runtimeConfig: Runtime = {
            apiVersion: 4,
            supports: {},
            isNAAChannelRecommended: false,
          };
          utils.setRuntimeConfig(runtimeConfig);
          expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
        });
      });
    });

    it('should return false if isNAAChannelRecommended is false and isLegacyTeams is false in runtimeConfig', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
        isLegacyTeams: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    it('should return false if isNAAChannelRecommended is false and isLegacyTeams is true in runtimeConfig for android client that does not supports nestedAppAuth', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
        isLegacyTeams: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    describe('should return true if isNAAChannelRecommended is false and isLegacyTeams is true in runtimeConfig for following clients that supports nestedAppAuth', () => {
      const hostClients = [HostClientType.ipados, HostClientType.ios, HostClientType.android];

      hostClients.forEach((hostClient) => {
        it(`for ${hostClient} client`, async () => {
          await utils.initializeWithContext(FrameContexts.content, hostClient);
          const runtimeConfig: Runtime = {
            apiVersion: 4,
            supports: { nestedAppAuth },
            isNAAChannelRecommended: false,
            isLegacyTeams: true,
          };
          utils.setRuntimeConfig(runtimeConfig);
          expect(nestedAppAuth.isNAAChannelRecommended()).toBeTruthy();
        });
      });
    });
  });
  describe('nestedAppAuth.isDeeplyNestedAuthSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => nestedAppAuth.isDeeplyNestedAuthSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return true if isDeeplyNestedAuthSupported set to true in runtime object', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: true,
        isDeeplyNestedAuthSupported: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeTruthy();
    });

    it('should return false if isDeeplyNestedAuthSupported set to false in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });

    it('should return false if isDeeplyNestedAuthSupported not present in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });
  });
  describe('getParentOrigin', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => nestedAppAuth.getParentOrigin()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return parentOrigin if initialized and set', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      expect(nestedAppAuth.getParentOrigin()).toBe(utils.validOrigin);
    });
  });
});
