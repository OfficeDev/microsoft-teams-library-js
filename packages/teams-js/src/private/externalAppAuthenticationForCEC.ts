import { sendMessageToParentAsync } from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { validateId } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { AuthenticatePopUpParameters, AuthTokenRequestParameters, InvokeError } from './interfaces';

const externalAppAuthenticationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_3;

// export namespace externalAppAuthenticationForCEC {
//   export function authenticateWithSSO(
//     appId: string,
//     authTokenRequest: AuthTokenRequestParameters,
//     SSOAuthCompletedCallback: () => void,
//   ): void {
//     ensureInitialized(runtime, FrameContexts.content);

//     if (!isSupported()) {
//       throw errorNotSupportedOnPlatform;
//     }
//     validateId(appId, new Error('App id is not valid.'));
//     registerHandler(
//       getApiVersionTag(ApiVersionNumber.V_3, ApiName.ExternalAppAuthenticationForCEC_SSOAuthCompleted),
//       'ssoAuthCompleted',
//       SSOAuthCompletedCallback,
//     );
//     return sendMessageToParent(
//       getApiVersionTag(
//         externalAppAuthenticationTelemetryVersionNumber,
//         ApiName.ExternalAppAuthenticationForCEC_AuthenticateWithSSO,
//       ),
//       'externalAppAuthenticationForCEC.authenticateWithSSO',
//       [appId, authTokenRequest.claims, authTokenRequest.silent],
//       (wasSuccessful, error) => {
//         if (!wasSuccessful) {
//           console.log('not successfull ' + error);
//         } else {
//           console.log('successfull ' + error);
//         }
//       },
//     );
//     // .then(([wasSuccessful, error]: [boolean, InvokeError]) => {
//     //   if (!wasSuccessful) {
//     //     throw error;
//     //   }
//     // })
//     // .finally(() => {
//     //   // removeHandler('ssoAuthCompleted');
//     // });
//   }

export namespace externalAppAuthenticationForCEC {
  export function authenticateWithSSO(
    appId: string,
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
      [appId, authTokenRequest.claims, authTokenRequest.silent],
    ).then(([wasSuccessful, error]: [boolean, InvokeError]) => {
      removeHandler('ssoAuthCompleted');
      if (!wasSuccessful) {
        throw error;
      }
    });
  }

  export function authenticateWithOAuth(
    appId: string,
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
        ApiName.ExternalAppAuthenticationForCEC_AuthenticateWithOAuth,
      ),
      'externalAppAuthenticationForCEC.authenticateWithOAuth',
      [
        appId,
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

  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.externalAppAuthenticationForCEC ? true : false;
  }
}
