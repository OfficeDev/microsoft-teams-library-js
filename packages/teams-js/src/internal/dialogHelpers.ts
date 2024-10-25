/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import * as dialog from '../public/dialog/dialog';
import { BotUrlDialogInfo, DialogInfo, DialogSize, UrlDialogInfo } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageToParent } from './communication';
import { registerHandler, removeHandler } from './handlers';
import { ApiName, ApiVersionNumber, getApiVersionTag } from './telemetry';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const dialogTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

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
