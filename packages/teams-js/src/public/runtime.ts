/* eslint-disable @typescript-eslint/ban-types */

import { GlobalVars } from '../internal/globalVars';
import { getLogger } from '../internal/telemetry';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';

const runtimeLogger = getLogger('runtime');

interface IBaseRuntime {
  readonly apiVersion: number;
}

interface IRuntimeV2 extends IBaseRuntime {
  readonly apiVersion: 2;
  readonly isLegacyTeams?: boolean;
  readonly hostVersionsInfo?: HostVersionsInfo;
  readonly supports: {
    ...
  };
}

type ILegacyRuntime = IRuntime;

export let runtime: IRuntime = {
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

export const teamsRuntimeConfig: IRuntime = {
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
  version: number;
  update: (old: IBaseRuntime) => IBaseRuntime;
}

function fastForwardRuntime(outdatedRuntime: IBaseRuntime): IRuntimeV3 {
  let runtime = outdatedRuntime;
  upgradeChain.forEach((upgrade) => {
    if (runtime.apiVersion === upgrade.version) {
      runtime = upgrade.update(runtime);
    }
  });
  return runtime;
}

const upgradeChain: IRuntimeUpgrade[] = [
  {
    version: 1,
    update: (old: IRuntimeV2) => {
      return {
        apiVersion: 2,
      } as IRuntimeV2;
    },
  },
  {
    version: 2,
    update: (old: IRuntimeV2) => {
      return {
        apiVersion: 3,
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
export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): IRuntime {
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

  const backCompatRuntimeConfig: IRuntime = {
    apiVersion: 1,
    isLegacyTeams: true,
    supports: newSupports,
  };

  generateBackCompatRuntimeConfigLogger(
    'Runtime config after updating based on highestSupportedVersion: %o',
    backCompatRuntimeConfig,
  );

  fastForwardRuntime(backCompatRuntimeConfig);

  return backCompatRuntimeConfig;
}

const applyRuntimeConfigLogger = runtimeLogger.extend('applyRuntimeConfig');
export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
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
