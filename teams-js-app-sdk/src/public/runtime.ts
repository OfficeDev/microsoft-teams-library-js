import { deepFreeze } from '../internal/utils';

export interface IRuntime {
  readonly apiVersion: number;
  readonly supports: {
    readonly calendar?: {};
  };
}
export enum RuntimeCapabilities {
  Calendar = 'calendar',
}

class Runtime {
  runtime: IRuntime;

  applyRuntimeConfig(runtimeConfig: IRuntime): void {
    this.runtime = deepFreeze(runtimeConfig);
  }
  isSupported(type: RuntimeCapabilities): boolean {
    return this.runtime.supports[type] ? true : false;
  }
}
export const runtime = new Runtime();
