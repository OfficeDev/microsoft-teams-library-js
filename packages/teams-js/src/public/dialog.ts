/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from './constants';
import {
  AdaptiveCardDialogInfo,
  BotAdaptiveCardDialogInfo,
  BotUrlDialogInfo,
  DialogInfo,
  DialogSize,
  UrlDialogInfo,
} from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to interact with the dialog module-specific part of the SDK.
 *
 * @beta
 */
export namespace dialog {
  /**
   * Data Structure to represent the SDK response when dialog closes
   *
   * @beta
   */
  export interface ISdkResponse {
    /**
     * Error in case there is a failure before dialog submission
     */
    err?: string;

    /**
     * Value provided in the `result` parameter by the dialog when the {@linkcode submit} function
     * was called.
     * If the dialog was closed by the user without submitting (e.g., using a control in the corner
     * of the dialog), this value will be `undefined` here.
     */
    result?: string | object;
  }

  /**
   * Handler used to receive and process messages sent between a dialog and the app that launched it
   * @beta
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type PostMessageChannel = (message: any) => void;

  /**
   * Handler used for receiving results when a dialog closes, either the value passed by {@linkcode submit}
   * or an error if the dialog was closed by the user.
   * @beta
   */
  export type DialogSubmitHandler = (result: ISdkResponse) => void;
  const storedMessages: string[] = [];

  /**
   * @hidden
   * Hide from docs because this function is only used during initialization
   *
   * Adds register handlers for messageForChild upon initialization and only in the tasks FrameContext. {@link FrameContexts.task}
   * Function is called during app initialization
   * @internal
   * Limited to Microsoft-internal use
   *
   * @beta
   */
  export function initialize(): void {
    registerHandler('messageForChild', handleDialogMessage, false);
  }

  function handleDialogMessage(message: string): void {
    if (!GlobalVars.frameContext) {
      // GlobalVars.frameContext is currently not set
      return;
    }

    if (GlobalVars.frameContext === FrameContexts.task) {
      storedMessages.push(message);
    } else {
      // Not in task FrameContext, remove 'messageForChild' handler
      removeHandler('messageForChild');
    }
  }

  export namespace url {
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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (messageFromChildHandler) {
        registerHandler('messageForParent', messageFromChildHandler);
      }
      const dialogInfo: DialogInfo = getDialogInfoFromUrlDialogInfo(urlDialogInfo);
      sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
        submitHandler?.({ err, result });
        removeHandler('messageForParent');
      });
    }

    /**
     * Submit the dialog module and close the dialog
     *
     * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
     */
    export function submit(result?: string | object, appIds?: string | string[]): void {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.meetingStage);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
      sendMessageToParent('tasks.completeTask', [result, appIds ? (Array.isArray(appIds) ? appIds : [appIds]) : []]);
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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      // We need to remove the original 'messageForChild'
      // handler since the original does not allow for post messages.
      // It is replaced by the user specified listener that is passed in.
      removeHandler('messageForChild');
      registerHandler('messageForChild', listener);
      storedMessages.reverse();
      while (storedMessages.length > 0) {
        const message = storedMessages.pop();
        listener(message);
      }
    }

    /**
     * Checks if dialog.url module is supported by the host
     *
     * @returns boolean to represent whether dialog.url module is supported
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.url ? true : false) : false;
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
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }
        if (messageFromChildHandler) {
          registerHandler('messageForParent', messageFromChildHandler);
        }
        const dialogInfo: DialogInfo = getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo);

        sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
          submitHandler?.({ err, result });
          removeHandler('messageForParent');
        });
      }

      /**
       * Checks if dialog.url.bot capability is supported by the host
       *
       * @returns boolean to represent whether dialog.url.bot is supported
       */
      export function isSupported(): boolean {
        return runtime.supports.dialog
          ? runtime.supports.dialog.url
            ? runtime.supports.dialog.url.bot
              ? true
              : false
            : false
          : false;
      }
    }

    /**
     * @hidden
     *
     * Convert UrlDialogInfo to DialogInfo to send the information to host in {@linkcode open} API.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getDialogInfoFromUrlDialogInfo(urlDialogInfo: UrlDialogInfo): DialogInfo {
      const dialogInfo: DialogInfo = {
        url: urlDialogInfo.url,
        height: urlDialogInfo.size ? urlDialogInfo.size.height : DialogDimension.Small,
        width: urlDialogInfo.size ? urlDialogInfo.size.width : DialogDimension.Small,
        title: urlDialogInfo.title,
        fallbackUrl: urlDialogInfo.fallbackUrl,
      };
      return dialogInfo;
    }

    /**
     * @hidden
     *
     * Convert BotUrlDialogInfo to DialogInfo to send the information to host in {@linkcode bot.open} API.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo: BotUrlDialogInfo): DialogInfo {
      const dialogInfo: DialogInfo = {
        url: botUrlDialogInfo.url,
        height: botUrlDialogInfo.size ? botUrlDialogInfo.size.height : DialogDimension.Small,
        width: botUrlDialogInfo.size ? botUrlDialogInfo.size.width : DialogDimension.Small,
        title: botUrlDialogInfo.title,
        fallbackUrl: botUrlDialogInfo.fallbackUrl,
        completionBotId: botUrlDialogInfo.completionBotId,
      };
      return dialogInfo;
    }
  }

  /**
   * Checks if dialog module is supported by the host
   *
   * @returns boolean to represent whether dialog module is supported
   *
   * @beta
   */
  export function isSupported(): boolean {
    return runtime.supports.dialog ? true : false;
  }

  /**
   * Namespace to update the dialog
   *
   * @beta
   */
  export namespace update {
    /**
     * Update dimensions - height/width of a dialog.
     *
     * @param dimensions - An object containing width and height properties.
     *
     * @beta
     */
    export function resize(dimensions: DialogSize): void {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.task, FrameContexts.meetingStage);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent('tasks.updateTask', [dimensions]);
    }

    /**
     * Checks if dialog.update capability is supported by the host
     *
     * @returns boolean to represent whether dialog.update is supported
     *
     * @beta
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.update ? true : false) : false;
    }
  }

  /**
   * Subcapability for interacting with adaptive card dialogs
   * @beta
   */
  export namespace adaptiveCard {
    /**
     * Allows app to open an adaptive card based dialog.
     *
     * @remarks
     * This function cannot be called from inside of a dialog
     *
     * @param adaptiveCardDialogInfo - An object containing the parameters of the dialog module.
     * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
     */
    export function open(adaptiveCardDialogInfo: AdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void {
      ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      const dialogInfo: DialogInfo = getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo);
      sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
        submitHandler?.({ err, result });
      });
    }

    /**
     * Checks if dialog.adaptiveCard module is supported by the host
     *
     * @returns boolean to represent whether dialog.adaptiveCard module is supported
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog ? (runtime.supports.dialog.card ? true : false) : false;
    }

    /**
     * Namespace for interaction with adaptive card dialogs that need to communicate with the bot framework
     */
    export namespace bot {
      /**
       * Allows an app to open an adaptive card-based dialog module using bot.
       *
       * @param botAdaptiveCardDialogInfo - An object containing the parameters of the dialog module including completionBotId.
       * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
       *
       * @returns a function that can be used to send messages to the dialog.
       */
      export function open(
        botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo,
        submitHandler?: DialogSubmitHandler,
      ): void {
        ensureInitialized(FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
        if (!isSupported()) {
          throw errorNotSupportedOnPlatform;
        }

        const dialogInfo: DialogInfo = getDialogInfoFromBotAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo);

        sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
          submitHandler?.({ err, result });
        });
      }

      /**
       * Checks if dialog.adaptiveCard.bot capability is supported by the host
       *
       * @returns boolean to represent whether dialog.adaptiveCard.bot is supported
       */
      export function isSupported(): boolean {
        return runtime.supports.dialog
          ? runtime.supports.dialog.card
            ? runtime.supports.dialog.card.bot
              ? true
              : false
            : false
          : false;
      }
    }

    /**
     * @hidden
     * Hide from docs
     * --------
     * Convert AdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
     *
     * @internal
     */
    export function getDialogInfoFromAdaptiveCardDialogInfo(
      adaptiveCardDialogInfo: AdaptiveCardDialogInfo,
    ): DialogInfo {
      const dialogInfo: DialogInfo = {
        card: adaptiveCardDialogInfo.card,
        height: adaptiveCardDialogInfo.size ? adaptiveCardDialogInfo.size.height : DialogDimension.Small,
        width: adaptiveCardDialogInfo.size ? adaptiveCardDialogInfo.size.width : DialogDimension.Small,
        title: adaptiveCardDialogInfo.title,
      };
      return dialogInfo;
    }

    /**
     * @hidden
     * Hide from docs
     * --------
     * Convert BotAdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
     *
     * @internal
     */
    export function getDialogInfoFromBotAdaptiveCardDialogInfo(
      botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo,
    ): DialogInfo {
      const dialogInfo: DialogInfo = {
        card: botAdaptiveCardDialogInfo.card,
        height: botAdaptiveCardDialogInfo.size ? botAdaptiveCardDialogInfo.size.height : DialogDimension.Small,
        width: botAdaptiveCardDialogInfo.size ? botAdaptiveCardDialogInfo.size.width : DialogDimension.Small,
        title: botAdaptiveCardDialogInfo.title,
        completionBotId: botAdaptiveCardDialogInfo.completionBotId,
      };
      return dialogInfo;
    }
  }
}
