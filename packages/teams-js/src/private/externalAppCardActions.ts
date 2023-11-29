import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace externalAppCardActions {
  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlType {
    DeepLinkOther,
    DeepLinkStageView,
    DeepLinkTaskModule,
    GenericUrl,
  }

  /**
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionOpenUrlError {
    errorCode: ActionOpenUrlErrorCode;
    message?: string;
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlErrorCode {
    INVALID_LINK, // Deep link is invalid
    NOT_SUPPORTED, // Deep link is not supported
    INTERNAL_ERROR, // Generic error
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IAdaptiveCardSubmitAction {
    id: string;
    data: Record<string, unknown>;
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ICardActionsConfig {
    // pulled from section 4.2
    enableImback: boolean;
    enableInvoke: boolean;
    enableDialog: boolean;
    enableStageView: boolean;
    enableSignIn: boolean;
    enableO365Submit: boolean;
  }

  /**
   *
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionSubmit
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionSubmitError {
    errorCode: ActionSubmitErrorCode;
    message?: string;
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionSubmitErrorCode {
    INTERNAL_ERROR, // Generic error
  }
  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function processActionSubmit(
    appId: string,
    actionSubmitPayload: IAdaptiveCardSubmitAction,
    cardActionsConfig?: ICardActionsConfig,
  ): Promise<void> {
    // TODO: what FrameContexts is this allowed from? Temporarily using the same FrameContexts as executeDeepLink
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    // TODO: confirm no issues with serialization and deserialization
    return sendMessageToParentAsync<[boolean, ActionSubmitError]>('externalAppCardActions.processActionSubmit', [
      appId,
      actionSubmitPayload,
      cardActionsConfig,
    ]).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        // TODO: update to new error types/confirm error codes
        throw error;
      }
    });
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function processActionOpenUrl(appId: string, url: string): Promise<ActionOpenUrlType> {
    // TODO: what FrameContexts is this allowed from? Temporarily using the same FrameContexts as executeDeepLink
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    // TODO: confirm no issues with deserialization
    return sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>('externalAppCardActions.processOpenUrl', [
      appId,
      url,
    ]).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
        // TODO: update to new error types/confirm error codes
        throw error;
      } else {
        return response;
      }
    });
  }

  /**
   * @hidden
   * Checks if the externalAppCardActions capability is supported by the host
   * @returns boolean to represent whether externalAppCardActions capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActions ? true : false;
  }
}
