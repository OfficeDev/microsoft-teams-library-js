import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { externalAppCardActions } from './externalAppCardActions';

/**
 * Updated to constants file: v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const externalAppCardActionsTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

export namespace externalAppCardActionsForCEC {
  export function processActionOpenUrl(
    appId: string,
    conversationId: string,
    url: URL,
  ): Promise<externalAppCardActions.ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    return sendMessageToParentAsync<
      [externalAppCardActions.ActionOpenUrlError, externalAppCardActions.ActionOpenUrlType]
    >(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionOpenUrl,
      ),
      'externalAppCardActions.cec.processActionOpenUrl',
      [appId, url.href, conversationId],
    ).then(
      ([error, response]: [externalAppCardActions.ActionOpenUrlError, externalAppCardActions.ActionOpenUrlType]) => {
        if (error) {
          throw error;
        } else {
          return response;
        }
      },
    );
  }

  export function processActionSubmit(
    appId: string,
    conversationId: string,
    actionSubmitPayload: externalAppCardActions.IAdaptiveCardActionSubmit, // alternatively, we can move IAdaptiveCardActionSubmit to interface
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));

    return sendMessageToParentAsync<[boolean, externalAppCardActions.ActionSubmitError]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionSubmit,
      ),
      'externalAppCardActions.cec.processActionSubmit',
      [appId, conversationId, actionSubmitPayload],
    ).then(([wasSuccessful, error]: [boolean, externalAppCardActions.ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
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
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActionsForCEC ? true : false;
  }
}
