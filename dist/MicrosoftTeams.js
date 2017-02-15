/**
 * This is the root namespace for the JavaScript SDK.
 */
var microsoftTeams;
(function (microsoftTeams) {
    "use strict";
    var version = "0.5";
    var validOrigins = [
        "https://teams.microsoft.com",
        "https://teams.microsoft.us",
        "https://int.teams.microsoft.com",
        "https://devspaces.skype.com",
        "https://ssauth.skype.com",
        "http://dev.local",
    ];
    var handlers = {};
    // Ensure these declarations stay in sync with the framework.
    var frameContexts = {
        settings: "settings",
        content: "content",
        authentication: "authentication",
        remove: "remove",
    };
    var hostClientTypes = {
        desktop: "desktop",
        web: "web",
    };
    // This indicates whether initialize was called (started).
    // It does not indicate whether initialization is complete. That can be inferred by whether parentOrigin is set.
    var initializeCalled = false;
    var currentWindow;
    var parentWindow;
    var parentOrigin;
    var parentMessageQueue = [];
    var childWindow;
    var childOrigin;
    var childMessageQueue = [];
    var nextMessageId = 0;
    var callbacks = {};
    var frameContext;
    var hostClientType;
    var themeChangeHandler;
    handlers["themeChange"] = handleThemeChange;
    /**
     * Initializes the library. This must be called before any other SDK calls.
     * The caller should only call this once the frame is loaded successfully.
     */
    function initialize() {
        if (initializeCalled) {
            // Independent components may not know whether the SDK is initialized so may call it to be safe.
            // Just no-op if that happens to make it easier to use.
            return;
        }
        initializeCalled = true;
        // Undocumented field used to mock the window for unit tests
        currentWindow = this._window || window;
        // Listen for messages post to our window
        var messageListener = function (evt) { return processMessage(evt); };
        currentWindow.addEventListener("message", messageListener, false);
        // If we are in an iframe then our parent window is the one hosting us (i.e. window.parent); otherwise,
        // it's the window that opened us (i.e. window.opener)
        parentWindow = (currentWindow.parent !== currentWindow.self) ? currentWindow.parent : currentWindow.opener;
        try {
            // Send the initialized message to any origin since at this point we most likely don't know what our
            // parent window's origin is yet and this message contains no data that could pose a security risk.
            parentOrigin = "*";
            var messageId = sendMessageRequest(parentWindow, "initialize", [version]);
            callbacks[messageId] = function (context, clientType) {
                frameContext = context;
                hostClientType = clientType;
            };
        }
        finally {
            parentOrigin = null;
        }
        // Undocumented function used to clear state between unit tests
        this._uninitialize = function () {
            if (frameContext === frameContexts.settings) {
                settings.registerOnSaveHandler(null);
            }
            if (frameContext === frameContexts.remove) {
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
    microsoftTeams.initialize = initialize;
    /**
     * Retrieves the current context the frame is running in.
     * @param callback The callback to invoke when the {@link Context} object is retrieved.
     */
    function getContext(callback) {
        ensureInitialized();
        var messageId = sendMessageRequest(parentWindow, "getContext");
        callbacks[messageId] = callback;
    }
    microsoftTeams.getContext = getContext;
    /**
     * Registers a handler for when the user changes their theme.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user changes their theme.
     */
    function registerOnThemeChangeHandler(handler) {
        ensureInitialized();
        themeChangeHandler = handler;
    }
    microsoftTeams.registerOnThemeChangeHandler = registerOnThemeChangeHandler;
    function handleThemeChange(theme) {
        if (themeChangeHandler) {
            themeChangeHandler(theme);
        }
        if (childWindow) {
            sendMessageRequest(childWindow, "themeChange", [theme]);
        }
    }
    /**
     * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
     * valid domains specified in the tab manifest; otherwise, an exception will be thrown. This function only
     * needs to be used when navigating the frame to a URL in a different domain than the current one in
     * a way that keeps the app informed of the change and allows the SDK to continue working.
     * @param url The url to navigate the frame to.
     */
    function navigateCrossDomain(url) {
        ensureInitialized();
        var messageId = sendMessageRequest(parentWindow, "navigateCrossDomain", [url]);
        callbacks[messageId] = function (success) {
            if (!success) {
                throw new Error("Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
            }
        };
    }
    microsoftTeams.navigateCrossDomain = navigateCrossDomain;
    /**
     * Shares a deep link a user can use to navigate back to a specific state in this page.
     */
    function shareDeepLink(deepLinkParameters) {
        ensureInitialized(frameContexts.content);
        sendMessageRequest(parentWindow, "shareDeepLink", [
            deepLinkParameters.subEntityId,
            deepLinkParameters.subEntityLabel,
            deepLinkParameters.subEntityWebUrl,
        ]);
    }
    microsoftTeams.shareDeepLink = shareDeepLink;
    /**
     * Namespace to interact with the settings-specific part of the SDK.
     * This object is only usable on the settings frame.
     */
    var settings;
    (function (settings_1) {
        var saveHandler;
        var removeHandler;
        handlers["settings.save"] = handleSave;
        handlers["settings.remove"] = handleRemove;
        /**
         * Sets the validity state for the settings.
         * The inital value is false so the user will not be able to save the settings until this is called with true.
         * @param validityState A value indicating whether the save or remove button is enabled for the user.
         */
        function setValidityState(validityState) {
            ensureInitialized(frameContexts.settings, frameContexts.remove);
            sendMessageRequest(parentWindow, "settings.setValidityState", [validityState]);
        }
        settings_1.setValidityState = setValidityState;
        /**
         * Gets the settings for the current instance.
         * @param callback The callback to invoke when the {@link Settings} object is retrieved.
         */
        function getSettings(callback) {
            ensureInitialized(frameContexts.settings, frameContexts.remove);
            var messageId = sendMessageRequest(parentWindow, "settings.getSettings");
            callbacks[messageId] = callback;
        }
        settings_1.getSettings = getSettings;
        /**
         * Sets the settings for the current instance.
         * Note that this is an asynchronous operation so there are no guarentees as to when calls
         * to getSettings will reflect the changed state.
         * @param settings The desired settings for this current instance.
         */
        function setSettings(settings) {
            ensureInitialized(frameContexts.settings);
            sendMessageRequest(parentWindow, "settings.setSettings", [settings]);
        }
        settings_1.setSettings = setSettings;
        /**
         * Registers a handler for when the user attempts to save the settings. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the save button.
         */
        function registerOnSaveHandler(handler) {
            ensureInitialized(frameContexts.settings);
            saveHandler = handler;
        }
        settings_1.registerOnSaveHandler = registerOnSaveHandler;
        /**
         * Registers a handler for when the user attempts to remove the content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the remove
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler The handler to invoke when the user selects the remove button.
         */
        function registerOnRemoveHandler(handler) {
            ensureInitialized(frameContexts.remove);
            removeHandler = handler;
        }
        settings_1.registerOnRemoveHandler = registerOnRemoveHandler;
        function handleSave() {
            var saveEvent = new SaveEventImpl();
            if (saveHandler) {
                saveHandler(saveEvent);
            }
            else {
                // If there is no registered handler, we assume success
                saveEvent.notifySuccess();
            }
        }
        var SaveEventImpl = (function () {
            function SaveEventImpl() {
                this.notified = false;
            }
            SaveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                sendMessageRequest(parentWindow, "settings.save.success");
                this.notified = true;
            };
            SaveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessageRequest(parentWindow, "settings.save.failure", [reason]);
                this.notified = true;
            };
            SaveEventImpl.prototype.ensureNotNotified = function () {
                if (this.notified) {
                    throw new Error("The SaveEvent may only notify success or failure once.");
                }
            };
            return SaveEventImpl;
        }());
        function handleRemove() {
            var removeEvent = new RemoveEventImpl();
            if (removeHandler) {
                removeHandler(removeEvent);
            }
            else {
                // If there is no registered handler, we assume success
                removeEvent.notifySuccess();
            }
        }
        var RemoveEventImpl = (function () {
            function RemoveEventImpl() {
                this.notified = false;
            }
            RemoveEventImpl.prototype.notifySuccess = function () {
                this.ensureNotNotified();
                sendMessageRequest(parentWindow, "settings.remove.success");
                this.notified = true;
            };
            RemoveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessageRequest(parentWindow, "settings.remove.failure", [reason]);
                this.notified = true;
            };
            RemoveEventImpl.prototype.ensureNotNotified = function () {
                if (this.notified) {
                    throw new Error("The removeEvent may only notify success or failure once.");
                }
            };
            return RemoveEventImpl;
        }());
    })(settings = microsoftTeams.settings || (microsoftTeams.settings = {}));
    /**
     * Namespace to interact with the authentication-specific part of the SDK.
     * This object is used for starting or completing authentication flows.
     */
    var authentication;
    (function (authentication) {
        var authParams;
        var authWindowMonitor;
        handlers["authentication.authenticate.success"] = handleSuccess;
        handlers["authentication.authenticate.failure"] = handleFailure;
        /**
         * Initiates an authentication request which pops up a new windows with the specified settings.
         * @param authenticateParameters A set of values that configure the authentication popup.
         */
        function authenticate(authenticateParameters) {
            ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);
            if (hostClientType === hostClientTypes.desktop) {
                // Convert any relative URLs into absolute ones before sending them over to our parent window
                var link = document.createElement("a");
                link.href = authenticateParameters.url;
                // Ask our parent window to open an authentication window with the parameters provided by the caller
                var messageId = sendMessageRequest(parentWindow, "authentication.authenticate", [
                    link.href,
                    authenticateParameters.width,
                    authenticateParameters.height,
                ]);
                callbacks[messageId] = function (success, response) {
                    if (success) {
                        authenticateParameters.successCallback(response);
                    }
                    else {
                        authenticateParameters.failureCallback(response);
                    }
                };
            }
            else {
                // Open an authentication window with the parameters provided by the caller
                openAuthenticationWindow(authenticateParameters);
            }
        }
        authentication.authenticate = authenticate;
        /**
         * Requests an AAD token to be issued on behalf of the app. The token is acquired from the cache
         * if it is not expired. Otherwise a request will be sent to AAD to obtain a new token.
         * @param authTokenRequest A set of values that configure the token request.
         */
        function getAuthToken(authTokenRequest) {
            ensureInitialized();
            var messageId = sendMessageRequest(parentWindow, "authentication.getAuthToken", [authTokenRequest.resources]);
            callbacks[messageId] = function (success, result) {
                if (success) {
                    authTokenRequest.successCallback(result);
                }
                else {
                    authTokenRequest.failureCallback(result);
                }
            };
        }
        authentication.getAuthToken = getAuthToken;
        /**
         * Requests the decoded AAD user identity on behalf of the app.
         */
        function getUser(userRequest) {
            ensureInitialized();
            var messageId = sendMessageRequest(parentWindow, "authentication.getUser");
            callbacks[messageId] = function (success, result) {
                if (success) {
                    userRequest.successCallback(result);
                }
                else {
                    userRequest.failureCallback(result);
                }
            };
        }
        authentication.getUser = getUser;
        function closeAuthenticationWindow() {
            // Stop monitoring the authentication window
            stopAuthenticationWindowMonitor();
            // Try to close the authentication window and clear all properties associated with it
            try {
                if (childWindow) {
                    childWindow.close();
                }
            }
            finally {
                childWindow = null;
                childOrigin = null;
            }
        }
        function openAuthenticationWindow(authenticateParameters) {
            authParams = authenticateParameters;
            // Close the previously opened window if we have one
            closeAuthenticationWindow();
            // Start with a sensible default size
            var width = authParams.width || 600;
            var height = authParams.height || 400;
            // Ensure that the new window is always smaller than our app's window so that it never fully covers up our app
            width = Math.min(width, (currentWindow.outerWidth - 400));
            height = Math.min(height, (currentWindow.outerHeight - 200));
            // Convert any relative URLs into absolute ones before sending them over to our parent window
            var link = document.createElement("a");
            link.href = authParams.url;
            // We are running in the browser so we need to center the new window ourselves
            var left = (typeof currentWindow.screenLeft !== "undefined") ? currentWindow.screenLeft : currentWindow.screenX;
            var top = (typeof currentWindow.screenTop !== "undefined") ? currentWindow.screenTop : currentWindow.screenY;
            left += (currentWindow.outerWidth / 2) - (width / 2);
            top += (currentWindow.outerHeight / 2) - (height / 2);
            // Open a child window with a desired set of standard browser features
            childWindow = currentWindow.open(link.href, "_blank", "toolbar=no, location=yes, status=no, menubar=no, top=" + top + ", left=" + left + ", width=" + width + ", height=" + height);
            if (childWindow) {
                // Start monitoring the authentication window so that we can detect if it gets closed before the flow completes
                startAuthenticationWindowMonitor();
            }
            else {
                // If we failed to open the window fail the authentication flow
                handleFailure("FailedToOpenWindow");
            }
        }
        function stopAuthenticationWindowMonitor() {
            if (authWindowMonitor) {
                clearInterval(authWindowMonitor);
                authWindowMonitor = 0;
            }
            delete handlers["initialize"];
            delete handlers["navigateCrossDomain"];
        }
        function startAuthenticationWindowMonitor() {
            // Stop the previous window monitor if there is one running
            stopAuthenticationWindowMonitor();
            // Create an interval loop that:
            // - Notifies the caller of failure if it detects that the authentication window is closed
            // - Keeps pinging the authentication window while its open in order to re-establish
            //   contact with any pages along the authentication flow that need to communicate
            //   with us
            authWindowMonitor = setInterval(function () {
                if (!childWindow || childWindow.closed) {
                    handleFailure("CancelledByUser");
                }
                else {
                    var savedChildOrigin = childOrigin;
                    try {
                        childOrigin = "*";
                        sendMessageRequest(childWindow, "ping");
                    }
                    finally {
                        childOrigin = savedChildOrigin;
                    }
                }
            }, 100);
            // Set up an initialize message handler that will give the authentication window its frame context
            handlers["initialize"] = function () {
                return [frameContexts.authentication, hostClientType];
            };
            // Set up a navigateCrossDomain message handlers that will block cross-domain re-navigation attempts
            // in the authentication window. We could at some point choose to implement this method via a call to
            // authenticationWindow.location.href = url; however, we would first need to figure out how to
            // validate the url against the tab's list of valid domains.
            handlers["navigateCrossDomain"] = function (url) {
                return false;
            };
        }
        /**
         * Notifies the frame that initiated this authentication request that the request was successful.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param result Specifies a result for the authentication. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        function notifySuccess(result) {
            ensureInitialized(frameContexts.authentication);
            sendMessageRequest(parentWindow, "authentication.authenticate.success", [result]);
            // Wait for the message to be sent before closing the window
            waitForMessageQueue(parentWindow, function () { return currentWindow.close(); });
        }
        authentication.notifySuccess = notifySuccess;
        /**
         * Notifies the frame that initiated this authentication request that the request failed.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param reason Specifies a reason for the authentication failure. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        function notifyFailure(reason) {
            ensureInitialized(frameContexts.authentication);
            sendMessageRequest(parentWindow, "authentication.authenticate.failure", [reason]);
            // Wait for the message to be sent before closing the window
            waitForMessageQueue(parentWindow, function () { return currentWindow.close(); });
        }
        authentication.notifyFailure = notifyFailure;
        function handleSuccess(result) {
            try {
                if (authParams && authParams.successCallback) {
                    authParams.successCallback(result);
                }
            }
            finally {
                authParams = null;
                closeAuthenticationWindow();
            }
        }
        function handleFailure(reason) {
            try {
                if (authParams && authParams.failureCallback) {
                    authParams.failureCallback(reason);
                }
            }
            finally {
                authParams = null;
                closeAuthenticationWindow();
            }
        }
    })(authentication = microsoftTeams.authentication || (microsoftTeams.authentication = {}));
    function ensureInitialized() {
        var expectedFrameContexts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            expectedFrameContexts[_i - 0] = arguments[_i];
        }
        if (!initializeCalled) {
            throw new Error("The library has not yet been initialized");
        }
        if (frameContext && expectedFrameContexts && expectedFrameContexts.length > 0) {
            var found = false;
            for (var i = 0; i < expectedFrameContexts.length; i++) {
                if (expectedFrameContexts[i] === frameContext) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                throw new Error("This call is not allowed in the '" + frameContext + "' context");
            }
        }
    }
    function processMessage(evt) {
        // Process only if we received a valid message
        if (!evt || !evt.data || typeof evt.data !== "object") {
            return;
        }
        // Process only if the message is coming from a different window and a valid origin
        var messageSource = evt.source || evt.originalEvent.source;
        var messageOrigin = evt.origin || evt.originalEvent.origin;
        if (messageSource === currentWindow ||
            (messageOrigin !== currentWindow.location.origin &&
                validOrigins.indexOf(messageOrigin.toLowerCase()) === -1)) {
            return;
        }
        // Update our parent and child relationships based on this message
        updateRelationships(messageSource, messageOrigin);
        // Handle the message
        if (messageSource === parentWindow) {
            handleParentMessage(evt);
        }
        else if (messageSource === childWindow) {
            handleChildMessage(evt);
        }
    }
    function updateRelationships(messageSource, messageOrigin) {
        // Determine whether the source of the message is our parent or child and update our
        // window and origin pointer accordingly
        if (!parentWindow || (messageSource === parentWindow)) {
            parentWindow = messageSource;
            parentOrigin = messageOrigin;
        }
        else if (!childWindow || (messageSource === childWindow)) {
            childWindow = messageSource;
            childOrigin = messageOrigin;
        }
        // Clean up pointers to closed parent and child windows
        if (parentWindow && parentWindow.closed) {
            parentWindow = null;
            parentOrigin = null;
        }
        if (childWindow && childWindow.closed) {
            childWindow = null;
            childOrigin = null;
        }
        // If we have any messages in our queue send them now
        flushMessageQueue(parentWindow);
        flushMessageQueue(childWindow);
    }
    function handleParentMessage(evt) {
        if ("id" in evt.data) {
            // Call any associated callbacks
            var message = evt.data;
            var callback = callbacks[message.id];
            if (callback) {
                callback.apply(null, message.args);
                // Remove the callback to only let the callback get called once and to free up memory.
                delete callbacks[message.id];
            }
        }
        else if ("func" in evt.data) {
            // Delegate the request to the proper handler
            var message = evt.data;
            var handler = handlers[message.func];
            if (handler) {
                // We don't expect any handler to respond at this point
                handler.apply(this, message.args);
            }
        }
    }
    function handleChildMessage(evt) {
        if (("id" in evt.data) && ("func" in evt.data)) {
            // Try to delegate the request to the proper handler
            var message_1 = evt.data;
            var handler = handlers[message_1.func];
            if (handler) {
                var result = handler.apply(this, message_1.args);
                if (result) {
                    sendMessageResponse(childWindow, message_1.id, Array.isArray(result) ? result : [result]);
                }
            }
            else {
                // Proxy to parent
                var messageId = sendMessageRequest(parentWindow, message_1.func, message_1.args);
                // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
                callbacks[messageId] = function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i - 0] = arguments[_i];
                    }
                    if (childWindow) {
                        sendMessageResponse(childWindow, message_1.id, args);
                    }
                };
            }
        }
    }
    function getTargetMessageQueue(targetWindow) {
        return (targetWindow === parentWindow) ? parentMessageQueue :
            (targetWindow === childWindow) ? childMessageQueue :
                [];
    }
    function getTargetOrigin(targetWindow) {
        return (targetWindow === parentWindow) ? parentOrigin :
            (targetWindow === childWindow) ? childOrigin :
                null;
    }
    function flushMessageQueue(targetWindow) {
        var targetOrigin = getTargetOrigin(targetWindow);
        var targetMessageQueue = getTargetMessageQueue(targetWindow);
        while (targetWindow && targetOrigin && (targetMessageQueue.length > 0)) {
            targetWindow.postMessage(targetMessageQueue.shift(), targetOrigin);
        }
    }
    function waitForMessageQueue(targetWindow, callback) {
        var messageQueueMonitor = setInterval(function () {
            if (getTargetMessageQueue(targetWindow).length === 0) {
                clearInterval(messageQueueMonitor);
                callback();
            }
        }, 100);
    }
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessageRequest(targetWindow, actionName, args) {
        var request = createMessageRequest(actionName, args);
        var targetOrigin = getTargetOrigin(targetWindow);
        // If the target window isn't closed and we already know its origin then send the message right away; otherwise,
        // queue up the message and send it once the origin has been established
        if (targetWindow && targetOrigin) {
            targetWindow.postMessage(request, targetOrigin);
        }
        else {
            getTargetMessageQueue(targetWindow).push(request);
        }
        return request.id;
    }
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessageResponse(targetWindow, id, args) {
        var response = createMessageResponse(id, args);
        var targetOrigin = getTargetOrigin(targetWindow);
        if (targetWindow && targetOrigin) {
            targetWindow.postMessage(response, targetOrigin);
        }
    }
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessageRequest(func, args) {
        return {
            id: nextMessageId++,
            func: func,
            args: args || [],
        };
    }
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessageResponse(id, args) {
        return {
            id: id,
            args: args || [],
        };
    }
})(microsoftTeams || (microsoftTeams = {}));
