import { GlobalVars } from '../internal/globalVars';

export namespace logger {
  /**
   * todo: doc
   * @returns bool
   */
  export function turnOnConsoleLog(): boolean {
    GlobalVars.turnOnConsoleLog = true;
    return GlobalVars.turnOnConsoleLog;
  }

  /**
   * todo: doc
   * @returns bool
   */
  export function turnOffConsoleLog(): boolean {
    GlobalVars.turnOnConsoleLog = false;
    return GlobalVars.turnOnConsoleLog;
  }
}
