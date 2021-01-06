import { TaskInfo } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { IAppWindow, ChildAppWindow } from './appWindow';
import { Communication } from '../internal/communication';

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
  export function startTask(taskInfo: TaskInfo, submitHandler?: (err: string, result: string) => void): IAppWindow {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel);

    const messageId = sendMessageRequestToParent('tasks.startTask', [taskInfo]);
    Communication.callbacks[messageId] = submitHandler;
    return new ChildAppWindow();
  }

  /**
   * Update height/width task info properties.
   * @param taskInfo An object containing width and height properties
   */
  export function updateTask(taskInfo: TaskInfo): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task);
    const { width, height, ...extra } = taskInfo;

    if (!Object.keys(extra).length) {
      sendMessageRequestToParent('tasks.updateTask', [taskInfo]);
    } else {
      throw new Error('updateTask requires a taskInfo argument containing only width and height');
    }
  }

  /**
   * Submit the task module.
   * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
   */
  export function submitTask(result?: string | object, appIds?: string | string[]): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task);

    // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
    sendMessageRequestToParent('tasks.completeTask', [result, Array.isArray(appIds) ? appIds : [appIds]]);
  }
}
