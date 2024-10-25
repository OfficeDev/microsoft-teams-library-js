/* eslint-disable @typescript-eslint/no-unused-vars */
import { sendMessageToParent } from '../../../internal/communication';
import { dialogTelemetryVersionNumber, getDialogInfoFromAdaptiveCardDialogInfo } from '../../../internal/dialogHelpers';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../../internal/telemetry';
import { isHostAdaptiveCardSchemaVersionUnsupported } from '../../../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../constants';
import { AdaptiveCardDialogInfo, DialogInfo } from '../../interfaces';
import { runtime } from '../../runtime';
import { DialogSubmitHandler } from '../dialog';
import * as url from '../url/url';
import * as bot from './bot';

/**
 * Subcapability for interacting with adaptive card dialogs
 * @beta
 */
/**
 * Allows app to open an adaptive card based dialog.
 *
 * @remarks
 * This function cannot be called from inside of a dialog
 *
 * @param adaptiveCardDialogInfo - An object containing the parameters of the dialog module {@link AdaptiveCardDialogInfo}.
 * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode url.submit} function or when the user closes the dialog.
 *
 * @beta
 */
export function open(adaptiveCardDialogInfo: AdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  const dialogInfo: DialogInfo = getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo);
  sendMessageToParent(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_AdaptiveCard_Open),
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
    },
  );
}

/**
 * Checks if dialog.adaptiveCard module is supported by the host
 *
 * @returns boolean to represent whether dialog.adaptiveCard module is supported
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
    (isAdaptiveCardVersionSupported && runtime.supports.dialog && runtime.supports.dialog.card) !== undefined
  );
}

export { bot };
