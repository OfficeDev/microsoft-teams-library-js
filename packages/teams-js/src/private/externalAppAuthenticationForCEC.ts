import { sendMessageToParentAsync } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
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

export namespace externalAppAuthenticationForCEC {
  export function authenticateWithSSO(
    appId: string,
    conversationId: string,
    authTokenRequest: AuthTokenRequestParameters,
    SSOAuthCompletedCallback: () => void,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    registerHandler(
      getApiVersionTag(ApiVersionNumber.V_3, ApiName.ExternalAppAuthenticationForCEC_SSOAuthCompleted),
      'ssoAuthCompleted',
      SSOAuthCompletedCallback,
    );
    return sendMessageToParentAsync(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEC_AuthenticateWithSSO,
      ),
      'externalAppAuthenticationForCEC.authenticateWithSSO',
      [appId, conversationId, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      removeHandler('ssoAuthCompleted');
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function authenticateWithOAuth(
    appId: string,
    conversationId: string,
    authenticateParameters: AuthenticatePopUpParameters,
    // callback that will be called when hubsdk is done with Authentication
    OAuthCompletedCallback: () => void,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    validateId(appId, new Error('App id is not valid.'));
    registerHandler(
      getApiVersionTag(ApiVersionNumber.V_3, ApiName.ExternalAppAuthenticationForCEC_SSOAuthCompleted),
      'oAuthCompleted',
      OAuthCompletedCallback,
    );

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthenticationForCEC_AuthenticateWithOauth,
      ),
      'externalAppAuthenticationForCEC.authenticateWithOauth',
      [
        appId,
        conversationId,
        authenticateParameters.url.href,
        authenticateParameters.width,
        authenticateParameters.height,
        authenticateParameters.isExternal,
      ],
    ).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      removeHandler('oAuthCompleted');
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
    validateOriginalRequestInfo(originalRequestInfo);

    // Ask the parent window to open an authentication window with the parameters provided by the caller.
    return sendMessageToParentAsync<[boolean, IActionExecuteResponse | InvokeErrorWrapper]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthentication_AuthenticateAndResendRequest,
      ),
      'externalAppAuthenticationForCEC.authenticateAndResendRequest',
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

    validateOriginalRequestInfo(originalRequestInfo);

    return sendMessageToParentAsync<[boolean, IActionExecuteResponse | InvokeErrorWrapper]>(
      getApiVersionTag(
        externalAppAuthenticationTelemetryVersionNumber,
        ApiName.ExternalAppAuthentication_AuthenticateWithSSOAndResendRequest,
      ),
      'externalAppAuthenticationForCEC.authenticateWithSSOAndResendRequest',
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
    return ensureInitialized(runtime) && runtime.supports.externalAppAuthenticationForCEC ? true : false;
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
