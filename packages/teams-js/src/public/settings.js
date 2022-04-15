"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var pages_1 = require("./pages");
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.config} namespace instead.
 *
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
var settings;
(function (settings) {
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link pages.config.setValidityState pages.config.setValidityState(validityState: boolean): void} instead.
     *
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     *
     * @param validityState - Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState) {
        pages_1.pages.config.setValidityState(validityState);
    }
    settings.setValidityState = setValidityState;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link pages.config.getConfig pages.config.getConfig(): Promise\<Config\>} instead.
     *
     * Gets the settings for the current instance.
     *
     * @param callback - The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.settings, constants_1.FrameContexts.remove, constants_1.FrameContexts.sidePanel);
        pages_1.pages.getConfig().then(function (config) {
            callback(config);
        });
    }
    settings.getSettings = getSettings;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link pages.config.setConfig pages.config.setConfig(instanceSettings: Config): Promise\<void\>} instead.
     *
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     *
     * @param - Set the desired settings for this instance.
     */
    function setSettings(instanceSettings, onComplete) {
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.settings, constants_1.FrameContexts.sidePanel);
        onComplete = onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)();
        pages_1.pages.config
            .setConfig(instanceSettings)
            .then(function () {
            onComplete(true);
        })
            .catch(function (error) {
            onComplete(false, error.message);
        });
    }
    settings.setSettings = setSettings;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link pages.config.registerOnSaveHandler pages.config.registerOnSaveHandler(handler: (evt: SaveEvent) => void): void} instead.
     *
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the user selects the save button.
     */
    function registerOnSaveHandler(handler) {
        pages_1.pages.config.registerOnSaveHandler(handler);
    }
    settings.registerOnSaveHandler = registerOnSaveHandler;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link pages.config.registerOnRemoveHandler pages.config.registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void} instead.
     *
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     *
     * @param handler - The handler to invoke when the user selects the remove button.
     */
    function registerOnRemoveHandler(handler) {
        pages_1.pages.config.registerOnRemoveHandler(handler);
    }
    settings.registerOnRemoveHandler = registerOnRemoveHandler;
})(settings = exports.settings || (exports.settings = {}));
//# sourceMappingURL=settings.js.map