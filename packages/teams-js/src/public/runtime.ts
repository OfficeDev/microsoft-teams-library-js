/* eslint-disable @typescript-eslint/ban-types */

import { errorRuntimeNotInitialized, errorRuntimeNotSupported } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { getLogger } from '../internal/telemetry';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';
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
export type Runtime = IRuntimeV2;

export const latestRuntimeApiVersion = 2;

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
    readonly video?: {};
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
    readonly video?: {};
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

export const teamsRuntimeConfig: Runtime = {
  apiVersion: 2,
  hostVersionsInfo: undefined,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    call: {},
    chat: {},
    conversations: {},
    dialog: {
      url: {
        bot: {},
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
      appButton: {},
      tabs: {},
      config: {},
      backStack: {},
      fullTrust: {},
    },
    remoteCamera: {},
    stageView: {},
    teams: {
      fullTrust: {},
    },
    teamsCore: {},
    video: {},
  },
};

interface ICapabilityReqs {
  readonly capability: object;
  readonly hostClientTypes: Array<string>;
}

export const v1HostClientTypes = [
  HostClientType.desktop,
  HostClientType.web,
  HostClientType.android,
  HostClientType.ios,
  HostClientType.rigel,
  HostClientType.surfaceHub,
  HostClientType.teamsRoomsWindows,
  HostClientType.teamsRoomsAndroid,
  HostClientType.teamsPhones,
  HostClientType.teamsDisplays,
];

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
  // This upgrade has been included for testing, it may be removed when there is a real upgrade implemented
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
];

export const versionConstants: Record<string, Array<ICapabilityReqs>> = {
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
      hostClientTypes: [HostClientType.android, HostClientType.desktop, HostClientType.ios],
    },
  ],
};

const generateBackCompatRuntimeConfigLogger = runtimeLogger.extend('generateBackCompatRuntimeConfig');
/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Generates and returns a runtime configuration for host clients which are not on the latest host SDK version
 * and do not provide their own runtime config. Their supported capabilities are based on the highest
 * client SDK version that they can support.
 *
 * @param highestSupportedVersion - The highest client SDK version that the host client can support.
 * @returns runtime which describes the APIs supported by the legacy host client.
 */
export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): Runtime {
  generateBackCompatRuntimeConfigLogger('generating back compat runtime config for %s', highestSupportedVersion);

  let newSupports = { ...teamsRuntimeConfig.supports };

  generateBackCompatRuntimeConfigLogger(
    'Supported capabilities in config before updating based on highestSupportedVersion: %o',
    newSupports,
  );

  Object.keys(versionConstants).forEach((versionNumber) => {
    if (compareSDKVersions(highestSupportedVersion, versionNumber) >= 0) {
      versionConstants[versionNumber].forEach((capabilityReqs) => {
        if (capabilityReqs.hostClientTypes.includes(GlobalVars.hostClientType)) {
          newSupports = {
            ...newSupports,
            ...capabilityReqs.capability,
          };
        }
      });
    }
  });

  const backCompatRuntimeConfig: Runtime = {
    apiVersion: 2,
    isLegacyTeams: true,
    supports: newSupports,
  };

  generateBackCompatRuntimeConfigLogger(
    'Runtime config after updating based on highestSupportedVersion: %o',
    backCompatRuntimeConfig,
  );

  return backCompatRuntimeConfig;
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
  apiVersion: 2,
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
