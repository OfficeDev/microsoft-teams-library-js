import { GlobalVars } from '../internal/globalVars';

export namespace logger {
  /**
   * Turn on client logging to display all of debug logs on browser console
   */
  export function turnOnConsoleLog(): void {
    GlobalVars.turnOnConsoleLog = true;
  }

  /**
   * Turn off client logging so that all of debug logs will not be displayed on browser console
   */
  export function turnOffConsoleLog(): void {
    GlobalVars.turnOnConsoleLog = false;
  }
}
