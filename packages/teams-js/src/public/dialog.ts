/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { sendAndHandleSdkError, sendMessageToParent } from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { DialogDimension, errorNotSupportedOnPlatform, FrameContexts, minAdaptiveCardVersion } from './constants';
import {
  AdaptiveCardDialogInfo,
  AdaptiveCardVersion,
  BotAdaptiveCardDialogInfo,
  BotUrlDialogInfo,
  DialogInfo,
  DialogSize,
  ErrorCode,
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
   * Function is called during app intitialization
   * @internal
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

  /**
   * Submit the dialog module.
   *
   * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
   * @param appIds - Helps to validate that the call originates from the same appId as the one that invoked the task module
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
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
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
   * @hidden
   * Hide from docs
   * --------
   * Convert UrlDialogInfo to DialogInfo to send the information to host in {@linkcode url.open} API.
   *
   * @internal
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
   * Hide from docs
   * --------
   * Convert AdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
   *
   * @internal
   */
  export function getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo: AdaptiveCardDialogInfo): DialogInfo {
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
   * Convert BotUrlDialogInfo to DialogInfo to send the information to host in {@linkcode url.bot.open} API.
   *
   * @internal
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

  /**
   * @hidden
   * Hide from docs
   * --------
   * Convert AdaptiveCardDialogInfo to DialogInfo to send the information to host in {@linkcode adaptiveCard.open} API.
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

  /**
   * Subcapability for interacting with adaptive card dialogs
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

      getVersion().then(hostVersion => {
        validateMinimumAdaptiveCardVersion(hostVersion);

        const dialogInfo: DialogInfo = getDialogInfoFromAdaptiveCardDialogInfo(adaptiveCardDialogInfo);
        sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
          submitHandler?.({ err, result });
        });
      });
    }

    /**
     * Query the host to see what version of the AdaptiveCard schema they support
     *
     * @returns a Promise containing the {@linkcode AdaptiveCardVersion}, describing what version of the AdaptiveCard
     * schema the host supports
     */
    export function getVersion(): Promise<AdaptiveCardVersion> {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      return sendAndHandleSdkError('adaptiveCard.version');
    }

    function validateMinimumAdaptiveCardVersion(hostVersion: AdaptiveCardVersion): void {
      if (
        hostVersion.majorVersion < minAdaptiveCardVersion.majorVersion ||
        (hostVersion.majorVersion === minAdaptiveCardVersion.majorVersion &&
          hostVersion.minorVersion < minAdaptiveCardVersion.minorVersion)
      ) {
        throw {
          errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
          message: `Can not open adaptive card dialog because host adaptive card version is ${hostVersion.majorVersion}.${hostVersion.minorVersion}, but the minimum acceptable adaptive card version is ${minAdaptiveCardVersion.majorVersion}.${minAdaptiveCardVersion.minorVersion}`,
        };
      }
    }

    /**
     * Checks if dialog.adaptiveCard module is supported by the host
     *
     * @returns boolean to represent whether dialog.adaptiveCard module is supported
     */
    export function isSupported(): boolean {
      return runtime.supports.dialog && runtime.supports.dialog.adaptiveCard && runtime.supports.adaptiveCard
        ? true
        : false;
    }

    /**
     * Namespace for interaction with adaptive card dialogs that need to communicate with the bot framework
     */
    export namespace bot {
      /**
       * Allows an app to open a adaptive card-based dialog module using bot.
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

        getVersion().then(hostVersion => {
          validateMinimumAdaptiveCardVersion(hostVersion);

          const dialogInfo: DialogInfo = getDialogInfoFromBotAdaptiveCardDialogInfo(botAdaptiveCardDialogInfo);

          sendMessageToParent('tasks.startTask', [dialogInfo], (err: string, result: string | object) => {
            submitHandler?.({ err, result });
          });
        });
      }

      /**
       * Checks if dialog.adaptiveCard.bot capability is supported by the host
       *
       * @returns boolean to represent whether dialog.adaptiveCard.bot is supported
       */
      export function isSupported(): boolean {
        return runtime.supports.dialog &&
          runtime.supports.dialog.adaptiveCard &&
          runtime.supports.dialog.adaptiveCard.bot &&
          runtime.supports.adaptiveCard
          ? true
          : false;
      }
    }
  }

  /**
   * Namespace for interacting with url based dialogs
   */
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
      return runtime.supports.dialog && runtime.supports.dialog.url ? true : false;
    }

    /**
     * Namespace to open a dialog that sends results to the bot framework
     */
    export namespace bot {
      /**
       * Allows an app to open a url-based dialog module using bot.
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
       * Checks if dialog.bot capability is supported by the host
       *
       * @returns boolean to represent whether dialog.url.bot is supported
       */
      export function isSupported(): boolean {
        return runtime.supports.dialog && runtime.supports.dialog.url && runtime.supports.dialog.url.bot ? true : false;
      }
    }
  }
}
