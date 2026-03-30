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
import { ISerializable } from '../../public';
import { FrameContexts } from '../../public/constants';
import { isSdkError, SdkError } from '../../public/interfaces';
import { runtime } from '../../public/runtime';
import {
  Content,
  ContentRequest,
  PreCheckContextResponse,
  SidePanelError,
  SidePanelErrorCode,
  SidePanelErrorImpl,
  UserConsentRequest,
} from './sidePanelInterfaces';

const copilotTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
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
 * Determines if the provided error object is an instance of SidePanelError or SdkError.
 * @internal
 * Limited to Microsoft-internal use
 * @param err The error object to check whether it is of SidePanelError type
 */
export function isResponseAReportableError(err: unknown): err is SidePanelError | SdkError {
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
 * @throws { SidePanelError | SdkError } - Throws a SidePanelError or SdkError if host SDK returns an error as a response to this call
 *
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 */
export async function getContent(request?: ContentRequest): Promise<Content> {
  ensureInitialized(runtime);
  const input = request ? [new SerializableContentRequest(request)] : [];
  return callFunctionInHostAndHandleResponse(
    ApiName.Copilot_SidePanel_GetContent,
    input,
    new GetContentResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_GetContent),
    isResponseAReportableError,
  );
}

/**
 * When the copilot detects a contextual query it gets the user consent status before making the getContent call.
 *
 * @returns { Promise<PreCheckContextResponse> } - promise resolves with a content object containing user content data
 * @throws { SidePanelError | SdkError } - Throws a SidePanelError or SdkError if host SDK returns an error as a response to this call
 *
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 */
export async function preCheckUserConsent(request?: UserConsentRequest): Promise<PreCheckContextResponse> {
  ensureInitialized(runtime);
  const input = request ? [new SerializableUserConsentRequest(request)] : [];
  return callFunctionInHostAndHandleResponse(
    ApiName.Copilot_SidePanel_PreCheckUserConsent,
    input,
    new PreCheckContextResponseHandler(),
    getApiVersionTag(copilotTelemetryVersionNumber, ApiName.Copilot_SidePanel_PreCheckUserConsent),
    isResponseAReportableError,
  );
}

/** Register user action content select handler function type */
export type userActionHandlerType = (selectedContent: Content) => void;
/**
 * @hidden
 * @beta
 * Registers a handler to get updated content data from the hub to send to copilot app.
 * This handler will be called when the user selects content in the application.
 * @param handler - The handler for getting user action content select.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerUserActionContentSelect(handler: userActionHandlerType): void {
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

/**
 * @hidden
 * @beta
 * @internal
 * Limited to Microsoft-internal use
 *
 * Error thrown when the copilot side panel API is not supported on the current platform.
 */
export const copilotSidePanelNotSupportedOnPlatformError = new SidePanelErrorImpl(
  SidePanelErrorCode.NotSupportedOnPlatform,
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

class SerializableContentRequest implements ISerializable {
  public constructor(private contentRequest: ContentRequest) {}
  public serialize(): object {
    return this.contentRequest;
  }
}

class SerializableUserConsentRequest implements ISerializable {
  public constructor(private userConsentRequest: UserConsentRequest) {}
  public serialize(): object {
    return this.userConsentRequest;
  }
}
