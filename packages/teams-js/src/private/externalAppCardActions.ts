import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { ActionOpenUrlError, ActionSubmitError, IAdaptiveCardActionSubmit } from './interfaces';

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
  export enum ActionOpenUrlType {
    DeepLinkDialog = 'DeepLinkDialog',
    DeepLinkOther = 'DeepLinkOther',
    DeepLinkStageView = 'DeepLinkStageView',
    GenericUrl = 'GenericUrl',
  }

  export function processActionSubmit(appId: string, actionSubmitPayload: IAdaptiveCardActionSubmit): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));

    return sendMessageToParentAsync<[boolean, ActionSubmitError]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionSubmit,
      ),
      'externalAppCardActions.processActionSubmit',
      [appId, actionSubmitPayload],
    ).then(([wasSuccessful, error]: [boolean, ActionSubmitError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function processActionOpenUrl(
    appId: string,
    url: URL,
    fromElement?: { name: 'composeExtensions' | 'plugins' },
  ): Promise<ActionOpenUrlType> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    return sendMessageToParentAsync<[ActionOpenUrlError, ActionOpenUrlType]>(
      getApiVersionTag(
        externalAppCardActionsTelemetryVersionNumber,
        ApiName.ExternalAppCardActions_ProcessActionOpenUrl,
      ),
      'externalAppCardActions.processActionOpenUrl',
      [appId, url.href, fromElement],
    ).then(([error, response]: [ActionOpenUrlError, ActionOpenUrlType]) => {
      if (error) {
        throw error;
      } else {
        return response;
      }
    });
  }

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppCardActions ? true : false;
  }
}
