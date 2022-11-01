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
   * As of 2.0.0, please use {@link dialog.url.open dialog.url.open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void} for url based dialogs
   * and {@link dialog.url.bot.open dialog.url.bot.open(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void} for bot based dialogs. In Teams,
   * this function can be used for adaptive card based dialogs. Support for adaptive card based dialogs is coming to other hosts in the future.
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
    const dialogSubmitHandler = submitHandler
      ? /* eslint-disable-next-line strict-null-checks/all */ /* fix tracked by 5730662 */
        (sdkResponse: dialog.ISdkResponse) => submitHandler(sdkResponse.err, sdkResponse.result)
      : undefined;
    if (taskInfo.card === undefined && taskInfo.url === undefined) {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      sendMessageToParent('tasks.startTask', [taskInfo as DialogInfo], submitHandler);
    } else if (taskInfo.completionBotId !== undefined && taskInfo.card) {
      dialog.adaptiveCard.bot.open(
        dialog.adaptiveCard.getBotAdaptiveCardDialogInfoFromTaskInfo(taskInfo),
        dialogSubmitHandler,
      );
    } else if (taskInfo.card) {
      dialog.adaptiveCard.open(
        dialog.adaptiveCard.getAdaptiveCardDialogInfoFromTaskInfo(taskInfo),
        dialogSubmitHandler,
      );
    } else if (taskInfo.completionBotId !== undefined) {
      dialog.url.bot.open(getBotUrlDialogInfoFromTaskInfo(taskInfo), dialogSubmitHandler);
    } else {
      dialog.url.open(getUrlDialogInfoFromTaskInfo(taskInfo), dialogSubmitHandler);
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
   * As of 2.0.0, please use {@link dialog.submit} instead.
   *
   * Submit the task module.
   *
   * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
   */
  export function submitTask(result?: string | object, appIds?: string | string[]): void {
    dialog.url.submit(result, appIds);
  }

  /**
   * Converts {@link TaskInfo} to {@link UrlDialogInfo}
   * @param taskInfo - TaskInfo object to convert
   * @returns - Converted UrlDialogInfo object
   */
  function getUrlDialogInfoFromTaskInfo(taskInfo: TaskInfo): UrlDialogInfo {
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
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

  /**
   * Converts {@link TaskInfo} to {@link BotUrlDialogInfo}
   * @param taskInfo - TaskInfo object to convert
   * @returns - converted BotUrlDialogInfo object
   */
  function getBotUrlDialogInfoFromTaskInfo(taskInfo: TaskInfo): BotUrlDialogInfo {
    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
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

  /**
   * Sets the height and width of the {@link TaskInfo} object to the original height and width, if initially specified,
   * otherwise uses the height and width values corresponding to {@link TaskModuleDimension | TaskModuleDimension.Small}
   * @param taskInfo TaskInfo object from which to extract size info, if specified
   * @returns TaskInfo with height and width specified
   */
  export function getDefaultSizeIfNotProvided(taskInfo: TaskInfo): TaskInfo {
    taskInfo.height = taskInfo.height ? taskInfo.height : TaskModuleDimension.Small;
    taskInfo.width = taskInfo.width ? taskInfo.width : TaskModuleDimension.Small;
    return taskInfo;
  }
}
