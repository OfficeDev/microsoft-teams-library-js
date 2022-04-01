/* eslint-disable @typescript-eslint/ban-types */

import { GlobalVars } from '../internal/globalVars';
import { compareSDKVersions, deepFreeze } from '../internal/utils';
import { HostClientType } from './constants';
export interface IRuntime {
  readonly apiVersion: number;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appInstallDialog?: {};
    readonly appEntity?: {};
    readonly bot?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly chat?: {
      readonly conversation?: {};
    };
    readonly dialog?: {
      readonly bot?: {};
      readonly update?: {};
    };
    readonly files?: {};
    readonly location?: {};
    readonly logs?: {};
    readonly mail?: {};
    readonly media?: {};
    readonly meeting?: {};
    readonly meetingRoom?: {};
    readonly menus?: {};
    readonly monetization?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly appButton?: {};
      readonly tabs?: {};
      readonly config?: {};
      readonly backStack?: {};
      readonly fullTrust?: {};
    };
    readonly people?: {};
    readonly remoteCamera?: {};
    readonly sharing?: {};
    readonly teams?: {
      readonly fullTrust?: {
        readonly joinedTeams?: {};
      };
    };
    readonly teamsCore?: {};
    readonly video?: {};
  };
}

export let runtime: IRuntime = {
  apiVersion: 1,
  supports: {
    appInstallDialog: undefined,
    bot: undefined,
    calendar: undefined,
    call: undefined,
    chat: {
      conversation: undefined,
    },
    dialog: {
      bot: undefined,
      update: undefined,
    },
    location: undefined,
    logs: undefined,
    mail: undefined,
    media: undefined,
    meeting: undefined,
    meetingRoom: undefined,
    menus: undefined,
    monetization: undefined,
    notifications: undefined,
    pages: {
      appButton: undefined,
      tabs: undefined,
      config: undefined,
      backStack: undefined,
      fullTrust: undefined,
    },
    people: undefined,
    remoteCamera: undefined,
    sharing: undefined,
    teams: {
      fullTrust: {
        joinedTeams: undefined,
      },
    },
    teamsCore: undefined,
    video: undefined,
  },
};

export const teamsRuntimeConfig = {
  apiVersion: 1,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    bot: {},
    call: {},
    chat: {
      conversation: {},
    },
    dialog: {
      bot: {},
      update: {},
    },
    files: {},
    logs: {},
    media: {},
    meeting: {},
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
    teams: {
      fullTrust: {},
    },
    teamsCore: {},
    video: {},
  },
};

// object of version constants
export const versionConstants = {
  '1.9.0': {
    capabilities: { location: {} },
    hostClientTypes: [
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
    ],
  },
  '2.0.0': {
    capabilities: { people: {} },
    hostClientTypes: [
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
    ],
  },
  '2.0.1': {
    capabilities: { teams: { fullTrust: { joinedTeams: {} } } },
    hostClientTypes: [
      HostClientType.android,
      HostClientType.teamsRoomsAndroid,
      HostClientType.teamsPhones,
      HostClientType.teamsDisplays,
    ],
  },
};

export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): IRuntime {
  let newSupports = { ...teamsRuntimeConfig.supports, ...{} };

  // for every key version in object, compare version with highestSupportedVersion.
  // if highestSupportedVersion >= key version, add these items to the returned runtime config.
  Object.keys(versionConstants).forEach(versionNumber => {
    if (
      compareSDKVersions(highestSupportedVersion, versionNumber) >= 0 &&
      versionConstants[versionNumber].hostClientTypes.includes(GlobalVars.hostClientType)
    ) {
      newSupports = {
        ...newSupports,
        ...versionConstants[versionNumber].capabilities,
      };
    }
  });

  const backCompatRuntimeConfig: IRuntime = {
    apiVersion: 1,
    isLegacyTeams: true,
    supports: newSupports,
  };
  return backCompatRuntimeConfig;
}

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
