"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamsCore = void 0;
var globalVars_1 = require("../internal/globalVars");
var Handlers = require("../internal/handlers"); // Conflict with some names
var internalAPIs_1 = require("../internal/internalAPIs");
var runtime_1 = require("./runtime");
/**
 * Namespace containing the set of APIs that support Teams-specific functionalities.
 *
 * @alpha
 */
var teamsCore;
(function (teamsCore) {
    /**
     * Enable print capability to support printing page using Ctrl+P and cmd+P
     */
    function enablePrintCapability() {
        if (!globalVars_1.GlobalVars.printCapabilityEnabled) {
            globalVars_1.GlobalVars.printCapabilityEnabled = true;
            (0, internalAPIs_1.ensureInitialized)();
            // adding ctrl+P and cmd+P handler
            document.addEventListener('keydown', function (event) {
                if ((event.ctrlKey || event.metaKey) && event.keyCode === 80) {
                    print();
                    event.cancelBubble = true;
                    event.preventDefault();
                    event.stopImmediatePropagation();
                }
            });
        }
    }
    teamsCore.enablePrintCapability = enablePrintCapability;
    /**
     * default print handler
     */
    function print() {
        window.print();
    }
    teamsCore.print = print;
    /**
     * @hidden
     * Registers a handler to be called when the page has been requested to load.
     *
     * @param handler - The handler to invoke when the page is loaded.
     *
     * @internal
     */
    function registerOnLoadHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        Handlers.registerOnLoadHandler(handler);
    }
    teamsCore.registerOnLoadHandler = registerOnLoadHandler;
    /**
     * @hidden
     * Registers a handler to be called before the page is unloaded.
     *
     * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
     * invoke the readyToUnload function provided to it once it's ready to be unloaded.
     *
     * @internal
     */
    function registerBeforeUnloadHandler(handler) {
        (0, internalAPIs_1.ensureInitialized)();
        Handlers.registerBeforeUnloadHandler(handler);
    }
    teamsCore.registerBeforeUnloadHandler = registerBeforeUnloadHandler;
    function isSupported() {
        return runtime_1.runtime.supports.teamsCore ? true : false;
    }
    teamsCore.isSupported = isSupported;
})(teamsCore = exports.teamsCore || (exports.teamsCore = {}));
//# sourceMappingURL=teamsAPIs.js.map