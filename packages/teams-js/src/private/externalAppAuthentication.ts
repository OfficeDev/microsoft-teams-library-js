import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { authentication, FrameContexts } from '../public';
import { errorNotSupportedOnPlatform } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use
 */
export namespace externalAppAuthentication {
  /*********** BEGIN REQUEST TYPE ************/
  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type IOriginalRequestInfo = IQueryMessageExtensionRequest | IActionExecuteInvokeRequest;

  /**
   * @hidden
   *
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
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IActionExecuteInvokeRequest {
    requestType: OriginalRequestType.ActionExecuteInvokeRequest;
    type: string; // "invoke"
    id: string; // "action id"
    verb: string; // "action"
    data: Record<string, unknown>; //object; // {}
  }

  /**
   * @hidden
   *
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
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type IInvokeResponse = IQueryMessageExtensionResponse | IActionExecuteResponse;

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum InvokeResponseType {
    ActionExecuteInvokeResponse = 'ActionExecuteInvokeResponse',
    QueryMessageExtensionResponse = 'QueryMessageExtensionResponse',
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface IQueryMessageExtensionResponse {
    responseType: InvokeResponseType.QueryMessageExtensionResponse;
    composeExtension?: ComposeExtensionResponse;
  }

  /**
   * @hidden
   *
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
    content: Record<string, unknown>; //object;
    name?: string;
    thumbnailUrl?: string;
    contentUrl?: string;
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
  /*********** END ERROR TYPE ***********/

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

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync<[InvokeError, IInvokeResponse]>(
      'externalAppAuthentication.authenticateAndResendRequest',
      [
        appId,
        originalRequestInfo,
        authenticateParameters.url,
        authenticateParameters.width,
        authenticateParameters.height,
        authenticateParameters.isExternal,
      ],
    ).then(([error, response]: [InvokeError, IInvokeResponse]) => {
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

    return sendMessageToParentAsync<[InvokeError, IInvokeResponse]>(
      'externalAppAuthentication.authenticateWithSSOAndResendRequest',
      [appId, originalRequestInfo, authTokenRequest.resources, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([error, response]: [InvokeError, IInvokeResponse]) => {
      if (error) {
        throw error;
      } else {
        return response;
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
