/* eslint-disable @typescript-eslint/ban-types */

import { errorRuntimeNotInitialized } from '../../src/internal/constants';
import { compareSDKVersions } from '../../src/internal/utils';
import { app, HostClientType } from '../../src/public';
import {
  applyRuntimeConfig,
  fastForwardRuntime,
  generateVersionBasedTeamsRuntimeConfig,
  IBaseRuntime,
  ICapabilityReqs,
  isRuntimeInitialized,
  latestRuntimeApiVersion,
  mapTeamsVersionToSupportedCapabilities,
  Runtime,
  runtime,
  setUnitializedRuntime,
  upgradeChain,
  versionAndPlatformAgnosticTeamsRuntimeConfig,
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
        apiVersion: latestRuntimeApiVersion,
        supports: {},
      };
      expect(latestRuntimeApiVersion).toEqual(runtime.apiVersion);
    });

    it('applyRuntime fast-forwards v3 runtime config to latest version', () => {
      const runtimeV3 = {
        apiVersion: 3,
        isLegacyTeams: false,
        supports: {
          appEntity: {},
        },
      };
      applyRuntimeConfig(runtimeV3);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
      if (isRuntimeInitialized(runtime)) {
        // eslint-disable-next-line strict-null-checks/all
        expect(runtime.supports.appEntity).toEqual(runtimeV3.supports.appEntity);
      }
    });

    it('applyRuntime fast-forwards v2 runtime config to latest version', () => {
      const runtimeV2 = {
        apiVersion: 2,
        isLegacyTeams: false,
        supports: {
          appNotification: {},
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
        /* eslint-disable-next-line strict-null-checks/all, @typescript-eslint/no-explicit-any*/ /* must use any here since appNotification isn't supposed to be a property anymore */
        expect((runtime.supports as any).appNotification).toBeUndefined();
        // eslint-disable-next-line strict-null-checks/all
        expect(runtime.supports.dialog).toEqual(runtimeV2.supports.dialog);
      }
    });

    it('applyRuntime fast-forwards v1 to latest version', () => {
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
        apiVersion: latestRuntimeApiVersion,
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

  // Determines whether the given "subset" runtime object is a subset of the given "superset" runtime object.
  // This is used to determine whether all capabilities supported in "subset" are also supported in "superset"
  function isSubset(subset: object, superset: object): boolean {
    for (const key in subset) {
      if (typeof subset[key] === 'object' && typeof superset[key] === 'object') {
        if (!isSubset(subset[key], superset[key])) {
          return false;
        }
      } else if (superset[key] === undefined) {
        return false;
      }
    }
    return true;
  }

  // Can recursively decompose an object into an array of objects, where each object in the array is a path to a leaf
  // node in the original object.
  // For example,
  // {
  //     pages: {
  //         appButton: {},
  //         tabs: {},
  //     }
  // }
  // would be decomposed into
  // [
  //     { pages: { appButton: {} } },
  //     { pages: { tabs: {} } }
  // ]
  // This can be a useful helper when identifying which capability defined in 'obj' is not defined in a runtime (because
  // you can decompose a runtime object using this function, then compare each capability/subcapability one at a time to find
  // any that are missing)
  function decomposeObject(obj: object): object[] {
    const result: object[] = [];

    function recurse(current: object, path: string[] = []): void {
      for (const key in current) {
        const newPath = [...path, key];
        if (typeof current[key] === 'object' && Object.keys(current[key]).length > 0) {
          recurse(current[key], newPath);
        } else {
          const entry: object = {};
          let temp = entry;
          for (const [i, prop] of newPath.entries()) {
            temp[prop] = i === newPath.length - 1 ? current[key] : {};
            temp = temp[prop];
          }
          result.push(entry);
        }
      }
    }

    recurse(obj);
    return result;
  }

  function getVersionsFromCapabilityMapOlderThanGivenVersion(version: string): string[] {
    return Object.keys(mapTeamsVersionToSupportedCapabilities).filter(
      (otherVer) => compareSDKVersions(otherVer, version) < 0,
    );
  }

  function getVersionsFromCapabilityMapNewerThanGivenVersion(version: string): string[] {
    return Object.keys(mapTeamsVersionToSupportedCapabilities).filter(
      (otherVer) => compareSDKVersions(otherVer, version) > 0,
    );
  }

  const oldestVersionInCapabilityMap = Object.keys(mapTeamsVersionToSupportedCapabilities).reduce((a, b) =>
    compareSDKVersions(a, b) < 0 ? a : b,
  );
  const newestVersionInCapabilityMap = Object.keys(mapTeamsVersionToSupportedCapabilities).reduce((a, b) =>
    compareSDKVersions(a, b) > 0 ? a : b,
  );

  function generateVersionOlderThanGivenVersion(version: string): string {
    return `0.${version}`;
  }

  function generateVersionNewerThanGivenVersion(version: string): string {
    return `${version}.1`;
  }

  describe('generateVersionBasedTeamsRuntimeConfig tests based on Teams default configuration', () => {
    it('Validate that all client types where a capability began to be supported report that capability IS supported in that version', async () => {
      for (const [version, capabilityAdditionsForEachVersion] of Object.entries(
        mapTeamsVersionToSupportedCapabilities,
      )) {
        for (const capabilityAdditionsInASpecificVersion of capabilityAdditionsForEachVersion) {
          const capabilityAdditionsForThisVersion = capabilityAdditionsInASpecificVersion.capability;

          for (const clientType of capabilityAdditionsInASpecificVersion.hostClientTypes) {
            await utils.initializeWithContext('content', clientType);
            const generatedCapabilityObjectForThisVersion = generateVersionBasedTeamsRuntimeConfig(
              version,
              versionAndPlatformAgnosticTeamsRuntimeConfig,
              mapTeamsVersionToSupportedCapabilities,
            ).supports;
            expect(isSubset(capabilityAdditionsForThisVersion, generatedCapabilityObjectForThisVersion)).toBe(true);
          }
        }
      }
    });
  });

  describe('generateVersionBasedTeamsRuntimeConfig older and newer version tests', () => {
    it('Validate that all client types for a version OLDER than when a capability began to be supported report that capability is NOT supported ', async () => {
      for (const [version, capabilityAdditionsForEachVersion] of Object.entries(
        mapTeamsVersionToSupportedCapabilities,
      )) {
        console.log(`version: ${version}`);
        for (const capabilityAdditionsInASpecificVersion of capabilityAdditionsForEachVersion) {
          const capabilityAdditionsForThisVersion = capabilityAdditionsInASpecificVersion.capability;
          const individualCapabilityAdditionsForThisVersion: object[] = decomposeObject(
            capabilityAdditionsForThisVersion,
          );
          console.log(
            `individualCapabilityAdditionsForThisVersion: ${JSON.stringify(
              individualCapabilityAdditionsForThisVersion,
            )}`,
          );

          for (const clientType of capabilityAdditionsInASpecificVersion.hostClientTypes) {
            console.log(`clientType: ${clientType}`);
            const olderVersionsInCapabilityMap = getVersionsFromCapabilityMapOlderThanGivenVersion(version);
            const versionOlderThanAllVersionsInCapabilityMap =
              generateVersionOlderThanGivenVersion(oldestVersionInCapabilityMap);
            const oldVersionsToTestAgainst = [
              ...olderVersionsInCapabilityMap,
              versionOlderThanAllVersionsInCapabilityMap,
            ];
            console.log(`oldVersionsToTestAgainst: ${oldVersionsToTestAgainst}`);

            for (const olderVersion of oldVersionsToTestAgainst) {
              console.log(`olderVersion: ${olderVersion}`);

              await utils.initializeWithContext('content', clientType);

              const generatedRuntimeConfigSupportedCapabilities = generateVersionBasedTeamsRuntimeConfig(
                olderVersion,
                versionAndPlatformAgnosticTeamsRuntimeConfig,
                mapTeamsVersionToSupportedCapabilities,
              ).supports;

              console.log(
                `generatedRuntimeConfigSupportedCapabilities: ${JSON.stringify(
                  generatedRuntimeConfigSupportedCapabilities,
                )}`,
              );

              individualCapabilityAdditionsForThisVersion.forEach((capabilityAdditionForThisVersion) => {
                console.log(`capabilityAdditionForThisVersion: ${JSON.stringify(capabilityAdditionForThisVersion)}`);
                expect(isSubset(capabilityAdditionForThisVersion, generatedRuntimeConfigSupportedCapabilities)).toBe(
                  false,
                );
              });
            }
          }
        }
      }
    });

    // it('Validate that all client types for a version NEWER than when a capability began to be supported report that capability IS supported ', async () => {
    //   for (const [version, capabilityAdditionsForEachVersion] of Object.entries(
    //     mapTeamsVersionToSupportedCapabilities,
    //   )) {
    //     for (const capabilityAdditionsInASpecificVersion of capabilityAdditionsForEachVersion) {
    //       const capabilityAdditionsForThisVersion = capabilityAdditionsInASpecificVersion.capability;
    //       const individualCapabilityAdditionsForThisVersion: object[] = decomposeObject(
    //         capabilityAdditionsForThisVersion,
    //       );

    //       for (const clientType of capabilityAdditionsInASpecificVersion.hostClientTypes) {
    //         const newerVersionsInCapabilityMap = getVersionsFromCapabilityMapOlderThanGivenVersion(version);
    //         const versionNewerThanAllVersionsInCapabilityMap =
    //           generateVersionNewerThanGivenVersion(newestVersionInCapabilityMap);
    //         const newVersionsToTestAgainst = [
    //           ...newerVersionsInCapabilityMap,
    //           versionNewerThanAllVersionsInCapabilityMap,
    //         ];

    //         for (const newerVersion of newVersionsToTestAgainst) {
    //           await utils.initializeWithContext('content', clientType);

    //           const generatedRuntimeConfigSupportedCapabilities = generateVersionBasedTeamsRuntimeConfig(
    //             newerVersion,
    //             versionAndPlatformAgnosticTeamsRuntimeConfig,
    //             mapTeamsVersionToSupportedCapabilities,
    //           ).supports;

    //           individualCapabilityAdditionsForThisVersion.forEach((capabilityAdditionForThisVersion) => {
    //             expect(isSubset(capabilityAdditionForThisVersion, generatedRuntimeConfigSupportedCapabilities)).toBe(
    //               true,
    //             );
    //           });
    //         }
    //       }
    //     }
    //   }
    // });
  });

  // for (const [version, capabilityAdditionsForEachVersion] of Object.entries(mapTeamsVersionToSupportedCapabilities)) {
  //   for (const capabilityAdditionsForClientTypesInASpecificVersion of capabilityAdditionsForEachVersion) {
  //     const capabilityAdditionsForThisVersion = capabilityAdditionsForClientTypesInASpecificVersion.capability;
  //     capabilityAdditionsForClientTypesInASpecificVersion.hostClientTypes.forEach((clientType) => {
  // it(`Back compat host client type ${clientType} supporting up to ${version} should support ${JSON.stringify(
  //   capabilityAdditionsForThisVersion,
  // )}`, async () => {
  //   await utils.initializeWithContext('content', clientType);
  //   const generatedCapabilityObjectForThisVersion = generateVersionBasedTeamsRuntimeConfig(
  //     version,
  //     versionAndPlatformAgnosticTeamsRuntimeConfig,
  //     mapTeamsVersionToSupportedCapabilities,
  //   ).supports;
  //   expect(isSubset(capabilityAdditionsForThisVersion, generatedCapabilityObjectForThisVersion)).toBe(true);
  // });

  // it(`Back compat host client type ${clientType} supporting lower than up to ${version} should NOT support ${JSON.stringify(
  //   capabilityAdditionsForThisVersion,
  // )} capability`, async () => {
  //   const individualCapabilityAdditionsForThisVersion: object[] = decomposeObject(
  //     capabilityAdditionsForThisVersion,
  //   );

  //   await utils.initializeWithContext('content', clientType);

  //   const generatedRuntimeConfigSupportedCapabilities = generateVersionBasedTeamsRuntimeConfig(
  //     generateVersionNumberOlderThanGivenVersion(version),
  //     versionAndPlatformAgnosticTeamsRuntimeConfig,
  //     mapTeamsVersionToSupportedCapabilities,
  //   ).supports;

  //   individualCapabilityAdditionsForThisVersion.forEach((capabilityAdditionForThisVersion) => {
  //     expect(isSubset(capabilityAdditionForThisVersion, generatedRuntimeConfigSupportedCapabilities)).toBe(
  //       false,
  //     );
  //   });
  // });

  //   const lowerVersions = Object.keys(mapTeamsVersionToSupportedCapabilities).filter(
  //     (otherVer) => compareSDKVersions(version, otherVer) >= 0,
  //   );

  //   lowerVersions.forEach((lowerVersion) => {
  //     mapTeamsVersionToSupportedCapabilities[lowerVersion].forEach((lowerCap) => {
  //       if (lowerCap.hostClientTypes.includes(clientType)) {
  //         const capabilityAdditionsForThisVersion = lowerCap.capability;
  //         it(`Back compat host client type ${clientType} supporting up to ${version} should ALSO support ${JSON.stringify(
  //           capabilityAdditionsForThisVersion,
  //         )} capability`, async () => {
  //           await utils.initializeWithContext('content', clientType);
  //           expect(
  //             isSubset(
  //               capabilityAdditionsForThisVersion,
  //               generateVersionBasedTeamsRuntimeConfig(
  //                 version,
  //                 versionAndPlatformAgnosticTeamsRuntimeConfig,
  //                 mapTeamsVersionToSupportedCapabilities,
  //               ).supports,
  //             ),
  //           ).toBe(true);
  //         });
  //       }
  //     });
  //   });
  // });

  //   const notSupportedHostClientTypes = Object.values(HostClientType).filter(
  //     (type) => !capabilityAdditionsForClientTypesInASpecificVersion.hostClientTypes.includes(type),
  //   );

  //   const individualCapabilityAdditionsForThisVersion: object[] = decomposeObject(
  //     capabilityAdditionsForThisVersion,
  //   );

  //   notSupportedHostClientTypes.forEach((clientType) => {
  //     it(`Back compat host client type ${clientType} supporting up to ${version} should NOT support ${JSON.stringify(
  //       capabilityAdditionsForThisVersion,
  //     )} capability`, async () => {
  //       await utils.initializeWithContext('content', clientType);

  //       individualCapabilityAdditionsForThisVersion.forEach((singleCapabilityAdditionForThisVersion) => {
  //         expect(
  //           isSubset(
  //             singleCapabilityAdditionForThisVersion,
  //             generateVersionBasedTeamsRuntimeConfig(
  //               version,
  //               versionAndPlatformAgnosticTeamsRuntimeConfig,
  //               mapTeamsVersionToSupportedCapabilities,
  //             ).supports,
  //           ),
  //         ).toBe(false);
  //       });
  //     });
  //   });
  // });
  //   });
  // });

  const runtimeWithNestedPagesCapability: Runtime = {
    apiVersion: latestRuntimeApiVersion,
    supports: {
      chat: {},
      pages: {
        tabs: {},
      },
    },
  };

  const runtimeWithUnnestedPagesCapability: Runtime = {
    apiVersion: latestRuntimeApiVersion,
    supports: {
      chat: {},
      pages: {},
    },
  };

  const runtimeWithoutPagesCapability: Runtime = {
    apiVersion: latestRuntimeApiVersion,
    supports: {
      chat: {},
    },
  };

  const clientTypeForRuntimeTesting = HostClientType.desktop;
  const versionForNoPagesCapability = '2.0.0';
  const versionForUnnestedPagesCapability = '3.0.0';
  const versionForNestedPagesCapability = '4.0.0';

  const mapVersionToSupportedCapabilities: Record<string, Array<ICapabilityReqs>> = {
    [versionForNoPagesCapability]: [
      {
        capability: { newCapability: {} },
        hostClientTypes: [clientTypeForRuntimeTesting],
      },
    ],
    [versionForUnnestedPagesCapability]: [
      {
        capability: { pages: {}, newCapability: {} },
        hostClientTypes: [clientTypeForRuntimeTesting],
      },
    ],
    [versionForNestedPagesCapability]: [
      {
        capability: { pages: { appButton: {} }, newCapability: {} },
        hostClientTypes: [clientTypeForRuntimeTesting],
      },
    ],
  };

  describe('generateVersionBasedTeamsRuntimeConfig tests based on specific types of merge data', () => {
    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing NESTED pages capability with version-specific runtime with NO pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForNoPagesCapability,
        runtimeWithNestedPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({ chat: {}, pages: { tabs: {} }, newCapability: {} });
    });

    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing NESTED pages capability with version-specific runtime with NESTED pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForNestedPagesCapability,
        runtimeWithNestedPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({
        chat: {},
        pages: { tabs: {}, appButton: {} },
        newCapability: {},
      });
    });

    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing NESTED pages capability with version-specific runtime with UNNESTED pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForUnnestedPagesCapability,
        runtimeWithNestedPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({ chat: {}, pages: { tabs: {} }, newCapability: {} });
    });

    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing UNNESTED pages capability with version-specific runtime with NESTED pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForNestedPagesCapability,
        runtimeWithUnnestedPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({ chat: {}, pages: { appButton: {} }, newCapability: {} });
    });

    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing UNNESTED pages capability with version-specific runtime with UNNESTED pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForUnnestedPagesCapability,
        runtimeWithUnnestedPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({ chat: {}, pages: {}, newCapability: {} });
    });

    it('generateVersionBasedTeamsRuntimeConfig can properly merge a version-agnostic config containing NO pages capability with version-specific runtime with NESTED pages capability', async () => {
      expect.assertions(1);

      await utils.initializeWithContext('content', clientTypeForRuntimeTesting);
      const generatedCapabilityObject = generateVersionBasedTeamsRuntimeConfig(
        versionForNestedPagesCapability,
        runtimeWithoutPagesCapability,
        mapVersionToSupportedCapabilities,
      ).supports;

      expect(generatedCapabilityObject).toStrictEqual({ chat: {}, pages: { appButton: {} }, newCapability: {} });
    });
  });
});
