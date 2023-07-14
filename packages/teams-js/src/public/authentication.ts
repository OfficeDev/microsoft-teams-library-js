import {
  Communication,
  sendMessageEventToChild,
  sendMessageToParent,
  sendMessageToParentAsync,
  waitForMessageQueue,
} from '../internal/communication';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitializeCalled, ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts, HostClientType } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the authentication-specific part of the SDK.
 *
 * This object is used for starting or completing authentication flows.
 */
export namespace authentication {
  let authHandlers: { success: (string) => void; fail: (string) => void } | undefined;
  let authWindowMonitor: number | undefined;

  /**
   * @hidden
   * @internal
   * Limited to Microsoft-internal use; automatically called when library is initialized
   */
  export function initialize(): void {
    registerHandler('authentication.authenticate.success', handleSuccess, false);
    registerHandler('authentication.authenticate.failure', handleFailure, false);
  }

  let authParams: AuthenticateParameters | undefined;
  /**
   * @deprecated
   * As of 2.0.0, this function has been deprecated in favor of a Promise-based pattern using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}
   *
   * Registers handlers to be called with the result of an authentication flow triggered using {@link authentication.authenticate authentication.authenticate(authenticateParameters?: AuthenticateParameters): void}
   *
   * @param authenticateParameters - Configuration for authentication flow pop-up result communication
   */
  export function registerAuthenticationHandlers(authenticateParameters: AuthenticateParameters): void {
    authParams = authenticateParameters;
  }

  /**
   * Initiates an authentication flow which requires a new window.
   * There are two primary uses for this function:
   * 1. When your app needs to authenticate using a 3rd-party identity provider (not Azure Active Directory)
   * 2. When your app needs to show authentication UI that is blocked from being shown in an iframe (e.g., Azure Active Directory consent prompts)
   *
   * For more details, see [Enable authentication using third-party OAuth provider](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/auth-flow-tab)
   *
   * This function is *not* needed for "standard" Azure SSO usage. Using {@link getAuthToken} is usually sufficient in that case. For more, see
   * [Enable SSO for tab apps](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview))
   *
   * @remarks
   * The authentication flow must start and end from the same domain, otherwise success and failure messages won't be returned to the window that initiated the call.
   * The [Teams authentication flow](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/auth-flow-tab) starts and ends at an endpoint on
   * your own service (with a redirect round-trip to the 3rd party identity provider in the middle).
   *
   * @param authenticateParameters - Parameters describing the authentication window used for executing the authentication flow
   *
   * @returns `Promise` that will be fulfilled with the result from the authentication pop-up, if successful. The string in this result is provided in the parameter
   * passed by your app when it calls {@link notifySuccess} in the pop-up window after returning from the identity provider redirect.
   *
   * @throws `Error` if the authentication request fails or is canceled by the user. This error is provided in the parameter passed by your app when it calls
   * {@link notifyFailure} in the pop-up window after returning from the identity provider redirect. However, in some cases it can also be provided by
   * the infrastructure depending on the failure (e.g., a user cancelation)
   *
   */
  export function authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise<string>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} instead.
   *
   * The documentation for {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} applies
   * to this function.
   * The one difference is that instead of the result being returned via the `Promise`, the result is returned to the callback functions provided in the
   * `authenticateParameters` parameter.
   *
   * @param authenticateParameters - Parameters describing the authentication window used for executing the authentication flow and callbacks used for indicating the result
   *
   */
  export function authenticate(authenticateParameters?: AuthenticateParameters): void;
  export function authenticate(authenticateParameters?: AuthenticateParameters): Promise<string> {
    const isDifferentParamsInCall: boolean = authenticateParameters !== undefined;
    const authenticateParams: AuthenticateParameters | undefined = isDifferentParamsInCall
      ? authenticateParameters
      : authParams;
    if (!authenticateParams) {
      throw new Error('No parameters are provided for authentication');
    }
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
    return authenticateHelper(authenticateParams)
      .then((value: string) => {
        try {
          if (authenticateParams && authenticateParams.successCallback) {
            authenticateParams.successCallback(value);
            return '';
          }
          return value;
        } finally {
          if (!isDifferentParamsInCall) {
            authParams = null;
          }
        }
      })
      .catch((err: Error) => {
        try {
          if (authenticateParams && authenticateParams.failureCallback) {
            authenticateParams.failureCallback(err.message);
            return '';
          }
          throw err;
        } finally {
          if (!isDifferentParamsInCall) {
            authParams = null;
          }
        }
      });
  }

  function authenticateHelper(authenticateParameters: AuthenticateParameters): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (
        GlobalVars.hostClientType === HostClientType.desktop ||
        GlobalVars.hostClientType === HostClientType.android ||
        GlobalVars.hostClientType === HostClientType.ios ||
        GlobalVars.hostClientType === HostClientType.ipados ||
        GlobalVars.hostClientType === HostClientType.rigel ||
        GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
        GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
        GlobalVars.hostClientType === HostClientType.teamsPhones ||
        GlobalVars.hostClientType === HostClientType.teamsDisplays
      ) {
        // Convert any relative URLs into absolute URLs before sending them over to the parent window.
        const link = document.createElement('a');
        link.href = authenticateParameters.url;
        // Ask the parent window to open an authentication window with the parameters provided by the caller.
        resolve(
          sendMessageToParentAsync<[boolean, string]>('authentication.authenticate', [
            link.href,
            authenticateParameters.width,
            authenticateParameters.height,
            authenticateParameters.isExternal,
          ]).then(([success, response]: [boolean, string]) => {
            if (success) {
              return response;
            } else {
              throw new Error(response);
            }
          }),
        );
      } else {
        // Open an authentication window with the parameters provided by the caller.
        authHandlers = {
          success: resolve,
          fail: reject,
        };
        openAuthenticationWindow(authenticateParameters);
      }
    });
  }

  /**
   * Requests an Azure AD token to be issued on behalf of your app in an SSO flow.
   * The token is acquired from the cache if it is not expired. Otherwise a request is sent to Azure AD to
   * obtain a new token.
   * This function is used to enable SSO scenarios. See [Enable SSO for tab apps](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview)
   * for more details.
   *
   * @param authTokenRequest - An optional set of values that configure the token request.
   *
   * @returns `Promise` that will be resolved with the token, if successful.
   *
   * @throws `Error` if the request fails in some way
   */
  export function getAuthToken(authTokenRequest?: AuthTokenRequestParameters): Promise<string>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link authentication.getAuthToken authentication.getAuthToken(authTokenRequest: AuthTokenRequestParameters): Promise\<string\>} instead.
   *
   * The documentation {@link authentication.getAuthToken authentication.getAuthToken(authTokenRequest: AuthTokenRequestParameters): Promise\<string\>} applies to this
   * function as well. The one difference when using this function is that the result is provided in the callbacks in the `authTokenRequest` parameter
   * instead of as a `Promise`.
   *
   * @param authTokenRequest - An optional set of values that configure the token request.
   * It contains callbacks to call in case of success/failure
   */
  export function getAuthToken(authTokenRequest?: AuthTokenRequest): void;
  export function getAuthToken(authTokenRequest?: AuthTokenRequest): Promise<string> {
    ensureInitializeCalled();
    return getAuthTokenHelper(authTokenRequest)
      .then((value: string) => {
        if (authTokenRequest && authTokenRequest.successCallback) {
          authTokenRequest.successCallback(value);
          return '';
        }
        return value;
      })
      .catch((err: Error) => {
        if (authTokenRequest && authTokenRequest.failureCallback) {
          authTokenRequest.failureCallback(err.message);
          return '';
        }
        throw err;
      });
  }

  function getAuthTokenHelper(authTokenRequest?: AuthTokenRequest): Promise<string> {
    return new Promise<[boolean, string]>((resolve) => {
      resolve(
        sendMessageToParentAsync('authentication.getAuthToken', [
          authTokenRequest?.resources,
          authTokenRequest?.claims,
          authTokenRequest?.silent,
        ]),
      );
    }).then(([success, result]: [boolean, string]) => {
      if (success) {
        return result;
      } else {
        throw new Error(result);
      }
    });
  }

  /**
   * @hidden
   * Requests the decoded Azure AD user identity on behalf of the app.
   *
   * @returns Promise that resolves with the {@link UserProfile}.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getUser(): Promise<UserProfile>;
  /**
   * @deprecated
   * As of 2.0.0, please use {@link authentication.getUser authentication.getUser(): Promise\<UserProfile\>} instead.
   *
   * @hidden
   * Requests the decoded Azure AD user identity on behalf of the app.
   *
   * @param userRequest - It passes success/failure callbacks in the userRequest object(deprecated)
   * @internal
   * Limited to Microsoft-internal use
   */
  export function getUser(userRequest: UserRequest): void;
  export function getUser(userRequest?: UserRequest): Promise<UserProfile> {
    ensureInitializeCalled();
    return getUserHelper()
      .then((value: UserProfile) => {
        if (userRequest && userRequest.successCallback) {
          userRequest.successCallback(value);
          return null;
        }
        return value;
      })
      .catch((err: Error) => {
        if (userRequest && userRequest.failureCallback) {
          userRequest.failureCallback(err.message);
          return null;
        }
        throw err;
      });
  }

  function getUserHelper(): Promise<UserProfile> {
    return new Promise<[boolean, UserProfile | string]>((resolve) => {
      resolve(sendMessageToParentAsync('authentication.getUser'));
    }).then(([success, result]: [boolean, UserProfile | string]) => {
      if (success) {
        return result as UserProfile;
      } else {
        throw new Error(result as string);
      }
    });
  }

  function closeAuthenticationWindow(): void {
    // Stop monitoring the authentication window
    stopAuthenticationWindowMonitor();
    // Try to close the authentication window and clear all properties associated with it
    try {
      if (Communication.childWindow) {
        Communication.childWindow.close();
      }
    } finally {
      Communication.childWindow = null;
      Communication.childOrigin = null;
    }
  }

  function openAuthenticationWindow(authenticateParameters: AuthenticateParameters): void {
    // Close the previously opened window if we have one
    closeAuthenticationWindow();
    // Start with a sensible default size
    let width = authenticateParameters.width || 600;
    let height = authenticateParameters.height || 400;
    // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
    width = Math.min(width, Communication.currentWindow.outerWidth - 400);
    height = Math.min(height, Communication.currentWindow.outerHeight - 200);
    // Convert any relative URLs into absolute URLs before sending them over to the parent window
    const link = document.createElement('a');
    link.href = authenticateParameters.url.replace('{oauthRedirectMethod}', 'web');
    // We are running in the browser, so we need to center the new window ourselves
    let left: number =
      typeof Communication.currentWindow.screenLeft !== 'undefined'
        ? Communication.currentWindow.screenLeft
        : Communication.currentWindow.screenX;
    let top: number =
      typeof Communication.currentWindow.screenTop !== 'undefined'
        ? Communication.currentWindow.screenTop
        : Communication.currentWindow.screenY;
    left += Communication.currentWindow.outerWidth / 2 - width / 2;
    top += Communication.currentWindow.outerHeight / 2 - height / 2;
    // Open a child window with a desired set of standard browser features
    Communication.childWindow = Communication.currentWindow.open(
      link.href,
      '_blank',
      'toolbar=no, location=yes, status=no, menubar=no, scrollbars=yes, top=' +
        top +
        ', left=' +
        left +
        ', width=' +
        width +
        ', height=' +
        height,
    );
    if (Communication.childWindow) {
      // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
      startAuthenticationWindowMonitor();
    } else {
      // If we failed to open the window, fail the authentication flow
      handleFailure('FailedToOpenWindow');
    }
  }

  function stopAuthenticationWindowMonitor(): void {
    if (authWindowMonitor) {
      clearInterval(authWindowMonitor);
      authWindowMonitor = 0;
    }
    removeHandler('initialize');
    removeHandler('navigateCrossDomain');
  }

  function startAuthenticationWindowMonitor(): void {
    // Stop the previous window monitor if one is running
    stopAuthenticationWindowMonitor();
    // Create an interval loop that
    // - Notifies the caller of failure if it detects that the authentication window is closed
    // - Keeps pinging the authentication window while it is open to re-establish
    //   contact with any pages along the authentication flow that need to communicate
    //   with us
    authWindowMonitor = Communication.currentWindow.setInterval(() => {
      if (!Communication.childWindow || Communication.childWindow.closed) {
        handleFailure('CancelledByUser');
      } else {
        const savedChildOrigin = Communication.childOrigin;
        try {
          Communication.childOrigin = '*';
          sendMessageEventToChild('ping');
        } finally {
          Communication.childOrigin = savedChildOrigin;
        }
      }
    }, 100);
    // Set up an initialize-message handler that gives the authentication window its frame context
    registerHandler('initialize', () => {
      return [FrameContexts.authentication, GlobalVars.hostClientType];
    });
    // Set up a navigateCrossDomain message handler that blocks cross-domain re-navigation attempts
    // in the authentication window. We could at some point choose to implement this method via a call to
    // authenticationWindow.location.href = url; however, we would first need to figure out how to
    // validate the URL against the tab's list of valid domains.
    registerHandler('navigateCrossDomain', () => {
      return false;
    });
  }

  /**
   * When using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}, the
   * window that was opened to execute the authentication flow should call this method after authentiction to notify the caller of
   * {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} that the
   * authentication request was successful.
   *
   * @remarks
   * This function is usable only from the authentication window.
   * This call causes the authentication window to be closed.
   *
   * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives
   * this value in its callback or via the `Promise` return value
   * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifySuccess(result?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, 'result', result);
    ensureInitialized(runtime, FrameContexts.authentication);
    sendMessageToParent('authentication.authenticate.success', [result]);
    // Wait for the message to be sent before closing the window
    waitForMessageQueue(Communication.parentWindow, () => setTimeout(() => Communication.currentWindow.close(), 200));
  }

  /**
   * When using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}, the
   * window that was opened to execute the authentication flow should call this method after authentiction to notify the caller of
   * {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} that the
   * authentication request failed.

   *
   * @remarks
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   *
   * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives
   * this value in its callback or via the `Promise` return value
   * @param callbackUrl - Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifyFailure(reason?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, 'reason', reason);
    ensureInitialized(runtime, FrameContexts.authentication);
    sendMessageToParent('authentication.authenticate.failure', [reason]);
    // Wait for the message to be sent before closing the window
    waitForMessageQueue(Communication.parentWindow, () => setTimeout(() => Communication.currentWindow.close(), 200));
  }

  function handleSuccess(result?: string): void {
    try {
      if (authHandlers) {
        authHandlers.success(result);
      }
    } finally {
      authHandlers = null;
      closeAuthenticationWindow();
    }
  }

  function handleFailure(reason?: string): void {
    try {
      if (authHandlers) {
        authHandlers.fail(new Error(reason));
      }
    } finally {
      authHandlers = null;
      closeAuthenticationWindow();
    }
  }

  /**
   * Validates that the callbackUrl param is a valid connector url, appends the result/reason and authSuccess/authFailure as URL fragments and redirects the window
   * @param callbackUrl - the connectors url to redirect to
   * @param key - "result" in case of success and "reason" in case of failure
   * @param value - the value of the passed result/reason parameter
   */
  function redirectIfWin32Outlook(callbackUrl?: string, key?: string, value?: string): void {
    if (callbackUrl) {
      const link = document.createElement('a');
      link.href = decodeURIComponent(callbackUrl);
      if (
        link.host &&
        link.host !== window.location.host &&
        link.host === 'outlook.office.com' &&
        link.search.indexOf('client_type=Win32_Outlook') > -1
      ) {
        if (key && key === 'result') {
          if (value) {
            link.href = updateUrlParameter(link.href, 'result', value);
          }
          Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authSuccess', ''));
        }
        if (key && key === 'reason') {
          if (value) {
            link.href = updateUrlParameter(link.href, 'reason', value);
          }
          Communication.currentWindow.location.assign(updateUrlParameter(link.href, 'authFailure', ''));
        }
      }
    }
  }

  /**
   * Appends either result or reason as a fragment to the 'callbackUrl'
   * @param uri - the url to modify
   * @param key - the fragment key
   * @param value - the fragment value
   */
  function updateUrlParameter(uri: string, key: string, value: string): string {
    const i = uri.indexOf('#');
    let hash = i === -1 ? '#' : uri.substr(i);
    hash = hash + '&' + key + (value !== '' ? '=' + value : '');
    uri = i === -1 ? uri : uri.substr(0, i);
    return uri + hash;
  }

  /**
   * @deprecated
   * As of 2.0.0, this interface has been deprecated in favor of leveraging the `Promise` returned from {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}
   *-------------------------
   * Used in {@link AuthenticateParameters} and {@link AuthTokenRequest}
   */
  export interface LegacyCallBacks {
    /**
     * @deprecated
     * As of 2.0.0, this property has been deprecated in favor of a Promise-based pattern.
     *
     * A function that is called if the request succeeds.
     */
    successCallback?: (result: string) => void;
    /**
     * @deprecated
     * As of 2.0.0, this property has been deprecated in favor of a Promise-based pattern.
     *
     * A function that is called if the request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
  }

  /**
   * Describes the authentication pop-up parameters
   */
  export interface AuthenticatePopUpParameters {
    /**
     * The URL for the authentication pop-up.
     */
    url: string;
    /**
     * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
     */
    width?: number;
    /**
     * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
     */
    height?: number;
    /**
     * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
     * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page specified in
     * the {@link url} property to be opened in an external browser.
     * If this flag is `false`, the page will be opened directly within the current hosting application.
     *
     * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
     * environment without an embedded browser.
     */
    isExternal?: boolean;
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} and
   * the associated {@link AuthenticatePopUpParameters} instead.
   *
   * @see {@link LegacyCallBacks}
   */
  export type AuthenticateParameters = AuthenticatePopUpParameters & LegacyCallBacks;

  /**
   * Describes authentication token request parameters
   */
  export interface AuthTokenRequestParameters {
    /**
     * @hidden
     * @internal
     * An list of resources for which to acquire the access token; only for internal Microsoft usage
     */
    resources?: string[];
    /**
     * An optional list of claims which to pass to AAD when requesting the access token.
     */
    claims?: string[];
    /**
     * An optional flag indicating whether to attempt the token acquisition silently or allow a prompt to be shown.
     */
    silent?: boolean;
  }

  /**
   * @deprecated
   * As of 2.0.0, please use {@link AuthTokenRequestParameters} instead.
   */
  export type AuthTokenRequest = AuthTokenRequestParameters & LegacyCallBacks;

  /**
   * @hidden
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface UserProfile {
    /**
     * @hidden
     * The intended recipient of the token. The application that receives the token must verify that the audience
     * value is correct and reject any tokens intended for a different audience.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    aud: string;
    /**
     * @hidden
     * Identifies how the subject of the token was authenticated.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    amr: string[];
    /**
     * @hidden
     * Stores the time at which the token was issued. It is often used to measure token freshness.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    iat: number;
    /**
     * @hidden
     * Identifies the security token service (STS) that constructs and returns the token. In the tokens that Azure AD
     * returns, the issuer is sts.windows.net. The GUID in the issuer claim value is the tenant ID of the Azure AD
     * directory. The tenant ID is an immutable and reliable identifier of the directory.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    iss: string;
    /**
     * @hidden
     * Provides the last name, surname, or family name of the user as defined in the Azure AD user object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    family_name: string;
    /**
     * @hidden
     * Provides the first or "given" name of the user, as set on the Azure AD user object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    given_name: string;
    /**
     * @hidden
     * Provides a human-readable value that identifies the subject of the token. This value is not guaranteed to
     * be unique within a tenant and is designed to be used only for display purposes.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    unique_name: string;
    /**
     * @hidden
     * Contains a unique identifier of an object in Azure AD. This value is immutable and cannot be reassigned or
     * reused. Use the object ID to identify an object in queries to Azure AD.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    oid: string;
    /**
     * @hidden
     * Identifies the principal about which the token asserts information, such as the user of an application.
     * This value is immutable and cannot be reassigned or reused, so it can be used to perform authorization
     * checks safely. Because the subject is always present in the tokens the Azure AD issues, we recommended
     * using this value in a general-purpose authorization system.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    sub: string;
    /**
     * @hidden
     * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
     * use this value to access tenant-specific directory resources in a multitenant application. For example,
     * you can use this value to identify the tenant in a call to the Graph API.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    tid: string;
    /**
     * @hidden
     * Defines the end of the time interval within which a token is valid. The service that validates the token
     * should verify that the current date is within the token lifetime; otherwise it should reject the token. The
     * service might allow for up to five minutes beyond the token lifetime to account for any differences in clock
     * time ("time skew") between Azure AD and the service.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    exp: number;
    /**
     * @hidden
     * Defines the start of the time interval within which a token is valid. The service that validates the token
     * should verify that the current date is within the token lifetime; otherwise it should reject the token. The
     * service might allow for up to five minutes beyond the token lifetime to account for any differences in clock
     * time ("time skew") between Azure AD and the service.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    nbf: number;
    /**
     * @hidden
     * Stores the user name of the user principal.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    upn: string;
    /**
     * @hidden
     * Stores the version number of the token.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    ver: string;
    /**
     * @hidden
     * Stores the data residency of the user.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    dataResidency?: DataResidency;
  }

  /**
   * @hidden
   * Limited set of data residencies information exposed to 1P application developers
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export enum DataResidency {
    /**
     * Public
     */
    Public = 'public',

    /**
     * European Union Data Boundary
     */
    EUDB = 'eudb',

    /**
     * Other, stored to cover fields that will not be exposed
     */
    Other = 'other',
  }

  /**
   * @deprecated
   * As of 2.0.0, this interface has been deprecated in favor of a Promise-based pattern.
   * @hidden
   * Describes the UserRequest. Success callback describes how a successful request is handled.
   * Failure callback describes how a failed request is handled.
   * @internal
   * Limited to Microsoft-internal use
   */
  export interface UserRequest {
    /**
     * A function that is called if the token request succeeds, with the resulting token.
     */
    successCallback?: (user: UserProfile) => void;
    /**
     * A function that is called if the token request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
  }
}
