/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { BotUrlDialogInfo, DialogInfo, DialogSize, UrlDialogInfo } from './interfaces';
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
  /**
   * Error in case there is a failure before dialog submission
   */
  err?: string;

  /**
   * Result value that the dialog is submitted with
   */
  result?: string | object;
}

export namespace dialog {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PostMessageChannel = (message: any) => void;
  export type DialogSubmitHandler = (result: SdkResponse) => void;
  /**
   * Allows an app to open the dialog module.
   *
   * @param urlDialogInfo - An object containing the parameters of the dialog module.
   * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
   * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
   *
   * @returns a function that can be used to send messages to the dialog.
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
      removeHandler('messageForParent');
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendMessageToDialog = (message: any): void => {
      sendMessageToParent('messageForChild', [message]);
    };
    return sendMessageToDialog;
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

  /**
   *  Send message to the parent from dialog
   *
   *  @remarks
   * This function is only called from inside of a dialog
   *
   * @param message - The message to send to the parent
   */
  export function sendMessageToParentFromDialog(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
  ): void {
    ensureInitialized(FrameContexts.task);
    sendMessageToParent('messageForParent', [message]);
  }

  /**
   * Register a listener that wil be triggerd when an event is received from the parent
   *
   * @remarks
   * This function is only called from inside of a dialog
   *
   * @param listener - The listener that will be triggered.
   */
  export function registerOnMessageFromParent(listener: PostMessageChannel): void {
    ensureInitialized();
    registerHandler('messageForChild', listener);
  }

  export function isSupported(): boolean {
    return runtime.supports.dialog ? true : false;
  }

  export namespace update {
    /**
     * Update dimensions - height/width of a dialog.
     *
     * @param dimensions - An object containing width and height properties.
     */
    export function resize(dimensions: DialogSize): void {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.meetingStage);
      sendMessageToParent('tasks.updateTask', [dimensions]);
    }
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.update ? true : false) : false;
    }
  }

  export namespace bot {
    /**
     * Allows an app to open the dialog module using bot.
     *
     * @param botUrlDialogInfo - An object containing the parameters of the dialog module including completionBotId.
     * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
     * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
     *
     * @returns a function that can be used to send messages to the dialog.
     */
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
        removeHandler('messageForParent');
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sendMessageToDialog = (message: any): void => {
        sendMessageToParent('messageForChild', [message]);
      };
      return sendMessageToDialog;
    }
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.bot ? true : false) : false;
    }
  }
}
