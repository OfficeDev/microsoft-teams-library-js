/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ChildAppWindow, IAppWindow } from './appWindow';
import { FrameContexts } from './constants';
import { DialogInfo } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @privateRemarks
 * This object is usable only on the content frame.
 *
 * @beta
 */
export namespace dialog {
  /**
   * Allows an app to open the dialog module.
   *
   * @param dialogInfo - An object containing the parameters of the dialog module
   * @param submitHandler - Handler to call when the task module is completed
   */
  export function open(dialogInfo: DialogInfo, submitHandler?: (err: string, result: string) => void): IAppWindow {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

    sendMessageToParent('tasks.startTask', [dialogInfo], submitHandler);
    return new ChildAppWindow();
  }

  /**
   * Update height/width dialog info properties.
   *
   * @param dialogInfo - An object containing width and height properties
   */
  export function resize(dialogInfo: DialogInfo): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.meetingStage);
    const { width, height, ...extra } = dialogInfo;

    if (!Object.keys(extra).length) {
      sendMessageToParent('tasks.updateTask', [dialogInfo]);
    } else {
      throw new Error('resize requires a dialogInfo argument containing only width and height');
    }
  }

  /**
   * Submit the dialog module.
   *
   * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
   */
  export function submit(result?: string | object, appIds?: string | string[]): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.meetingStage);

    /**
     * @privateRemarks
     * Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
     */
    sendMessageToParent('tasks.completeTask', [result, Array.isArray(appIds) ? appIds : [appIds]]);
  }

  export function isSupported(): boolean {
    return runtime.supports.dialog ? true : false;
  }
}
