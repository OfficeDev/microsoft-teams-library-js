// Shim in definitions used for browser-compat
interface MessageEvent
{
    // Needed for Chrome
    originalEvent: MessageEvent;
}

/**
 * This is the root namespace for the JavaScript SDK.
 */
namespace microsoftTeams
{
    "use strict";

    const version = "0.5";

    const validOrigins = [
        "https://teams.microsoft.com",
        "https://teams.microsoft.us",
        "https://int.teams.microsoft.com",
        "https://devspaces.skype.com",
        "https://ssauth.skype.com",
        "http://dev.local", // local development
    ];

    const handlers: {[func: string]: Function} = {};

    // Ensure these declarations stay in sync with the framework.
    const frameContexts =
    {
        settings: "settings",
        content: "content",
        authentication: "authentication",
        remove: "remove",
    };

    const hostClientTypes =
    {
        desktop: "desktop",
        web: "web",
    };

    interface MessageRequest
    {
        id: number;
        func: string;
        args?: any[]; // tslint:disable-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    }

    interface MessageResponse
    {
        id: number;
        args?: any[]; // tslint:disable-line:no-any:The args here are a passthrough from OnMessage where we do receive any[]
    }

    // This indicates whether initialize was called (started).
    // It does not indicate whether initialization is complete. That can be inferred by whether parentOrigin is set.
    let initializeCalled = false;

    let currentWindow: Window;
    let parentWindow: Window;
    let parentOrigin: string;
    let parentMessageQueue: MessageRequest[] = [];
    let childWindow: Window;
    let childOrigin: string;
    let childMessageQueue: MessageRequest[] = [];
    let nextMessageId = 0;
    let callbacks: {[id: number]: Function} = {};
    let frameContext: string;
    let hostClientType: string;

    let themeChangeHandler: (theme: string) => void;
    handlers["themeChange"] = handleThemeChange;

    /**
     * Initializes the library. This must be called before any other SDK calls.
     * The caller should only call this once the frame is loaded successfully.
     */
    export function initialize(): void
    {
        if (initializeCalled)
        {
            // Independent components may not know whether the SDK is initialized so may call it to be safe.
            // Just no-op if that happens to make it easier to use.
            return;
        }

        initializeCalled = true;

        // Undocumented field used to mock the window for unit tests
        currentWindow = this._window as Window || window;

        // Listen for messages post to our window
        let messageListener = (evt: MessageEvent) => processMessage(evt);
        currentWindow.addEventListener("message", messageListener, false);

        // If we are in an iframe then our parent window is the one hosting us (i.e. window.parent); otherwise,
        // it's the window that opened us (i.e. window.opener)
        parentWindow = (currentWindow.parent !== currentWindow.self) ? currentWindow.parent : currentWindow.opener;

        try
        {
            // Send the initialized message to any origin since at this point we most likely don't know what our
            // parent window's origin is yet and this message contains no data that could pose a security risk.
            parentOrigin = "*";
            let messageId = sendMessageRequest(parentWindow, "initialize", [ version ]);
            callbacks[messageId] = (context: string, clientType: string) =>
            {
                frameContext = context;
                hostClientType = clientType;
            };
        }
        finally
        {
            parentOrigin = null;
        }

        // Undocumented function used to clear state between unit tests
        this._uninitialize = () =>
        {
            if (frameContext === frameContexts.settings)
            {
                settings.registerOnSaveHandler(null);
            }

            if (frameContext === frameContexts.remove)
            {
                settings.registerOnRemoveHandler(null);
            }

            initializeCalled = false;
            parentWindow = null;
            parentOrigin = null;
            parentMessageQueue = [];
            childWindow = null;
            childOrigin = null;
            childMessageQueue = [];
            nextMessageId = 0;
            callbacks = {};
            frameContext = null;
            hostClientType = null;

            currentWindow.removeEventListener("message", messageListener, false);
        };
    }

    /**
     * Retrieves the current context the frame is running in.
     * @param callback The callback to invoke when the {@link Context} object is retrieved.
     */
    export function getContext(callback: (context: Context) => void): void
    {
        ensureInitialized();

        let messageId = sendMessageRequest(parentWindow, "getContext");
        callbacks[messageId] = callback;
    }

    /**
     * Registers a handler for when the user changes their theme.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user changes their theme.
     */
    export function registerOnThemeChangeHandler(handler: (theme: string) => void): void
    {
        ensureInitialized();

        themeChangeHandler = handler;
    }

    function handleThemeChange(theme: string): void
    {
        if (themeChangeHandler)
        {
            themeChangeHandler(theme);
        }

        if (childWindow)
        {
            sendMessageRequest(childWindow, "themeChange", [ theme ]);
        }
    }

    /**
     * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
     * valid domains specified in the tab manifest; otherwise, an exception will be thrown. This function only
     * needs to be used when navigating the frame to a URL in a different domain than the current one in
     * a way that keeps the app informed of the change and allows the SDK to continue working.
     * @param url The url to navigate the frame to.
     */
    export function navigateCrossDomain(url: string): void
    {
        ensureInitialized();

        let messageId = sendMessageRequest(parentWindow, "navigateCrossDomain", [ url ]);
        callbacks[messageId] = (success: boolean) =>
        {
            if (!success)
            {
                throw new Error("Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
            }
        };
    }

    /**
     * Shares a deep link a user can use to navigate back to a specific state in this page.
     */
    export function shareDeepLink (deepLinkParameters: DeepLinkParameters): void
    {
        ensureInitialized(frameContexts.content);

        sendMessageRequest(parentWindow, "shareDeepLink", [
            deepLinkParameters.subEntityId,
            deepLinkParameters.subEntityLabel,
            deepLinkParameters.subEntityWebUrl,
        ]);
    }

    /**
     * Namespace to interact with the settings-specific part of the SDK.
     * This object is only usable on the settings frame.
     */
    export namespace settings
    {
        let saveHandler: (evt: SaveEvent) => void;
        let removeHandler: (evt: RemoveEvent) => void;
        handlers["settings.save"] = handleSave;
        handlers["settings.remove"] = handleRemove;

        /**
         * Sets the validity state for the settings.
         * The inital value is false so the user will not be able to save the settings until this is called with true.
         * @param validityState A value indicating whether the save or remove button is enabled for the user.
         */
        export function setValidityState(validityState: boolean): void
        {
            ensureInitialized(frameContexts.settings, frameContexts.remove);

            sendMessageRequest(parentWindow, "settings.setValidityState", [ validityState ]);
        }

        /**
         * Gets the settings for the current instance.
         * @param callback The callback to invoke when the {@link Settings} object is retrieved.
         */
        export function getSettings(callback: (settings: Settings) => void): void
        {
            ensureInitialized(frameContexts.settings, frameContexts.remove);

            let messageId = sendMessageRequest(parentWindow, "settings.getSettings");
            callbacks[messageId] = callback;
        }

        /**
         * Sets the settings for the current instance.
         * Note that this is an asynchronous operation so there are no guarentees as to when calls
         * to getSettings will reflect the changed state.
         * @param settings The desired settings for this current instance.
         */
        export function setSettings(settings: Settings): void
        {
            ensureInitialized(frameContexts.settings);

            sendMessageRequest(parentWindow, "settings.setSettings", [ settings ]);
        }

        /**
         * Registers a handler for when the user attempts to save the settings. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the save button.
         */
        export function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void
        {
            ensureInitialized(frameContexts.settings);

            saveHandler = handler;
        }

        /**
         * Registers a handler for when the user attempts to remove the content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the remove
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the remove button.
         */
        export function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void
        {
            ensureInitialized(frameContexts.remove);

            removeHandler = handler;
        }

        function handleSave(): void
        {
            let saveEvent = new SaveEventImpl();
            if (saveHandler)
            {
                saveHandler(saveEvent);
            }
            else
            {
                // If there is no registered handler, we assume success
                saveEvent.notifySuccess();
            }
        }

        export interface Settings
        {
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
             * The developer-defined unique id for the entity this content points to.
             */
            entityId: string;
        }

        export interface SaveEvent
        {
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

        export interface RemoveEvent
        {
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

        class SaveEventImpl implements SaveEvent
        {
            public notified: boolean = false;

            public notifySuccess(): void
            {
                this.ensureNotNotified();

                sendMessageRequest(parentWindow, "settings.save.success");

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessageRequest(parentWindow, "settings.save.failure", [ reason ]);

                this.notified = true;
            }

            private ensureNotNotified(): void
            {
                if (this.notified)
                {
                    throw new Error("The SaveEvent may only notify success or failure once.");
                }
            }
        }

        function handleRemove(): void
        {
            let removeEvent = new RemoveEventImpl();
            if (removeHandler)
            {
                removeHandler(removeEvent);
            }
            else
            {
                // If there is no registered handler, we assume success
                removeEvent.notifySuccess();
            }
        }

        class RemoveEventImpl implements RemoveEvent
        {
            public notified: boolean = false;

            public notifySuccess(): void
            {
                this.ensureNotNotified();

                sendMessageRequest(parentWindow, "settings.remove.success");

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessageRequest(parentWindow, "settings.remove.failure", [ reason ]);

                this.notified = true;
            }

            private ensureNotNotified(): void
            {
                if (this.notified)
                {
                    throw new Error("The removeEvent may only notify success or failure once.");
                }
            }
        }
    }

    /**
     * Namespace to interact with the authentication-specific part of the SDK.
     * This object is used for starting or completing authentication flows.
     */
    export namespace authentication
    {
        let authParams: AuthenticateParameters;
        let authWindowMonitor: number;
        handlers["authentication.authenticate.success"] = handleSuccess;
        handlers["authentication.authenticate.failure"] = handleFailure;

        /**
         * Initiates an authentication request which pops up a new windows with the specified settings.
         * @param authenticateParameters A set of values that configure the authentication popup.
         */
        export function authenticate(authenticateParameters: AuthenticateParameters): void
        {
            ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);

            if (hostClientType === hostClientTypes.desktop)
            {
                // Convert any relative URLs into absolute ones before sending them over to our parent window
                let link = document.createElement("a");
                link.href = authenticateParameters.url;

                // Ask our parent window to open an authentication window with the parameters provided by the caller
                let messageId = sendMessageRequest(parentWindow, "authentication.authenticate", [
                    link.href,
                    authenticateParameters.width,
                    authenticateParameters.height,
                ]);
                callbacks[messageId] = (success: boolean, response: string) =>
                {
                    if (success)
                    {
                        authenticateParameters.successCallback(response);
                    }
                    else
                    {
                        authenticateParameters.failureCallback(response);
                    }
                };
            }
            else
            {
                // Open an authentication window with the parameters provided by the caller
                openAuthenticationWindow(authenticateParameters);
            }
        }

        /**
         * Requests an AAD token to be issued on behalf of the app. The token is acquired from the cache
         * if it is not expired. Otherwise a request will be sent to AAD to obtain a new token.
         * @param authTokenRequest A set of values that configure the token request.
         */
        export function getAuthToken(authTokenRequest: AuthTokenRequest): void
        {
            ensureInitialized();

            let messageId = sendMessageRequest(parentWindow, "authentication.getAuthToken", [ authTokenRequest.resources ]);
            callbacks[messageId] = (success: boolean, result: string) =>
            {
                if (success)
                {
                    authTokenRequest.successCallback(result);
                }
                else
                {
                    authTokenRequest.failureCallback(result);
                }
            };
        }

        /**
         * Requests the decoded AAD user identity on behalf of the app.
         */
        export function getUser(userRequest: UserRequest): void
        {
            ensureInitialized();

            let messageId = sendMessageRequest(parentWindow, "authentication.getUser");
            callbacks[messageId] = (success: boolean, result: UserProfile | string) =>
            {
                if (success)
                {
                    userRequest.successCallback(result as UserProfile);
                }
                else
                {
                    userRequest.failureCallback(result as string);
                }
            };
        }

        function closeAuthenticationWindow(): void
        {
            // Stop monitoring the authentication window
            stopAuthenticationWindowMonitor();

            // Try to close the authentication window and clear all properties associated with it
            try
            {
                if (childWindow)
                {
                    childWindow.close();
                }
            }
            finally
            {
                childWindow = null;
                childOrigin = null;
            }
        }

        function openAuthenticationWindow(authenticateParameters: AuthenticateParameters): void
        {
            authParams = authenticateParameters;

            // Close the previously opened window if we have one
            closeAuthenticationWindow();

            // Start with a sensible default size
            let width = authParams.width || 600;
            let height = authParams.height || 400;

            // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
            width = Math.min(width, (currentWindow.outerWidth - 400));
            height = Math.min(height, (currentWindow.outerHeight - 200));

            // Convert any relative URLs into absolute ones before sending them over to our parent window
            let link = document.createElement("a");
            link.href = authParams.url;

            // We are running in the browser so we need to center the new window ourselves
            let left: number = (typeof currentWindow.screenLeft !== "undefined") ? currentWindow.screenLeft : currentWindow.screenX;
            let top: number = (typeof currentWindow.screenTop !== "undefined") ? currentWindow.screenTop : currentWindow.screenY;
            left += (currentWindow.outerWidth / 2) - (width / 2);
            top += (currentWindow.outerHeight / 2) - (height / 2);

            // Open a child window with a desired set of standard browser features
            childWindow = currentWindow.open(link.href, "_blank", "toolbar=no, location=yes, status=no, menubar=no, top=" + top + ", left=" + left + ", width=" + width + ", height=" + height);
            if (childWindow)
            {
                // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
                startAuthenticationWindowMonitor();
            }
            else
            {
                // If we failed to open the window fail the authentication flow
                handleFailure("FailedToOpenWindow");
            }
        }

        function stopAuthenticationWindowMonitor(): void
        {
            if (authWindowMonitor)
            {
                clearInterval(authWindowMonitor);
                authWindowMonitor = 0;
            }

            delete handlers["initialize"];
            delete handlers["navigateCrossDomain"];
        }

        function startAuthenticationWindowMonitor(): void
        {
            // Stop the previous window monitor if there is one running
            stopAuthenticationWindowMonitor();

            // Create an interval loop that:
            // - Notifies the caller of failure if it detects that the authentication window is closed
            // - Keeps pinging the authentication window while its open in order to re-establish
            //   contact with any pages along the authentication flow that need to communicate
            //   with us
            authWindowMonitor = setInterval(() =>
            {
                if (!childWindow || childWindow.closed)
                {
                    handleFailure("CancelledByUser");
                }
                else
                {
                    let savedChildOrigin = childOrigin;
                    try
                    {
                        childOrigin = "*";
                        sendMessageRequest(childWindow, "ping");
                    }
                    finally
                    {
                        childOrigin = savedChildOrigin;
                    }
                }
            }, 100);

            // Set up an initialize message handler that will give the authentication window its frame context
            handlers["initialize"] = () =>
            {
                return [ frameContexts.authentication, hostClientType ];
            };

            // Set up a navigateCrossDomain message handlers that will block cross-domain re-navigation attempts
            // in the authentication window. We could at some point choose to implement this method via a call to
            // authenticationWindow.location.href = url; however, we would first need to figure out how to
            // validate the url against the tab's list of valid domains.
            handlers["navigateCrossDomain"] = (url: string) =>
            {
                return false;
            };
        }

        /**
         * Notifies the frame that initiated this authentication request that the request was successful.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param result Specifies a result for the authentication. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        export function notifySuccess(result?: string): void
        {
            ensureInitialized(frameContexts.authentication);

            sendMessageRequest(parentWindow, "authentication.authenticate.success", [result]);

            // Wait for the message to be sent before closing the window
            waitForMessageQueue(parentWindow, () => currentWindow.close());
        }

        /**
         * Notifies the frame that initiated this authentication request that the request failed.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param reason Specifies a reason for the authentication failure. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        export function notifyFailure(reason?: string): void
        {
            ensureInitialized(frameContexts.authentication);

            sendMessageRequest(parentWindow, "authentication.authenticate.failure", [ reason ]);

            // Wait for the message to be sent before closing the window
            waitForMessageQueue(parentWindow, () => currentWindow.close());
        }

        function handleSuccess(result?: string): void
        {
            try
            {
                if (authParams && authParams.successCallback)
                {
                    authParams.successCallback(result);
                }
            }
            finally
            {
                authParams = null;
                closeAuthenticationWindow();
            }
        }

        function handleFailure(reason?: string): void
        {
            try
            {
                if (authParams && authParams.failureCallback)
                {
                    authParams.failureCallback(reason);
                }
            }
            finally
            {
                authParams = null;
                closeAuthenticationWindow();
            }
        }

        export interface AuthenticateParameters
        {
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

        export interface AuthTokenRequest
        {
            /**
             * An array of resource URIs identifying the target resources for which the token should be requested.
             */
            resources: string[];

            /**
             * A function which is called if the token request succeeds with the resulting token.
             */
            successCallback?: (token: string) => void;

            /**
             * A function which is called if the token request fails with the reason for the failure.
             */
            failureCallback?: (reason: string) => void;
        }

        export interface UserRequest
        {
            /**
             * A function which is called if the token request succeeds with the resulting token.
             */
            successCallback?: (user: UserProfile) => void;

            /**
             * A function which is called if the token request fails with the reason for the failure.
             */
            failureCallback?: (reason: string) => void;
        }

        export interface UserProfile
        {
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
             * returns, the issuer is sts.windows.net. The GUID in the Issuer claim value is the tenant ID of the Azure AD
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
             * Provides a human readable value that identifies the subject of the token. This value is not guaranteed to
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
             * using this value in a general purpose authorization system.
             */
            sub: string;

            /**
             * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
             * use this value to access tenant-specific directory resources in a multi-tenant application. For example,
             * you can use this value to identify the tenant in a call to the Graph API.
             */
            tid: string;

            /**
             * Defines the time interval within which a token is valid. The service that validates the token should verify
             * that the current date is within the token lifetime, else it should reject the token. The service might allow
             * for up to five minutes beyond the token lifetime range to account for any differences in clock time ("time
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

    export interface Context
    {
        /**
         * The O365 group id for the team with which the content is associated.
         * This field is only available when the identity permission is requested in the manifest.
         */
        groupId?: string;

        /**
         * The Microsoft Teams id for the team with which the content is associated.
         */
        teamId?: string;

        /**
         * The Microsoft Teams id for the channel with which the content is associated.
         */
        channelId?: string;

        /**
         * The developer-defined unique id for the entity this content points to.
         */
        entityId: string;

        /**
         * The developer-defined unique id for the sub-entity this content points to.
         * This field should be used to restore to a specific state within an entity, for example scrolling to or activating a specific piece of content.
         */
        subEntityId?: string;

        /**
         * The current locale that the user has configured for the app formatted as
         * languageId-countryId (e.g. en-us).
         */
        locale: string;

        /**
         * The current user's upn.
         * As a malicious party can host content in a malicious browser, this value should only
         * be used as a hint as to who the user is and never as proof of identity.
         * This field is only available when the identity permission is requested in the manifest.
         */
        upn?: string;

        /**
         * The current user's AAD tenant id.
         * As a malicious party can host content in a malicious browser, this value should only
         * be used as a hint as to who the user is and never as proof of identity.
         * This field is only available when the identity permission is requested in the manifest.
         */
        tid?: string;

        /**
         * The current UI theme the user is using.
         */
        theme?: string;
    }

    export interface DeepLinkParameters
    {
        /**
         * The developer-defined unique id for the sub-entity this deep link points to within the current entity.
         * This field should be used to restore to a specific state within an entity, for example scrolling to or activating a specific piece of content.
         */
        subEntityId: string;

        /**
         * The label for the sub-entity which should be displayed when the deep link is rendered in a client.
         */
        subEntityLabel: string;

        /**
         * The fallback url to navigate the user to if there is no support for rendering the page inside the client.
         * This url should lead directly to the sub-entity.
         */
        subEntityWebUrl?: string;
    }

    function ensureInitialized(...expectedFrameContexts: string[]): void
    {
        if (!initializeCalled)
        {
            throw new Error("The library has not yet been initialized");
        }

        if (frameContext && expectedFrameContexts && expectedFrameContexts.length > 0)
        {
            let found = false;
            for (let i = 0; i < expectedFrameContexts.length; i++)
            {
                if (expectedFrameContexts[i] === frameContext)
                {
                    found = true;
                    break;
                }
            }

            if (!found)
            {
                throw new Error("This call is not allowed in the '" + frameContext + "' context");
            }
        }
    }

    function processMessage(evt: MessageEvent): void
    {
        // Process only if we received a valid message
        if (!evt || !evt.data || typeof evt.data !== "object")
        {
            return;
        }

        // Process only if the message is coming from a different window and a valid origin
        let messageSource = evt.source || evt.originalEvent.source;
        let messageOrigin = evt.origin || evt.originalEvent.origin;
        if (messageSource === currentWindow ||
            (messageOrigin !== currentWindow.location.origin &&
             validOrigins.indexOf(messageOrigin.toLowerCase()) === -1))
        {
            return;
        }

        // Update our parent and child relationships based on this message
        updateRelationships(messageSource, messageOrigin);

        // Handle the message
        if (messageSource === parentWindow)
        {
            handleParentMessage(evt);
        }
        else if (messageSource === childWindow)
        {
            handleChildMessage(evt);
        }
    }

    function updateRelationships(messageSource: Window, messageOrigin: string): void
    {
        // Determine whether the source of the message is our parent or child and update our
        // window and origin pointer accordingly
        if (!parentWindow || (messageSource === parentWindow))
        {
            parentWindow = messageSource;
            parentOrigin = messageOrigin;
        }
        else if (!childWindow || (messageSource === childWindow))
        {
            childWindow = messageSource;
            childOrigin = messageOrigin;
        }

        // Clean up pointers to closed parent and child windows
        if (parentWindow && parentWindow.closed)
        {
            parentWindow = null;
            parentOrigin = null;
        }
        if (childWindow && childWindow.closed)
        {
            childWindow = null;
            childOrigin = null;
        }

        // If we have any messages in our queue send them now
        flushMessageQueue(parentWindow);
        flushMessageQueue(childWindow);
    }

    function handleParentMessage(evt: MessageEvent): void
    {
        if ("id" in evt.data)
        {
            // Call any associated callbacks
            const message = evt.data as MessageResponse;
            const callback = callbacks[message.id];
            if (callback)
            {
                callback.apply(null, message.args);

                // Remove the callback to only let the callback get called once and to free up memory.
                delete callbacks[message.id];
            }
        }
        else if ("func" in evt.data)
        {
            // Delegate the request to the proper handler
            const message = evt.data as MessageRequest;
            const handler = handlers[message.func];
            if (handler)
            {
                // We don't expect any handler to respond at this point
                handler.apply(this, message.args);
            }
        }
    }

    function handleChildMessage(evt: MessageEvent): void
    {
        if (("id" in evt.data) && ("func" in evt.data))
        {
            // Try to delegate the request to the proper handler
            const message = evt.data as MessageRequest;
            const handler = handlers[message.func];
            if (handler)
            {
                let result = handler.apply(this, message.args);
                if (result)
                {
                    sendMessageResponse(childWindow, message.id, Array.isArray(result) ? result : [ result ]);
                }
            }
            else
            {
                // Proxy to parent
                let messageId = sendMessageRequest(parentWindow, message.func, message.args);

                // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
                callbacks[messageId] = (...args: any[]) =>
                {
                    if (childWindow)
                    {
                        sendMessageResponse(childWindow, message.id, args);
                    }
                };
            }
        }
    }

    function getTargetMessageQueue(targetWindow: Window): MessageRequest[]
    {
        return (targetWindow === parentWindow) ? parentMessageQueue :
               (targetWindow === childWindow) ? childMessageQueue :
               [];
    }

    function getTargetOrigin(targetWindow: Window): string
    {
        return (targetWindow === parentWindow) ? parentOrigin :
               (targetWindow === childWindow) ? childOrigin :
               null;
    }

    function flushMessageQueue(targetWindow: Window): void
    {
        let targetOrigin = getTargetOrigin(targetWindow);
        let targetMessageQueue = getTargetMessageQueue(targetWindow);
        while (targetWindow && targetOrigin && (targetMessageQueue.length > 0))
        {
            targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
        }
    }

    function waitForMessageQueue(targetWindow: Window, callback: () => void): void
    {
        let messageQueueMonitor = setInterval(() =>
        {
            if (getTargetMessageQueue(targetWindow).length === 0)
            {
                clearInterval(messageQueueMonitor);
                callback();
            }
        }, 100);
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessageRequest(targetWindow: Window, actionName: string, args?: any[]): number
    {
        let request = createMessageRequest(actionName, args);
        let targetOrigin = getTargetOrigin(targetWindow);

        // If the target window isn't closed and we already know its origin then send the message right away; otherwise,
        // queue up the message and send it once the origin has been established
        if (targetWindow && targetOrigin)
        {
            targetWindow.postMessage(request, targetOrigin);
        }
        else
        {
            getTargetMessageQueue(targetWindow).push(request);
        }

        return request.id;
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessageResponse(targetWindow: Window, id: number, args?: any[]): void
    {
        let response = createMessageResponse(id, args);
        let targetOrigin = getTargetOrigin(targetWindow);
        if (targetWindow && targetOrigin)
        {
            targetWindow.postMessage(response, targetOrigin);
        }
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessageRequest(func: string, args: any[]): MessageRequest
    {
        return {
            id: nextMessageId++,
            func: func,
            args: args || [],
        };
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessageResponse(id: number, args: any[]): MessageResponse
    {
        return {
            id: id,
            args: args || [],
        };
    }
}
