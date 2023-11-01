/* eslint-disable @typescript-eslint/ban-types */
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { dialog } from '../public/dialog';
import { BotUrlDialogInfo, DialogInfo, DialogSize, UrlDialogInfo } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageToParentWithVersion } from './communication';
import { registerHandler, removeHandler } from './handlers';

export function updateResizeHelper(dimensions: DialogSize, apiVersion = 'v1'): void {
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
  sendMessageToParentWithVersion(apiVersion, 'tasks.updateTask', [dimensions]);
}

export function urlOpenHelper(
  urlDialogInfo: UrlDialogInfo,
  submitHandler?: dialog.DialogSubmitHandler,
  messageFromChildHandler?: dialog.PostMessageChannel,
  apiVersion = 'v1',
): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!dialog.url.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (messageFromChildHandler) {
    registerHandler('messageForParent', messageFromChildHandler);
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromUrlDialogInfo(urlDialogInfo);
  sendMessageToParentWithVersion(
    apiVersion,
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
      removeHandler('messageForParent');
    },
  );
}

export function botUrlOpenHelper(
  urlDialogInfo: BotUrlDialogInfo,
  submitHandler?: dialog.DialogSubmitHandler,
  messageFromChildHandler?: dialog.PostMessageChannel,
  apiVersion = 'v1',
): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!dialog.url.bot.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (messageFromChildHandler) {
    registerHandler('messageForParent', messageFromChildHandler);
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromBotUrlDialogInfo(urlDialogInfo);
  sendMessageToParentWithVersion(
    apiVersion,
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
      removeHandler('messageForParent');
    },
  );
}

export function urlSubmitHelper(result?: string | object, appIds?: string | string[], apiVersion = 'v1'): void {
  // FrameContext content should not be here because dialog.submit can be called only from inside of a dialog (FrameContext task)
  // but it's here because Teams mobile incorrectly returns FrameContext.content when calling app.getFrameContext().
  // FrameContexts.content will be removed once the bug is fixed.
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!dialog.url.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
  sendMessageToParentWithVersion(apiVersion, 'tasks.completeTask', [
    result,
    appIds ? (Array.isArray(appIds) ? appIds : [appIds]) : [],
  ]);
}
