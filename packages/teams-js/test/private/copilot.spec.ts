import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { copilot } from '../../src/private/copilot';
import { app } from '../../src/public/app';
import { FrameContexts } from '../../src/public/constants';
import { M365ChatLicenseType } from '../../src/public/interfaces';
import { _minRuntimeConfigToUninitialize, Runtime } from '../../src/public/runtime';
import { Utils } from '../utils';

const copilotRuntimeConfig: Runtime = {
  apiVersion: 4,
  hostVersionsInfo: {
    m365ChatLicenseInfo: {
      m365ChatLicenseType: M365ChatLicenseType.WebAndWork,
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

  describe('license', () => {
    it('should throw if called before initialization', () => {
      utils.uninitializeRuntimeConfig();
      expect(() => copilot.license.isSupported()).toThrowError(new Error(errorLibraryNotInitialized));
      expect(() => copilot.license.getM365ChatLicenseType()).toThrowError(new Error(errorLibraryNotInitialized));
    });
    it('should return true if the user has copilotLicense and the type of license', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      utils.setRuntimeConfig(copilotRuntimeConfig);
      expect(copilot.license.isSupported()).toBeTruthy();
      expect(copilot.license.getM365ChatLicenseType()).toBe(M365ChatLicenseType.WebAndWork);
    });
    it('if the m365ChatLicenseType is not set by the host or missing; isSupported() returns false and getM365ChatLicenseType throws error', async () => {
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
      expect(() => copilot.license.getM365ChatLicenseType()).toThrowError(new Error('M365Chat license is not supported'));
    });
    it('if the m365ChatLicenseType is NONE; isSupported() returns false and getM365ChatLicenseType throws error ', async () => {
      await utils.initializeWithContext(FrameContexts.content);
      const copilotRuntimeConfigWithCopilotLicenseFalse: Runtime = {
        apiVersion: 4,
        hostVersionsInfo: {
          m365ChatLicenseInfo: {
            m365ChatLicenseType: M365ChatLicenseType.None,
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
      expect(() => copilot.license.getM365ChatLicenseType()).toThrowError(new Error('M365Chat license is not supported'));
    });
  });
});
