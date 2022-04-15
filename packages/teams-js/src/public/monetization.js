"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.monetization = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var runtime_1 = require("./runtime");
/**
 * @alpha
 */
var monetization;
(function (monetization) {
    /**
     * @hidden
     * This function is the overloaded implementation of openPurchaseExperience.
     * Since the method signatures of the v1 callback and v2 promise differ in the type of the first parameter,
     * we need to do an extra check to know the typeof the @param1 to set the proper arguments of the utility function.
     * @param param1
     * @param param2
     * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
     */
    function openPurchaseExperience(param1, param2) {
        var callback;
        var planInfo;
        if (typeof param1 === 'function') {
            callback = param1;
            planInfo = param2;
        }
        else {
            planInfo = param1;
        }
        var wrappedFunction = function () {
            return new Promise(function (resolve) {
                resolve((0, communication_1.sendAndHandleSdkError)('monetization.openPurchaseExperience', planInfo));
            });
        };
        (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content);
        return (0, utils_1.callCallbackWithErrorOrResultOrNullFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    monetization.openPurchaseExperience = openPurchaseExperience;
    function isSupported() {
        return runtime_1.runtime.supports.monetization ? true : false;
    }
    monetization.isSupported = isSupported;
})(monetization = exports.monetization || (exports.monetization = {}));
//# sourceMappingURL=monetization.js.map