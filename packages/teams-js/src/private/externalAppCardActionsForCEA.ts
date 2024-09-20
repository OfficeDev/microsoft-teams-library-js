import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { AppId } from '../public';
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
  export async function processActionOpenUrl(
    appId: AppId,
    conversationId: string,
    url: URL,
  ): Promise<ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(conversationId, new Error('conversation id is not valid.'));
    const [error, response] = await sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl,
      ),
      ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl,
      [appId, url.href, conversationId],
    );
    if (error) {
      throw error;
    } else {
      return response;
    }
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
  export async function processActionSubmit(
    appId: AppId,
    conversationId: string,
    actionSubmitPayload: IAdaptiveCardActionSubmit,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(conversationId, new Error('conversation id is not valid.'));
    const error = await sendMessageToParentAsync<ActionSubmitError | undefined>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit,
      ),
      ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit,
      [appId, conversationId, actionSubmitPayload],
    );
    console.log('HERE    ', error);
    if (error && (!Array.isArray(error) || error.length > 0) && error[0]) {
      throw error[0];
    }
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
