/* eslint-disable @typescript-eslint/ban-types */

import { errorRuntimeNotInitialized, errorRuntimeNotSupported } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { getLogger } from '../internal/telemetry';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType, teamsMinAdaptiveCardVersion } from './constants';
import { HostVersionsInfo } from './interfaces';

const runtimeLogger = getLogger('runtime');

export interface IBaseRuntime {
  readonly apiVersion: number;
  readonly hostVersionsInfo?: HostVersionsInfo;
  readonly isLegacyTeams?: boolean;
  readonly supports?: {};
}

/**
 * Latest runtime interface version
 */
export type Runtime = IRuntimeV4;

export const latestRuntimeApiVersion = 4;

function isLatestRuntimeVersion(runtime: IBaseRuntime): runtime is Runtime {
  return runtime.apiVersion === latestRuntimeApiVersion;
}

interface IRuntimeV1 extends IBaseRuntime {
  readonly apiVersion: 1;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appEntity?: {};
    readonly appInstallDialog?: {};
    readonly barCode?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {};
    readonly conversations?: {};
    readonly dialog?: {
      readonly bot?: {};
      readonly update?: {};
    };
    readonly geoLocation?: {
      readonly map?: {};
    };
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly monetization?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly backStack?: {};
      readonly config?: {};
      readonly currentApp?: {};
      readonly fullTrust?: {};
      readonly tabs?: {};
    };
    readonly people?: {};
    readonly permissions?: {};
    readonly profile?: {};
    readonly remoteCamera?: {};
    readonly search?: {};
    readonly sharing?: {};
    readonly stageView?: {};
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly teamsCore?: {};
    readonly video?: {
      readonly mediaStream?: {};
      readonly sharedFrame?: {};
    };
    readonly webStorage?: {};
  };
}

interface IRuntimeV2 extends IBaseRuntime {
  readonly apiVersion: 2;
  readonly hostVersionsInfo?: HostVersionsInfo;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appEntity?: {};
    readonly appInstallDialog?: {};
    readonly appNotification?: {};
    readonly barCode?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {};
    readonly conversations?: {};
    readonly dialog?: {
      readonly card?: {
        readonly bot?: {};
      };
      readonly url?: {
        readonly bot?: {};
      };
      readonly update?: {};
    };
    readonly geoLocation?: {
      readonly map?: {};
    };
    readonly interactive?: {};
    readonly secondaryBrowser?: {};
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly marketplace?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly monetization?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly backStack?: {};
      readonly config?: {};
      readonly currentApp?: {};
      readonly fullTrust?: {};
      readonly tabs?: {};
    };
    readonly people?: {};
    readonly permissions?: {};
    readonly profile?: {};
    readonly remoteCamera?: {};
    readonly search?: {};
    readonly sharing?: {};
    readonly stageView?: {};
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly teamsCore?: {};
    readonly video?: {
      readonly mediaStream?: {};
      readonly sharedFrame?: {};
    };
    readonly webStorage?: {};
  };
}

interface IRuntimeV3 extends IBaseRuntime {
  readonly apiVersion: 3;
  readonly hostVersionsInfo?: HostVersionsInfo;
  readonly isNAAChannelRecommended?: boolean;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appEntity?: {};
    readonly appInstallDialog?: {};
    readonly barCode?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {};
    readonly clipboard?: {};
    readonly conversations?: {};
    readonly dialog?: {
      readonly card?: {
        readonly bot?: {};
      };
      readonly url?: {
        readonly bot?: {};
      };
      readonly update?: {};
    };
    readonly externalAppAuthentication?: {};
    readonly externalAppCardActions?: {};
    readonly geoLocation?: {
      readonly map?: {};
    };
    readonly interactive?: {};
    readonly secondaryBrowser?: {};
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly marketplace?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly monetization?: {};
    readonly nestedAppAuth?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly backStack?: {};
      readonly config?: {};
      readonly currentApp?: {};
      readonly fullTrust?: {};
      readonly tabs?: {};
    };
    readonly people?: {};
    readonly permissions?: {};
    readonly profile?: {};
    readonly remoteCamera?: {};
    readonly search?: {};
    readonly sharing?: {};
    readonly stageView?: {};
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly thirdPartyCloudStorage?: {};
    readonly teamsCore?: {};
    readonly video?: {
      readonly mediaStream?: {};
      readonly sharedFrame?: {};
    };
    readonly visualMedia?: {
      readonly image?: {};
    };
    readonly webStorage?: {};
  };
}

interface IRuntimeV4 extends IBaseRuntime {
  readonly apiVersion: 4;
  readonly hostVersionsInfo?: HostVersionsInfo;
  readonly isNAAChannelRecommended?: boolean;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appEntity?: {};
    readonly appInstallDialog?: {};
    readonly barCode?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {};
    readonly clipboard?: {};
    readonly conversations?: {};
    readonly dialog?: {
      readonly card?: {
        readonly bot?: {};
      };
      readonly url?: {
        readonly bot?: {};
        readonly parentCommunication?: {};
      };
      readonly update?: {};
    };
    readonly externalAppAuthentication?: {};
    readonly externalAppAuthenticationForCEA?: {};
    readonly externalAppCardActions?: {};
    readonly externalAppCardActionsForCEA?: {};
    readonly externalAppCommands?: {};
    readonly geoLocation?: {
      readonly map?: {};
    };
    readonly hostEntity?: {
      readonly tab?: {};
    };
    readonly interactive?: {};
    readonly secondaryBrowser?: {};
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly marketplace?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly messageChannels?: {
      readonly telemetry?: {};
      readonly dataLayer?: {};
    };
    readonly monetization?: {};
    readonly nestedAppAuth?: {};
    readonly notifications?: {};
    readonly otherAppStateChange?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly backStack?: {};
      readonly config?: {};
      readonly currentApp?: {};
      readonly fullTrust?: {};
      readonly tabs?: {};
    };
    readonly people?: {};
    readonly permissions?: {};
    readonly profile?: {};
    readonly remoteCamera?: {};
    readonly search?: {};
    readonly sharing?: {
      readonly history?: {};
    };
    readonly stageView?: {
      readonly self?: {};
    };
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly thirdPartyCloudStorage?: {};
    readonly teamsCore?: {};
    readonly video?: {
      readonly mediaStream?: {};
      readonly sharedFrame?: {};
    };
    readonly visualMedia?: {
      readonly image?: {};
    };
    readonly webStorage?: {};
  };
}
// Constant used to set the runtime configuration
const _uninitializedRuntime: UninitializedRuntime = {
  apiVersion: -1,
  supports: {},
};

interface UninitializedRuntime extends IBaseRuntime {
  readonly apiVersion: -1;
  readonly supports: {};
}

/**
 * @hidden
 * Ensures that the runtime has been initialized

 * @returns True if the runtime has been initialized
 * @throws Error if the runtime has not been initialized
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isRuntimeInitialized(runtime: IBaseRuntime): runtime is Runtime {
  if (isLatestRuntimeVersion(runtime)) {
    return true;
  } else if (runtime.apiVersion === -1) {
    throw new Error(errorRuntimeNotInitialized);
  } else {
    throw new Error(errorRuntimeNotSupported);
  }
}

export let runtime: Runtime | UninitializedRuntime = _uninitializedRuntime;

/**
 * This object is used as the default runtime for versions of Teams which don't pass a runtime object during
 * initialization. If the host DOES pass a runtime object during init, then this object is not used.
 *
 * In practice, this is used in Teams V1 and ALL versions of Teams mobile since they are the only hosts
 * that don't pass a runtime object during initialization (since they don't use the host SDK).
 *
 * If there are certain versions of Teams V1 or Teams mobile which support a capability but not ALL
 * versions, then you should modify the mapTeamsVersionToSupportedCapabilities structure for that purpose. That
 * structure allows you to specify particular versions on particular platforms that support certain capabilities.
 * This structure is version agnostic.
 *
 * In practice, if you are adding a new capability, you are likely only to need to update mapTeamsVersionToSupportedCapabilities
 * and NOT this structure, as this structure is effectively only used for capabilities that have existed "forever."
 *
 * Remember that everything here all still ONLY applies to versions of Teams that don't pass a runtime object during
 * initialization -- if they do, then neither this object nor the mapTeamsVersionToSupportedCapabilities structure is
 * used -- all runtime capabilities are dynamically discovered at runtime in the case where the runtime object is passed
 * during initialization.
 */
export const versionAndPlatformAgnosticTeamsRuntimeConfig: Runtime = {
  apiVersion: 4,
  isNAAChannelRecommended: false,
  hostVersionsInfo: teamsMinAdaptiveCardVersion,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    call: {},
    chat: {},
    conversations: {},
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
    interactive: {},
    logs: {},
    meetingRoom: {},
    menus: {},
    monetization: {},
    notifications: {},
    pages: {
      config: {},
      backStack: {},
      fullTrust: {},
    },
    remoteCamera: {},
    teams: {
      fullTrust: {},
    },
    teamsCore: {},
    video: {
      sharedFrame: {},
    },
  },
};

export interface ICapabilityReqs {
  readonly capability: object;
  readonly hostClientTypes: Array<string>;
}

const v1NonMobileHostClientTypes = [
  HostClientType.desktop,
  HostClientType.web,
  HostClientType.rigel,
  HostClientType.surfaceHub,
  HostClientType.teamsRoomsWindows,
  HostClientType.teamsRoomsAndroid,
  HostClientType.teamsPhones,
  HostClientType.teamsDisplays,
];

export const v1MobileHostClientTypes = [HostClientType.android, HostClientType.ios, HostClientType.ipados];

export const v1HostClientTypes = [...v1NonMobileHostClientTypes, ...v1MobileHostClientTypes];

/**
 * @hidden
 * `upgradeToNextVersion` transforms runtime of version `versionToUpgradeFrom` to the next higher version
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface IRuntimeUpgrade {
  versionToUpgradeFrom: number;
  upgradeToNextVersion: (previousVersionRuntime: IBaseRuntime) => IBaseRuntime;
}

/**
 * @hidden
 * Uses upgradeChain to transform an outdated runtime object to the latest format.
 * @param outdatedRuntime - The runtime object to be upgraded
 * @returns The upgraded runtime object
 * @throws Error if the runtime object could not be upgraded to the latest version
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function fastForwardRuntime(outdatedRuntime: IBaseRuntime): Runtime {
  let runtime = outdatedRuntime;
  if (runtime.apiVersion < latestRuntimeApiVersion) {
    upgradeChain.forEach((upgrade) => {
      if (runtime.apiVersion === upgrade.versionToUpgradeFrom) {
        runtime = upgrade.upgradeToNextVersion(runtime);
      }
    });
  }
  if (isLatestRuntimeVersion(runtime)) {
    return runtime;
  } else {
    throw new Error('Received a runtime that could not be upgraded to the latest version');
  }
}

/**
 * @hidden
 * List of transformations required to upgrade a runtime object from a previous version to the next higher version.
 * This list must be ordered from lowest version to highest version
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const upgradeChain: IRuntimeUpgrade[] = [
  {
    versionToUpgradeFrom: 1,
    upgradeToNextVersion: (previousVersionRuntime: IRuntimeV1): IRuntimeV2 => {
      return {
        apiVersion: 2,
        hostVersionsInfo: undefined,
        isLegacyTeams: previousVersionRuntime.isLegacyTeams,
        supports: {
          ...previousVersionRuntime.supports,
          dialog: previousVersionRuntime.supports.dialog
            ? {
                card: undefined,
                url: previousVersionRuntime.supports.dialog,
                update: previousVersionRuntime.supports.dialog?.update,
              }
            : undefined,
        },
      };
    },
  },
  {
    versionToUpgradeFrom: 2,
    upgradeToNextVersion: (previousVersionRuntime: IRuntimeV2): IRuntimeV3 => {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */ /* Intentionally assigned to unused variable to delete propery when destructuring */
      const { appNotification: _, ...newSupports } = previousVersionRuntime.supports;
      return {
        ...previousVersionRuntime,
        apiVersion: 3,
        supports: newSupports,
      };
    },
  },
  {
    versionToUpgradeFrom: 3,
    upgradeToNextVersion: (previousVersionRuntime: IRuntimeV3): IRuntimeV4 => {
      return {
        apiVersion: 4,
        hostVersionsInfo: previousVersionRuntime.hostVersionsInfo,
        isNAAChannelRecommended: previousVersionRuntime.isNAAChannelRecommended,
        isLegacyTeams: previousVersionRuntime.isLegacyTeams,
        supports: {
          ...previousVersionRuntime.supports,
          dialog: previousVersionRuntime.supports.dialog
            ? {
                card: previousVersionRuntime.supports.dialog?.card,
                url: {
                  bot: previousVersionRuntime.supports.dialog?.url?.bot,
                  parentCommunication: previousVersionRuntime.supports.dialog?.url ? {} : undefined,
                },
                update: previousVersionRuntime.supports.dialog?.update,
              }
            : undefined,
        },
      };
    },
  },
];

/**
 * This structure is used for versions of Teams that don't pass a runtime object during initialization.
 * Please see the extensive comments in versionAndPlatformAgnosticTeamsRuntimeConfig for more information
 * on when and how to use this structure.
 */
export const mapTeamsVersionToSupportedCapabilities: Record<string, Array<ICapabilityReqs>> = {
  // 1.0.0 just signifies "these capabilities have practically always been supported." For some of these
  // we don't know what the real first version that supported them was -- but it was long enough ago that
  // we can just effectively consider them always supported (on the specified platforms)
  '1.0.0': [
    {
      capability: { pages: { appButton: {}, tabs: {} }, stageView: {} },
      hostClientTypes: v1NonMobileHostClientTypes,
    },
  ],
  '1.9.0': [
    {
      capability: { location: {} },
      hostClientTypes: v1HostClientTypes,
    },
  ],
  '2.0.0': [
    {
      capability: { people: {} },
      hostClientTypes: v1HostClientTypes,
    },
    {
      capability: { sharing: {} },
      hostClientTypes: [HostClientType.desktop, HostClientType.web],
    },
  ],
  '2.0.1': [
    {
      capability: { teams: { fullTrust: { joinedTeams: {} } } },
      hostClientTypes: [
        HostClientType.android,
        HostClientType.desktop,
        HostClientType.ios,
        HostClientType.teamsRoomsAndroid,
        HostClientType.teamsPhones,
        HostClientType.teamsDisplays,
        HostClientType.web,
      ],
    },
    {
      capability: { webStorage: {} },
      hostClientTypes: [HostClientType.desktop],
    },
  ],
  '2.0.5': [
    {
      capability: { webStorage: {} },
      hostClientTypes: [HostClientType.android, HostClientType.ios],
    },
  ],
  '2.0.8': [
    {
      capability: { sharing: {} },
      hostClientTypes: [HostClientType.android, HostClientType.ios],
    },
  ],
};

const generateBackCompatRuntimeConfigLogger = runtimeLogger.extend('generateBackCompatRuntimeConfig');

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Merges the capabilities of two runtime objects. Fully supports arbitrarily nested capabilities/subcapabilities.
 *
 * Note that this function isn't actually doing anything specific to capabilities/runtime. It's just doing a
 * generic merge of two objects.
 *
 * This function is NOT intended to handle objects that are NOT "shaped" like runtime objects. Specifically
 * this means that it doesn't know how to merge values that aren't themselves objects. For example, it cannot
 * properly handle situations where both objects contain a string or number with the same property name since the proper way to
 * merge such values would be domain-dependent. For now it just happens to keep the value in the baseline and ignore the other.
 * Since the runtime is only supposed to have objects, this limitation is fine.
 *
 * @param baselineRuntime the baseline runtime object
 * @param runtimeToMergeIntoBaseline the runtime object to merge into the baseline
 * @returns the merged runtime object which is the union of baselineRuntime and runtimeToMergeIntoBaseline
 */
function mergeRuntimeCapabilities(baselineRuntime: object, runtimeToMergeIntoBaseline: object): object {
  const merged: object = { ...baselineRuntime };

  for (const key in runtimeToMergeIntoBaseline) {
    if (Object.prototype.hasOwnProperty.call(runtimeToMergeIntoBaseline, key)) {
      if (typeof runtimeToMergeIntoBaseline[key] === 'object' && !Array.isArray(runtimeToMergeIntoBaseline[key])) {
        merged[key] = mergeRuntimeCapabilities(baselineRuntime[key] || {}, runtimeToMergeIntoBaseline[key]);
      } else {
        if (!(key in baselineRuntime)) {
          merged[key] = runtimeToMergeIntoBaseline[key];
        }
      }
    }
  }

  return merged;
}

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Generates and returns a runtime configuration for host clients which are not on the latest host SDK version
 * and do not provide their own runtime config (this is just older versions of Teams on some platforms).
 * Their supported capabilities are based on the highest client SDK version that they can support.
 *
 * @param highestSupportedVersion - The highest client SDK version that the host client can support.
 * @returns runtime which describes the APIs supported by the legacy host client.
 */
export function generateVersionBasedTeamsRuntimeConfig(
  highestSupportedVersion: string,
  versionAgnosticRuntimeConfig: Runtime,
  mapVersionToSupportedCapabilities: Record<string, Array<ICapabilityReqs>>,
): Runtime {
  generateBackCompatRuntimeConfigLogger('generating back compat runtime config for %s', highestSupportedVersion);

  let newSupports = { ...versionAgnosticRuntimeConfig.supports };

  generateBackCompatRuntimeConfigLogger(
    'Supported capabilities in config before updating based on highestSupportedVersion: %o',
    newSupports,
  );

  Object.keys(mapVersionToSupportedCapabilities).forEach((versionNumber) => {
    if (compareSDKVersions(highestSupportedVersion, versionNumber) >= 0) {
      mapVersionToSupportedCapabilities[versionNumber].forEach((capabilityReqs) => {
        if (
          GlobalVars.hostClientType !== undefined &&
          capabilityReqs.hostClientTypes.includes(GlobalVars.hostClientType)
        ) {
          newSupports = mergeRuntimeCapabilities(newSupports, capabilityReqs.capability);
        }
      });
    }
  });

  const teamsBackCompatRuntimeConfig: Runtime = {
    apiVersion: latestRuntimeApiVersion,
    hostVersionsInfo: teamsMinAdaptiveCardVersion,
    isLegacyTeams: true,
    supports: newSupports,
  };

  generateBackCompatRuntimeConfigLogger(
    'Runtime config after updating based on highestSupportedVersion: %o',
    teamsBackCompatRuntimeConfig,
  );

  return teamsBackCompatRuntimeConfig;
}

const applyRuntimeConfigLogger = runtimeLogger.extend('applyRuntimeConfig');
export function applyRuntimeConfig(runtimeConfig: IBaseRuntime): void {
  // Some hosts that have not adopted runtime versioning send a string for apiVersion, so we should handle those as v1 inputs
  if (typeof runtimeConfig.apiVersion === 'string') {
    applyRuntimeConfigLogger('Trying to apply runtime with string apiVersion, processing as v1: %o', runtimeConfig);
    runtimeConfig = {
      ...runtimeConfig,
      apiVersion: 1,
    };
  }
  applyRuntimeConfigLogger('Fast-forwarding runtime %o', runtimeConfig);
  const ffRuntimeConfig = fastForwardRuntime(runtimeConfig);
  applyRuntimeConfigLogger('Applying runtime %o', ffRuntimeConfig);
  runtime = deepFreeze(ffRuntimeConfig);
}

export function setUnitializedRuntime(): void {
  runtime = deepFreeze(_uninitializedRuntime);
}

/**
 * @hidden
 * Constant used to set minimum runtime configuration
 * while un-initializing an app in unit test case.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const _minRuntimeConfigToUninitialize: Runtime = {
  apiVersion: latestRuntimeApiVersion,
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
