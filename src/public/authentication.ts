import { ensureInitialized } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { FrameContexts, HostClientType } from './constants';
import {
  Communication,
  sendMessageToParent,
  sendMessageEventToChild,
  waitForMessageQueue,
} from '../internal/communication';
import { registerHandler, removeHandler } from '../internal/handlers';

/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
export namespace authentication {
  let authParams: AuthenticateParameters;
  let authWindowMonitor: number;

  export function initialize(): void {
    registerHandler('authentication.authenticate.success', handleSuccess, false);
    registerHandler('authentication.authenticate.failure', handleFailure, false);
  }

  /**
   * Registers the authentication Communication.handlers
   * @param authenticateParameters A set of values that configure the authentication pop-up.
   */
  export function registerAuthenticationHandlers(authenticateParameters: AuthenticateParameters): void {
    authParams = authenticateParameters;
  }

  /**
   * Initiates an authentication request, which opens a new window with the specified settings.
   */
  export function authenticate(authenticateParameters?: AuthenticateParameters): void {
    const authenticateParams = authenticateParameters !== undefined ? authenticateParameters : authParams;
    ensureInitialized(
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.remove,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (
      GlobalVars.hostClientType === HostClientType.desktop ||
      GlobalVars.hostClientType === HostClientType.android ||
      GlobalVars.hostClientType === HostClientType.ios ||
      GlobalVars.hostClientType === HostClientType.rigel ||
      GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
      GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
      GlobalVars.hostClientType === HostClientType.teamsPhones ||
      GlobalVars.hostClientType === HostClientType.teamsDisplays
    ) {
      // Convert any relative URLs into absolute URLs before sending them over to the parent window.
      const link = document.createElement('a');
      link.href = authenticateParams.url;
      // Ask the parent window to open an authentication window with the parameters provided by the caller.
      sendMessageToParent(
        'authentication.authenticate',
        [link.href, authenticateParams.width, authenticateParams.height],
        (success: boolean, response: string) => {
          if (success) {
            authenticateParams.successCallback(response);
          } else {
            authenticateParams.failureCallback(response);
          }
        },
      );
    } else {
      // Open an authentication window with the parameters provided by the caller.
      openAuthenticationWindow(authenticateParams);
    }
  }

  /**
   * Requests an Azure AD token to be issued on behalf of the app. The token is acquired from the cache
   * if it is not expired. Otherwise a request is sent to Azure AD to obtain a new token.
   * @param authTokenRequest A set of values that configure the token request.
   */
  export function getAuthToken(authTokenRequest: AuthTokenRequest): void {
    ensureInitialized();
    sendMessageToParent(
      'authentication.getAuthToken',
      [authTokenRequest.resources, authTokenRequest.claims, authTokenRequest.silent],
      (success: boolean, result: string) => {
        if (success) {
          authTokenRequest.successCallback(result);
        } else {
          authTokenRequest.failureCallback(result);
        }
      },
    );
  }

  /**
   * @private
   * Hide from docs.
   * ------
   * Requests the decoded Azure AD user identity on behalf of the app.
   */
  export function getUser(userRequest: UserRequest): void {
    ensureInitialized();
    sendMessageToParent('authentication.getUser', (success: boolean, result: UserProfile | string) => {
      if (success) {
        userRequest.successCallback(result as UserProfile);
      } else {
        userRequest.failureCallback(result as string);
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
    authParams = authenticateParameters;
    // Close the previously opened window if we have one
    closeAuthenticationWindow();
    // Start with a sensible default size
    let width = authParams.width || 600;
    let height = authParams.height || 400;
    // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
    width = Math.min(width, Communication.currentWindow.outerWidth - 400);
    height = Math.min(height, Communication.currentWindow.outerHeight - 200);
    // Convert any relative URLs into absolute URLs before sending them over to the parent window
    const link = document.createElement('a');
    link.href = authParams.url;
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
   * Notifies the frame that initiated this authentication request that the request was successful.
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
   * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifySuccess(result?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, 'result', result);
    ensureInitialized(FrameContexts.authentication);
    sendMessageToParent('authentication.authenticate.success', [result]);
    // Wait for the message to be sent before closing the window
    waitForMessageQueue(Communication.parentWindow, () => setTimeout(() => Communication.currentWindow.close(), 200));
  }

  /**
   * Notifies the frame that initiated this authentication request that the request failed.
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
   * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
   */
  export function notifyFailure(reason?: string, callbackUrl?: string): void {
    redirectIfWin32Outlook(callbackUrl, 'reason', reason);
    ensureInitialized(FrameContexts.authentication);
    sendMessageToParent('authentication.authenticate.failure', [reason]);
    // Wait for the message to be sent before closing the window
    waitForMessageQueue(Communication.parentWindow, () => setTimeout(() => Communication.currentWindow.close(), 200));
  }

  function handleSuccess(result?: string): void {
    try {
      if (authParams && authParams.successCallback) {
        authParams.successCallback(result);
      }
    } finally {
      authParams = null;
      closeAuthenticationWindow();
    }
  }

  function handleFailure(reason?: string): void {
    try {
      if (authParams && authParams.failureCallback) {
        authParams.failureCallback(reason);
      }
    } finally {
      authParams = null;
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

  export interface AuthenticateParameters {
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
     * A function that is called if the authentication succeeds, with the result returned from the authentication pop-up.
     */
    successCallback?: (result?: string) => void;
    /**
     * A function that is called if the authentication fails, with the reason for the failure returned from the authentication pop-up.
     */
    failureCallback?: (reason?: string) => void;
  }

  export interface AuthTokenRequest {
    /**
     * An optional list of resource for which to acquire the access token; only used for full trust apps.
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
    /**
     * A function that is called if the token request succeeds, with the resulting token.
     */
    successCallback?: (token: string) => void;
    /**
     * A function that is called if the token request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
  }

  /**
   * @private
   * Hide from docs.
   * ------
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

  /**
   * @private
   * Hide from docs.
   * ------
   */
  export interface UserProfile {
    /**
     * The intended recipient of the token. The application that receives the token must verify that the audience
     * value is correct and reject any tokens intended for a different audience.
     */
    aud: string;
    /**
     * Identifies how the subject of the token was authenticated.
     */
    amr: string[];
    /**
     * Stores the time at which the token was issued. It is often used to measure token freshness.
     */
    iat: number;
    /**
     * Identifies the security token service (STS) that constructs and returns the token. In the tokens that Azure AD
     * returns, the issuer is sts.windows.net. The GUID in the issuer claim value is the tenant ID of the Azure AD
     * directory. The tenant ID is an immutable and reliable identifier of the directory.
     */
    iss: string;
    /**
     * Provides the last name, surname, or family name of the user as defined in the Azure AD user object.
     */
    family_name: string;
    /**
     * Provides the first or "given" name of the user, as set on the Azure AD user object.
     */
    given_name: string;
    /**
     * Provides a human-readable value that identifies the subject of the token. This value is not guaranteed to
     * be unique within a tenant and is designed to be used only for display purposes.
     */
    unique_name: string;
    /**
     * Contains a unique identifier of an object in Azure AD. This value is immutable and cannot be reassigned or
     * reused. Use the object ID to identify an object in queries to Azure AD.
     */
    oid: string;
    /**
     * Identifies the principal about which the token asserts information, such as the user of an application.
     * This value is immutable and cannot be reassigned or reused, so it can be used to perform authorization
     * checks safely. Because the subject is always present in the tokens the Azure AD issues, we recommended
     * using this value in a general-purpose authorization system.
     */
    sub: string;
    /**
     * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
     * use this value to access tenant-specific directory resources in a multitenant application. For example,
     * you can use this value to identify the tenant in a call to the Graph API.
     */
    tid: string;
    /**
     * Defines the time interval within which a token is valid. The service that validates the token should verify
     * that the current date is within the token lifetime; otherwise it should reject the token. The service might
     * allow for up to five minutes beyond the token lifetime to account for any differences in clock time ("time
     * skew") between Azure AD and the service.
     */
    exp: number;
    nbf: number;
    /**
     * Stores the user name of the user principal.
     */
    upn: string;
    /**
     * Stores the version number of the token.
     */
    ver: string;
  }
}
