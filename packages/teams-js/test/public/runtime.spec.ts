import { compareSDKVersions } from '../../src/internal/utils';
import { app, HostClientType } from '../../src/public';
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
          )} capability`, async () => {
            await utils.initializeWithContext('content', clientType);
            const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
              generateBackCompatRuntimeConfig(version).supports,
            ).replace(/[{}]/g, '');
            expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(true);
          });

          it(`Back compat host client type ${clientType} supporting lower than up to ${version} should NOT support ${capability.replace(
            /:/g,
            ' ',
          )} capability`, async () => {
            await utils.initializeWithContext('content', clientType);
            const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
              generateBackCompatRuntimeConfig('1.4.0').supports,
            ).replace(/[{}]/g, '');
            expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(false);
          });

          const lowerVersions = Object.keys(versionConstants).filter(
            otherVer => compareSDKVersions(version, otherVer) >= 0,
          );

          lowerVersions.forEach(lowerVersion => {
            versionConstants[lowerVersion].forEach(lowerCap => {
              it(`Back compat host client type ${clientType} supporting up to ${version} should ALSO support ${JSON.stringify(
                lowerCap.capability,
              ).replace(/[{:}]/g, ' ')} capability`, async () => {
                await utils.initializeWithContext('content', clientType);
                const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
                  generateBackCompatRuntimeConfig(version).supports,
                ).replace(/[{}]/g, '');
                expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(true);
              });
            });
          });
        });

        const notSupportedHostClientTypes = Object.values(HostClientType).filter(
          type => !supportedCapability.hostClientTypes.includes(type),
        );

        notSupportedHostClientTypes.forEach(clientType => {
          it(`Back compat host client type ${clientType} supporting up to ${version} should NOT support ${capability.replace(
            /:/g,
            ' ',
          )} capability`, async () => {
            await utils.initializeWithContext('content', clientType);
            const generatedRuntimeConfigSupportedCapabilities = JSON.stringify(
              generateBackCompatRuntimeConfig(version).supports,
            ).replace(/[{}]/g, '');
            expect(generatedRuntimeConfigSupportedCapabilities.includes(capability)).toBe(false);
          });
        });
      });
    });
  });
});
