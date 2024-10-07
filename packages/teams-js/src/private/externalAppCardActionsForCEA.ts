import { sendAndUnwrap, sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { externalAppCardActions } from './externalAppCardActions';

/**
 * All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCardActionsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;
/**
 * @beta
 * @hidden
 * Namespace to delegate adaptive card action for Custom Engine Agent execution to the host
 * @internal
 * Limited to Microsoft-internal use
 */
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
   * @throws Error if the response has not successfully completed
   * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
   */
  export async function processActionOpenUrl(
    appId: AppId,
    conversationId: string,
    url: URL,
  ): Promise<externalAppCardActions.ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(conversationId, new Error('conversation id is not valid.'));
    const [error, response] = await sendMessageToParentAsync<
      [externalAppCardActions.ActionOpenUrlError, externalAppCardActions.ActionOpenUrlType]
    >(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl,
      ),
      ApiName.ExternalAppCardActionsForCEA_ProcessActionOpenUrl,
      [appId.toString(), conversationId, url.href],
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
   * @throws Error if host notifies of an error
   * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
   */
  export async function processActionSubmit(
    appId: AppId,
    conversationId: string,
    actionSubmitPayload: externalAppCardActions.IAdaptiveCardActionSubmit,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(conversationId, new Error('conversation id is not valid.'));
    const error = await sendAndUnwrap<externalAppCardActions.ActionSubmitError | undefined>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit,
      ),
      ApiName.ExternalAppCardActionsForCEA_ProcessActionSubmit,
      appId.toString(),
      conversationId,
      actionSubmitPayload,
    );
    if (error) {
      throw error;
    }
  }

  /**
   * @beta
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
