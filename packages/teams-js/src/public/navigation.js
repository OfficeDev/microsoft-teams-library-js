"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateBack = exports.navigateCrossDomain = exports.navigateToTab = exports.returnFocus = void 0;
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var constants_1 = require("./constants");
var pages_1 = require("./pages");
/**
 * Navigation specific part of the SDK.
 */
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.returnFocus pages.returnFocus(navigateForward?: boolean): void} instead.
 *
 * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
 *
 * @param navigateForward - Determines the direction to focus in teams app.
 */
function returnFocus(navigateForward) {
    pages_1.pages.returnFocus(navigateForward);
}
exports.returnFocus = returnFocus;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.tabs.navigateToTab pages.tabs.navigateToTab(tabInstance: TabInstance): Promise\<void\>} instead.
 *
 * Navigates the Microsoft Teams app to the specified tab instance.
 *
 * @param tabInstance - The tab instance to navigate to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateToTab(tabInstance, onComplete) {
    (0, internalAPIs_1.ensureInitialized)();
    onComplete = onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)();
    pages_1.pages.tabs
        .navigateToTab(tabInstance)
        .then(function () {
        onComplete(true);
    })
        .catch(function (error) {
        onComplete(false, error.message);
    });
}
exports.navigateToTab = navigateToTab;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.navigateCrossDomain pages.navigateCrossDomain(url: string): Promise\<void\>} instead.
 *
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 *
 * @param url - The URL to navigate the frame to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateCrossDomain(url, onComplete) {
    (0, internalAPIs_1.ensureInitialized)(constants_1.FrameContexts.content, constants_1.FrameContexts.sidePanel, constants_1.FrameContexts.settings, constants_1.FrameContexts.remove, constants_1.FrameContexts.task, constants_1.FrameContexts.stage, constants_1.FrameContexts.meetingStage);
    onComplete = onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)();
    pages_1.pages
        .navigateCrossDomain(url)
        .then(function () {
        onComplete(true);
    })
        .catch(function (error) {
        onComplete(false, error.message);
    });
}
exports.navigateCrossDomain = navigateCrossDomain;
/**
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link pages.backStack.navigateBack pages.backStack.navigateBack(): Promise\<void\>} instead.
 *
 * Navigates back in the Teams client.
 * See registerBackButtonHandler for more information on when it's appropriate to use this method.
 *
 * @param onComplete - The callback to invoke when the action is complete.
 */
function navigateBack(onComplete) {
    (0, internalAPIs_1.ensureInitialized)();
    onComplete = onComplete ? onComplete : (0, utils_1.getGenericOnCompleteHandler)();
    pages_1.pages.backStack
        .navigateBack()
        .then(function () {
        onComplete(true);
    })
        .catch(function (error) {
        onComplete(false, error.message);
    });
}
exports.navigateBack = navigateBack;
//# sourceMappingURL=navigation.js.map