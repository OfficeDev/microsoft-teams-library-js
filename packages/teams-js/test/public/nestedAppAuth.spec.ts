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
describe('Testing nestedAppAuth capability', () => {
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

  describe('nestedAppAuth.isNAAChannelRecommended', () => {
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

    it('should return false if isNAAChannelRecommended is false in runtimeConfig for macos client', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.macos);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    it('should return false if isNAAChannelRecommended is false in runtimeConfig for desktop client', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.desktop);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
    });

    it('should return false if isNAAChannelRecommended is false in runtimeConfig for web client', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.web);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isNAAChannelRecommended: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeFalsy();
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

    it('should return true if isNAAChannelRecommended is false and isLegacyTeams is true in runtimeConfig for android client that supports nestedAppAuth', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: { nestedAppAuth },
        isNAAChannelRecommended: false,
        isLegacyTeams: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeTruthy();
    });

    it('should return true if isNAAChannelRecommended is false and isLegacyTeams is true in runtimeConfig for ios client that supports nestedAppAuth', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.ios);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: { nestedAppAuth },
        isNAAChannelRecommended: false,
        isLegacyTeams: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isNAAChannelRecommended()).toBeTruthy();
    });

    it('should return true if isNAAChannelRecommended is false and isLegacyTeams is true in runtimeConfig for ipados client that supports nestedAppAuth', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.ipados);
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
});
