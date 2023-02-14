/* eslint-disable @typescript-eslint/ban-types */

import { errorRuntimeNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { compareSDKVersions } from '../../src/internal/utils';
import { app, HostClientType } from '../../src/public';
import {
  applyRuntimeConfig,
  fastForwardRuntime,
  generateBackCompatRuntimeConfig,
  IBaseRuntime,
  isRuntimeInitialized,
  latestRuntimeApiVersion,
  Runtime,
  runtime,
  setUnitializedRuntime,
  upgradeChain,
  versionConstants,
} from '../../src/public/runtime';
import { getSupportedCapabilities } from '../../src/supportedCapabilities';
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
    it('latestRuntimeVersion should match Runtime interface apiVersion', () => {
      const runtime: Runtime = {
        apiVersion: 2,
        supports: {},
      };
      expect(latestRuntimeApiVersion).toEqual(runtime.apiVersion);
    });

    it('applyRuntime fast-forwards v2 runtime config to latest version', () => {
      const runtimeV2 = {
        apiVersion: 2,
        isLegacyTeams: false,
        supports: {
          dialog: {
            card: {
              bot: {},
            },
            url: {
              bot: {},
            },
            update: {},
          },
        },
      };
      applyRuntimeConfig(runtimeV2);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
      if (isRuntimeInitialized(runtime)) {
        // eslint-disable-next-line strict-null-checks/all
        expect(runtime.supports.dialog).toEqual(runtimeV2.supports.dialog);
      }
    });

    it('applyRuntime fast-forwards v1 to v2 runtime config to latest version', () => {
      const runtimeV1 = {
        apiVersion: 1,
        isLegacyTeams: false,
        supports: {
          dialog: {
            bot: {},
            update: {},
          },
        },
      };

      const fastForwardConfig = fastForwardRuntime(runtimeV1);
      expect(fastForwardConfig).toEqual({
        apiVersion: 2,
        hostVersionsInfo: undefined,
        isLegacyTeams: false,
        supports: { dialog: { card: undefined, url: { bot: {}, update: {} }, update: {} } },
      });
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

    it('shenanigans', () => {
      const runtimeWithStringVersion = {
        apiVersion: 2,
        hostVersionsInfo: {
          adaptiveCardSchemaVersion: {
            majorVersion: 1,
            minorVersion: 5,
          },
        },
        isLegacyTeams: false,
        supports: {
          appEntity: {},
          appInstallDialog: {},
          barCode: {},
          calendar: {},
          call: {},
          chat: {},
          conversations: {},
          dialog: {
            card: {},
            url: {
              bot: {},
            },
            update: {},
          },
          geoLocation: {},
          location: {},
          logs: {},
          mail: {},
          meetingRoom: {},
          menus: {},
          monetization: {},
          notifications: {},
          pages: {
            appButton: {},
            backStack: {},
            config: {},
            currentApp: {},
            fullTrust: {},
            tabs: {},
          },
          people: {},
          permissions: {},
          profile: {},
          remoteCamera: {},
          search: {},
          sharing: {},
          stageView: {},
          teams: {
            fullTrust: {
              joinedTeams: {},
            },
          },
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(runtimeWithStringVersion as Runtime);

      expect(supportedCapabilities.geoLocation.isSupported()).toBeTruthy();
      expect(supportedCapabilities.geoLocation.getCurrentLocation).toBeDefined();
      expect(supportedCapabilities.geoLocation.map.isSupported()).toBeFalsy();
      // Unsupported subcapabilities have all non-isSupported functions set to undefined
      expect(supportedCapabilities.geoLocation.map.chooseLocation).toBeUndefined();

      expect(supportedCapabilities.dialog.isSupported()).toBeTruthy();
      expect(supportedCapabilities.dialog.adaptiveCard.isSupported()).toBeTruthy();
      expect(supportedCapabilities.dialog.adaptiveCard.open).toBeDefined();
      expect(supportedCapabilities.dialog.adaptiveCard.bot.isSupported()).toBeFalsy();
      expect(supportedCapabilities.dialog.adaptiveCard.bot.open).toBeUndefined();
      expect(supportedCapabilities.dialog.url.isSupported()).toBeTruthy();
      expect(supportedCapabilities.dialog.url.bot.isSupported()).toBeTruthy();
      expect(supportedCapabilities.dialog.url.bot.open).toBeDefined();
      expect(supportedCapabilities.dialog.update.isSupported()).toBeTruthy();

      expect(supportedCapabilities.appEntity.isSupported()).toBeTruthy();
      expect(supportedCapabilities.appInstallDialog.isSupported()).toBeTruthy();
      expect(supportedCapabilities.barCode.isSupported()).toBeTruthy();
      expect(supportedCapabilities.calendar.isSupported()).toBeTruthy();
      expect(supportedCapabilities.call.isSupported()).toBeTruthy();
      expect(supportedCapabilities.chat.isSupported()).toBeTruthy();
      expect(supportedCapabilities.conversations.isSupported()).toBeTruthy();
      expect(supportedCapabilities.location.isSupported()).toBeTruthy();
      expect(supportedCapabilities.logs.isSupported()).toBeTruthy();
      expect(supportedCapabilities.mail.isSupported()).toBeTruthy();
      expect(supportedCapabilities.meetingRoom.isSupported()).toBeTruthy();
      expect(supportedCapabilities.menus.isSupported()).toBeTruthy();
      expect(supportedCapabilities.monetization.isSupported()).toBeTruthy();
      expect(supportedCapabilities.notifications.isSupported()).toBeTruthy();

      expect(supportedCapabilities.pages.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.appButton.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.backStack.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.config.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.currentApp.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.fullTrust.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.tabs.isSupported()).toBeTruthy();

      expect(supportedCapabilities.people.isSupported).toBeTruthy();
      expect(supportedCapabilities.profile.isSupported).toBeTruthy();
      expect(supportedCapabilities.remoteCamera.isSupported).toBeTruthy();
      expect(supportedCapabilities.search.isSupported).toBeTruthy();
      expect(supportedCapabilities.sharing.isSupported).toBeTruthy();
      expect(supportedCapabilities.stageView.isSupported).toBeTruthy();

      expect(supportedCapabilities.teams.isSupported()).toBeTruthy();
      expect(supportedCapabilities.teams.fullTrust.isSupported()).toBeTruthy();
      expect(supportedCapabilities.teams.fullTrust.joinedTeams.isSupported()).toBeTruthy();
    });

    it('shenanigans: throw if runtime version is not yet supported', () => {
      const runtimeWithStringVersion = {
        apiVersion: 99,
        hostVersionsInfo: {
          adaptiveCardSchemaVersion: {
            majorVersion: 1,
            minorVersion: 5,
          },
        },
        isLegacyTeams: false,
        supports: {},
      };

      expect(() => getSupportedCapabilities(runtimeWithStringVersion as Runtime)).toThrowError(
        `Unsupported runtime version: ${runtimeWithStringVersion.apiVersion}`,
      );
    });

    it('upgradeChain is ordered from oldest to newest', () => {
      expect.assertions(upgradeChain.length - 1);
      let version = upgradeChain[0].versionToUpgradeFrom;
      for (let i = 1; i < upgradeChain.length; i++) {
        expect(upgradeChain[i].versionToUpgradeFrom).toBeGreaterThan(version);
        version = upgradeChain[i].versionToUpgradeFrom;
      }
    });

    it('isRuntimeInitialized throws errorRuntimeNotInitialized when runtime is not initialized', () => {
      setUnitializedRuntime();
      expect(() => isRuntimeInitialized(runtime)).toThrowError(new Error(errorRuntimeNotInitialized));
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
