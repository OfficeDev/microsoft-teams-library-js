/* eslint-disable @typescript-eslint/ban-types */

import { GlobalVars } from '../internal/globalVars';
import { getLogger } from '../internal/telemetry';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';

const runtimeLogger = getLogger('runtime');

interface IBaseRuntime {
  readonly apiVersion: number;
}

// Latest runtime version
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

export let runtime: Runtime = {
  apiVersion: 1,
  supports: {
    appInstallDialog: undefined,
    barCode: undefined,
    calendar: undefined,
    call: undefined,
    chat: undefined,
    webStorage: undefined,
    conversations: undefined,
    dialog: {
      bot: undefined,
      update: undefined,
    },
    geoLocation: {
      map: undefined,
    },
    location: undefined,
    logs: undefined,
    mail: undefined,
    meetingRoom: undefined,
    menus: undefined,
    monetization: undefined,
    notifications: undefined,
    pages: {
      appButton: undefined,
      backStack: undefined,
      config: undefined,
      currentApp: undefined,
      fullTrust: undefined,
      tabs: undefined,
    },
    people: undefined,
    permissions: undefined,
    profile: undefined,
    remoteCamera: undefined,
    search: undefined,
    sharing: undefined,
    stageView: undefined,
    teams: {
      fullTrust: {
        joinedTeams: undefined,
      },
    },
    teamsCore: undefined,
    video: undefined,
  },
};

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

const upgradeChain: IRuntimeUpgrade[] = [];

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
    {
      capability: { profile: {} },
      hostClientTypes: [HostClientType.desktop, HostClientType.web],
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

  const ffBackCompatRuntimeConfig = fastForwardRuntime(backCompatRuntimeConfig);

  generateBackCompatRuntimeConfigLogger(
    'Runtime config after updating fast-forwarding to latest runtime api version: %o',
    ffBackCompatRuntimeConfig,
  );

  return ffBackCompatRuntimeConfig;
}

const applyRuntimeConfigLogger = runtimeLogger.extend('applyRuntimeConfig');
export function applyRuntimeConfig(runtimeConfig: Runtime): void {
  applyRuntimeConfigLogger('Applying runtime %o', runtimeConfig);
  runtime = deepFreeze(runtimeConfig);
}

/**
 * @hidden
 * Constant used to set minimum runtime configuration
 * while un-initializing an app in unit test case.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const _minRuntimeConfigToUninitialize = {
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
