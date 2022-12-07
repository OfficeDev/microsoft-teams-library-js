/* eslint-disable @typescript-eslint/ban-types */

import { compareSDKVersions } from '../../src/internal/utils';
import { app, HostClientType } from '../../src/public';
import {
  applyRuntimeConfig,
  generateBackCompatRuntimeConfig,
  IBaseRuntime,
  latestRuntimeApiVersion,
  Runtime,
  runtime,
  versionConstants,
} from '../../src/public/runtime';
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

  describe('runtime versioning', () => {
    it('latestRuntimeVersion should match Runtine interface apiVersion', () => {
      const runtime: Runtime = {
        apiVersion: 1,
        supports: {},
      };
      expect(latestRuntimeApiVersion).toEqual(runtime.apiVersion);
    });

    it('applyRuntime fast-forwards v0 runtime config to latest version', () => {
      const runtimeV0 = {
        apiVersion: 0,
        isLegacyTeams: false,
        supports: {
          calendarV0: {},
        },
      };
      applyRuntimeConfig(runtimeV0);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
      // eslint-disable-next-line strict-null-checks/all
      expect(runtime.supports.calendar).toEqual({});
    });

    it('applyRuntime handles runtime config with string apiVersion', () => {
      const runtimeWithStringVersion = {
        apiVersion: '2.0.0',
        isLegacyTeams: false,
        supports: {},
      };
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
    });
  });

  describe('generateBackCompatRuntimeConfig', () => {
    Object.entries(versionConstants).forEach(([version, capabilities]) => {
      capabilities.forEach((supportedCapability) => {
        const capability = JSON.stringify(supportedCapability.capability).replace(/[{}]/g, '');
        supportedCapability.hostClientTypes.forEach((clientType) => {
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
            (otherVer) => compareSDKVersions(version, otherVer) >= 0,
          );

          lowerVersions.forEach((lowerVersion) => {
            versionConstants[lowerVersion].forEach((lowerCap) => {
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
          (type) => !supportedCapability.hostClientTypes.includes(type),
        );

        notSupportedHostClientTypes.forEach((clientType) => {
          it(`Back compat host client type ${clientType} supporting up to ${version} should NOT support ${capability.replace(
            /[{:}]/g,
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
