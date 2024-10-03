import { sendAndUnwrap } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { AppId } from '../public';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { externalAppAuthentication } from './externalAppAuthentication';

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
   * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authTokenRequest Parameters for SSO authentication
   * @throws InvokeError if the host encounters an error while authenticating
   * @returns A promise that resolves when authentication succeeds and rejects with InvokeError on failure
   */
  export async function authenticateWithSSO(
    appId: AppId,
    conversationId: string,
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    const error = await sendAndUnwrap<externalAppAuthentication.InvokeError | undefined>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSO,
      ),
      ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSO,
      appId.toString(),
      conversationId,
      authTokenRequest.claims,
      authTokenRequest.silent,
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
   * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authenticateParameters Parameters for the authentication pop-up
   * @throws InvokeError if the host encounters an error while authenticating
   * @returns A promise that resolves from the application backend and rejects with InvokeError if the host encounters an error while authenticating
   */
  export async function authenticateWithOauth(
    appId: AppId,
    conversationId: string,
    authenticateParameters: externalAppAuthentication.AuthenticatePopUpParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    const error = await sendAndUnwrap<externalAppAuthentication.InvokeError | undefined>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithOauth,
      ),
      ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithOauth,
      appId.toString(),
      conversationId,
      authenticateParameters.url.href,
      authenticateParameters.width,
      authenticateParameters.height,
      authenticateParameters.isExternal,
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
   * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authenticateParameters Parameters for the authentication pop-up
   * @param originalRequestInfo Information about the original request that should be resent
   * @throws InvokeError if the host encounters an error while authenticating or resending the request
   * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export async function authenticateAndResendRequest(
    appId: AppId,
    conversationId: string,
    authenticateParameters: externalAppAuthentication.AuthenticatePopUpParameters,
    originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest,
  ): Promise<externalAppAuthentication.IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    const response = await sendAndUnwrap<
      externalAppAuthentication.InvokeError | externalAppAuthentication.IActionExecuteResponse
    >(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateAndResendRequest,
      ),
      ApiName.ExternalAppAuthenticationForCEA_AuthenticateAndResendRequest,
      appId.toString(),
      conversationId,
      originalRequestInfo,
      authenticateParameters.url.href,
      authenticateParameters.width,
      authenticateParameters.height,
      authenticateParameters.isExternal,
    );
    if (externalAppAuthentication.isActionExecuteResponse(response)) {
      return response;
    } else {
      throw externalAppAuthentication.isInvokeError(response) ? response : defaultExternalAppError;
    }
  }

  /**
   * @beta
   * @hidden
   * Signals to the host to perform SSO authentication for the application specified by the app ID and then resend the request to the application backend with the authentication result and originalRequestInfo
   * @internal
   * Limited to Microsoft-internal use
   * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
   * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
   * @param authTokenRequest Parameters for SSO authentication
   * @param originalRequestInfo Information about the original request that should be resent
   * @throws InvokeError if the host encounters an error while authenticating or resending the request
   * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
   */
  export async function authenticateWithSSOAndResendRequest(
    appId: AppId,
    conversationId: string,
    authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters,
    originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest,
  ): Promise<externalAppAuthentication.IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    const response = await sendAndUnwrap<
      externalAppAuthentication.IActionExecuteResponse | externalAppAuthentication.InvokeError
    >(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSOAndResendRequest,
      ),
      ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSOAndResendRequest,
      appId.toString(),
      conversationId,
      originalRequestInfo,
      authTokenRequest.claims,
      authTokenRequest.silent,
    );
    if (externalAppAuthentication.isActionExecuteResponse(response)) {
      return response;
    } else {
      throw externalAppAuthentication.isInvokeError(response) ? response : defaultExternalAppError;
    }
  }

  /**
   * @beta
   * @hidden
   * Checks if the externalAppAuthenticationForCEA capability is supported by the host
   * @returns boolean to represent whether externalAppAuthenticationForCEA capability is supported
   * @throws Error if {@linkcode app.initialize} has not successfully completed
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
  function validateOriginalRequestInfo(
    actionExecuteRequest: externalAppAuthentication.IActionExecuteInvokeRequest,
  ): void {
    if (actionExecuteRequest.type !== externalAppAuthentication.ActionExecuteInvokeRequestType) {
      const error: externalAppAuthentication.InvokeError = {
        errorCode: externalAppAuthentication.InvokeErrorCode.INTERNAL_ERROR,
        message: `Invalid action type ${actionExecuteRequest.type}. Action type must be "${externalAppAuthentication.ActionExecuteInvokeRequestType}"`,
      };
      throw error;
    }
  }

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use
   * @beta
   */
  const defaultExternalAppError = {
    errorCode: externalAppAuthentication.InvokeErrorCode.INTERNAL_ERROR,
    message: 'No valid response received',
  };
}
