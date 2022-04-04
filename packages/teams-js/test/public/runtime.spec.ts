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

  // create test groups for each capability
  describe('generateBackCompatRuntimeConfig', () => {
    // below test will be changed so instead of checking manually each capability, we make it
    // so each capability added to versionConstants is automatically checked thorugh this test case.

    // for each version number in versionConstants,
    // for each hostclient type possible,
    // check that if the hostclient type is in the ICapabilityReq and version number ...
    it('Back compat host client supporting up to 1.9.0 should support location capability and not any later capabilities', () => {
      return utils.initializeWithContext('content', 'android').then(() => {
        // removing the brackets allows us to check for nested capabilities like legacy.fullTrust.joinedTeams.
        const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
          generateBackCompatRuntimeConfig('1.9.0').supports,
        ).replace(/[{}]/g, '');
        console.log(`generatedRuntimeConfigSupportedCapabilities: ${generatedRuntimeConfigSupportedCapabilities}`);
        Object.keys(versionConstants).map(version => {
          versionConstants[version].forEach(capabilityReqs => {
            const capability = JSON.stringify(capabilityReqs.capability).replace(/[{}]/g, '');
            console.log(`capability: ${capability}`);
            expect(compareSDKVersions('1.9.0', version) >= 0).toBe(
              generatedRuntimeConfigSupportedCapabilities.includes(capability),
            );
          });
        });
      });
    });

    // versions < 1.9.0 should not contain location capability
    // versions >= 1.9.0 should support location
    // should work with any hostClientType for location

    // Basically every capability needs to check those above
    // should work with any hostClientType for people
    // should only allow android hostClientType for joinedTeams
  });
});
