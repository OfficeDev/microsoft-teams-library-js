import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ActionOpenUrlError, ActionOpenUrlType, ActionSubmitError, IAdaptiveCardActionSubmit } from './interfaces';

/**
 * Updated to constants file: v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCardActionsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
export namespace externalAppCardActionsForCEA {
  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.OpenUrl request to the host for the application with the provided app ID.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for. This must be a UUID
   * @param conversationId To tell the bot what conversation the calls are coming from
   * @param url The URL to open
   * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
   */
  export function processActionOpenUrl(appId: string, conversationId: string, url: URL): Promise<ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));
    return sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl,
      ),
      'externalAppCardActionsForCEA.processActionOpenUrl',
      [appId, url.href, conversationId],
    ).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
        throw error;
      } else {
        return response;
      }
    });
  }

  /**
   * @beta
   * @hidden
   * Delegates an Adaptive Card Action.Submit request to the host for the application with the provided app ID
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application the request is intended for. This must be a UUID
   * @param conversationId To tell the bot what conversation the calls are coming from
   * @param actionSubmitPayload The Adaptive Card Action.Submit payload
   * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
   */
  export function processActionSubmit(
    appId: string,
    conversationId: string,
    actionSubmitPayload: IAdaptiveCardActionSubmit,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));
    return sendMessageToParentAsync<[boolean, ActionSubmitError]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit,
      ),
      'externalAppCardActionsForCEA.processActionSubmit',
      [appId, conversationId, actionSubmitPayload],
    ).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  /**
   * @hidden
   * Checks if the externalAppCardActionsForCEA capability is supported by the host
   * @returns boolean to represent whether externalAppCardActions capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActionsForCEA ? true : false;
  }
}
