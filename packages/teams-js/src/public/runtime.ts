/* eslint-disable @typescript-eslint/ban-types */

import { deepFreeze } from '../internal/utils';
export interface IRuntime {
  readonly apiVersion: number;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly appInstallDialog?: {};
    readonly appEntity?: {};
    readonly barcode?: {};
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
    readonly location?: {
      readonly map?: {};
    };
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
    barcode: undefined,
    calendar: undefined,
    call: undefined,
    chat: {
      conversation: undefined,
    },
    dialog: {
      bot: undefined,
      update: undefined,
    },
    location: {
      map: undefined,
    },
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

export const teamsRuntimeConfig: IRuntime = {
  apiVersion: 1,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    // I'm actually not sure what the right thing to put here, if we don't use the old format I think we would want this to say false in legacy teams
    barcode: {},
    call: {},
    chat: {
      conversation: {},
    },
    dialog: {
      bot: {},
      update: {},
    },
    files: {},
    location: {
      map: {},
    },
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
    people: {},
    remoteCamera: {},
    sharing: {},
    teams: {
      fullTrust: {
        joinedTeams: {},
      },
    },
    teamsCore: {},
    video: {},
  },
};

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
