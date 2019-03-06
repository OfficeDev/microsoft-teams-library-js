export declare const enum HostClientType {
    desktop = "desktop",
    web = "web",
    android = "android",
    ios = "ios"
}
/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 *
 * @private
 * Hide from docs until feature is complete
 */
export declare namespace menus {
    /**
     * Represents information about item in View Configuration.
     */
    interface ViewConfiguration {
        /**
         * Unique identifier of view.
         */
        id: string;
        /**
         * Display title of the view.
         */
        title: string;
        /**
         * Additional information for accessibility.
         */
        contentDescription?: string;
    }
    /**
     * Represents information about menu item for Action Menu and Navigation Bar Menu.
     */
    class MenuItem {
        /**
         * Unique identifier for the menu item.
         */
        id: string;
        /**
         * Display title of the menu item.
         */
        title: string;
        /**
         * Display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        icon?: string;
        /**
         * Selected state display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        iconSelected?: string;
        /**
         * Additional information for accessibility.
         */
        contentDescription?: string;
        /**
         * State of the menu item
         */
        enabled: boolean;
        /**
         * Interface to show list of items on selection of menu item.
         */
        viewData: ViewData;
    }
    /**
     * Represents information about view to show on Navigation Bar Menu item selection
     */
    interface ViewData {
        /**
         * Display header title of the item list.
         */
        listTitle?: string;
        /**
         * Type of the menu item.
         */
        listType: MenuListType;
        /**
         * Array of MenuItem. Icon value will be required for all items in the list.
         */
        listItems: MenuItem[];
    }
    /**
     * Represents information about type of list to display in Navigation Bar Menu.
     */
    enum MenuListType {
        dropDown = "dropDown",
        popOver = "popOver"
    }
    /**
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     * @param viewConfig List of view configurations. Minimum 1 value is required.
     * @param handler The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig: ViewConfiguration[], handler: (id: string) => boolean): void;
    /**
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items: MenuItem[], handler: (id: string) => boolean): void;
    interface ActionMenuParameters {
        /**
         * Display title for Action Menu
         */
        title: string;
        /**
         * List of MenuItems for Action Menu
         */
        items: MenuItem[];
    }
    /**
     * Used to show Action Menu.
     * @param params Parameters for Menu Parameters
     * @param handler The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params: ActionMenuParameters, handler: (id: string) => boolean): void;
}
/**
 * Represents information about tabs for an app
 */
export interface TabInformation {
    teamTabs: TabInstance[];
}
/**
 * Represents information about a tab instance
 */
export interface TabInstance {
    /**
     * The name of the tab
     */
    tabName: string;
    /**
     * Internal: do not use
     * @protected
     */
    internalTabInstanceId?: string;
    /**
     * Last viewed time of this tab. null means unknown
     */
    lastViewUnixEpochTime?: string;
    /**
     * The developer-defined unique ID for the entity this content points to.
     */
    entityId?: string;
    /**
     * The Microsoft Teams ID for the channel with which the content is associated.
     */
    channelId?: string;
    /**
     * The name for the channel with which the content is associated.
     */
    channelName?: string;
    /**
     * Is this tab in a favorite channel?
     */
    channelIsFavorite?: boolean;
    /**
     * The Microsoft Teams ID for the team with which the content is associated.
     */
    teamId?: string;
    /**
     * The name for the team with which the content is associated.
     */
    teamName?: string;
    /**
     * Is this tab in a favorite team?
     */
    teamIsFavorite?: boolean;
    /**
     * The Office 365 group ID for the team with which the content is associated.
     * This field is available only when the identity permission is requested in the manifest.
     */
    groupId?: string;
    /**
     * Content URL of this tab
     */
    url?: string;
    /**
     * Website URL of this tab
     */
    websiteUrl?: string;
}
/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
export declare const enum TeamType {
    Standard = 0,
    Edu = 1,
    Class = 2,
    Plc = 3,
    Staff = 4
}
/**
 * Indicates the various types of roles of a user in a team.
 */
export declare const enum UserTeamRole {
    Admin = 0,
    User = 1,
    Guest = 2
}
/**
 * Indicates information about the tab instance for filtering purposes.
 */
export interface TabInstanceParameters {
    /**
     * Flag allowing to select favorite channels only
     */
    favoriteChannelsOnly?: boolean;
    /**
     * Flag allowing to select favorite teams only
     */
    favoriteTeamsOnly?: boolean;
}
/**
 * @private
 * Hide from docs
 * --------
 * Query parameters used when fetching team information
 */
export interface TeamInstanceParameters {
    /**
     * Flag allowing to select favorite teams only
     */
    favoriteTeamsOnly?: boolean;
}
/**
 * @private
 * Hide from docs
 * --------
 * Information on userJoined Teams
 */
export interface UserJoinedTeamsInformation {
    /**
     * List of team information
     */
    userJoinedTeams: TeamInformation[];
}
/**
 * Represents Team Information
 */
export interface TeamInformation {
    /**
     * Id of the team
     */
    teamId: string;
    /**
     * Team display name
     */
    teamName: string;
    /**
     * Team description
     */
    teamDescription?: string;
    /**
     * Thumbnail Uri
     */
    thumbnailUri?: string;
    /**
     * The Office 365 group ID for the team with which the content is associated.
     * This field is available only when the identity permission is requested in the manifest.
     */
    groupId?: string;
    /**
     * Role of current user in the team
     */
    userTeamRole?: UserTeamRole;
}
export declare const enum TaskModuleDimension {
    Large = "large",
    Medium = "medium",
    Small = "small"
}
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
export declare function navigateBack(): void;
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
export declare function navigateCrossDomain(url: string): void;
/**
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 * @param callback The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
export declare function getTabInstances(callback: (tabInfo: TabInformation) => void, tabInstanceParameters?: TabInstanceParameters): void;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
export declare function getUserJoinedTeams(callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void, teamInstanceParameters?: TeamInstanceParameters): void;
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
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
export declare function openFilePreview(filePreviewParameters: FilePreviewParameters): void;
export declare const enum NotificationTypes {
    fileDownloadStart = "fileDownloadStart",
    fileDownloadComplete = "fileDownloadComplete"
}
export interface ShowNotificationParameters {
    message: string;
    notificationType: NotificationTypes;
}
/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
export declare function showNotification(showNotificationParameters: ShowNotificationParameters): void;
/**
 * @private
 * Hide from docs.
 * ------
 * execute deep link API.
 * @param deepLink deep link.
 */
export declare function executeDeepLink(deepLink: string): void;
/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export declare function uploadCustomApp(manifestBlob: Blob): void;
/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export declare function navigateToTab(tabInstance: TabInstance): void;
/**
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
export declare namespace settings {
    /**
     * Sets the validity state for the settings.
     * The initial value is false, so the user cannot save the settings until this is called with true.
     * @param validityState Indicates whether the save or remove button is enabled for the user.
     */
    function setValidityState(validityState: boolean): void;
    /**
     * Gets the settings for the current instance.
     * @param callback The callback to invoke when the {@link Settings} object is retrieved.
     */
    function getSettings(callback: (instanceSettings: Settings) => void): void;
    /**
     * Sets the settings for the current instance.
     * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
     * @param settings The desired settings for this instance.
     */
    function setSettings(instanceSettings: Settings): void;
    /**
     * Registers a handler for when the user attempts to save the settings. This handler should be used
     * to create or update the underlying resource powering the content.
     * The object passed to the handler must be used to notify whether to proceed with the save.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * @param handler The handler to invoke when the user selects the save button.
     */
    function registerOnSaveHandler(handler: (evt: SaveEvent) => void): void;
    /**
     * Registers a handler for user attempts to remove content. This handler should be used
     * to remove the underlying resource powering the content.
     * The object passed to the handler must be used to indicate whether to proceed with the removal.
     * Only one handler may be registered at a time. Subsequent registrations will override the first.
     * @param handler The handler to invoke when the user selects the remove button.
     */
    function registerOnRemoveHandler(handler: (evt: RemoveEvent) => void): void;
    interface Settings {
        /**
         * A suggested display name for the new content.
         * In the settings for an existing instance being updated, this call has no effect.
         */
        suggestedDisplayName?: string;
        /**
         * Sets the URL to use for the content of this instance.
         */
        contentUrl: string;
        /**
         * Sets the URL for the removal configuration experience.
         */
        removeUrl?: string;
        /**
         * Sets the URL to use for the external link to view the underlying resource in a browser.
         */
        websiteUrl?: string;
        /**
         * The developer-defined unique ID for the entity to which this content points.
         */
        entityId: string;
    }
    interface SaveEvent {
        /**
         * Object containing properties passed as arguments to the settings.save event.
         */
        result: SaveParameters;
        /**
         * Indicates that the underlying resource has been created and the settings can be saved.
         */
        notifySuccess(): void;
        /**
         * Indicates that creation of the underlying resource failed and that the settings cannot be saved.
         * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
         */
        notifyFailure(reason?: string): void;
    }
    interface RemoveEvent {
        /**
         * Indicates that the underlying resource has been removed and the content can be removed.
         */
        notifySuccess(): void;
        /**
         * Indicates that removal of the underlying resource failed and that the content cannot be removed.
         * @param reason Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
         */
        notifyFailure(reason?: string): void;
    }
    interface SaveParameters {
        /**
         * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
         */
        webhookUrl?: string;
    }
}
/**
 * Namespace to interact with the authentication-specific part of the SDK.
 * This object is used for starting or completing authentication flows.
 */
export declare namespace authentication {
    /**
     * Registers the authentication handlers
     * @param authenticateParameters A set of values that configure the authentication pop-up.
     */
    function registerAuthenticationHandlers(authenticateParameters: AuthenticateParameters): void;
    /**
     * Initiates an authentication request, which opens a new window with the specified settings.
     */
    function authenticate(authenticateParameters?: AuthenticateParameters): void;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests an Azure AD token to be issued on behalf of the app. The token is acquired from the cache
     * if it is not expired. Otherwise a request is sent to Azure AD to obtain a new token.
     * @param authTokenRequest A set of values that configure the token request.
     */
    function getAuthToken(authTokenRequest: AuthTokenRequest): void;
    /**
     * @private
     * Hide from docs.
     * ------
     * Requests the decoded Azure AD user identity on behalf of the app.
     */
    function getUser(userRequest: UserRequest): void;
    /**
     * Notifies the frame that initiated this authentication request that the request was successful.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifySuccess(result?: string, callbackUrl?: string): void;
    /**
     * Notifies the frame that initiated this authentication request that the request failed.
     * This function is usable only on the authentication window.
     * This call causes the authentication window to be closed.
     * @param result Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives this value in its callback.
     * @param callbackUrl Specifies the url to redirect back to if the client is Win32 Outlook.
     */
    function notifyFailure(reason?: string, callbackUrl?: string): void;
    interface AuthenticateParameters {
        /**
         * The URL for the authentication pop-up.
         */
        url: string;
        /**
         * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        width?: number;
        /**
         * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        height?: number;
        /**
         * A function that is called if the authentication succeeds, with the result returned from the authentication pop-up.
         */
        successCallback?: (result?: string) => void;
        /**
         * A function that is called if the authentication fails, with the reason for the failure returned from the authentication pop-up.
         */
        failureCallback?: (reason?: string) => void;
    }
    /**
     * @private
     * Hide from docs.
     * ------
     */
    interface AuthTokenRequest {
        /**
         * An array of resource URIs identifying the target resources for which the token should be requested.
         */
        resources: string[];
        /**
         * A function that is called if the token request succeeds, with the resulting token.
         */
        successCallback?: (token: string) => void;
        /**
         * A function that is called if the token request fails, with the reason for the failure.
         */
        failureCallback?: (reason: string) => void;
    }
    /**
     * @private
     * Hide from docs.
     * ------
     */
    interface UserRequest {
        /**
         * A function that is called if the token request succeeds, with the resulting token.
         */
        successCallback?: (user: UserProfile) => void;
        /**
         * A function that is called if the token request fails, with the reason for the failure.
         */
        failureCallback?: (reason: string) => void;
    }
    /**
     * @private
     * Hide from docs.
     * ------
     */
    interface UserProfile {
        /**
         * The intended recipient of the token. The application that receives the token must verify that the audience
         * value is correct and reject any tokens intended for a different audience.
         */
        aud: string;
        /**
         * Identifies how the subject of the token was authenticated.
         */
        amr: string[];
        /**
         * Stores the time at which the token was issued. It is often used to measure token freshness.
         */
        iat: number;
        /**
         * Identifies the security token service (STS) that constructs and returns the token. In the tokens that Azure AD
         * returns, the issuer is sts.windows.net. The GUID in the issuer claim value is the tenant ID of the Azure AD
         * directory. The tenant ID is an immutable and reliable identifier of the directory.
         */
        iss: string;
        /**
         * Provides the last name, surname, or family name of the user as defined in the Azure AD user object.
         */
        family_name: string;
        /**
         * Provides the first or "given" name of the user, as set on the Azure AD user object.
         */
        given_name: string;
        /**
         * Provides a human-readable value that identifies the subject of the token. This value is not guaranteed to
         * be unique within a tenant and is designed to be used only for display purposes.
         */
        unique_name: string;
        /**
         * Contains a unique identifier of an object in Azure AD. This value is immutable and cannot be reassigned or
         * reused. Use the object ID to identify an object in queries to Azure AD.
         */
        oid: string;
        /**
         * Identifies the principal about which the token asserts information, such as the user of an application.
         * This value is immutable and cannot be reassigned or reused, so it can be used to perform authorization
         * checks safely. Because the subject is always present in the tokens the Azure AD issues, we recommended
         * using this value in a general-purpose authorization system.
         */
        sub: string;
        /**
         * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
         * use this value to access tenant-specific directory resources in a multitenant application. For example,
         * you can use this value to identify the tenant in a call to the Graph API.
         */
        tid: string;
        /**
         * Defines the time interval within which a token is valid. The service that validates the token should verify
         * that the current date is within the token lifetime; otherwise it should reject the token. The service might
         * allow for up to five minutes beyond the token lifetime to account for any differences in clock time ("time
         * skew") between Azure AD and the service.
         */
        exp: number;
        nbf: number;
        /**
         * Stores the user name of the user principal.
         */
        upn: string;
        /**
         * Stores the version number of the token.
         */
        ver: string;
    }
}
export interface Context {
    /**
     * The Office 365 group ID for the team with which the content is associated.
     * This field is available only when the identity permission is requested in the manifest.
     */
    groupId?: string;
    /**
     * The Microsoft Teams ID for the team with which the content is associated.
     */
    teamId?: string;
    /**
     * The name for the team with which the content is associated.
     */
    teamName?: string;
    /**
     * The Microsoft Teams ID for the channel with which the content is associated.
     */
    channelId?: string;
    /**
     * The name for the channel with which the content is associated.
     */
    channelName?: string;
    /**
     * The developer-defined unique ID for the entity this content points to.
     */
    entityId: string;
    /**
     * The developer-defined unique ID for the sub-entity this content points to.
     * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
     */
    subEntityId?: string;
    /**
     * The current locale that the user has configured for the app formatted as
     * languageId-countryId (for example, en-us).
     */
    locale: string;
    /**
     * @deprecated Use loginHint or userPrincipalName.
     * The UPN of the current user.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    upn?: string;
    /**
     * The Azure AD tenant ID of the current user.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    tid?: string;
    /**
     * The current UI theme.
     */
    theme?: string;
    /**
     * Indication whether the tab is in full-screen mode.
     */
    isFullScreen?: boolean;
    /**
     * The type of the team.
     */
    teamType?: TeamType;
    /**
     * The root SharePoint folder associated with the team.
     */
    teamSiteUrl?: string;
    /**
     * The relative path to the SharePoint folder associated with the channel.
     */
    channelRelativeUrl?: string;
    /**
     * Unique ID for the current Teams session for use in correlating telemetry data.
     */
    sessionId?: string;
    /**
     * The user's role in the team.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to the user's role, and never as proof of her role.
     */
    userTeamRole?: UserTeamRole;
    /**
     * The Microsoft Teams ID for the chat with which the content is associated.
     */
    chatId?: string;
    /**
     * A value suitable for use as a login_hint when authenticating with Azure AD.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    loginHint?: string;
    /**
     * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    userPrincipalName?: string;
    /**
     * The Azure AD object id of the current user.
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    userObjectId?: string;
    /**
     * Indicates whether team is archived.
     * Apps should use this as a signal to prevent any changes to content associated with archived teams.
     */
    isTeamArchived?: boolean;
    /**
     * The type of the host client. Possible values are : android, ios, web, desktop
     */
    hostClientType?: HostClientType;
    /**
     * SharePoint context
     */
    sharepoint?: any;
    /**
     * The type of license for the current users tenant.
     */
    tenantSKU?: string;
    /**
     * The license type for the current user.
     */
    userLicenseType?: string;
}
export interface DeepLinkParameters {
    /**
     * The developer-defined unique ID for the sub-entity to which this deep link points in the current entity.
     * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
     */
    subEntityId: string;
    /**
     * The label for the sub-entity that should be displayed when the deep link is rendered in a client.
     */
    subEntityLabel: string;
    /**
     * The fallback URL to which to navigate the user if the client cannot render the page.
     * This URL should lead directly to the sub-entity.
     */
    subEntityWebUrl?: string;
}
/**
 * @private
 * Hide from docs.
 * ------
 */
export interface FilePreviewParameters {
    /**
     * The developer-defined unique ID for the file.
     */
    entityId: string;
    /**
     * The display name of the file.
     */
    title: string;
    /**
     * An optional description of the file.
     */
    description?: string;
    /**
     * The file extension; e.g. pptx, docx, etc.
     */
    type: string;
    /**
     * A url to the source of the file, used to open the content in the user's default browser
     */
    objectUrl: string;
    /**
     * Optional; an alternate self-authenticating url used to preview the file in Mobile clients and offer it for download by the user
     */
    downloadUrl?: string;
    /**
     * Optional; an alternate url optimized for previewing the file in Teams web and desktop clients
     */
    webPreviewUrl?: string;
    /**
     * Optional; an alternate url that allows editing of the file in Teams web and desktop clients
     */
    webEditUrl?: string;
    /**
     * Optional; the base url of the site where the file is hosted
     */
    baseUrl?: string;
    /**
     * Optional; indicates whether the file should be opened in edit mode
     */
    editFile?: boolean;
    /**
     * Optional; the developer-defined unique ID for the sub-entity to return to when the file stage closes.
     * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
     */
    subEntityId?: string;
}
/**
 * @private
 * Internal use only
 * Sends a custom action message to Teams.
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export declare function sendCustomMessage(actionName: string, args?: any[]): number;
export interface TaskInfo {
    /**
     * The url to be rendered in the webview/iframe.
     */
    url?: string;
    /**
     * JSON defining an adaptive card.
     */
    card?: string;
    /**
     * The requested height of the webview/iframe.
     */
    height?: TaskModuleDimension | Number;
    /**
     * The requested width of the webview/iframe.
     */
    width?: TaskModuleDimension | Number;
    /**
     * Title of the task module.
     */
    title?: string;
    /**
     * If client doesnt support the URL, the URL that needs to be opened in the browser.
     */
    fallbackUrl?: string;
    /**
     * Specifies a bot ID to send the result of the user's interaction with the task module.
     * If specified, the bot will receive a task/complete invoke event with a JSON object
     * in the event payload.
     */
    completionBotId?: string;
}
/**
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 */
export declare namespace tasks {
    /**
     * Allows an app to open the task module.
     * @param taskInfo An object containing the parameters of the task module
     * @param submitHandler Handler to call when the task module is completed
     */
    function startTask(taskInfo: TaskInfo, submitHandler?: (err: string, result: string) => void): void;
    /**
     * Update height/width task info properties.
     * @param taskInfo An object containing width and height properties
     */
    function updateTask(taskInfo: TaskInfo): void;
    /**
     * Submit the task module.
     * @param result Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds Helps to validate that the call originates from the same appId as the one that invoked the task module
     */
    function submitTask(result?: string | object, appIds?: string | string[]): void;
}
/**
 * @private
 * Hide from docs
 * --------
 * Information about all members in a chat
 */
export interface ChatMembersInformation {
    members: ThreadMember[];
}
/**
 * @private
 * Hide from docs
 * --------
 * Information about a chat member
 */
export interface ThreadMember {
    /**
     * The member's user principal name in the current tenant.
     */
    upn: string;
}
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
export declare function getChatMembers(callback: (chatMembersInformation: ChatMembersInformation) => void): void;
