"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appInitialization = void 0;
var app_1 = require("./app");
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link app} namespace instead.
 */
var appInitialization;
(function (appInitialization) {
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.Messages} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.Messages = app_1.app.Messages;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.FailedReason} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.FailedReason = app_1.app.FailedReason;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.ExpectedFailureReason} instead.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    appInitialization.ExpectedFailureReason = app_1.app.ExpectedFailureReason;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.notifyAppLoaded app.notifyAppLoaded(): void} instead.
     * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
     */
    function notifyAppLoaded() {
        app_1.app.notifyAppLoaded();
    }
    appInitialization.notifyAppLoaded = notifyAppLoaded;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.notifySuccess app.notifySuccess(): void} instead.
     * Notifies the frame that app initialization is successful and is ready for user interaction.
     */
    function notifySuccess() {
        app_1.app.notifySuccess();
    }
    appInitialization.notifySuccess = notifySuccess;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.notifyFailure app.notifyFailure(appInitializationFailedRequest: IFailedRequest): void} instead.
     * Notifies the frame that app initialization has failed and to show an error page in its place.
     */
    function notifyFailure(appInitializationFailedRequest) {
        app_1.app.notifyFailure(appInitializationFailedRequest);
    }
    appInitialization.notifyFailure = notifyFailure;
    /**
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link app.notifyExpectedFailure app.notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void} instead.
     * Notifies the frame that app initialized with some expected errors.
     */
    function notifyExpectedFailure(expectedFailureRequest) {
        app_1.app.notifyExpectedFailure(expectedFailureRequest);
    }
    appInitialization.notifyExpectedFailure = notifyExpectedFailure;
})(appInitialization = exports.appInitialization || (exports.appInitialization = {}));
//# sourceMappingURL=appInitialization.js.map