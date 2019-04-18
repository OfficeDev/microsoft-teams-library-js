/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
export declare namespace authentication {
    /**
     * Registers the authentication GlobalVars.handlers
     * @param authenticateParameters A set of values that configure the authentication pop-up.
     */
    function registerAuthenticationHandlers(authenticateParameters: AuthenticateParameters): void;
    /**
     * Initiates an authentication request, which opens a new window with the specified settings.
     */
    function authenticate(authenticateParameters?: AuthenticateParameters): void;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests an Azure AD token to be issued on behalf of the app. The token is acquired from the cache
     * if it is not expired. Otherwise a request is sent to Azure AD to obtain a new token.
     * @param authTokenRequest A set of values that configure the token request.
     */
    function getAuthToken(authTokenRequest: AuthTokenRequest): void;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests the decoded Azure AD user identity on behalf of the app.
     */
    function getUser(userRequest: UserRequest): void;
    /**
     * Notifies the frame that initiated this authentication request that the request was successful.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifySuccess(result?: string, callbackUrl?: string): void;
    /**
     * Notifies the frame that initiated this authentication request that the request failed.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifyFailure(reason?: string, callbackUrl?: string): void;
    interface AuthenticateParameters {
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
    /**
     * @private
     * Hide from docs.
     * ------
     */
    interface AuthTokenRequest {
        /**
         * An array of resource URIs identifying the target resources for which the token should be requested.
         */
        resources: string[];
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
    interface UserRequest {
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
    interface UserProfile {
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
