import { sendMessageToParent } from '../../../internal/communication';
import {
  dialogTelemetryVersionNumber,
  getDialogInfoFromBotAdaptiveCardDialogInfo,
} from '../../../internal/dialogHelpers';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../../internal/telemetry';
import { isHostAdaptiveCardSchemaVersionUnsupported } from '../../../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../constants';
import { BotAdaptiveCardDialogInfo, DialogInfo } from '../../interfaces';
import { runtime } from '../../runtime';
import { DialogSubmitHandler } from '../dialog';

/**
 * Module for interaction with adaptive card dialogs that need to communicate with the bot framework
 *
 * @beta
 * @module
 */

/**
 * Allows an app to open an adaptive card-based dialog module using bot.
 *
 * @param botAdaptiveCardDialogInfo - An object containing the parameters of the dialog module including completionBotId.
 * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
 *
 * @beta
 */
export function open(botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const dialogInfo: DialogInfo = getDialogInfoFromBotAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo);

  sendMessageToParent(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_AdaptiveCard_Bot_Open),
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
    },
  );
}

/**
 * Checks if dialog.adaptiveCard.bot capability is supported by the host
 *
 * @returns boolean to represent whether dialog.adaptiveCard.bot is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  const isAdaptiveCardVersionSupported =
    runtime.hostVersionsInfo &&
    runtime.hostVersionsInfo.adaptiveCardSchemaVersion &&
    !isHostAdaptiveCardSchemaVersionUnsupported(runtime.hostVersionsInfo.adaptiveCardSchemaVersion);
  return (
    ensureInitialized(runtime) &&
    (isAdaptiveCardVersionSupported &&
      runtime.supports.dialog &&
      runtime.supports.dialog.card &&
      runtime.supports.dialog.card.bot) !== undefined
  );
}
