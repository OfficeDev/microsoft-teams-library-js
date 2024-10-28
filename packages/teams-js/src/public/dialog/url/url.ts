/* eslint-disable @typescript-eslint/no-unused-vars */
import { dialogTelemetryVersionNumber, urlOpenHelper, urlSubmitHelper } from '../../../internal/dialogHelpers';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../../internal/telemetry';
import { DialogDimension } from '../../constants';
import { BotUrlDialogInfo, DialogInfo, UrlDialogInfo } from '../../interfaces';
import { M365ContentAction } from '../../interfaces';
import { runtime } from '../../runtime';
import { DialogSubmitHandler, PostMessageChannel } from '../dialog';
import * as bot from './bot';
import * as parentCommunication from './parentCommunication';

/**
 * Allows app to open a url based dialog.
 *
 * @remarks
 * This function cannot be called from inside of a dialog
 *
 * @param urlDialogInfo - An object containing the parameters of the dialog module.
 * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
 * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
 *
 * @beta
 */
export function open(
  urlDialogInfo: UrlDialogInfo,
  submitHandler?: DialogSubmitHandler,
  messageFromChildHandler?: PostMessageChannel,
): void {
  urlOpenHelper(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_Open),
    urlDialogInfo,
    submitHandler,
    messageFromChildHandler,
  );
}

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
export function submit(result?: string | object, appIds?: string | string[]): void {
  urlSubmitHelper(getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_Submit), result, appIds);
}

/**
 * Checks if dialog.url module is supported by the host
 *
 * @returns boolean to represent whether dialog.url module is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && (runtime.supports.dialog && runtime.supports.dialog.url) !== undefined;
}

/**
 * @hidden
 *
 * Convert UrlDialogInfo to DialogInfo to send the information to host in {@linkcode open} API.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getDialogInfoFromUrlDialogInfo(urlDialogInfo: UrlDialogInfo): DialogInfo {
  const dialogInfo: DialogInfo = {
    url: urlDialogInfo.url,
    height: urlDialogInfo.size ? urlDialogInfo.size.height : DialogDimension.Small,
    width: urlDialogInfo.size ? urlDialogInfo.size.width : DialogDimension.Small,
    title: urlDialogInfo.title,
    fallbackUrl: urlDialogInfo.fallbackUrl,
  };
  return dialogInfo;
}

/**
 * @hidden
 *
 * Convert BotUrlDialogInfo to DialogInfo to send the information to host in {@linkcode bot.open} API.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo: BotUrlDialogInfo): DialogInfo {
  const dialogInfo: DialogInfo = getDialogInfoFromUrlDialogInfo(botUrlDialogInfo);
  dialogInfo.completionBotId = botUrlDialogInfo.completionBotId;
  return dialogInfo;
}

export { bot, parentCommunication };
