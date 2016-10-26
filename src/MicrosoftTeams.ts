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

    const validOrigins = [
        "https://teams.microsoft.com",
        "https://teams.skype.com",
        "https://ppespaces.skype.com",
        "https://devspaces.skype.com",
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

    let parentWindow: Window;
    let parentOrigin: string;
    let messageQueue: MessageRequest[] = [];
    let nextMessageId = 0;
    let callbacks: {[id: number]: Function} = {};
    let frameContext: string;

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
            throw new Error("initialize must not be called more than once.");
        }

        initializeCalled = true;

        // Undocumented field used to mock the window for unit tests
        let currentWindow = this._window as Window || window;

        // If we are in an iframe then our parent window is the one hosting us (i.e. window.parent); otherwise,
        // it's the window that opened us (i.e. window.opener)
        parentWindow = (currentWindow.parent !== currentWindow.self) ? currentWindow.parent : currentWindow.opener;
        if (!parentWindow)
        {
            throw new Error("This page must be loaded in an iframe");
        }

        // Listen for messages post to our window (in a way that works for all browsers)
        let messageListener = (evt: MessageEvent) => processMessage(evt);
        currentWindow.addEventListener("message", messageListener, false);

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
            messageQueue = [];
            nextMessageId = 0;
            callbacks = {};
            frameContext = null;

            currentWindow.removeEventListener("message", messageListener, false);
        };

        try
        {
            // Send the initialized message to any origin since at this point we most likely don't know what our
            // parent window's origin is yet and this message contains no data that could pose a security risk.
            parentOrigin = "*";
            let messageId = sendMessage("initialize");
            callbacks[messageId] = (context: string) =>
            {
                frameContext = context;
            };
        }
        finally
        {
            parentOrigin = null;
        }
    }

    /**
     * Retrieves the current context the frame is running in.
     * @param callback The callback to invoke when the {@link Context} object is retrieved.
     */
    export function getContext(callback: (context: Context) => void): void
    {
        ensureInitialized();

        let messageId = sendMessage("getContext");
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

        let messageId = sendMessage("navigateCrossDomain", url);
        callbacks[messageId] = (success: boolean) =>
        {
            if (!success)
            {
                throw new Error("Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
            }
        };
    }

    /**
     * Namespace to interact with the settings view-specific SDK.
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

            sendMessage("settings.setValidityState", validityState);
        }

        /**
         * Gets the settings for the current instance.
         * @param callback The callback to invoke when the {@link Settings} object is retrieved.
         */
        export function getSettings(callback: (settings: Settings) => void): void
        {
            ensureInitialized(frameContexts.settings, frameContexts.remove);

            let messageId = sendMessage("settings.getSettings");
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

            sendMessage("settings.setSettings", settings);
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
             * The custom settings for this content instance.
             * The developer may use this for generic storage specific to this instance,
             * for example a JSON blob describing the previously selected options used to pre-populate the UI.
             * The string must be less than 1kb.
             */
            customSettings?: string;
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

                sendMessage("settings.save.success");

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessage("settings.save.failure", reason);

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

                sendMessage("settings.remove.success");

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessage("settings.remove.failure", reason);

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

    export namespace authentication
    {
        /**
         * Initiates an authentication request which pops up a new windows with the specified settings.
         * @param authenticateParameters A set of values that configure the authentication popup.
         */
        export function authenticate(authenticateParameters: AuthenticateParameters): void
        {
            ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);

            // Convert any relative URLs into absolute ones before sending them over to our parent window
            let link = document.createElement("a");
            link.href = authenticateParameters.url;

            let messageId = sendMessage(
                "authentication.authenticate",
                link.href,
                authenticateParameters.width,
                authenticateParameters.height);
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

        /**
         * Notifies the frame that initiated this authentication request that the request was successful.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param result Specifies a result for the authentication. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        export function notifySuccess(result?: string): void
        {
            ensureInitialized(frameContexts.authentication);

            sendMessage("authentication.authenticate.success", result);
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

            sendMessage("authentication.authenticate.failure", reason);
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
    }

    export interface Context
    {
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

        // Process only if the message is coming from a valid origin or the origin used for local testing.
        parentOrigin = evt.origin || evt.originalEvent.origin;
        if (validOrigins.indexOf(parentOrigin.toLowerCase()) === -1)
        {
            return;
        }

        // If we have any messages in our queue send them now
        while (messageQueue.length > 0)
        {
            parentWindow.postMessage(messageQueue.shift(), parentOrigin);
        }

        // Check to see if this looks like a request or a response
        if ("id" in evt.data)
        {
            // Call any associated callbacks.
            const message = evt.data as MessageResponse;
            const callback = callbacks[message.id];
            if (callback)
            {
                callback.apply(null, message.args);
            }
        }
        else if ("func" in evt.data)
        {
            // Delegate the request to the proper handler.
            const message = evt.data as MessageRequest;
            const handler = handlers[message.func];
            if (handler)
            {
                // We don't expect any handler to respond at this point.
                handler.apply(this, message.args);
            }
        }
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessage(actionName: string, ...args: any[]): number
    {
        let request = createMessage(actionName, args);

        // If we already know our parent window's origin then send the message right away; otherwise,
        // queue up the message and send it once the origin has been established
        if (parentOrigin)
        {
            parentWindow.postMessage(request, parentOrigin);
        }
        else
        {
            messageQueue.push(request);
        }

        return request.id;
    }

    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessage(func: string, args: any[]): MessageRequest
    {
        return {
            id: nextMessageId++,
            func: func,
            args: args,
        };
    }
}
