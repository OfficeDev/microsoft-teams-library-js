import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import {
  ActionExecuteInvokeRequestType,
  AuthenticatePopUpParameters,
  AuthTokenRequestParameters,
  IActionExecuteInvokeRequest,
  IActionExecuteResponse,
  InvokeError,
  InvokeErrorCode,
  InvokeErrorWrapper,
} from './interfaces';

const externalAppAuthenticationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * Namespace to delegate authentication requests to the host for custom engine agents
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
export namespace externalAppAuthenticationForCEA {
  /**
   * @beta
   * @hidden
   * Signals to the host to perform SSO authentication for the application specified by the app ID, and then send the authResult to the application backend.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId Id of the application backend for which the host should attempt SSO authentication.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authTokenRequest Parameters for SSO authentication
   * @throws InvokeError if the host encounters an error while authenticating
   * @returns A promise that resolves when authentication succeeds and rejects with InvokeError on failure
   */
  export async function authenticateWithSSO(
    appId: AppId,
    conversationId: string,
    authTokenRequest: AuthTokenRequestParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    const [error] = await sendMessageToParentAsync<[InvokeError]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSO,
      ),
      'externalAppAuthenticationForCEA.authenticateWithSSO',
      [appId, conversationId, authTokenRequest.claims, authTokenRequest.silent],
    );
    if (error) {
      throw error;
    }
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform authentication using the given authentication parameters and then send the auth result to the application backend.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend to which the request and authentication response should be sent. This must be a UUID
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authenticateParameters Parameters for the authentication pop-up
   * @throws InvokeError if the host encounters an error while authenticating
   * @returns A promise that resolves from the application backend and rejects with InvokeError if the host encounters an error while authenticating
   */
  export async function authenticateWithOAuth(
    appId: AppId,
    conversationId: string,
    authenticateParameters: AuthenticatePopUpParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    const [error] = await sendMessageToParentAsync<[InvokeError]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithOauth,
      ),
      'externalAppAuthenticationForCEA.authenticateWithOauth',
      [
        appId,
        conversationId,
        authenticateParameters.url.href,
        authenticateParameters.width,
        authenticateParameters.height,
        authenticateParameters.isExternal,
      ],
    );
    if (error) {
      throw error;
    }
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform authentication using the given authentication parameters and then resend the request to the application backend with the authentication result.
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend to which the request and authentication response should be sent. This must be a UUID
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authenticateParameters Parameters for the authentication pop-up
   * @param originalRequestInfo Information about the original request that should be resent
   * @throws InvokeError if the host encounters an error while authenticating or resending the request
   * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export async function authenticateAndResendRequest(
    appId: AppId,
    conversationId: string,
    authenticateParameters: AuthenticatePopUpParameters,
    originalRequestInfo: IActionExecuteInvokeRequest,
  ): Promise<IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    const [error, response] = await sendMessageToParentAsync<[InvokeErrorWrapper, IActionExecuteResponse]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthentication_AuthenticateAndResendRequest,
      ),
      'externalAppAuthenticationForCEA.authenticateAndResendRequest',
      [
        appId,
        conversationId,
        originalRequestInfo,
        authenticateParameters.url.href,
        authenticateParameters.width,
        authenticateParameters.height,
        authenticateParameters.isExternal,
      ],
    );
    if (response && response.responseType != null) {
      return response as IActionExecuteResponse;
    } else {
      throw error;
    }
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform SSO authentication for the application specified by the app ID and then resend the request to the application backend with the authentication result and originalRequestInfo
   * @internal
   * Limited to Microsoft-internal use
   * @param appId ID of the application backend for which the host should attempt SSO authentication and resend the request and authentication response. This must be a UUID.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authTokenRequest Parameters for SSO authentication
   * @param originalRequestInfo Information about the original request that should be resent
   * @throws InvokeError if the host encounters an error while authenticating or resending the request
   * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export async function authenticateWithSSOAndResendRequest(
    appId: AppId,
    conversationId: string,
    authTokenRequest: AuthTokenRequestParameters,
    originalRequestInfo: IActionExecuteInvokeRequest,
  ): Promise<IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    const [error, response] = await sendMessageToParentAsync<
      [InvokeErrorWrapper, IActionExecuteResponse | InvokeErrorWrapper]
    >(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthentication_AuthenticateWithSSOAndResendRequest,
      ),
      'externalAppAuthenticationForCEA.authenticateWithSSOAndResendRequest',
      [appId, conversationId, originalRequestInfo, authTokenRequest.claims, authTokenRequest.silent],
    );
    if (response && response.responseType != null) {
      return response as IActionExecuteResponse;
    } else {
      throw error;
    }
  }

  /**
   * @beta
   * @hidden
   * Checks if the externalAppAuthenticationForCEA capability is supported by the host
   * @returns boolean to represent whether externalAppAuthenticationForCEA capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppAuthenticationForCEA ? true : false;
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   * @beta
   */

  function validateOriginalRequestInfo(actionExecuteRequest: IActionExecuteInvokeRequest): void {
    if (actionExecuteRequest.type !== ActionExecuteInvokeRequestType) {
      const error: InvokeError = {
        errorCode: InvokeErrorCode.INTERNAL_ERROR,
        message: `Invalid action type ${actionExecuteRequest.type}. Action type must be "${ActionExecuteInvokeRequestType}"`,
      };
      throw error;
    }
  }
}
