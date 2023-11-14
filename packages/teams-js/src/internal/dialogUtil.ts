/* eslint-disable @typescript-eslint/ban-types */
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { dialog } from '../public/dialog';
import { BotUrlDialogInfo, DialogInfo, DialogSize, UrlDialogInfo } from '../public/interfaces';
import { runtime } from '../public/runtime';
import { sendMessageToParentWithVersion } from './communication';
import { registerHandler, removeHandler } from './handlers';

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
  sendMessageToParentWithVersion(apiVersionTag, 'tasks.updateTask', [dimensions]);
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
    registerHandler('messageForParent', messageFromChildHandler);
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromUrlDialogInfo(urlDialogInfo);
  sendMessageToParentWithVersion(
    apiVersionTag,
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
      removeHandler('messageForParent');
    },
  );
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
    registerHandler('messageForParent', messageFromChildHandler);
  }
  const dialogInfo: DialogInfo = dialog.url.getDialogInfoFromBotUrlDialogInfo(urlDialogInfo);
  sendMessageToParentWithVersion(
    apiVersionTag,
    'tasks.startTask',
    [dialogInfo],
    (err: string, result: string | object) => {
      submitHandler?.({ err, result });
      removeHandler('messageForParent');
    },
  );
}

export function urlSubmitHelper(apiVersionTag: string, result?: string | object, appIds?: string | string[]): void {
  // FrameContext content should not be here because dialog.submit can be called only from inside of a dialog (FrameContext task)
  // but it's here because Teams mobile incorrectly returns FrameContext.content when calling app.getFrameContext().
  // FrameContexts.content will be removed once the bug is fixed.
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
  if (!dialog.url.isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
  sendMessageToParentWithVersion(apiVersionTag, 'tasks.completeTask', [
    result,
    appIds ? (Array.isArray(appIds) ? appIds : [appIds]) : [],
  ]);
}
