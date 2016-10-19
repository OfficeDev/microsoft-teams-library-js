declare namespace microsoftTeams
{
    // Initializes the library. This must be called before any other API calls.
    // The caller should only call this once the frame is loaded successfully.
    function initialize(): void;

    // Retrieves the current context the frame is running in.
    function getContext(callback: (context: Context) => void): void;

    // Registers a handler for when the user changes their theme.
    // Only one handler may be registered at a time. Subsequent registrations will override the first.
    function registerOnThemeChangeHandler(handler: (theme: string) => void): void;

    // Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
    // valid domains specified in the tab manifest; otherwise, an exception will be thrown. This API only
    // needs to be used when navigating the frame to a URL in a different domain than the current one in
    // a way that keeps the SkypeTeams app informed of the change and allows the API to continue working.
    function navigateCrossDomain(url: string): void;

    // Namespace to interact with the settings view-specific API.
    // This object is only usable on the settings frame.
    namespace settings
    {
        // Sets the validity state for the settings.
        // The inital value is false so the user will not be able to save the settings until this is called with true.
        function setValidityState(validityState: boolean): void;

        // Gets the settings for the current instance.
        function getSettings(callback: (settings: Settings) => void): void;

        // Sets the settings for the current instance.
        // Note that this is an asynchronous operation so there are no guarentees as to when calls
        // to getSettings will reflect the changed state.
        function setSettings(settings: Settings): void;

        // Registers a handler for when the user attempts to save the settings. This handler should be used
        // to create or update the underlying resource powering the content.
        // The object passed to the handler must be used to notify whether to proceed with the save.
        // Only one handler may be registered at a time. Subsequent registrations will override the first.
        function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void;

        // Registers a handler for when the user attempts to remove the content. This handler should be used
        // to remove the underlying resource powering the content.
        // The object passed to the handler must be used to notify whether to proceed with the remove
        // Only one handler may be registered at a time. Subsequent registrations will override the first.
        function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void;

        interface Settings
        {
            // A suggested display name for the new content.
            // In the settings for an existing instance being updated, this call has no effect.
            suggestedDisplayName?: string;

            // Sets the url to use for the content of this instance.
            contentUrl: string;

            // Sets the remove URL for the remove config experience
            removeUrl?: string;

            // Sets the url to use for the external link to view the underlying resource in a browser.
            websiteUrl?: string;

            // The custom settings for this content instance.
            // The developer may use this for generic storage specific to this instance,
            // for example a JSON blob describing the previously selected options used to pre-populate the UI.
            // The string must be less than 1kb.
            customSettings?: string;
        }

        interface SaveEvent
        {
            // Notifies that the underlying resource has been created and the settings may be saved.
            notifySuccess(): void;

            // Notifies that the underlying resource creation failed and that the settings may not be saved.
            notifyFailure(reason?: string): void;
        }

        interface RemoveEvent
        {
            // Notifies that the underlying resource has been removed and the content may be removed.
            notifySuccess(): void;

            // Notifies that the underlying resource removal failed and that the content may not be removed.
            notifyFailure(reason?: string): void;
        }
    }

    namespace authentication
    {
        // Initiates an authentication request which pops up a new windows with the specified settings.
        function authenticate(authenticateParameters: AuthenticateParameters): void;

        // Notifies the frame that initiated this authentication request that the request was successful.
        // This function is only usable on the authentication window.
        // This call causes the authentication window to be closed.
        function notifySuccess(result?: string): void;

        // Notifies the frame that initiated this authentication request that the request failed.
        // This function is only usable on the authentication window.
        // This call causes the authentication window to be closed.
        function notifyFailure(reason?: string): void;

        interface AuthenticateParameters
        {
            // The url for the authentication popup
            url: string,

            // The preferred width for the popup. Note that this value may be ignored if outside the acceptable bounds.
            width?: number,

            // The preferred height for the popup. Note that this value may be ignored if outside the acceptable bounds.
            height?: number,

            // A function which is called if the authentication succeeds with the result returned from the authentication popup.
            successCallback?: (result?: string) => void,

            // A function which is called if the authentication fails with the reason for the failure returned from the authentication popup.
            failureCallback?: (reason?: string) => void
        }
    }

    interface Context
    {
        // The O365 group id for the team with which the content is associated.
        // This field is only available when needsIdentity is set in the manifest.
        groupId?: string;

        // The current locale that the user has configured for the app formatted as
        // languageId-countryId (e.g. en-us).
        locale: string;

        // The current user's upn.
        // As a malicious party can host content in a malicious browser, this value should only
        // be used as a hint as to who the user is and never as proof of identity.
        // This field is only available when needsIdentity is set in the manifest.
        upn?: string;

        // The current user's AAD tenant id.
        // As a malicious party can host content in a malicious browser, this value should only
        // be used as a hint as to who the user is and never as proof of identity.
        // This field is only available when needsIdentity is set in the manifest.
        tid?: string;

        // The current UI theme the user is using.
        theme?: string;
    }
}
