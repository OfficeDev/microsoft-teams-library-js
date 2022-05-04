/* eslint-disable @typescript-eslint/ban-types */

import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ChildAppWindow, IAppWindow } from './appWindow';
import { FrameContexts, TaskModuleDimension } from './constants';
import { dialog } from './dialog';
import { BotUrlDialogInfo, DialogInfo, DialogSize, TaskInfo, UrlDialogInfo } from './interfaces';

/**
 * @deprecated
 * As of 2.0.0, please use {@link dialog} namespace instead.
 *
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 * The tasks namespace will be deprecated. Please use dialog for future developments.
 */
export namespace tasks {
  /**
   * @deprecated
   * As of 2.0.0, please use {@link dialog.open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): PostMessageChannel} for url based dialogs
   * and {@link dialog.bot.open(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): PostMessageChannel} for bot based dialogs.
   *
   * Allows an app to open the task module.
   *
   * @param taskInfo - An object containing the parameters of the task module
   * @param submitHandler - Handler to call when the task module is completed
   */
  export function startTask(
    taskInfo: TaskInfo,
    submitHandler?: (err: string, result: string | object) => void,
  ): IAppWindow {
    if (taskInfo.card !== undefined || taskInfo.url === undefined) {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      sendMessageToParent('tasks.startTask', [taskInfo as DialogInfo], submitHandler);
    } else if (taskInfo.completionBotId !== undefined) {
      dialog.bot.open(getBotUrlDialogInfoFromTaskInfo(taskInfo), (sdkResponse: dialog.ISdkResponse) =>
        submitHandler(sdkResponse.err, sdkResponse.result),
      );
    } else {
      dialog.open(getUrlDialogInfoFromTaskInfo(taskInfo), (sdkResponse: dialog.ISdkResponse) =>
        submitHandler(sdkResponse.err, sdkResponse.result),
      );
    }
    return new ChildAppWindow();
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link dialog.update.resize dialog.update.resize(dimensions: DialogSize): void} instead.
   *
   * Update height/width task info properties.
   *
   * @param taskInfo - An object containing width and height properties
   */
  export function updateTask(taskInfo: TaskInfo): void {
    taskInfo = getDefaultSizeIfNotProvided(taskInfo);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, height, ...extra } = taskInfo;

    if (Object.keys(extra).length) {
      throw new Error('resize requires a TaskInfo argument containing only width and height');
    }
    dialog.update.resize(taskInfo as DialogSize);
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link dialog.submit dialog.submit(result?: string | object, appIds?: string | string[]): void} instead.
   *
   * Submit the task module.
   *
   * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
   */
  export function submitTask(result?: string | object, appIds?: string | string[]): void {
    dialog.submit(result, appIds);
  }

  export function getUrlDialogInfoFromTaskInfo(taskInfo: TaskInfo): UrlDialogInfo {
    const urldialogInfo: UrlDialogInfo = {
      url: taskInfo.url,
      size: {
        height: taskInfo.height ? taskInfo.height : TaskModuleDimension.Small,
        width: taskInfo.width ? taskInfo.width : TaskModuleDimension.Small,
      },
      title: taskInfo.title,
      fallbackUrl: taskInfo.fallbackUrl,
    };
    return urldialogInfo;
  }

  export function getBotUrlDialogInfoFromTaskInfo(taskInfo: TaskInfo): BotUrlDialogInfo {
    const botUrldialogInfo: BotUrlDialogInfo = {
      url: taskInfo.url,
      size: {
        height: taskInfo.height ? taskInfo.height : TaskModuleDimension.Small,
        width: taskInfo.width ? taskInfo.width : TaskModuleDimension.Small,
      },
      title: taskInfo.title,
      fallbackUrl: taskInfo.fallbackUrl,
      completionBotId: taskInfo.completionBotId,
    };
    return botUrldialogInfo;
  }
  export function getDefaultSizeIfNotProvided(taskInfo: TaskInfo): TaskInfo {
    taskInfo.height = taskInfo.height ? taskInfo.height : TaskModuleDimension.Small;
    taskInfo.width = taskInfo.width ? taskInfo.width : TaskModuleDimension.Small;
    return taskInfo;
  }
}
