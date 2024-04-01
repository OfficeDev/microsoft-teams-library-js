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

    it('applyRuntime fast-forwards v4 runtime config to latest version', () => {
      const runtimeV4 = {
        apiVersion: 4,
        isLegacyTeams: false,
        supports: {
          dialog: {
            card: {
              bot: {},
            },
            url: {
              bot: {},
              parentCommunication: {},
            },
            update: {},
          },
        },
      };
      applyRuntimeConfig(runtimeV4);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
      if (isRuntimeInitialized(runtime)) {
        // eslint-disable-next-line strict-null-checks/all
        expect(runtime.supports.dialog).toEqual(runtimeV4.supports.dialog);
      }
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
      const latestRuntimeDialogInfo = {
        card: {
          bot: {},
        },
        url: {
          bot: {},
          parentCommunication: {},
        },
        update: {},
      };
      applyRuntimeConfig(runtimeV2);
      expect(runtime.apiVersion).toEqual(latestRuntimeApiVersion);
      if (isRuntimeInitialized(runtime)) {
        /* eslint-disable-next-line strict-null-checks/all, @typescript-eslint/no-explicit-any*/ /* must use any here since appNotification isn't supposed to be a property anymore */
        expect((runtime.supports as any).appNotification).toBeUndefined();
        // eslint-disable-next-line strict-null-checks/all
        expect(runtime.supports.dialog).toEqual(latestRuntimeDialogInfo);
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
      const latestRuntimeDialogInfo = {
        card: undefined,
        url: {
          bot: {},
          parentCommunication: {},
        },
        update: {},
      };

      const fastForwardConfig = fastForwardRuntime(runtimeV1);
      expect(fastForwardConfig).toEqual({
        apiVersion: latestRuntimeApiVersion,
        hostVersionsInfo: undefined,
        isLegacyTeams: false,
        supports: { dialog: latestRuntimeDialogInfo },
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

  /* eslint-disable-next-line recommend-const-enums/recommend-const-enums */
  enum OlderOrNewerVersions {
    OlderVersions,
    NewerVersions,
  }

  function getOlderOrNewerVersionsToUseForTest(olderOrNewer: OlderOrNewerVersions, version: string): string[] {
    if (olderOrNewer === OlderOrNewerVersions.OlderVersions) {
      const olderVersionsInCapabilityMap = getVersionsFromCapabilityMapOlderThanGivenVersion(version);
      const versionOlderThanAllVersionsInCapabilityMap =
        generateVersionOlderThanGivenVersion(oldestVersionInCapabilityMap);
      const oldVersionsToTestAgainst = [...olderVersionsInCapabilityMap, versionOlderThanAllVersionsInCapabilityMap];
      return oldVersionsToTestAgainst;
    } else {
      const newVersionsInCapabilityMap = getVersionsFromCapabilityMapNewerThanGivenVersion(version);
      const versionNewerThanAllVersionsInCapabilityMap =
        generateVersionNewerThanGivenVersion(newestVersionInCapabilityMap);
      const newVersionsToTestAgainst = [...newVersionsInCapabilityMap, versionNewerThanAllVersionsInCapabilityMap];
      return newVersionsToTestAgainst;
    }
  }

  async function testVersionsForPresenceOrAbsenceOfCapabilitySupport(
    olderOrNewerVersions: OlderOrNewerVersions,
    versionWhereCapabilityWasAdded: string,
    individualCapabilityAdditionsForThisVersion: object[],
    clientType: string,
  ): Promise<void> {
    const versionsToTestAgainst = getOlderOrNewerVersionsToUseForTest(
      olderOrNewerVersions,
      versionWhereCapabilityWasAdded,
    );
    for (const versionToTest of versionsToTestAgainst) {
      await utils.initializeWithContext('content', clientType);

      const generatedRuntimeConfigSupportedCapabilities = generateVersionBasedTeamsRuntimeConfig(
        versionToTest,
        versionAndPlatformAgnosticTeamsRuntimeConfig,
        mapTeamsVersionToSupportedCapabilities,
      ).supports;

      const shouldCapabilityBeSupported = olderOrNewerVersions === OlderOrNewerVersions.NewerVersions;

      individualCapabilityAdditionsForThisVersion.forEach((capabilityAdditionForThisVersion) => {
        expect(isSubset(capabilityAdditionForThisVersion, generatedRuntimeConfigSupportedCapabilities)).toBe(
          shouldCapabilityBeSupported,
        );
      });
    }
  }

  describe('generateVersionBasedTeamsRuntimeConfig older and newer version tests', () => {
    for (const [versionWhereCapabilitySupportWasAdded, capabilityAdditionsForEachVersion] of Object.entries(
      mapTeamsVersionToSupportedCapabilities,
    )) {
      for (const capabilityAdditionsInASpecificVersion of capabilityAdditionsForEachVersion) {
        const capabilityAdditionsForThisVersion = capabilityAdditionsInASpecificVersion.capability;
        const individualCapabilityAdditionsForThisVersion: object[] = decomposeObject(
          capabilityAdditionsForThisVersion,
        );

        for (const clientType of capabilityAdditionsInASpecificVersion.hostClientTypes) {
          it('Validate that all client types for a version OLDER than when a capability began to be supported report that capability is NOT supported ', async () => {
            await testVersionsForPresenceOrAbsenceOfCapabilitySupport(
              OlderOrNewerVersions.OlderVersions,
              versionWhereCapabilitySupportWasAdded,
              individualCapabilityAdditionsForThisVersion,
              clientType,
            );
          });
          it('Validate that all client types for a version NEWER than when a capability began to be supported report that capability IS supported ', async () => {
            await testVersionsForPresenceOrAbsenceOfCapabilitySupport(
              OlderOrNewerVersions.NewerVersions,
              versionWhereCapabilitySupportWasAdded,
              individualCapabilityAdditionsForThisVersion,
              clientType,
            );
          });
        }
      }
    }
  });

  // For any capability which begins to be supported on some version for some platform, the above tests will validate that it's NOT reported
  // in any version OLDER than its entry and IS supported in all versions NEWER than its entry
  // This test will validate that for any capability in the map, if there's a platform for that capability that does NOT appear in the map, it
  // is always reported as unsupported.
  // E.g., if the "sharing" capability is supported on Desktop and Android in version 1.5.0, the above tests will make sure that both Desktop
  // and Android report it as unsupported in versions OLDER than 1.5.0 and also ensure that Desktop and Android report it as SUPPORTED in versions
  // NEWER than (or equal to) 1.5.0. However, those tests will not validate that iOS reports it as UNSUPPORTED in all versions, since the tests
  // are based on the platforms listed in the map and not on the platforms absent from the map.
  describe('generateVersionBasedTeamsRuntimeConfig ensure only platform support is consistent', () => {
    const mapCapabilityAsStringToPlatformsListedInMap: Map<string, Set<string>> = new Map();

    const allAddedCapabilityReqsInAnyVersion: Array<Array<ICapabilityReqs>> = Object.values(
      mapTeamsVersionToSupportedCapabilities,
    );

    for (const addedCapabilityReqsInAVersion of allAddedCapabilityReqsInAnyVersion) {
      for (const addedCapabilityReqInAVersion of addedCapabilityReqsInAVersion) {
        const individualCapabilities: object[] = decomposeObject(addedCapabilityReqInAVersion.capability);

        for (const individualCapability of individualCapabilities) {
          const individualCapabilityAsString: string = JSON.stringify(individualCapability);
          const clientTypesToWhichCapabilityHasBeenAddedSoFar: Set<string> | undefined =
            mapCapabilityAsStringToPlatformsListedInMap.get(individualCapabilityAsString);

          const updatedClientTypesToWhichCapabilityHasBeenAdded: Set<string> =
            clientTypesToWhichCapabilityHasBeenAddedSoFar
              ? new Set([
                  ...clientTypesToWhichCapabilityHasBeenAddedSoFar,
                  ...addedCapabilityReqInAVersion.hostClientTypes,
                ])
              : new Set(addedCapabilityReqInAVersion.hostClientTypes);

          mapCapabilityAsStringToPlatformsListedInMap.set(
            individualCapabilityAsString,
            updatedClientTypesToWhichCapabilityHasBeenAdded,
          );
        }
      }
    }

    // Now that we have all the capabilities from the map and the platforms that they are added to (for any version) in the map, we
    // can generate the map of capabilities to platforms that are NOT listed in the map anywhere for each capability.
    const mapCapabilityAsStringToPlatformsNotListedForItEverInMap: Map<string, string[]> = new Map();
    for (const [
      capabilityAsString,
      clientTypesEverListedInMapForThisCapability,
    ] of mapCapabilityAsStringToPlatformsListedInMap) {
      const notSupportedHostClientTypes = Object.values(HostClientType).filter(
        (clientType) => !clientTypesEverListedInMapForThisCapability.has(clientType),
      );

      mapCapabilityAsStringToPlatformsNotListedForItEverInMap.set(capabilityAsString, notSupportedHostClientTypes);
    }

    // Finally, we can test that for every capability in the map, platforms that don't appear ever for that capability are always reported as unsupported
    for (const [
      capabilityAsString,
      notSupportedHostClientTypes,
    ] of mapCapabilityAsStringToPlatformsNotListedForItEverInMap) {
      // For all versions in the map plus ones older than it and newer than it
      const allVersionsInCapabilityMap = Object.keys(mapTeamsVersionToSupportedCapabilities);
      const versionOlderThanCapabilityMap = generateVersionOlderThanGivenVersion(oldestVersionInCapabilityMap);
      const versionNewerThanCapabilityMap = generateVersionNewerThanGivenVersion(newestVersionInCapabilityMap);
      const versionsToTestAgainst = [
        ...allVersionsInCapabilityMap,
        versionOlderThanCapabilityMap,
        versionNewerThanCapabilityMap,
      ];

      const capabilityAdditionThatShouldBeUnsupported = JSON.parse(capabilityAsString);

      for (const versionToTest of versionsToTestAgainst) {
        for (const unsupportedClientType of notSupportedHostClientTypes) {
          it(`Validate that ${capabilityAsString} is NOT supported for clientType ${unsupportedClientType} on version ${versionToTest}`, async () => {
            await utils.initializeWithContext('content', unsupportedClientType);

            const generatedRuntimeConfigSupportedCapabilities = generateVersionBasedTeamsRuntimeConfig(
              versionToTest,
              versionAndPlatformAgnosticTeamsRuntimeConfig,
              mapTeamsVersionToSupportedCapabilities,
            ).supports;

            expect(
              isSubset(capabilityAdditionThatShouldBeUnsupported, generatedRuntimeConfigSupportedCapabilities),
            ).toBe(false);
          });
        }
      }
    }
  });

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
