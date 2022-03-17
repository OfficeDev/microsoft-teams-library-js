/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { BotUrlDialogInfo, DialogInfo, UrlDialogInfo } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @remarks
 * This object is usable only on the content frame.
 *
 * @beta
 */
export interface SdkResponse {
  err: string;
  result: string | object;
}

export namespace dialog {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PostMessageChannel = (message: any, onComplete?: (status: boolean, reason?: string) => void) => void;
  export type DialogSubmitHandler = (result: SdkResponse) => void;
  /**
   * Allows an app to open the dialog module.
   *
   * @param urlDialogInfo - An object containing the parameters of the dialog module
   * @param submitHandler - Handler to call when the task module is completed
   * @param messageFromChildHandler - Handler that triggers if dialog tries to send a message to the app.
   *
   * @returns a Handler that is triggerd to send a message to the dialog.
   */
  export function open(
    urlDialogInfo: UrlDialogInfo,
    submitHandler?: DialogSubmitHandler,
    messageFromChildHandler?: PostMessageChannel,
  ): PostMessageChannel {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

    if (messageFromChildHandler) {
      registerHandler('messageForParent', messageFromChildHandler);
    }

    sendMessageToParent('tasks.startTask', [urlDialogInfo], (err: string, result: string | object) => {
      submitHandler({ err, result });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessageToDialog = (message: any, onComplete?: (status: boolean, reason?: string) => void): void => {
      sendMessageToParent('messageForChild', [message], onComplete ? onComplete : getGenericOnCompleteHandler());
    };
    return sendMessageToDialog;
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

    // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
    sendMessageToParent('tasks.completeTask', [result, Array.isArray(appIds) ? appIds : [appIds]]);
  }

  export function isSupported(): boolean {
    return runtime.supports.dialog ? true : false;
  }
  export namespace bot {
    export function open(
      botUrlDialogInfo: BotUrlDialogInfo,
      submitHandler?: DialogSubmitHandler,
      messageFromChildHandler?: PostMessageChannel,
    ): PostMessageChannel {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

      if (messageFromChildHandler) {
        registerHandler('messageForParent', messageFromChildHandler);
      }

      sendMessageToParent('tasks.startTask', [botUrlDialogInfo], (err: string, result: string | object) => {
        submitHandler({ err, result });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sendMessageToDialog = (message: any, onComplete?: (status: boolean, reason?: string) => void): void => {
        sendMessageToParent('messageForChild', [message], onComplete ? onComplete : getGenericOnCompleteHandler());
      };
      return sendMessageToDialog;
    }
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.bot ? true : false) : false;
    }
  }
}
