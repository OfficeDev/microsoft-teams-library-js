import { botUrlOpenHelper, dialogTelemetryVersionNumber } from '../../../internal/dialogHelpers';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../../internal/telemetry';
import { BotUrlDialogInfo } from '../../interfaces';
import { runtime } from '../../runtime';
import { DialogSubmitHandler, PostMessageChannel } from '../dialog';

/**
 * Module to open a dialog that sends results to the bot framework
 *
 * @beta
 * @module
 */

/**
 * Allows an app to open a dialog that sends submitted data to a bot.
 *
 * @param botUrlDialogInfo - An object containing the parameters of the dialog module including completionBotId.
 * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
 * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
 *
 * @returns a function that can be used to send messages to the dialog.
 *
 * @beta
 */
export function open(
  botUrlDialogInfo: BotUrlDialogInfo,
  submitHandler?: DialogSubmitHandler,
  messageFromChildHandler?: PostMessageChannel,
): void {
  botUrlOpenHelper(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_Bot_Open),
    botUrlDialogInfo,
    submitHandler,
    messageFromChildHandler,
  );
}

/**
 * Checks if dialog.url.bot capability is supported by the host
 *
 * @returns boolean to represent whether dialog.url.bot is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return (
    ensureInitialized(runtime) &&
    (runtime.supports.dialog && runtime.supports.dialog.url && runtime.supports.dialog.url.bot) !== undefined
  );
}
