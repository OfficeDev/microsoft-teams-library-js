/**
 * @beta
 * @hidden
 * User information required by specific apps
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { callFunctionInHostAndHandleResponse } from '../../internal/communication';
import { registerHandlerHelper } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ResponseHandler } from '../../internal/responseHandler';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { FrameContexts } from '../../public/constants';
import { isSdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import {
  Content,
  PreCheckContextResponse,
  SidePanelError,
  SidePanelErrorCode,
  SidePanelErrorImpl,
} from './sidePanelInterfaces';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 * @returns boolean to represent whether copilot.sidePanel capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.copilot?.sidePanel;
}

/**
 * @beta
 * @hidden
 * Determines if the provided error object is an instance of SidePanelError
 * @internal
 * Limited to Microsoft-internal use
 * @param err The error object to check whether it is of SidePanelError type
 */
export function isSidePanelError(err: unknown): err is SidePanelError {
  if (typeof err !== 'object' || err === null) {
    return false;
  }

  const error = err as SidePanelError;

  return (
    (Object.values(SidePanelErrorCode).includes(error.errorCode as SidePanelErrorCode) &&
      (error.message === undefined || typeof error.message === 'string')) ||
    isSdkError(err) // If the error is an SdkError, it can be considered a SidePanelError
  );
}
/**
 * Get user content data from the hub to send to copilot app.
 *
 * @returns { Promise<Content> } - promise resolves with a content object containing user content data
 * @throws { SdkError } - Throws an SdkError if host SDK returns an error as a response to this call
 *
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export async function getContent(): Promise<Content> {
  ensureInitialized(runtime);
  const response = callFunctionInHostAndHandleResponse(
    ApiName.Copilot_SidePanel_GetContent,
    [],
    new GetContentResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_GetContent),
    isSidePanelError,
  );
  return response;
}

export async function preCheckUserConsent(): Promise<PreCheckContextResponse> {
  ensureInitialized(runtime);
  const response = callFunctionInHostAndHandleResponse(
    ApiName.Copilot_SidePanel_PreCheckUserConsent,
    [],
    new PreCheckContextResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_PreCheckUserConsent),
  );
  return response;
}

/** Register user action content select handler function type */
export type userActionHandlerType = (selectedContent: Content) => void;
/**
 * @hidden
 *
 * Registers a handler to get updated content data from the hub to send to copilot app.
 * This handler will be called when the user selects content in the application.
 * @param handler - The handler for getting user action content select.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerOnContentChangeHandler(handler: userActionHandlerType): void {
  registerHandlerHelper(
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_RegisterUserActionContentSelect),
    'copilot.sidePanel.userActionContentSelect',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw copilotSidePanelNotSupportedOnPlatformError;
      }
    },
  );
}

/** Register for user consent changes. Copilot app can only access the content of the page/data displayed in the hub, if the user has consented
 * to share the content with the copilot app.
 */
export type registerUserConsentPreCheckResponseType = (selectedContent: PreCheckContextResponse) => void;
/**
 * @hidden
 *
 * Registers a handler to get user consent changes.
 * This handler will be called when the user changes their consent in the hub.
 * @param handler - The handler for getting user consent changes.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerUserConsent(handler: registerUserConsentPreCheckResponseType): void {
  registerHandlerHelper(
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_RegisterOnUserConsentChange),
    'copilot.sidePanel.userConsentChange',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw copilotSidePanelNotSupportedOnPlatformError;
      }
    },
  );
}

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * Error thrown when the copilot side panel API is not supported on the current platform.
 */
export const copilotSidePanelNotSupportedOnPlatformError = new SidePanelErrorImpl(
  SidePanelErrorCode.NOT_SUPPORTED_ON_PLATFORM,
  'This API is not supported on the current platform.',
);
class GetContentResponseHandler extends ResponseHandler<Content, Content> {
  public validate(response: Content): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: Content): Content {
    return response;
  }
}

class PreCheckContextResponseHandler extends ResponseHandler<PreCheckContextResponse, PreCheckContextResponse> {
  public validate(response: PreCheckContextResponse): boolean {
    return response !== null && typeof response === 'object';
  }

  public deserialize(response: PreCheckContextResponse): PreCheckContextResponse {
    return response;
  }
}
