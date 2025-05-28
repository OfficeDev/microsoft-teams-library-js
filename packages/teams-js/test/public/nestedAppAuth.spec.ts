import * as communication from '../../src/internal/communication';
import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { app, FrameContexts, HostClientType, nestedAppAuth } from '../../src/public';
import { errorNotSupportedOnPlatform } from '../../src/public/constants';
import {
  _minRuntimeConfigToUninitialize,
  Runtime,
  teamsMobileVersionLegacyForDeeplyNestedAuth,
} from '../../src/public/runtime';
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

  describe('isDeeplyNestedAuthSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => nestedAppAuth.isDeeplyNestedAuthSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should return true if isDeeplyNestedAuthSupported set to true in runtime object', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
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
        isDeeplyNestedAuthSupported: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });

    it('should return false if isDeeplyNestedAuthSupported not present in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });

    describe('should return false when isDeeplyNestedAuthSupported is false across different host clients', () => {
      const hostClients = [HostClientType.macos, HostClientType.desktop, HostClientType.web];

      hostClients.forEach((hostClient) => {
        it(`${hostClient} client`, async () => {
          await utils.initializeWithContext(FrameContexts.content, hostClient);
          const runtimeConfig: Runtime = {
            apiVersion: 4,
            supports: {},
            isDeeplyNestedAuthSupported: false,
          };
          utils.setRuntimeConfig(runtimeConfig);
          expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
        });
      });
    });

    it('should return false if isDeeplyNestedAuthSupported is false and isLegacyTeams is false in runtimeConfig', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isDeeplyNestedAuthSupported: false,
        isLegacyTeams: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });

    it('should return false if isDeeplyNestedAuthSupported is false and isLegacyTeams is true in runtimeConfig for android client for version < teamsMobileVersionLegacyForDeeplyNestedAuth', async () => {
      await utils.initializeWithContext(FrameContexts.content, HostClientType.android);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        isDeeplyNestedAuthSupported: false,
        isLegacyTeams: true,
      };
      utils.setClientSupportedSDKVersion('2.1.1');
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeFalsy();
    });

    describe('should return true if isDeeplyNestedAuthSupported is false and isLegacyTeams is true in runtimeConfig for android clients with version teamsMobileVersionLegacyForDeeplyNestedAuth', () => {
      const hostClients = [HostClientType.ipados, HostClientType.ios, HostClientType.android];
      hostClients.forEach((hostClient) => {
        it(`for ${hostClient} client`, async () => {
          await utils.initializeWithContext(FrameContexts.content, hostClient);
          utils.setClientSupportedSDKVersion(teamsMobileVersionLegacyForDeeplyNestedAuth);
          const runtimeConfig: Runtime = {
            apiVersion: 4,
            supports: {},
            isDeeplyNestedAuthSupported: false,
            isLegacyTeams: true,
          };
          utils.setRuntimeConfig(runtimeConfig);
          expect(nestedAppAuth.isDeeplyNestedAuthSupported()).toBeTruthy();
        });
      });
    });
  });
  describe('canParentManageNAATrustedOrigins', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => nestedAppAuth.canParentManageNAATrustedOrigins()).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should return true if canParentManageNAATrustedOrigins set to true in runtime object', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        canParentManageNAATrustedOrigins: true,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.canParentManageNAATrustedOrigins()).toBeTruthy();
    });

    it('should return false if canParentManageNAATrustedOrigins set to false in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        canParentManageNAATrustedOrigins: false,
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.canParentManageNAATrustedOrigins()).toBeFalsy();
    });

    it('should return false if canParentManageNAATrustedOrigins not present in runtime object ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
      };
      utils.setRuntimeConfig(runtimeConfig);
      expect(nestedAppAuth.canParentManageNAATrustedOrigins()).toBeFalsy();
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

  describe('addNAATrustedOrigins and deleteNAATrustedOrigins', () => {
    const validOrigins = ['https://microsoft.com', 'https://contoso.com'];
    const runtimeConfig: Runtime = {
      apiVersion: 4,
      supports: {},
      canParentManageNAATrustedOrigins: true,
    };
    let callFunctionSpy: jest.SpyInstance;

    beforeEach(async () => {
      callFunctionSpy = jest.spyOn(communication, 'callFunctionInHostAndHandleResponse').mockResolvedValue('success');
    });

    afterEach(() => {
      callFunctionSpy.mockRestore();
    });

    it('should throw if called before initialization', async () => {
      utils.uninitializeRuntimeConfig();
      await expect(nestedAppAuth.addNAATrustedOrigins(validOrigins)).rejects.toThrow(errorLibraryNotInitialized);
    });

    it('should throw exception when canParentManageNAATrustedOrigins is false', async () => {
      await utils.initializeWithContext(FrameContexts.content);

      const runtimeConfig: Runtime = {
        apiVersion: 4,
        supports: {},
        canParentManageNAATrustedOrigins: false,
      };
      utils.setRuntimeConfig(runtimeConfig);

      expect(nestedAppAuth.canParentManageNAATrustedOrigins()).toBeFalsy();

      try {
        await nestedAppAuth.addNAATrustedOrigins(validOrigins);
        fail('Expected error was not thrown');
      } catch (e) {
        expect(e).toBe(errorNotSupportedOnPlatform);
      }

      try {
        await nestedAppAuth.deleteNAATrustedOrigins(validOrigins);
        fail('Expected error was not thrown');
      } catch (e) {
        expect(e).toBe(errorNotSupportedOnPlatform);
      }
    });

    it('should throw if passed invalid origin strings', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      const invalidOrigins = ['invalid-url'];

      await expect(nestedAppAuth.addNAATrustedOrigins(invalidOrigins)).rejects.toThrow(/Invalid origin provided/);
    });

    it('should throw if passed empty array', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      await expect(nestedAppAuth.addNAATrustedOrigins([])).rejects.toThrow(
        /parameter is required and must be a non-empty array/,
      );
      await expect(nestedAppAuth.deleteNAATrustedOrigins([])).rejects.toThrow(
        /parameter is required and must be a non-empty array/,
      );
    });

    it('should successfully call host function to add trusted origins', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      const result = await nestedAppAuth.addNAATrustedOrigins(validOrigins);
      expect(result).toEqual('success');
      expect(callFunctionSpy).toHaveBeenCalledWith(
        'nestedAppAuth.manageNAATrustedOrigins',
        expect.any(Array),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should successfully call host function to delete trusted origins', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      const result = await nestedAppAuth.deleteNAATrustedOrigins(validOrigins);
      expect(result).toEqual('success');
      expect(callFunctionSpy).toHaveBeenCalledWith(
        'nestedAppAuth.manageNAATrustedOrigins',
        expect.any(Array),
        expect.any(Object),
        expect.any(String),
      );
    });

    it('should throw error if not called from top-level window - ADD functionality', async () => {
      const originalParent = window.parent;
      Object.defineProperty(window, 'parent', { value: {}, configurable: true });

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      try {
        await nestedAppAuth.addNAATrustedOrigins(validOrigins);
        fail('Expected error was not thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('This API is only available in the top-level parent.');
      }

      Object.defineProperty(window, 'parent', { value: originalParent });
    });

    it('should throw error if not called from top-level window - Delete functionality', async () => {
      const originalParent = window.parent;
      Object.defineProperty(window, 'parent', { value: {}, configurable: true });

      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(runtimeConfig);

      try {
        await nestedAppAuth.deleteNAATrustedOrigins(validOrigins);
        fail('Expected error was not thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('This API is only available in the top-level parent.');
      }

      Object.defineProperty(window, 'parent', { value: originalParent });
    });
  });
});
