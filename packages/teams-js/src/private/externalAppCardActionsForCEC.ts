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
export namespace externalAppCardActionsForCEC {
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
        ApiName.ExternalAppCardActionsForCEC_ProcessActionOpenUrl,
      ),
      'externalAppCardActionsForCEC.processActionOpenUrl',
      [appId, url.href, conversationId],
    ).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
        throw error;
      } else {
        return response;
      }
    });
  }

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
        ApiName.ExternalAppCardActionsForCEC_ProcessActionSubmit,
      ),
      'externalAppCardActionsForCEC.processActionSubmit',
      [appId, conversationId, actionSubmitPayload],
    ).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActionsForCEC ? true : false;
  }
}
