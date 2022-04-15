"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logs = void 0;
var communication_1 = require("../internal/communication");
var handlers_1 = require("../internal/handlers");
var internalAPIs_1 = require("../internal/internalAPIs");
var runtime_1 = require("../public/runtime");
/**
 * @hidden
 * Namespace to interact with the logging part of the SDK.
 * This object is used to send the app logs on demand to the host client
 *
 * Hide from docs
 *
 * @internal
 */
var logs;
(function (logs) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Registers a handler for getting app log
     *
     * @param handler - The handler to invoke to get the app log
     */
    function registerGetLogHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        if (handler) {
            (0, handlers_1.registerHandler)('log.request', function () {
                var log = handler();
                (0, communication_1.sendMessageToParent)('log.receive', [log]);
            });
        }
        else {
            (0, handlers_1.removeHandler)('log.request');
        }
    }
    logs.registerGetLogHandler = registerGetLogHandler;
    function isSupported() {
        return runtime_1.runtime.supports.logs ? true : false;
    }
    logs.isSupported = isSupported;
})(logs = exports.logs || (exports.logs = {}));
//# sourceMappingURL=logs.js.map