/* eslint-disable @typescript-eslint/ban-types */

import { GlobalVars } from '../internal/globalVars';
import { getLogger } from '../internal/telemetry';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';

const runtimeLogger = getLogger('runtime');

export interface IBaseRuntime {
  readonly apiVersion: number;
  readonly isLegacyTeams?: boolean;
}

// Latest runtime interface version
export type Runtime = IRuntimeV1;

export const latestRuntimeApiVersion = 1;

function isLatestRuntimeVersion(runtime: IBaseRuntime): runtime is Runtime {
  return runtime.apiVersion === latestRuntimeApiVersion && isRuntimeV1(runtime);
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

function isRuntimeV1(runtime: IBaseRuntime): runtime is IRuntimeV1 {
  return runtime.apiVersion === 1 && 'supports' in runtime;
}

// This interface is included for testing and as an examle of how to implement a runtime version upgrade
// it may be removed when there is a real version upgrade implemented and tested
interface IRuntimeV0 extends IBaseRuntime {
  readonly apiVersion: 0;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appEntity?: {};
    readonly appInstallDialog?: {};
    readonly calendarV0?: {};
  };
}

/**
 * @hidden
 * Constant used to set the runtime configuration
 * to its uninitialized state.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const _uninitializedRuntime: Runtime = {
  apiVersion: 1,
  supports: {},
};

export let runtime: Runtime = _uninitializedRuntime;

export const teamsRuntimeConfig: Runtime = {
  apiVersion: 1,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    call: {},
    chat: {},
    conversations: {},
    dialog: {
      bot: {},
      update: {},
    },
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
    sharing: {},
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

interface IRuntimeUpgrade {
  versionToUpgradeFrom: number;
  upgradeToNextVersion: (previousVersionRuntime: IBaseRuntime) => IBaseRuntime;
}

function fastForwardRuntime(outdatedRuntime: IBaseRuntime): Runtime {
  let runtime = outdatedRuntime;
  if (runtime.apiVersion < latestRuntimeApiVersion) {
    upgradeChain.forEach((upgrade) => {
      if (runtime.apiVersion === upgrade.versionToUpgradeFrom) {
        runtime = upgrade.upgradeToNextVersion(runtime);
      }
    });
  }
  return isLatestRuntimeVersion(runtime) && runtime;
}

const upgradeChain: IRuntimeUpgrade[] = [
  // This upgrade has been included for testing, it may be removed when there is a real upgrade implemented
  {
    versionToUpgradeFrom: 0,
    upgradeToNextVersion: (previousVersionRuntime: IRuntimeV0): IRuntimeV1 => {
      return {
        apiVersion: 1,
        isLegacyTeams: previousVersionRuntime.isLegacyTeams,
        supports: {
          ...previousVersionRuntime.supports,
          calendar: previousVersionRuntime.supports.calendarV0,
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
export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): IRuntimeV1 {
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

  const backCompatRuntimeConfig: IRuntimeV1 = {
    apiVersion: 1,
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

/**
 * @hidden
 * Constant used to set minimum runtime configuration
 * while un-initializing an app in unit test case.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const _minRuntimeConfigToUninitialize: Runtime = {
  apiVersion: 1,
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
