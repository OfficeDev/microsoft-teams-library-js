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

  it('Back compat host client supporting up to v1.9.0 should support location capability and not any later capabilities', () => {
    return utils.initializeWithContext('content', 'android').then(() => {
      // removing the brackets allows us to check for nested capabilities like legacy.fullTrust.joinedTeams.
      const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
        generateBackCompatRuntimeConfig('1.9.0').supports,
      ).replace(/[{}]/g, '');
      Object.keys(versionConstants).map(version => {
        const capability = JSON.stringify(versionConstants[version].capabilities).replace(/[{}]/g, '');
        expect(compareSDKVersions('1.9.0', version) >= 0).toBe(
          generatedRuntimeConfigSupportedCapabilities.includes(capability),
        );
      });
    });
  });
});
