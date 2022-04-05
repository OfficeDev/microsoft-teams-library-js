import { compareSDKVersions } from '../../src/internal/utils';
import { app } from '../../src/public';
import { generateBackCompatRuntimeConfig, versionConstants } from '../../src/public/runtime';
import { Utils } from '../utils';

describe('runtime', () => {
  const utils = new Utils();

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
  });

  afterEach(() => {
    if (app._uninitialize) {
      app._uninitialize();
    }
  });

  describe('generateBackCompatRuntimeConfig', () => {
    Object.entries(versionConstants).forEach(([version, capabilities]) => {
      capabilities.forEach(supportedCapability => {
        const capability = JSON.stringify(supportedCapability.capability).replace(/[{}]/g, '');
        supportedCapability.hostClientTypes.forEach(clientType => {
          it(`Back compat host client type ${clientType} supporting up to ${version} should support ${capability.replace(
            /:/g,
            ' ',
          )} capability and not any later capabilities`, async () => {
            await utils.initializeWithContext('content', clientType);
            const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
              generateBackCompatRuntimeConfig(version).supports,
            ).replace(/[{}]/g, '');
            expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(true);
          });
        });
      });
    });

    it('Back compat should return false when not proper version is supported', async () => {
      await utils.initializeWithContext('content', 'ios');
      const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
        generateBackCompatRuntimeConfig('1.4.5').supports,
      ).replace(/[{}]/g, '');
      expect(generatedRuntimeConfigSupportedCapabilities.includes('location')).toBe(false);
    });
  });
});
