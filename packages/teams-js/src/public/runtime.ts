/* eslint-disable @typescript-eslint/ban-types */

import { deepFreeze } from '../internal/utils';
export interface IRuntime {
  readonly apiVersion: number;
  readonly isLegacyTeams?: boolean;
  readonly supports: {
    readonly audioDevice?: {};
    readonly appInstallDialog?: {};
    readonly appEntity?: {};
    readonly barcodeDevice?: {};
    readonly bot?: {};
    readonly calendar?: {};
    readonly call?: {};
    readonly cameraDevice?: {};
    readonly chat?: {};
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
      readonly fullTrust?: {};
    };
    readonly teamsCore?: {};
    readonly video?: {};
    readonly videoDevice?: {};
  };
}

export let runtime: IRuntime = {
  apiVersion: 1,
  supports: {
    appInstallDialog: undefined,
    audioDevice: undefined,
    barcodeDevice: undefined,
    bot: undefined,
    calendar: undefined,
    call: undefined,
    cameraDevice: undefined,
    chat: undefined,
    dialog: {
      bot: undefined,
      update: undefined,
    },
    location: {
      map: undefined,
    },
    logs: undefined,
    mail: undefined,
    media: {},
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
    videoDevice: undefined,
  },
};

export const teamsRuntimeConfig: IRuntime = {
  apiVersion: 1,
  isLegacyTeams: true,
  supports: {
    appInstallDialog: {},
    appEntity: {},
    audioDevice: {},
    barcodeDevice: {},
    bot: {},
    call: {},
    cameraDevice: {},
    chat: {},
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
      fullTrust: {},
    },
    teamsCore: {},
    video: {},
    videoDevice: {},
  },
};

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
