import { sendMessageToParentAsync } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
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

const externalAppAuthenticationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_3;

export namespace externalAppAuthenticationForCEA {
  export function authenticateWithSSO(
    appId: string,
    conversationId: string,
    authTokenRequest: AuthTokenRequestParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));

    return sendMessageToParentAsync(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEA_AuthenticateWithSSO,
      ),
      'externalAppAuthenticationForCEA.authenticateWithSSO',
      [appId, conversationId, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function authenticateWithOAuth(
    appId: string,
    conversationId: string,
    authenticateParameters: AuthenticatePopUpParameters,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync(
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
    ).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function authenticateAndResendRequest(
    appId: string,
    conversationId: string,
    authenticateParameters: AuthenticatePopUpParameters,
    originalRequestInfo: IActionExecuteInvokeRequest,
  ): Promise<IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync<[boolean, IActionExecuteResponse | InvokeErrorWrapper]>(
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
    ).then(([wasSuccessful, response]: [boolean, IActionExecuteResponse | InvokeErrorWrapper]) => {
      if (wasSuccessful && response.responseType != null) {
        return response as IActionExecuteResponse;
      } else {
        const error = response as InvokeError;
        throw error;
      }
    });
  }
  export function authenticateWithSSOAndResendRequest(
    appId: string,
    conversationId: string,
    authTokenRequest: AuthTokenRequestParameters,
    originalRequestInfo: IActionExecuteInvokeRequest,
  ): Promise<IActionExecuteResponse> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    validateId(conversationId, new Error('conversation id is not valid.'));

    validateOriginalRequestInfo(originalRequestInfo);

    return sendMessageToParentAsync<[boolean, IActionExecuteResponse | InvokeErrorWrapper]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthentication_AuthenticateWithSSOAndResendRequest,
      ),
      'externalAppAuthenticationForCEA.authenticateWithSSOAndResendRequest',
      [appId, conversationId, originalRequestInfo, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([wasSuccessful, response]: [boolean, IActionExecuteResponse | InvokeErrorWrapper]) => {
      if (wasSuccessful && response.responseType != null) {
        return response as IActionExecuteResponse;
      } else {
        const error = response as InvokeError;
        throw error;
      }
    });
  }
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppAuthenticationForCEA ? true : false;
  }

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
