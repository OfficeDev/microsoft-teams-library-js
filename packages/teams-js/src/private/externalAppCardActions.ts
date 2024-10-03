import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ExternalAppErrorCode } from './constants';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCardActionsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * Namespace to delegate adaptive card action execution to the host
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace externalAppCardActions {
  /**
   * @hidden
   * The type of deeplink action that was executed by the host
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlType {
    DeepLinkDialog = 'DeepLinkDialog',
    DeepLinkOther = 'DeepLinkOther',
    DeepLinkStageView = 'DeepLinkStageView',
    GenericUrl = 'GenericUrl',
  }

  /**
   * @beta
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
   * and IExternalAppCardActionForCEAService.handleActionOpenUrl
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionOpenUrlError {
    errorCode: ActionOpenUrlErrorCode;
    message?: string;
  }

  /**
   * @beta
   * @hidden
   * Error codes that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
   * and IExternalAppCardActionForCEAService.handleActionOpenUrl
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum ActionOpenUrlErrorCode {
    INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
    INVALID_LINK = 'INVALID_LINK', // Deep link is invalid
    NOT_SUPPORTED = 'NOT_SUPPORTED', // Deep link is not supported
  }

  /**
   * @beta
   * @hidden
   * The payload that is used when executing an Adaptive Card Action.Submit
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IAdaptiveCardActionSubmit {
    id: string;
    data: string | Record<string, unknown>;
  }

  /**
   * @beta
   * @hidden
   * Error that can be thrown from IExternalAppCardActionService.handleActionSubmit
   * and IExternalAppCardActionForCEAService.handleActionSubmit
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface ActionSubmitError {
    errorCode: ExternalAppErrorCode;
    message?: string;
  }

  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.Submit request to the host for the application with the provided app ID
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for. This must be a UUID
   * @param actionSubmitPayload The Adaptive Card Action.Submit payload
   * @param cardActionsConfig The card actions configuration. This indicates which subtypes should be handled by this API
   * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
   */
  export function processActionSubmit(appId: string, actionSubmitPayload: IAdaptiveCardActionSubmit): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const typeSafeAppId: AppId = new AppId(appId);

    return sendMessageToParentAsync<[boolean, ActionSubmitError]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionSubmit,
      ),
      'externalAppCardActions.processActionSubmit',
      [typeSafeAppId.toString(), actionSubmitPayload],
    ).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.OpenUrl request to the host for the application with the provided app ID.
   * If `fromElement` is not provided, the information from the manifest is used to determine whether the URL can
   * be processed by the host. Deep link URLs for plugins are not supported and will result in an error.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for. This must be a UUID
   * @param url The URL to open
   * @param fromElement The element on behalf of which the M365 app is making the request.
   * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
   */
  export function processActionOpenUrl(
    appId: string,
    url: URL,
    fromElement?: { name: 'composeExtensions' | 'plugins' },
  ): Promise<ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const typeSafeAppId: AppId = new AppId(appId);
    return sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionOpenUrl,
      ),
      'externalAppCardActions.processActionOpenUrl',
      [typeSafeAppId.toString(), url.href, fromElement],
    ).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
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
