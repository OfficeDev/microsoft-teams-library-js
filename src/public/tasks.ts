import { TaskInfo } from "./interfaces";
import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";

/**
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
export namespace tasks {

  /**
   * Allows an app to open the task module.
   * @param taskInfo An object containing the parameters of the task module
   * @param submitHandler Handler to call when the task module is completed
   */
  export function startTask(
    taskInfo: TaskInfo,
    submitHandler?: (err: string, result: string) => void
  ): void {
    ensureInitialized(frameContexts.content);

    const messageId = sendMessageRequest(GlobalVars.parentWindow, "tasks.startTask", [
      taskInfo
    ]);
    GlobalVars.callbacks[messageId] = submitHandler;
  }

  /**
   * Update height/width task info properties.
   * @param taskInfo An object containing width and height properties
   */
  export function updateTask(taskInfo: TaskInfo): void {
    ensureInitialized(frameContexts.content, frameContexts.task);
    const { width, height, ...extra } = taskInfo;

    if (!Object.keys(extra).length) {
      sendMessageRequest(GlobalVars.parentWindow, "tasks.updateTask", [taskInfo]);
    } else {
      throw new Error(
        "updateTask requires a taskInfo argument containing only width and height"
      );
    }
  }

  /**
   * Submit the task module.
   * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
   */
  export function submitTask(
    result?: string | object,
    appIds?: string | string[]
  ): void {
    ensureInitialized(frameContexts.content, frameContexts.task);

    // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
    sendMessageRequest(GlobalVars.parentWindow, "tasks.completeTask", [
      result,
      Array.isArray(appIds) ? appIds : [appIds]
    ]);
  }
}