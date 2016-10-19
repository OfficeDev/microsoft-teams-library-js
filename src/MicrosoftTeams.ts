// Shim in definitions used for browser-compat
interface MessageEvent {
  // Needed for Chrome
  originalEvent: MessageEvent;
}

namespace microsoftTeamsImpl
{
    'use strict';

    const validOrigins = [
        "https://teams.microsoft.com",
        "https://teams.skype.com",
        "https://ppespaces.skype.com",
        "https://devspaces.skype.com",
        "http://dev.local" // local development
    ];

    const handlers: {[func: string]: Function} = {};

    // Ensure these declarations stay in sync with the framework.
    const frameContexts =
    {
        settings: "settings",
        content: "content",
        authentication: "authentication",
        remove: "remove"
    }

    export interface MessageRequest
    {
        id: number;
        func: string;
        args?: any[];
    }

    export interface MessageResponse
    {
        id: number;
        args?: any[];
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

    export function initialize(): void
    {
        if (initializeCalled)
        {
            throw new Error("initialize must not be called more than once.");
        }

        initializeCalled = true;

        // Undocumented field used to mock the window for unit tests
        let currentWindow = this._window || window;

        // If we are in an iframe then our parent window is the one hosting us (i.e. window.parent); otherwise,
        // it's the window that opened us (i.e. window.opener)
        parentWindow = (currentWindow.parent !== currentWindow.self) ? currentWindow.parent : currentWindow.opener;
        if (!parentWindow)
        {
            throw new Error("This page must be loaded in an iframe");
        }

        // Listen for messages post to our window (in a way that works for all browsers)
        let messageListener = evt => processMessage(evt);
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

    export function getContext(callback: (context: microsoftTeams.Context) => void): void
    {
        ensureInitialized();

        let messageId = sendMessage("getContext");
        callbacks[messageId] = callback;
    }

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

    export namespace settings
    {
        let saveHandler: (evt: microsoftTeams.settings.SaveEvent) => void;
        let removeHandler: (evt: microsoftTeams.settings.RemoveEvent) => void;
        handlers["settings.save"] = handleSave;
        handlers["settings.remove"] = handleRemove;

        export function setValidityState(validityState: boolean): void
        {
            ensureInitialized(frameContexts.settings, frameContexts.remove);

            sendMessage("settings.setValidityState", validityState);
        }

        export function getSettings(callback: (settings: microsoftTeams.settings.Settings) => void): void
        {
            ensureInitialized(frameContexts.settings, frameContexts.remove);

            let messageId = sendMessage("settings.getSettings");
            callbacks[messageId] = callback;
        }

        export function setSettings(settings: microsoftTeams.settings.Settings): void
        {
            ensureInitialized(frameContexts.settings);

            sendMessage("settings.setSettings", settings);
        }

        export function registerOnSaveHandler(handler: (evt: microsoftTeams.settings.SaveEvent) => void): void
        {
            ensureInitialized(frameContexts.settings);

            saveHandler = handler;
        }

        export function registerOnRemoveHandler(handler: (evt: microsoftTeams.settings.RemoveEvent) => void): void
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

        class SaveEventImpl implements microsoftTeams.settings.SaveEvent
        {
            public notified = false;

            public notifySuccess(): void
            {
                this.ensureNotNotified();

                sendMessage("settings.save.success")

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessage("settings.save.failure", reason)

                this.notified = true;
            }

            private ensureNotNotified()
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

        class RemoveEventImpl implements microsoftTeams.settings.RemoveEvent
        {
            public notified = false;

            public notifySuccess(): void
            {
                this.ensureNotNotified();

                sendMessage("settings.remove.success")

                this.notified = true;
            }

            public notifyFailure(reason?: string): void
            {
                this.ensureNotNotified();

                sendMessage("settings.remove.failure", reason)

                this.notified = true;
            }

            private ensureNotNotified()
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
        export function authenticate(authenticateParameters: microsoftTeams.authentication.AuthenticateParameters): void
        {
            ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);

            // Convert any relative URLs into absolute ones before sending them over to our parent window
            let link = document.createElement('a');
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

        export function notifySuccess(result?: string): void
        {
            ensureInitialized(frameContexts.authentication);

            sendMessage("authentication.authenticate.success", result);
        }

        export function notifyFailure(reason?: string): void
        {
            ensureInitialized(frameContexts.authentication);

            sendMessage("authentication.authenticate.failure", reason);
        }
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
        if (!evt || !evt.data || typeof evt.data != "object")
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

    function createMessage(func: string, args: any[]): MessageRequest
    {
        return {
            id: nextMessageId++,
            func: func,
            args: args,
        };
    }
}

// Hack to get around having an ambient d.ts and non-ambient ts side by side. 
window["microsoftTeams"] = microsoftTeamsImpl;