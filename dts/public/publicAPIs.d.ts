import { TabInformation, TabInstanceParameters, TabInstance, DeepLinkParameters, Context } from "./interfaces";
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
export declare function initialize(hostWindow?: any): void;
/**
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 */
export declare function _uninitialize(): void;
/**
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
export declare function enablePrintCapability(): void;
/**
 * default print handler
 */
export declare function print(): void;
/**
 * Retrieves the current context the frame is running in.
 * @param callback The callback to invoke when the {@link Context} object is retrieved.
 */
export declare function getContext(callback: (context: Context) => void): void;
/**
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user changes their theme.
 */
export declare function registerOnThemeChangeHandler(handler: (theme: string) => void): void;
/**
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler The handler to invoke when the user toggles full-screen view for a tab.
 */
export declare function registerFullScreenHandler(handler: (isFullScreen: boolean) => void): void;
/**
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 * @param handler The handler to invoke when the user presses their Team client's back button.
 */
export declare function registerBackButtonHandler(handler: () => boolean): void;
/**
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
export declare function navigateBack(onComplete?: (status: boolean, reason?: string) => void): void;
/**
 * Registers a handler to be called before the page is unloaded.
 * @param handler The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
export declare function registerBeforeUnloadHandler(handler: (readyToUnload: () => void) => boolean): void;
/**
 * Registers a handler for when the user reconfigurated tab
 * @param handler The handler to invoke when the user click on Settings.
 */
export declare function registerChangeSettingsHandler(handler: () => void): void;
/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
export declare function navigateCrossDomain(url: string, onComplete?: (status: boolean, reason?: string) => void): void;
/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export declare function getTabInstances(callback: (tabInfo: TabInformation) => void, tabInstanceParameters?: TabInstanceParameters): void;
/**
 * Allows an app to retrieve the most recently used tabs for this user.
 * @param callback The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Ignored, kept for future use
 */
export declare function getMruTabInstances(callback: (tabInfo: TabInformation) => void, tabInstanceParameters?: TabInstanceParameters): void;
/**
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 * @param deepLinkParameters ID and label for the link and fallback URL.
 */
export declare function shareDeepLink(deepLinkParameters: DeepLinkParameters): void;
/**
 * execute deep link API.
 * @param deepLink deep link.
 */
export declare function executeDeepLink(deepLink: string, onComplete?: (status: boolean, reason?: string) => void): void;
/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export declare function navigateToTab(tabInstance: TabInstance, onComplete?: (status: boolean, reason?: string) => void): void;
