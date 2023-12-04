import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { authentication, FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * Namespace to delegate authentication and message extension requests to the host
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace externalAppAuthentication {
  /*********** BEGIN REQUEST TYPE ************/
  /**
   * @hidden
   * Information about the bot request that should be resent by the host
   * @internal
   * Limited to Microsoft-internal use
   */
  export type IOriginalRequestInfo = IQueryMessageExtensionRequest | IActionExecuteInvokeRequest;

  /**
   * @hidden
   * Information about the message extension request that should be resent by the host. Corresponds to request schema in https://learn.microsoft.com/en-us/microsoftteams/platform/resources/messaging-extension-v3/search-extensions#receive-user-requests
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IQueryMessageExtensionRequest {
    requestType: OriginalRequestType.QueryMessageExtensionRequest;
    commandId: string;
    parameters?: {
      name?: string;
      value?: string;
    }[];
    queryOptions?: {
      count: number;
      skip: number;
    };
  }

  /**
   * @hidden
   * Information about the Action.Execute request that should be resent by the host. Corresponds to schema in https://adaptivecards.io/explorer/Action.Execute.html
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IActionExecuteInvokeRequest {
    requestType: OriginalRequestType.ActionExecuteInvokeRequest;
    type: string; // This must be "Action.Execute"
    id: string; // The unique identifier associated with the action
    verb: string; // The card author defined verb associated with the action
    data: string | Record<string, unknown>;
  }

  /**
   * @hidden
   * This is the only allowed value for IActionExecuteInvokeRequest.type. Used for validation
   * @internal
   * Limited to Microsoft-internal use
   */
  const ActionExecuteInvokeRequestType = 'Action.Execute';

  /**
   * @hidden
   * Used to differentiate between IOriginalRequestInfo types
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum OriginalRequestType {
    ActionExecuteInvokeRequest = 'ActionExecuteInvokeRequest',
    QueryMessageExtensionRequest = 'QueryMessageExtensionRequest',
  }
  /*********** END REQUEST TYPE ************/

  /*********** BEGIN RESPONSE TYPE ************/
  /**
   * @hidden
   * The response from the bot returned via the host
   * @internal
   * Limited to Microsoft-internal use
   */
  export type IInvokeResponse = IQueryMessageExtensionResponse | IActionExecuteResponse;

  /**
   * @hidden
   * Used to differentiate between IInvokeResponse types
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum InvokeResponseType {
    ActionExecuteInvokeResponse = 'ActionExecuteInvokeResponse',
    QueryMessageExtensionResponse = 'QueryMessageExtensionResponse',
  }

  /**
   * @hidden
   * The response from the bot returned via the host for a message extension query request.
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IQueryMessageExtensionResponse {
    responseType: InvokeResponseType.QueryMessageExtensionResponse;
    composeExtension?: ComposeExtensionResponse;
  }

  /**
   * @hidden
   * The response from the bot returned via the host for an Action.Execute request.
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IActionExecuteResponse {
    responseType: InvokeResponseType.ActionExecuteInvokeResponse;
    value: Record<string, unknown>;
    signature?: string;
    statusCode: number;
    type: string;
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type ComposeExtensionResponse = {
    attachmentLayout: AttachmentLayout;
    type: ComposeResultTypes;
    attachments: QueryMessageExtensionAttachment[];
    suggestedActions?: QueryMessageExtensionSuggestedActions;
    text?: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type QueryMessageExtensionSuggestedActions = {
    actions?: Action[];
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type Action = {
    type: string;
    title: string;
    value: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type QueryMessageExtensionCard = {
    contentType: string;
    content: Record<string, unknown>;
    fallbackHtml?: string;
    signature?: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type QueryMessageExtensionAttachment = QueryMessageExtensionCard & {
    preview?: QueryMessageExtensionCard;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type AttachmentLayout = 'grid' | 'list';
  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type ComposeResultTypes = 'auth' | 'config' | 'message' | 'result' | 'silentAuth';
  /*********** END RESPONSE TYPE ************/

  /*********** BEGIN ERROR TYPE ***********/
  export interface InvokeError {
    errorCode: InvokeErrorCode;
    message?: string;
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum InvokeErrorCode {
    INTERNAL_ERROR = 'INTERNAL_ERROR', // Generic error
  }

  /**
   * @hidden
   * Wrapper to differentiate between InvokeError and IInvokeResponse response from host
   * @internal
   * Limited to Microsoft-internal use
   */
  type InvokeErrorWrapper = InvokeError & { responseType: undefined };
  /*********** END ERROR TYPE ***********/

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   * TODO - Add more validation here as we get more details on the allowed request schemas
   */
  function validateOriginalRequestInfo(originalRequestInfo: IOriginalRequestInfo): void {
    if (originalRequestInfo.requestType === OriginalRequestType.ActionExecuteInvokeRequest) {
      const actionExecuteRequest = originalRequestInfo as IActionExecuteInvokeRequest;
      if (actionExecuteRequest.type !== ActionExecuteInvokeRequestType) {
        const error: InvokeError = {
          errorCode: InvokeErrorCode.INTERNAL_ERROR,
          message: `Invalid action type ${actionExecuteRequest.type}. Action type must be "${ActionExecuteInvokeRequestType}"`,
        };
        throw error;
      }
    }
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform authentication using the given authentication parameters and then resend the request to the application specified by the app ID with the authentication result.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend to which the request and authentication response should be sent
   * @param authenticateParameters Parameters for the authentication pop-up
   * @param originalRequestInfo Information about the original request that should be resent
   * @returns A promise that resolves to the IInvokeResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export function authenticateAndResendRequest(
    appId: string,
    authenticateParameters: authentication.AuthenticatePopUpParameters,
    originalRequestInfo: IOriginalRequestInfo,
  ): Promise<IInvokeResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateOriginalRequestInfo(originalRequestInfo);

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync<[boolean, IInvokeResponse | InvokeErrorWrapper]>(
      'externalAppAuthentication.authenticateAndResendRequest',
      [
        appId,
        originalRequestInfo,
        authenticateParameters.url,
        authenticateParameters.width,
        authenticateParameters.height,
        authenticateParameters.isExternal,
      ],
    ).then(([wasSuccessful, response]: [boolean, IInvokeResponse | InvokeErrorWrapper]) => {
      if (wasSuccessful && response.responseType != null) {
        return response;
      } else {
        const error = response as InvokeError;
        throw error;
      }
    });
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform SSO authentication for the application specified by the app ID
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend for which the host should attempt SSO authentication
   * @param authTokenRequest Parameters for SSO authentication
   * @returns A promise that resolves when authentication and succeeds and rejects with InvokeError on failure
   */
  export function authenticateWithSSO(
    appId: string,
    authTokenRequest: authentication.AuthTokenRequestParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync('externalAppAuthentication.authenticateWithSSO', [
      appId,
      authTokenRequest.resources,
      authTokenRequest.claims,
      authTokenRequest.silent,
    ]).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform SSO authentication for the application specified by the app ID and then resend the request to the application backend with the authentication result
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend for which the host should attempt SSO authentication and resend the request and authentication response
   * @param authTokenRequest Parameters for SSO authentication
   * @param originalRequestInfo Information about the original request that should be resent
   * @returns A promise that resolves to the IInvokeResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export function authenticateWithSSOAndResendRequest(
    appId: string,
    authTokenRequest: authentication.AuthTokenRequestParameters,
    originalRequestInfo: IOriginalRequestInfo,
  ): Promise<IInvokeResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateOriginalRequestInfo(originalRequestInfo);

    return sendMessageToParentAsync<[boolean, IInvokeResponse | InvokeError]>(
      'externalAppAuthentication.authenticateWithSSOAndResendRequest',
      [appId, originalRequestInfo, authTokenRequest.resources, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([wasSuccessful, response]: [boolean, IInvokeResponse | InvokeErrorWrapper]) => {
      if (wasSuccessful && response.responseType != null) {
        return response;
      } else {
        const error = response as InvokeError;
        throw error;
      }
    });
  }

  /**
   * @hidden
   * Checks if the externalAppAuthentication capability is supported by the host
   * @returns boolean to represent whether externalAppAuthentication capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppAuthentication ? true : false;
  }
}
