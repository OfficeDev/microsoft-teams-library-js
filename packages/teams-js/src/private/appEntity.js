"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appEntity = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var public_1 = require("../public");
var runtime_1 = require("../public/runtime");
/**
 * @hidden
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @alpha
 */
var appEntity;
(function (appEntity_1) {
    /**
     * @hidden
     * Hide from docs
     * --------
     * Open the Tab Gallery and retrieve the app entity
     * @param threadId ID of the thread where the app entity will be created
     * @param categories A list of app categories that will be displayed in the opened tab gallery
     * @param subEntityId An object that will be made available to the application being configured
     *                      through the Teams Context's subEntityId field.
     * @param callback Callback that will be triggered once the app entity information is available.
     *                 The callback takes two arguments: an SdkError in case something happened (i.e.
     *                 no permissions to execute the API) and the app entity configuration, if available
     *
     * @alpha
     */
    function selectAppEntity(threadId, categories, subEntityId, callback) {
        (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
        if (!threadId || threadId.length == 0) {
            throw new Error('[appEntity.selectAppEntity] threadId name cannot be null or empty');
        }
        if (!callback) {
            throw new Error('[appEntity.selectAppEntity] Callback cannot be null');
        }
        (0, communication_1.sendMessageToParent)('appEntity.selectAppEntity', [threadId, categories, subEntityId], callback);
    }
    appEntity_1.selectAppEntity = selectAppEntity;
    function isSupported() {
        return runtime_1.runtime.supports.appEntity ? true : false;
    }
    appEntity_1.isSupported = isSupported;
})(appEntity = exports.appEntity || (exports.appEntity = {}));
//# sourceMappingURL=appEntity.js.map