/* eslint-disable @typescript-eslint/ban-types */

import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { ChildAppWindow, IAppWindow } from './appWindow';
import { FrameContexts, TaskModuleDimension } from './constants';
import { botUrlOpenHelper, updateResizeHelper, urlOpenHelper, urlSubmitHelper } from './dialog';
import { dialog } from './dialog';
import { BotUrlDialogInfo, DialogInfo, DialogSize, TaskInfo, UrlDialogInfo } from './interfaces';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const tasksTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link dialog} namespace instead.
 *
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 * The tasks namespace will be deprecated. Please use dialog for future developments.
 */
export namespace tasks {
  /**
   * Function type that is used to receive the result when a task module is submitted by
   * calling {@link tasks.submitTask tasks.submitTask(result?: string | object, appIds?: string | string[]): void}
   *
   * @param err - If the task module failed, this string contains the reason for failure. If the task module succeeded, this value is the empty string.
   * @param result - On success, this is the value passed to the `result` parameter of {@link tasks.submitTask tasks.submitTask(result?: string | object, appIds?: string | string[]): void}. On failure, this is the empty string.
   */
  export type startTaskSubmitHandlerFunctionType = (err: string, result: string | object) => void;

  /**
   * @deprecated
   * As of 2.8.0:
   * - For url-based dialogs, please use {@link dialog.url.open dialog.url.open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void} .
   * - For url-based dialogs with bot interaction, please use {@link dialog.url.bot.open dialog.url.bot.open(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void}
   * - For Adaptive Card-based dialogs:
   *   - In Teams, please continue to use this function until the new functions in {@link dialog.adaptiveCard} have been fully implemented. You can tell at runtime when they are implemented in Teams by checking
   *     the return value of the {@link dialog.adaptiveCard.isSupported} function. This documentation line will also be removed once they have been fully implemented in Teams.
   *   - In all other hosts, please use {@link dialog.adaptiveCard.open dialog.adaptiveCard.open(cardDialogInfo: CardDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void}
   *
   * Allows an app to open the task module.
   *
   * @param taskInfo - An object containing the parameters of the task module
   * @param submitHandler - Handler to call when the task module is completed
   */
  export function startTask(taskInfo: TaskInfo, submitHandler?: startTaskSubmitHandlerFunctionType): IAppWindow {
    const apiVersionTag: string = getApiVersionTag(tasksTelemetryVersionNumber, ApiName.Tasks_StartTask);
    const dialogSubmitHandler = submitHandler
      ? (sdkResponse: dialog.ISdkResponse) => submitHandler(sdkResponse.err ?? '', sdkResponse.result ?? '')
      : undefined;
    if (taskInfo.card === undefined && taskInfo.url === undefined) {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      sendMessageToParent(apiVersionTag, 'tasks.startTask', [taskInfo as DialogInfo], submitHandler);
    } else if (taskInfo.card) {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      sendMessageToParent(apiVersionTag, 'tasks.startTask', [taskInfo as DialogInfo], submitHandler);
    } else if (taskInfo.completionBotId !== undefined) {
      botUrlOpenHelper(apiVersionTag, getBotUrlDialogInfoFromTaskInfo(taskInfo), dialogSubmitHandler);
    } else {
      urlOpenHelper(apiVersionTag, getUrlDialogInfoFromTaskInfo(taskInfo), dialogSubmitHandler);
    }
    return new ChildAppWindow();
  }

  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link dialog.update.resize dialog.update.resize(dimensions: DialogSize): void} instead.
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
    updateResizeHelper(getApiVersionTag(tasksTelemetryVersionNumber, ApiName.Tasks_UpdateTask), taskInfo as DialogSize);
  }

  /**
   * @deprecated
   * As of 2.8.0, please use {@link dialog.url.submit} instead.
   *
   * Submit the task module.
   *
   * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
   */
  export function submitTask(result?: string | object, appIds?: string | string[]): void {
    urlSubmitHelper(getApiVersionTag(tasksTelemetryVersionNumber, ApiName.Tasks_SubmitTask), result, appIds);
  }

  /**
   * Converts {@link TaskInfo} to {@link UrlDialogInfo}
   * @param taskInfo - TaskInfo object to convert
   * @returns - Converted UrlDialogInfo object
   */
  function getUrlDialogInfoFromTaskInfo(taskInfo: TaskInfo): UrlDialogInfo {
    if (taskInfo.url === undefined) {
      throw new Error("url property of taskInfo object can't be undefined");
    }

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
    if (taskInfo.url === undefined || taskInfo.completionBotId === undefined) {
      throw new Error(
        `Both url ${taskInfo.url} and completionBotId ${taskInfo.completionBotId} are required for bot url dialog. At least one is undefined.`,
      );
    }

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
   * otherwise uses the height and width values corresponding to {@link DialogDimension | TaskModuleDimension.Small}
   * @param taskInfo TaskInfo object from which to extract size info, if specified
   * @returns TaskInfo with height and width specified
   */
  export function getDefaultSizeIfNotProvided(taskInfo: TaskInfo): TaskInfo {
    taskInfo.height = taskInfo.height ? taskInfo.height : TaskModuleDimension.Small;
    taskInfo.width = taskInfo.width ? taskInfo.width : TaskModuleDimension.Small;
    return taskInfo;
  }
}
