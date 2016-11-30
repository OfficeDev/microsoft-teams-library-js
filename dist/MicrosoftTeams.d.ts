interface MessageEvent {
    originalEvent: MessageEvent;
}
/**
 * This is the root namespace for the JavaScript SDK.
 */
declare namespace microsoftTeams {
    /**
     * Initializes the library. This must be called before any other SDK calls.
     * The caller should only call this once the frame is loaded successfully.
     */
    function initialize(): void;
    /**
     * Retrieves the current context the frame is running in.
     * @param callback The callback to invoke when the {@link Context} object is retrieved.
     */
    function getContext(callback: (context: Context) => void): void;
    /**
     * Registers a handler for when the user changes their theme.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user changes their theme.
     */
    function registerOnThemeChangeHandler(handler: (theme: string) => void): void;
    /**
     * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
     * valid domains specified in the tab manifest; otherwise, an exception will be thrown. This function only
     * needs to be used when navigating the frame to a URL in a different domain than the current one in
     * a way that keeps the app informed of the change and allows the SDK to continue working.
     * @param url The url to navigate the frame to.
     */
    function navigateCrossDomain(url: string): void;
    /**
     * Shares a deep link a user can use to navigate back to a specific state in this page.
     */
    function shareDeepLink(deepLinkParameters: DeepLinkParameters): void;
    /**
     * Namespace to interact with the settings-specific part of the SDK.
     * This object is only usable on the settings frame.
     */
    namespace settings {
        /**
         * Sets the validity state for the settings.
         * The inital value is false so the user will not be able to save the settings until this is called with true.
         * @param validityState A value indicating whether the save or remove button is enabled for the user.
         */
        function setValidityState(validityState: boolean): void;
        /**
         * Gets the settings for the current instance.
         * @param callback The callback to invoke when the {@link Settings} object is retrieved.
         */
        function getSettings(callback: (settings: Settings) => void): void;
        /**
         * Sets the settings for the current instance.
         * Note that this is an asynchronous operation so there are no guarentees as to when calls
         * to getSettings will reflect the changed state.
         * @param settings The desired settings for this current instance.
         */
        function setSettings(settings: Settings): void;
        /**
         * Registers a handler for when the user attempts to save the settings. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the save button.
         */
        function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void;
        /**
         * Registers a handler for when the user attempts to remove the content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the remove
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the remove button.
         */
        function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void;
        interface Settings {
            /**
             * A suggested display name for the new content.
             * In the settings for an existing instance being updated, this call has no effect.
             */
            suggestedDisplayName?: string;
            /**
             * Sets the url to use for the content of this instance.
             */
            contentUrl: string;
            /**
             * Sets the remove URL for the remove config experience
             */
            removeUrl?: string;
            /**
             * Sets the url to use for the external link to view the underlying resource in a browser.
             */
            websiteUrl?: string;
            /**
             * The custom settings for this content instance.
             * The developer may use this for generic storage specific to this instance,
             * for example a JSON blob describing the previously selected options used to pre-populate the UI.
             * The string must be less than 1kb.
             */
            customSettings?: string;
        }
        interface SaveEvent {
            /**
             * Notifies that the underlying resource has been created and the settings may be saved.
             */
            notifySuccess(): void;
            /**
             * Notifies that the underlying resource creation failed and that the settings may not be saved.
             * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user. Otherwise a generic error is displayed.
             */
            notifyFailure(reason?: string): void;
        }
        interface RemoveEvent {
            /**
             * Notifies that the underlying resource has been removed and the content may be removed.
             */
            notifySuccess(): void;
            /**
             * Notifies that the underlying resource removal failed and that the content may not be removed.
             * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user. Otherwise a generic error is displayed.
             */
            notifyFailure(reason?: string): void;
        }
    }
    /**
     * Namespace to interact with the authentication-specific part of the SDK.
     * This object is used for starting or completing authentication flows.
     */
    namespace authentication {
        /**
         * Initiates an authentication request which pops up a new windows with the specified settings.
         * @param authenticateParameters A set of values that configure the authentication popup.
         */
        function authenticate(authenticateParameters: AuthenticateParameters): void;
        /**
         * Notifies the frame that initiated this authentication request that the request was successful.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param result Specifies a result for the authentication. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        function notifySuccess(result?: string): void;
        /**
         * Notifies the frame that initiated this authentication request that the request failed.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param reason Specifies a reason for the authentication failure. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        function notifyFailure(reason?: string): void;
        interface AuthenticateParameters {
            /**
             * The url for the authentication popup
             */
            url: string;
            /**
             * The preferred width for the popup. Note that this value may be ignored if outside the acceptable bounds.
             */
            width?: number;
            /**
             * The preferred height for the popup. Note that this value may be ignored if outside the acceptable bounds.
             */
            height?: number;
            /**
             * A function which is called if the authentication succeeds with the result returned from the authentication popup.
             */
            successCallback?: (result?: string) => void;
            /**
             * A function which is called if the authentication fails with the reason for the failure returned from the authentication popup.
             */
            failureCallback?: (reason?: string) => void;
        }
    }
    interface Context {
        /**
         * The O365 group id for the team with which the content is associated.
         * This field is only available when needsIdentity is set in the manifest.
         */
        groupId?: string;
        /**
         * The current locale that the user has configured for the app formatted as
         * languageId-countryId (e.g. en-us).
         */
        locale: string;
        /**
         * The current user's upn.
         * As a malicious party can host content in a malicious browser, this value should only
         * be used as a hint as to who the user is and never as proof of identity.
         * This field is only available when needsIdentity is set in the manifest.
         */
        upn?: string;
        /**
         * The current user's AAD tenant id.
         * As a malicious party can host content in a malicious browser, this value should only
         * be used as a hint as to who the user is and never as proof of identity.
         * This field is only available when needsIdentity is set in the manifest.
         */
        tid?: string;
        /**
         * The current UI theme the user is using.
         */
        theme?: string;
        /**
         * The context passed in as part of a deep link navigation to this page which should be used
         * to restore a specific page state.
         */
        deepLinkContext?: string;
    }
    interface DeepLinkParameters {
        /**
         * Any context the page might need to restore a specific state for the user.
         */
        deepLinkContext?: string;
        /**
         * The label which should be displayed for this deep link when the link is rendered in a client.
         */
        label?: string;
        /**
         * The fallback url to navigate the user to if there is no support for rendering the page inside the client.
         */
        webUrl?: string;
    }
}
