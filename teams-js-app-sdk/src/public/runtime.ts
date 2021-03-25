import { deepFreeze } from '../internal/utils';

export interface IRuntime {
  readonly apiVersion: number;
  readonly supports: {
    readonly calendar?: {};
    readonly location?: {};
    readonly mail?: {};
    readonly meeting?: {};
    readonly notifications?: {};
    readonly pages?: {
      readonly tabs?: {};
      readonly config?: {};
    };
  };
}

export let runtime: IRuntime;

export function applyRuntimeConfig(runtimeConfig: IRuntime): void {
  runtime = deepFreeze(runtimeConfig);
}
