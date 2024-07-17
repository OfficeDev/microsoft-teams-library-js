import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { copilot } from '../../src/private/copilot';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

const copilotRuntimeConfig: Runtime = {
  apiVersion: 4,
  hostVersionsInfo: {
    m365ChatLicenseInfo: {
      hasM365ChatLicense: true,
    },
  },
  supports: {
    pages: {
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    teamsCore: {},
    logs: {},
  },
};
describe('copilot', () => {
  let utils: Utils;
  beforeEach(() => {
    utils = new Utils();
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(copilotRuntimeConfig);
      app._uninitialize();
    }
  });

  describe('license.isSupported', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => copilot.license.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return true if the user has copilotLicense', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(copilotRuntimeConfig);
      expect(copilot.license.isSupported()).toBeTruthy();
    });
    it('should return false if the value is not set by the host or missing ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const copilotRuntimeConfigWithOutM365ChatLicense: Runtime = {
        apiVersion: 4,
        supports: {
          pages: {
            appButton: {},
            tabs: {},
            config: {},
            backStack: {},
            fullTrust: {},
          },
          teamsCore: {},
          logs: {},
        },
      };
      utils.setRuntimeConfig(copilotRuntimeConfigWithOutM365ChatLicense);
      expect(copilot.license.isSupported()).toBeFalsy();
    });
    it('should return false if the value is false ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const copilotRuntimeConfigWithCopilotLicenseFalse: Runtime = {
        apiVersion: 4,
        hostVersionsInfo: {
          m365ChatLicenseInfo: {
            hasM365ChatLicense: false,
          },
        },
        supports: {
          pages: {
            appButton: {},
            tabs: {},
            config: {},
            backStack: {},
            fullTrust: {},
          },
          teamsCore: {},
          logs: {},
        },
      };
      utils.setRuntimeConfig(copilotRuntimeConfigWithCopilotLicenseFalse);
      expect(copilot.license.isSupported()).toBeFalsy();
    });
  });
});
