/* eslint-disable @typescript-eslint/ban-types */
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { dialog } from '../public/dialog';
import { DialogInfo, DialogSize, UrlDialogInfo } from '../public/interfaces';
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
