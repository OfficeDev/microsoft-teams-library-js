/**
 * This is the root namespace for the JavaScript SDK.
 */
var microsoftTeams;
(function (microsoftTeams) {
    "use strict";
    var validOrigins = [
        "https://teams.microsoft.com",
        "https://teams.skype.com",
        "https://ppespaces.skype.com",
        "https://devspaces.skype.com",
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
    // This indicates whether initialize was called (started).
    // It does not indicate whether initialization is complete. That can be inferred by whether parentOrigin is set.
    var initializeCalled = false;
    var parentWindow;
    var parentOrigin;
    var messageQueue = [];
    var nextMessageId = 0;
    var callbacks = {};
    var frameContext;
    var themeChangeHandler;
    handlers["themeChange"] = handleThemeChange;
    /**
     * Initializes the library. This must be called before any other SDK calls.
     * The caller should only call this once the frame is loaded successfully.
     */
    function initialize() {
        if (initializeCalled) {
            throw new Error("initialize must not be called more than once.");
        }
        initializeCalled = true;
        // Undocumented field used to mock the window for unit tests
        var currentWindow = this._window || window;
        // If we are in an iframe then our parent window is the one hosting us (i.e. window.parent); otherwise,
        // it's the window that opened us (i.e. window.opener)
        parentWindow = (currentWindow.parent !== currentWindow.self) ? currentWindow.parent : currentWindow.opener;
        if (!parentWindow) {
            throw new Error("This page must be loaded in an iframe");
        }
        // Listen for messages post to our window (in a way that works for all browsers)
        var messageListener = function (evt) { return processMessage(evt); };
        currentWindow.addEventListener("message", messageListener, false);
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
            messageQueue = [];
            nextMessageId = 0;
            callbacks = {};
            frameContext = null;
            currentWindow.removeEventListener("message", messageListener, false);
        };
        try {
            // Send the initialized message to any origin since at this point we most likely don't know what our
            // parent window's origin is yet and this message contains no data that could pose a security risk.
            parentOrigin = "*";
            var messageId = sendMessage("initialize");
            callbacks[messageId] = function (context) {
                frameContext = context;
            };
        }
        finally {
            parentOrigin = null;
        }
    }
    microsoftTeams.initialize = initialize;
    /**
     * Retrieves the current context the frame is running in.
     * @param callback The callback to invoke when the {@link Context} object is retrieved.
     */
    function getContext(callback) {
        ensureInitialized();
        var messageId = sendMessage("getContext");
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
        var messageId = sendMessage("navigateCrossDomain", url);
        callbacks[messageId] = function (success) {
            if (!success) {
                throw new Error("Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.");
            }
        };
    }
    microsoftTeams.navigateCrossDomain = navigateCrossDomain;
    /**
     * Namespace to interact with the settings view-specific SDK.
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
            sendMessage("settings.setValidityState", validityState);
        }
        settings_1.setValidityState = setValidityState;
        /**
         * Gets the settings for the current instance.
         * @param callback The callback to invoke when the {@link Settings} object is retrieved.
         */
        function getSettings(callback) {
            ensureInitialized(frameContexts.settings, frameContexts.remove);
            var messageId = sendMessage("settings.getSettings");
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
            sendMessage("settings.setSettings", settings);
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
                sendMessage("settings.save.success");
                this.notified = true;
            };
            SaveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessage("settings.save.failure", reason);
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
                sendMessage("settings.remove.success");
                this.notified = true;
            };
            RemoveEventImpl.prototype.notifyFailure = function (reason) {
                this.ensureNotNotified();
                sendMessage("settings.remove.failure", reason);
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
    var authentication;
    (function (authentication) {
        /**
         * Initiates an authentication request which pops up a new windows with the specified settings.
         * @param authenticateParameters A set of values that configure the authentication popup.
         */
        function authenticate(authenticateParameters) {
            ensureInitialized(frameContexts.content, frameContexts.settings, frameContexts.remove);
            // Convert any relative URLs into absolute ones before sending them over to our parent window
            var link = document.createElement("a");
            link.href = authenticateParameters.url;
            var messageId = sendMessage("authentication.authenticate", link.href, authenticateParameters.width, authenticateParameters.height);
            callbacks[messageId] = function (success, response) {
                if (success) {
                    authenticateParameters.successCallback(response);
                }
                else {
                    authenticateParameters.failureCallback(response);
                }
            };
        }
        authentication.authenticate = authenticate;
        /**
         * Notifies the frame that initiated this authentication request that the request was successful.
         * This function is only usable on the authentication window.
         * This call causes the authentication window to be closed.
         * @param result Specifies a result for the authentication. If specified, the frame which initiated the authentication popup will recieve this value in their callback.
         */
        function notifySuccess(result) {
            ensureInitialized(frameContexts.authentication);
            sendMessage("authentication.authenticate.success", result);
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
            sendMessage("authentication.authenticate.failure", reason);
        }
        authentication.notifyFailure = notifyFailure;
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
        // Process only if the message is coming from a valid origin or the origin used for local testing
        var messageOrigin = evt.origin || evt.originalEvent.origin;
        if (validOrigins.indexOf(messageOrigin.toLowerCase()) === -1) {
            return;
        }
        // Set our parent origin so that we can use it when sending messages
        parentOrigin = messageOrigin;
        // If we have any messages in our queue send them now
        while (messageQueue.length > 0) {
            parentWindow.postMessage(messageQueue.shift(), parentOrigin);
        }
        // Check to see if this looks like a request or a response
        if ("id" in evt.data) {
            // Call any associated callbacks
            var message = evt.data;
            var callback = callbacks[message.id];
            if (callback) {
                callback.apply(null, message.args);
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
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function sendMessage(actionName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var request = createMessage(actionName, args);
        // If we already know our parent window's origin then send the message right away; otherwise,
        // queue up the message and send it once the origin has been established
        if (parentOrigin) {
            parentWindow.postMessage(request, parentOrigin);
        }
        else {
            messageQueue.push(request);
        }
        return request.id;
    }
    // tslint:disable-next-line:no-any:The args here are a passthrough to postMessage where we do allow any[]
    function createMessage(func, args) {
        return {
            id: nextMessageId++,
            func: func,
            args: args,
        };
    }
})(microsoftTeams || (microsoftTeams = {}));
