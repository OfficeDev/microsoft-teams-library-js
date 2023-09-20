import { ExternalAppDialogInfo } from '../public/interfaces';

/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 *  capability that allows an app (restricted to bizchat for now) to show a modal dialog.
 *  Unlike traditional URL-based dialogs that limit opening URLs with the same domain,
 *  this capability allows any URL pointing to a teams-js app to be opened within the dialog.
 */
export namespace externalAppDialog {
  export interface ISdkResponse {
    err?: string;
    result?: string | object;
  }
  export type DialogSubmitHandler = (result: ISdkResponse) => void;

  /**
   * Allows app to open a dialog.
   *
   * @remarks
   * This function cannot be called from inside of a dialog
   *
   * @param externalAppDialogInfo - An object containing the parameters of the dialog module.
   * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
   *
   * @beta
   */
  export function open(externalAppDialogInfo: ExternalAppDialogInfo, submitHandler: DialogSubmitHandler): void;

  /**
   * Submit the dialog module and close the dialog
   *
   * @remarks
   * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
   *
   * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it,
   *  If this function is called from a dialog while {@link M365ContentAction} is set in the context object by the host, result will be ignored
   *
   * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
   *
   * @beta
   */
  export function submit(result?: string | object, appIds?: string | string[]): void;

  export function isSupported(): boolean;

  export namespace bot {
    export function open(externalAppDialogInfo: BotExternalAppDialogInfo, submitHandler: DialogSubmitHandler): void;
    export function isSupported(): boolean;
  }
}
