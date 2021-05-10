import { deepFreeze } from '../internal/utils';

export interface IRuntime {
  readonly apiVersion: number;
  readonly supports: {
    readonly calendar?: {};
    readonly chat?: {};
    readonly dialog?: {};
    readonly location?: {};
    readonly mail?: {};
    readonly media?: {};
    readonly meeting?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly tabs?: {};
      readonly config?: {};
      readonly backStack?: {};
      readonly fullTrust?: {};
    };
    readonly teams?: {
      readonly fullTrust?: {};
    };
  };
}

export let runtime: IRuntime = {
  apiVersion: 1,
  supports: {
    calendar: undefined,
    chat: undefined,
    dialog: undefined,
    location: undefined,
    mail: undefined,
    media: undefined,
    meeting: undefined,
    notifications: undefined,
    pages: {
      tabs: undefined,
      config: undefined,
      backStack: undefined,
      fullTrust: undefined,
    },
    teams: {
      fullTrust: undefined,
    },
  },
};

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
