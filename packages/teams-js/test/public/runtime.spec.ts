/* eslint-disable @typescript-eslint/ban-types */

import { errorRuntimeNotInitialized } from '../../src/internal/constants';
import { GlobalVars } from '../../src/internal/globalVars';
import { getSupportedCapabilities } from '../../src/internal/supportedCapabilities';
import { compareSDKVersions } from '../../src/internal/utils';
import { app, FrameContexts, HostClientType } from '../../src/public';
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

    it('Unsupported top level capabilities return unsupported and other functions are undefined', () => {
      const runtimeWithStringVersion = {
        apiVersion: 2,
        hostVersionsInfo: {
          adaptiveCardSchemaVersion: {
            majorVersion: 1,
            minorVersion: 5,
          },
        },
        isLegacyTeams: false,
        supports: {},
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.content,
      );

      expect(supportedCapabilities.barCode.isSupported()).toBeFalsy();
      expect(supportedCapabilities.barCode.requestPermission).toBeUndefined();
    });

    it('Supported top level capabilities return supported and other functions are defined', () => {
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
          barCode: {},
          permissions: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.content,
      );

      expect(supportedCapabilities.barCode.isSupported()).toBeTruthy();
      expect(supportedCapabilities.barCode.requestPermission).toBeDefined();
    });

    it('Supported top level capabilities return supported and other functions are defined in capabilities with overloaded signatures', () => {
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
          monetization: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.content,
      );

      expect(supportedCapabilities.monetization.isSupported()).toBeTruthy();
      expect(supportedCapabilities.monetization.openPurchaseExperience).toBeDefined();
    });

    it('Supported top level capabilities return supported but other functions are undefined in capabilities with overloaded signatures when using invalid FrameContext', () => {
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
          monetization: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.settings,
      );

      expect(supportedCapabilities.monetization.isSupported()).toBeTruthy();
      expect(supportedCapabilities.monetization.openPurchaseExperience).toBeUndefined();
    });

    it('Supported top level capabilities return supported but functions undefined if invalid framecontext passed in', () => {
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
          barCode: {},
          permissions: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.meetingStage,
      );

      expect(supportedCapabilities.barCode.isSupported()).toBeTruthy();
      expect(supportedCapabilities.barCode.requestPermission).toBeUndefined();
    });

    it('private capabilities container is not generated if not asked for', () => {
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
          barCode: {},
          permissions: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.content,
      );

      // eslint-disable-next-line strict-null-checks/all
      expect(supportedCapabilities.microsoftOnly).toBeUndefined();
    });

    // it('private capabilities are generated if asked for', () => {
    //   const runtimeWithStringVersion = {
    //     apiVersion: 2,
    //     hostVersionsInfo: {
    //       adaptiveCardSchemaVersion: {
    //         majorVersion: 1,
    //         minorVersion: 5,
    //       },
    //     },
    //     isLegacyTeams: false,
    //     supports: {
    //       appEntity: {},
    //     },
    //   };

    //   // Ignore this, random initialization needed for various isSupports checks
    //   applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
    //   GlobalVars.initializeCompleted = true;

    //   const supportedCapabilities = getSupportedCapabilities(runtimeWithStringVersion as Runtime, true);

    //   // eslint-disable-next-line strict-null-checks/all
    //   expect(supportedCapabilities.microsoftOnly?.appEntity.isSupported()).toBeTruthy();
    //   // eslint-disable-next-line strict-null-checks/all
    //   expect(supportedCapabilities.microsoftOnly?.appEntity.selectAppEntity).toBeDefined();
    //   // eslint-disable-next-line strict-null-checks/all
    //   expect(supportedCapabilities.microsoftOnly?.logs.isSupported()).toBeFalsy();
    //   // eslint-disable-next-line strict-null-checks/all
    //   expect(supportedCapabilities.microsoftOnly?.logs.registerGetLogHandler).toBeUndefined();
    // });

    // TODO: Something about pages is causing this to break in a weird async way
    // It's because pages.config is used in the afterEach and those functions have been accidentally erased
    it('supportedCapabilities with nested capabilities are generated correctly', () => {
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
          teamsCore: {},
          video: {},
          webStorage: {},
        },
      };

      // Ignore this, random initialization needed for various isSupports checks
      applyRuntimeConfig(runtimeWithStringVersion as unknown as IBaseRuntime);
      GlobalVars.initializeCompleted = true;

      const supportedCapabilities = getSupportedCapabilities(
        runtimeWithStringVersion as Runtime,
        FrameContexts.content,
        true,
      );

      // eslint-disable-next-line strict-null-checks/all
      expect(supportedCapabilities.microsoftOnly).toBeDefined();

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

      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.appEntity.isSupported(),
      ).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.appEntity.selectAppEntity,
      ).toBeDefined();
      expect(supportedCapabilities.appInstallDialog.isSupported()).toBeTruthy();
      expect(supportedCapabilities.barCode.isSupported()).toBeTruthy();
      expect(supportedCapabilities.calendar.isSupported()).toBeTruthy();
      expect(supportedCapabilities.call.isSupported()).toBeTruthy();
      expect(supportedCapabilities.chat.isSupported()).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.conversations.isSupported(),
      ).toBeTruthy();
      expect(supportedCapabilities.location.isSupported()).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined && supportedCapabilities.microsoftOnly.logs.isSupported(),
      ).toBeTruthy();
      expect(supportedCapabilities.mail.isSupported()).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.meetingRoom.isSupported(),
      ).toBeTruthy();
      expect(supportedCapabilities.menus.isSupported()).toBeTruthy();
      expect(supportedCapabilities.monetization.isSupported()).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.notifications.isSupported(),
      ).toBeTruthy();

      expect(supportedCapabilities.pages.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.appButton.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.backStack.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.config.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.currentApp.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.fullTrust.isSupported()).toBeTruthy();
      expect(supportedCapabilities.pages.tabs.isSupported()).toBeTruthy();

      expect(supportedCapabilities.people.isSupported()).toBeTruthy();
      expect(supportedCapabilities.profile.isSupported()).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.remoteCamera.isSupported,
      ).toBeTruthy();
      expect(supportedCapabilities.search.isSupported()).toBeTruthy();
      expect(supportedCapabilities.sharing.isSupported()).toBeTruthy();
      expect(supportedCapabilities.stageView.isSupported()).toBeTruthy();
      expect(supportedCapabilities.teamsCore.isSupported()).toBeTruthy();
      expect(supportedCapabilities.video.isSupported()).toBeTruthy();
      expect(supportedCapabilities.webStorage.isSupported()).toBeTruthy();

      expect(
        supportedCapabilities.microsoftOnly !== undefined && supportedCapabilities.microsoftOnly.teams.isSupported(),
      ).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.teams.fullTrust.isSupported(),
      ).toBeTruthy();
      expect(
        supportedCapabilities.microsoftOnly !== undefined &&
          supportedCapabilities.microsoftOnly.teams.fullTrust.joinedTeams.isSupported(),
      ).toBeTruthy();
    });

    // it('throw if runtime version is not yet supported', () => {
    //   const runtimeWithStringVersion = {
    //     apiVersion: 99,
    //     hostVersionsInfo: {
    //       adaptiveCardSchemaVersion: {
    //         majorVersion: 1,
    //         minorVersion: 5,
    //       },
    //     },
    //     isLegacyTeams: false,
    //     supports: {},
    //   };

    //   expect(() => getSupportedCapabilities(runtimeWithStringVersion as Runtime)).toThrowError(
    //     `Unsupported runtime version: ${runtimeWithStringVersion.apiVersion}`,
    //   );
    // });

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
