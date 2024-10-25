/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ensureInitialized } from '../internal/internalAPIs';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { dialog } from '../public/dialog/dialog';
import { AdaptiveCardDialogInfo, BotAdaptiveCardDialogInfo } from '../public/interfaces';
import { BotUrlDialogInfo, DialogInfo, DialogSize, UrlDialogInfo } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageToParent } from './communication';
import { GlobalVars } from './globalVars';
import { registerHandler, removeHandler } from './handlers';
import { ApiName, ApiVersionNumber, getApiVersionTag } from './telemetry';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
export const dialogTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

export function updateResizeHelper(apiVersionTag: string, dimensions: DialogSize): void {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.task,
    FrameContexts.meetingStage,
  );
  if (!dialog.update.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(apiVersionTag, 'tasks.updateTask', [dimensions]);
}

export function urlOpenHelper(
  apiVersionTag: string,
  urlDialogInfo: UrlDialogInfo,
  submitHandler?: dialog.DialogSubmitHandler,
  messageFromChildHandler?: dialog.PostMessageChannel,
): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!dialog.url.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (messageFromChildHandler) {
    registerHandler(
      getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_RegisterMessageForParentHandler),
      'messageForParent',
      messageFromChildHandler,
    );
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromUrlDialogInfo(urlDialogInfo);
  sendMessageToParent(apiVersionTag, 'tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
    submitHandler?.({ err, result });
    removeHandler('messageForParent');
  });
}

export function botUrlOpenHelper(
  apiVersionTag: string,
  urlDialogInfo: BotUrlDialogInfo,
  submitHandler?: dialog.DialogSubmitHandler,
  messageFromChildHandler?: dialog.PostMessageChannel,
): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!dialog.url.bot.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (messageFromChildHandler) {
    registerHandler(
      getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_Bot_RegisterMessageForParentHandler),
      'messageForParent',
      messageFromChildHandler,
    );
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromBotUrlDialogInfo(urlDialogInfo);
  sendMessageToParent(apiVersionTag, 'tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
    submitHandler?.({ err, result });
    removeHandler('messageForParent');
  });
}

export function urlSubmitHelper(apiVersionTag: string, result?: string | object, appIds?: string | string[]): void {
  ensureInitialized(runtime, FrameContexts.task);
  if (!dialog.url.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
  sendMessageToParent(apiVersionTag, 'tasks.completeTask', [
    result,
    appIds ? (Array.isArray(appIds) ? appIds : [appIds]) : [],
  ]);
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Convert AdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
 *
 * @internal
 */
export function getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo: AdaptiveCardDialogInfo): DialogInfo {
  const dialogInfo: DialogInfo = {
    card: adaptiveCardDialogInfo.card,
    height: adaptiveCardDialogInfo.size ? adaptiveCardDialogInfo.size.height : DialogDimension.Small,
    width: adaptiveCardDialogInfo.size ? adaptiveCardDialogInfo.size.width : DialogDimension.Small,
    title: adaptiveCardDialogInfo.title,
  };
  return dialogInfo;
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Convert BotAdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
 *
 * @internal
 */
export function getDialogInfoFromBotAdaptiveCardDialogInfo(
  botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo,
): DialogInfo {
  const dialogInfo: DialogInfo = getDialogInfoFromAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo);
  dialogInfo.completionBotId = botAdaptiveCardDialogInfo.completionBotId;
  return dialogInfo;
}

export const storedMessages: string[] = [];

export function handleDialogMessage(message: string): void {
  if (!GlobalVars.frameContext) {
    // GlobalVars.frameContext is currently not set
    return;
  }

  if (GlobalVars.frameContext === FrameContexts.task) {
    storedMessages.push(message);
  } else {
    // Not in task FrameContext, remove 'messageForChild' handler
    removeHandler('messageForChild');
  }
}
