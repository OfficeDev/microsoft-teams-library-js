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
  export type OriginalRequestInfo = IQueryMessageExtensionRequest | IActionExecuteInvokeRequest;

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
  interface IActionExecuteInvokeRequest {
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
  export enum M365CardContentType {
    Error = 'error',
    HeroCard = 'application/vnd.microsoft.card.hero',
    ThumbnailCard = 'application/vnd.microsoft.card.thumbnail',
    ConnectorCard = 'application/vnd.microsoft.teams.card.o365connector',
    AdaptiveCard = 'application/vnd.microsoft.card.adaptive',
    SignInCard = 'signincard',
    AppInstallCard = 'appinstallcard',
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
    actions?: Actions[];
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type Actions = {
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
  export type AttachmentLayout = 'list' | 'grid';
  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type ComposeResultTypes = 'result' | 'auth' | 'config' | 'message' | 'silentAuth' | '';
  /*********** END RESPONSE TYPE ************/

  /*********** BEGIN ERROR TYPE ***********/
  export interface InvokeError {
    errorCode: InvokeErrorCode;
    message?: string;
  }

  export enum InvokeErrorCode {
    INTERNAL_ERROR, // Generic error
  }
  /*********** END ERROR TYPE ***********/

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function authenticateAndResendRequest(
    appId: string,
    authenticateParameters: authentication.AuthenticatePopUpParameters,
    originalRequestInfo: OriginalRequestInfo,
  ): Promise<IInvokeResponse> {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

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
        // TODO: update to new error types/confirm error codes
        throw error;
      } else {
        return response;
      }
    });
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function authenticateWithSSO(
    appId: string,
    authTokenRequest: authentication.AuthTokenRequestParameters,
  ): Promise<void> {
    ensureInitialized(runtime);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync('externalAppAuthentication.authenticateWithSSO', [
      appId,
      authTokenRequest.resources,
      authTokenRequest.claims,
      authTokenRequest.silent,
    ]).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      // make sure host sdk is throwing the right type of errors
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function authenticateWithSSOAndResendRequest(
    appId: string,
    authTokenRequest: authentication.AuthTokenRequestParameters,
    originalRequestInfo: OriginalRequestInfo,
  ): Promise<IInvokeResponse> {
    ensureInitialized(runtime);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync<[InvokeError, IInvokeResponse]>(
      'externalAppAuthentication.authenticateWithSSOAndResendRequest',
      [appId, originalRequestInfo, authTokenRequest.resources, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([error, response]: [InvokeError, IInvokeResponse]) => {
      if (error) {
        // TODO: update to new error types/confirm error codes
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
