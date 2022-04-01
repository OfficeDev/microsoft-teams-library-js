/* eslint-disable @typescript-eslint/ban-types */

import { compareSDKVersions, deepFreeze } from '../internal/utils';
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
      readonly fullTrust?: {};
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
      fullTrust: undefined,
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
const versionConstants = {
  '1.9.0': {
    capabilities: { location: {} },
    hostClientTypes: [],
  },
  '2.0.0': {
    capabilities: { people: {} },
    hostClientTypes: [],
  },
  '2.0.1': {
    capabilities: { teams: { fullTrust: { joinedTeams: {} } } },
    hostClientTypes: [],
  },
};

export function generateBackCompatRuntimeConfig(highestSupportedVersion: string): IRuntime {
  const backCompatRuntimeConfig = {
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
  // for every key version in object, compare version with highestSupportedVersion.
  // if highestSupportedVersion >= key version, add these items to the returned runtime config.
  // TODO: add check for hostclienttypes
  // TODO: check what happens with object .add like Shreyas said
  // TODO: add nested joinedTeams
  Object.keys(versionConstants).forEach(versionNumber => {
    if (compareSDKVersions(highestSupportedVersion, versionNumber) >= 0) {
      backCompatRuntimeConfig.supports = Object.assign(
        backCompatRuntimeConfig.supports,
        versionConstants[versionNumber].capabilities,
      );
    }
  });

  return backCompatRuntimeConfig;
}

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
