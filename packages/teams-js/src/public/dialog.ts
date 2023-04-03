/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendMessageToParent } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { isHostAdaptiveCardSchemaVersionUnsupported } from '../internal/utils';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts } from './constants';
import {
  AdaptiveCardDialogInfo,
  BotAdaptiveCardDialogInfo,
  BotUrlDialogInfo,
  DialogInfo,
  DialogSize,
  M365ContentAction,
  TaskInfo,
  UrlDialogInfo,
} from './interfaces';
import { runtime } from './runtime';

/**
 * This group of capabilities enables apps to show modal dialogs. There are two primary types of dialogs: URL-based dialogs and [Adaptive Card](https://learn.microsoft.com/adaptive-cards/) dialogs.
 * Both types of dialogs are shown on top of your app, preventing interaction with your app while they are displayed.
 * - URL-based dialogs allow you to specify a URL from which the contents will be shown inside the dialog.
 *   - For URL dialogs, use the functions and interfaces in the {@link dialog.url} namespace.
 * - Adaptive Card-based dialogs allow you to provide JSON describing an Adaptive Card that will be shown inside the dialog.
 *   - For Adaptive Card dialogs, use the functions and interfaces in the {@link dialog.adaptiveCard} namespace.
 *
 * @remarks Note that dialogs were previously called "task modules". While they have been renamed for clarity, the functionality has been maintained.
 * For more details, see [Dialogs](https://learn.microsoft.com/microsoftteams/platform/task-modules-and-cards/what-are-task-modules)
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
     * Value provided in the `result` parameter by the dialog when the {@linkcode url.submit} function
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
   * Handler used for receiving results when a dialog closes, either the value passed by {@linkcode url.submit}
   * or an error if the dialog was closed by the user.
   *
   * @see {@linkcode ISdkResponse}
   *
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
     * @beta
     */
    export function open(
      urlDialogInfo: UrlDialogInfo,
      submitHandler?: DialogSubmitHandler,
      messageFromChildHandler?: PostMessageChannel,
    ): void {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
     * @remarks
     * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
     *
     * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it,
     *  If this function is called from a dialog while {@link M365ContentAction} is set in the context object by the host, result will be ignored
     *
     * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
     *
     * @beta
     */
    export function submit(result?: string | object, appIds?: string | string[]): void {
      // FrameContext content should not be here because dialog.submit can be called only from inside of a dialog (FrameContext task)
      // but it's here because Teams mobile incorrectly returns FrameContext.content when calling app.getFrameContext().
      // FrameContexts.content will be removed once the bug is fixed.
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      // Send tasks.completeTask instead of tasks.submitTask message for backward compatibility with Mobile clients
      sendMessageToParent('tasks.completeTask', [result, appIds ? (Array.isArray(appIds) ? appIds : [appIds]) : []]);
    }

    /**
     *  Send message to the parent from dialog
     *
     * @remarks
     * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
     *
     * @param message - The message to send to the parent
     *
     * @beta
     */
    export function sendMessageToParentFromDialog(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: any,
    ): void {
      ensureInitialized(runtime, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      sendMessageToParent('messageForParent', [message]);
    }

    /**
     *  Send message to the dialog from the parent
     *
     * @param message - The message to send
     *
     * @beta
     */
    export function sendMessageToDialog(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message: any,
    ): void {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      sendMessageToParent('messageForChild', [message]);
    }

    /**
     * Register a listener that will be triggered when a message is received from the app that opened the dialog.
     *
     * @remarks
     * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
     *
     * @param listener - The listener that will be triggered.
     *
     * @beta
     */
    export function registerOnMessageFromParent(listener: PostMessageChannel): void {
      ensureInitialized(runtime, FrameContexts.task);
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
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && (runtime.supports.dialog && runtime.supports.dialog.url) !== undefined;
    }

    /**
     * Namespace to open a dialog that sends results to the bot framework
     *
     * @beta
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
       *
       * @beta
       */
      export function open(
        botUrlDialogInfo: BotUrlDialogInfo,
        submitHandler?: DialogSubmitHandler,
        messageFromChildHandler?: PostMessageChannel,
      ): void {
        ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
       *
       * @throws Error if {@linkcode app.initialize} has not successfully completed
       *
       * @beta
       */
      export function isSupported(): boolean {
        return (
          ensureInitialized(runtime) &&
          (runtime.supports.dialog && runtime.supports.dialog.url && runtime.supports.dialog.url.bot) !== undefined
        );
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
      const dialogInfo: DialogInfo = getDialogInfoFromUrlDialogInfo(botUrlDialogInfo);
      dialogInfo.completionBotId = botUrlDialogInfo.completionBotId;
      return dialogInfo;
    }
  }

  /**
   * This function currently serves no purpose and should not be used. All functionality that used
   * to be covered by this method is now in subcapabilities and those isSupported methods should be
   * used directly.
   *
   * @hidden
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.dialog ? true : false;
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
      ensureInitialized(
        runtime,
        FrameContexts.content,
        FrameContexts.sidePanel,
        FrameContexts.task,
        FrameContexts.meetingStage,
      );
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      sendMessageToParent('tasks.updateTask', [dimensions]);
    }

    /**
     * Checks if dialog.update capability is supported by the host
     * @returns boolean to represent whether dialog.update capabilty is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) && runtime.supports.dialog
        ? runtime.supports.dialog.update
          ? true
          : false
        : false;
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
     * @param adaptiveCardDialogInfo - An object containing the parameters of the dialog module {@link AdaptiveCardDialogInfo}.
     * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode url.submit} function or when the user closes the dialog.
     *
     * @beta
     */
    export function open(adaptiveCardDialogInfo: AdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    export function isSupported(): boolean {
      const isAdaptiveCardVersionSupported =
        runtime.hostVersionsInfo &&
        runtime.hostVersionsInfo.adaptiveCardSchemaVersion &&
        !isHostAdaptiveCardSchemaVersionUnsupported(runtime.hostVersionsInfo.adaptiveCardSchemaVersion);
      return (
        ensureInitialized(runtime) &&
        (isAdaptiveCardVersionSupported && runtime.supports.dialog && runtime.supports.dialog.card) !== undefined
      );
    }

    /**
     * Namespace for interaction with adaptive card dialogs that need to communicate with the bot framework
     *
     * @beta
     */
    export namespace bot {
      /**
       * Allows an app to open an adaptive card-based dialog module using bot.
       *
       * @param botAdaptiveCardDialogInfo - An object containing the parameters of the dialog module including completionBotId.
       * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
       *
       * @beta
       */
      export function open(
        botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo,
        submitHandler?: DialogSubmitHandler,
      ): void {
        ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
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
       *
       * @throws Error if {@linkcode app.initialize} has not successfully completed
       *
       * @beta
       */
      export function isSupported(): boolean {
        const isAdaptiveCardVersionSupported =
          runtime.hostVersionsInfo &&
          runtime.hostVersionsInfo.adaptiveCardSchemaVersion &&
          !isHostAdaptiveCardSchemaVersionUnsupported(runtime.hostVersionsInfo.adaptiveCardSchemaVersion);
        return (
          ensureInitialized(runtime) &&
          (isAdaptiveCardVersionSupported &&
            runtime.supports.dialog &&
            runtime.supports.dialog.card &&
            runtime.supports.dialog.card.bot) !== undefined
        );
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
      const dialogInfo: DialogInfo = getDialogInfoFromAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo);
      dialogInfo.completionBotId = botAdaptiveCardDialogInfo.completionBotId;
      return dialogInfo;
    }

    /**
     * @hidden
     * Converts {@link TaskInfo} to {@link AdaptiveCardDialogInfo}
     * @param taskInfo - TaskInfo object to convert
     * @returns - converted AdaptiveCardDialogInfo
     */
    export function getAdaptiveCardDialogInfoFromTaskInfo(taskInfo: TaskInfo): AdaptiveCardDialogInfo {
      // eslint-disable-next-line strict-null-checks/all
      const adaptiveCardDialogInfo: AdaptiveCardDialogInfo = {
        card: taskInfo.card,
        size: {
          height: taskInfo.height ? taskInfo.height : DialogDimension.Small,
          width: taskInfo.width ? taskInfo.width : DialogDimension.Small,
        },
        title: taskInfo.title,
      };

      return adaptiveCardDialogInfo;
    }

    /**
     * @hidden
     * Converts {@link TaskInfo} to {@link BotAdaptiveCardDialogInfo}
     * @param taskInfo - TaskInfo object to convert
     * @returns - converted BotAdaptiveCardDialogInfo
     */
    export function getBotAdaptiveCardDialogInfoFromTaskInfo(taskInfo: TaskInfo): BotAdaptiveCardDialogInfo {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      const botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo = {
        card: taskInfo.card,
        size: {
          height: taskInfo.height ? taskInfo.height : DialogDimension.Small,
          width: taskInfo.width ? taskInfo.width : DialogDimension.Small,
        },
        title: taskInfo.title,
        completionBotId: taskInfo.completionBotId,
      };

      return botAdaptiveCardDialogInfo;
    }
  }
}
