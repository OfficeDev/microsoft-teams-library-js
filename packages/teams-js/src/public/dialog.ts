/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { BotUrlDialogInfo, DialogSize, UrlDialogInfo } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @beta
 */
export namespace dialog {
  /**
   * Data Structure to represent the SDK response when dialog closes
   */
  export interface ISdkResponse {
    /**
     * Error in case there is a failure before dialog submission
     */
    err?: string;

    /**
     * Result value that the dialog is submitted with using {@linkcode submit} function
     *
     */
    result?: string | object;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PostMessageChannel = (message: any) => void;
  export type DialogSubmitHandler = (result: ISdkResponse) => void;
  const storedMessages: string[] = [];

  /**
   * @hidden
   * Hide from docs because this function is only used during initialization
   * ------------------
   * Adds register handlers for messageForChild upon initialization and only in the tasks FrameContext. {@link FrameContexts.task}
   * Function is called in {@link app.initializeHelper}
   * @internal
   */
  export function initialize(): void {
    ensureInitialized(FrameContexts.task);
    const dialogMessageHandler = (message: string): void => {
      storedMessages.push(message);
    };
    registerHandler('messageForChild', dialogMessageHandler, false);
  }

  /**
   * Allows app to open a url based dialog.
   *
   * @remarks
   * This function cannot be called from inside of a dialog
   *
   * @param urlDialogInfo - An object containing the parameters of the dialog module.
   * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
   * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
   *
   * @returns a function that can be used to send messages to the dialog.
   */
  export function open(
    urlDialogInfo: UrlDialogInfo,
    submitHandler?: DialogSubmitHandler,
    messageFromChildHandler?: PostMessageChannel,
  ): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

    if (messageFromChildHandler) {
      registerHandler('messageForParent', messageFromChildHandler);
    }
    sendMessageToParent('tasks.startTask', [urlDialogInfo], (err: string, result: string | object) => {
      submitHandler({ err, result });
      removeHandler('messageForParent');
    });
  }

  /**
   * Submit the dialog module.
   *
   * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
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
   *  Send message to the dialog from the parent
   *
   * @param message - The message to send
   */
  export function sendMessageToDialog(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    message: any,
  ): void {
    ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
    sendMessageToParent('messageForChild', [message]);
  }

  /**
   * Register a listener that will be triggered when a message is received from the app that opened the dialog.
   *
   * @remarks
   * This function is only called from inside of a dialog.
   *
   * @param listener - The listener that will be triggered.
   */
  export function registerOnMessageFromParent(listener: PostMessageChannel): void {
    ensureInitialized(FrameContexts.task);
    removeHandler('messageForChild');
    registerHandler('messageForChild', listener);
    storedMessages.reverse();
    while (storedMessages.length > 0) {
      const message = storedMessages.pop();
      listener(message);
    }
  }

  /**
   * Checks if dialog module is supported by the host
   *
   * @returns boolean to represent whether dialog module is supported
   */
  export function isSupported(): boolean {
    return runtime.supports.dialog ? true : false;
  }

  /**
   * Namespace to update the dialog
   */
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

    /**
     * Checks if dialog.update capability is supported by the host
     *
     * @returns boolean to represent whether dialog.update is supported
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.update ? true : false) : false;
    }
  }

  /**
   * Namespace to open a dialog that sends results to the bot framework
   */
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
    ): void {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);

      if (messageFromChildHandler) {
        registerHandler('messageForParent', messageFromChildHandler);
      }
      sendMessageToParent('tasks.startTask', [botUrlDialogInfo], (err: string, result: string | object) => {
        submitHandler({ err, result });
        removeHandler('messageForParent');
      });
    }

    /**
     * Checks if dialog.bot capability is supported by the host
     *
     * @returns boolean to represent whether dialog.bot is supported
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.bot ? true : false) : false;
    }
  }
}
