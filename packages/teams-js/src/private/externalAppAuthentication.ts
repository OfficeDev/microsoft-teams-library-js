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
  export type OriginalRequestInfo =
    | IQueryMessageExtensionRequest
    | IActionBotInvokeRequest
    | ISubmitActionInvokeRequest;

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
  interface IActionBotInvokeRequest {
    requestType: OriginalRequestType.ActionBotInvokeRequest;
    action: ExecuteAction;
    cardData?: IMsgExtCardData;
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  interface ISubmitActionInvokeRequest {
    requestType: OriginalRequestType.SubmitActionInvokeRequest;
    data: Record<string, unknown>; //object;
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  interface ExecuteAction {
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
  interface IMsgExtCardData {
    cardId: string;
    content: string;
    contentType: M365CardContentType;
    appId: string;
    botId?: string;
    contentUrl?: string;
    signature?: string;
    appName?: string;
    source?: number;
    titleId?: string;
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
    ActionBotInvokeRequest = 'ActionBotInvokeRequest',
    QueryMessageExtensionRequest = 'QueryMessageExtensionRequest',
    SubmitActionInvokeRequest = 'SubmitActionInvokeRequest',
  }
  /*********** END REQUEST TYPE ************/

  /*********** BEGIN RESPONSE TYPE ************/
  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type IInvokeResponse = BotInvokeErrorResponse | BotInvokeResultResponse;

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeErrorResponse = {
    type: BotResponseType.Error;
    value: BotInvokeError;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeError = {
    errorCode: number;
    errorMessage: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeResultResponse = {
    type: BotResponseType.Result;
    value: BotInvokeResult;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum BotResponseType {
    Result = 'result',
    Error = 'error',
  }

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  // How to tell the difference between the two types? Can they be updated with a type/kind property
  // so we can use discriminated union?
  export type BotInvokeResult = BotInvokeNonActionExecuteResponse | BotInvokeExecuteResponse;

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeNonActionExecuteResponse = {
    providerId?: string;
    composeExtension?: ComposeExtensionResponse;
    task?: TaskResult;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeExecuteResponse = {
    value: Record<string, unknown>; //object;
    signature?: string;
    statusCode: number;
    type: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type ComposeExtensionResponse = {
    attachmentLayout: AttachmentLayout;
    type: ComposeResultTypes;
    attachments: BotInvokeCard[];
    suggestedActions?: BotInvokeSuggestedActions;
    text?: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type BotInvokeSuggestedActions = {
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
  export type Card = {
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
  export type BotInvokeCard = Card & {
    preview?: Card;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskResult = TaskContinueResult | TaskMessageResult;

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskContinueResult = {
    type: TaskContinueType;
    value: TaskInfo;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskInfo = {
    title?: string;
    height?: string | number;
    width?: string | number;
    url?: string;
    fallbackUrl?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    card?: string | any;
    completionBotId?: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskMessageResult = {
    type: TaskMessageType;
    value: string;
  };

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskContinueType = 'continue';
  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export type TaskMessageType = 'message';

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
  export type ComposeResultTypes = 'result' | 'auth' | 'config' | 'message' | 'botMessagePreview' | 'silentAuth' | '';
  /*********** END RESPONSE TYPE ************/

  /*********** BEGIN ERROR TYPE ***********/
  export interface InvokeError {
    errorCode: InvokeErrorCode;
    message?: string;
  }

  export enum InvokeErrorCode {
    ACTION_NOT_SUPPORTED_IN_CONTEXT = 1,
  }
  /*********** END ERROR TYPE ***********/

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   */
  export function authenticateAndResendRequest(
    appId: string,
    originalRequestInfo: OriginalRequestInfo,
    authenticateParameters: authentication.AuthenticatePopUpParameters,
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

    // Convert any relative URLs into absolute URLs before sending them over to the parent window.
    const link = document.createElement('a');
    link.href = authenticateParameters.url;
    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync<[InvokeError, IInvokeResponse]>(
      'externalAppAuthentication.authenticateAndResendRequest',
      [
        appId,
        originalRequestInfo,
        link.href,
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
      authTokenRequest?.resources,
      authTokenRequest?.claims,
      authTokenRequest?.silent,
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
    originalRequestInfo: OriginalRequestInfo,
    authTokenRequest: authentication.AuthTokenRequestParameters,
  ): Promise<IInvokeResponse> {
    ensureInitialized(runtime);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    return sendMessageToParentAsync<[InvokeError, IInvokeResponse]>(
      'externalAppAuthentication.authenticateWithSSOAndResendRequest',
      [appId, originalRequestInfo, authTokenRequest?.resources, authTokenRequest?.claims, authTokenRequest?.silent],
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
