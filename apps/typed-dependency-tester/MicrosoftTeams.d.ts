declare namespace logs {
    /**
     * @hidden
     *
     * Registers a handler for getting app log
     *
     * @param handler - The handler to invoke to get the app log
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerGetLogHandler(handler: () => string): void;
    /**
     * @hidden
     *
     * Checks if the logs capability is supported by the host
     * @returns boolean to represent whether the logs capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/** HostClientType represents the different client platforms on which host can be run. */
declare enum HostClientType {
    /** Represents the desktop client of host, which is installed on a user's computer and runs as a standalone application. */
    desktop = "desktop",
    /** Represents the web-based client of host, which runs in a web browser. */
    web = "web",
    /** Represents the Android mobile client of host, which runs on Android devices such as smartphones and tablets. */
    android = "android",
    /** Represents the iOS mobile client of host, which runs on iOS devices such as iPhones. */
    ios = "ios",
    /** Represents the iPadOS client of host, which runs on iOS devices such as iPads. */
    ipados = "ipados",
    /** The host is running on a macOS client, which runs on devices such as MacBooks. */
    macos = "macos",
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link teamsRoomsWindows} instead.
     */
    rigel = "rigel",
    /** Represents the client of host, which runs on surface hub devices. */
    surfaceHub = "surfaceHub",
    /** Represents the client of host, which runs on Teams Rooms on Windows devices. More information on Microsoft Teams Rooms on Windows can be found [Microsoft Teams Rooms (Windows)](https://support.microsoft.com/office/microsoft-teams-rooms-windows-help-e667f40e-5aab-40c1-bd68-611fe0002ba2)*/
    teamsRoomsWindows = "teamsRoomsWindows",
    /** Represents the client of host, which runs on Teams Rooms on Android devices. More information on Microsoft Teams Rooms on Android can be found [Microsoft Teams Rooms (Android)].(https://support.microsoft.com/office/get-started-with-teams-rooms-on-android-68517298-d513-46be-8d6d-d41db5e6b4b2)*/
    teamsRoomsAndroid = "teamsRoomsAndroid",
    /** Represents the client of host, which runs on Teams phones. More information can be found [Microsoft Teams Phones](https://support.microsoft.com/office/get-started-with-teams-phones-694ca17d-3ecf-40ca-b45e-d21b2c442412) */
    teamsPhones = "teamsPhones",
    /** Represents the client of host, which runs on Teams displays devices. More information can be found [Microsoft Teams Displays](https://support.microsoft.com/office/get-started-with-teams-displays-ff299825-7f13-4528-96c2-1d3437e6d4e6) */
    teamsDisplays = "teamsDisplays"
}
/** HostName indicates the possible hosts for your application. */
declare enum HostName {
    /**
     * Office.com and Office Windows App
     */
    office = "Office",
    /**
     * For "desktop" specifically, this refers to the new, pre-release version of Outlook for Windows.
     * Also used on other platforms that map to a single Outlook client.
     */
    outlook = "Outlook",
    /**
     * Outlook for Windows: the classic, native, desktop client
     */
    outlookWin32 = "OutlookWin32",
    /**
     * Microsoft-internal test Host
     */
    orange = "Orange",
    /**
     * Microsoft connected workplace platform
     */
    places = "Places",
    /**
     * Teams
     */
    teams = "Teams",
    /**
     * Modern Teams
     */
    teamsModern = "TeamsModern"
}
/**
 * FrameContexts provides information about the context in which the app is running within the host.
 * Developers can use FrameContexts to determine how their app should behave in different contexts,
 * and can use the information provided by the context to adapt the app to the user's needs.
 *
 * @example
 * If your app is running in the "settings" context, you should be displaying your apps configuration page.
 * If the app is running in the content context, the developer may want to display information relevant to
 * the content the user is currently viewing.
 */
declare enum FrameContexts {
    /**
     * App's frame context from where settings page can be accessed.
     * See [how to create a configuration page.]( https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/create-tab-pages/configuration-page?tabs=teamsjs-v2)
     */
    settings = "settings",
    /** The default context for the app where all the content of the app is displayed. */
    content = "content",
    /** Frame context used when app is running in the authentication window launched by calling {@link authentication.authenticate} */
    authentication = "authentication",
    /** The page shown when the user uninstalls the app. */
    remove = "remove",
    /** A task module is a pop-up window that can be used to display a form, a dialog, or other interactive content within the host. */
    task = "task",
    /** The side panel is a persistent panel that is displayed on the right side of the host and can be used to display content or UI that is relevant to the current page or tab. */
    sidePanel = "sidePanel",
    /** The stage is a large area that is displayed at the center of the host and can be used to display content or UI that requires a lot of space, such as a video player or a document editor. */
    stage = "stage",
    /** App's frame context from where meetingStage can be accessed in a meeting session, which is the primary area where video and presentation content is displayed during a meeting. */
    meetingStage = "meetingStage"
}
/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
declare enum TeamType {
    /** Represents a standard or classic team in host that is designed for ongoing collaboration and communication among a group of people. */
    Standard = 0,
    /**  Represents an educational team in host that is designed for classroom collaboration and communication among students and teachers. */
    Edu = 1,
    /** Represents a class team in host that is designed for classroom collaboration and communication among students and teachers in a structured environment. */
    Class = 2,
    /** Represents a professional learning community (PLC) team in host that is designed for educators to collaborate and share resources and best practices. */
    Plc = 3,
    /** Represents a staff team in host that is designed for staff collaboration and communication among staff members.*/
    Staff = 4
}
/**
 * Indicates the various types of roles of a user in a team.
 */
declare enum UserTeamRole {
    /** Represents that the user is an owner or administrator of the team. */
    Admin = 0,
    /** Represents that the user is a standard member of the team. */
    User = 1,
    /** Represents that the user does not have any role in the team. */
    Guest = 2
}
/**
 * Dialog module dimension enum
 */
declare enum DialogDimension {
    /** Represents a large-sized dialog box, which is typically used for displaying large amounts of content or complex workflows that require more space. */
    Large = "large",
    /** Represents a medium-sized dialog box, which is typically used for displaying moderate amounts of content or workflows that require less space. */
    Medium = "medium",
    /** Represents a small-sized dialog box, which is typically used for displaying simple messages or workflows that require minimal space.*/
    Small = "small"
}

/**
 * The type of the channel with which the content is associated.
 */
declare enum ChannelType {
    /** The default channel type. Type of channel is used for general collaboration and communication within a team. */
    Regular = "Regular",
    /** Type of channel is used for sensitive or confidential communication within a team and is only accessible to members of the channel. */
    Private = "Private",
    /** Type of channel is used for collaboration between multiple teams or groups and is accessible to members of all the teams or groups. */
    Shared = "Shared"
}

/**
 * Represents information about tabs for an app
 */
interface TabInformation {
    /** Represents the tabs associated with a Microsoft Teams app */
    teamTabs: TabInstance[];
}
/**
 * Represents information about a tab instance
 */
interface TabInstance {
    /**
     * The name of the tab
     */
    tabName: string;
    /**
     * @internal
     * Limited to Microsoft-internal use
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
    /**
     * AppId of this tab
     */
    appId?: string;
    /**
     * Order of this tab. Order is 1-indexed.
     */
    order?: number;
}
/**
 * Indicates information about the tab instance for filtering purposes.
 */
interface TabInstanceParameters {
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
 * Represents Team Information
 */
interface TeamInformation {
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
    /**
     * The type of the team.
     */
    teamType?: TeamType;
    /**
     * The locked status of the team
     */
    isTeamLocked?: boolean;
    /**
     * The archived status of the team
     */
    isTeamArchived?: boolean;
}
/**
 * Represents OS locale info used for formatting date and time data
 */
interface LocaleInfo {
    /** Represents the user's platform on which the app is running. */
    platform: HostClientType.android | HostClientType.ios | HostClientType.macos | 'windows';
    /**
     * Represents the regional format used by the user's locale.
     * @example `en-us`.
     */
    regionalFormat: string;
    /**
     * Displays date values, as specified by the short date format MM/DD/YYYY in user's regional settings.
     * @example 4/21/2023 or 4-21-2023
     */
    shortDate: string;
    /**
     * Displays only date values, as specified by the Long Date format in user's regional settings.
     * @example Friday, April 21, 2023
     */
    longDate: string;
    /**
     * A string representing the short time format used by the user's locale.
     * @example 10:10
     */
    shortTime: string;
    /**
     * A string representing the long time format used by the user's locale.
     * @example 10:10:42 AM
     */
    longTime: string;
}
/**
 * Allowed user file open preferences
 */
declare enum FileOpenPreference {
    /** Indicates that the user should be prompted to open the file in inline. */
    Inline = "inline",
    /** Indicates that the user should be prompted to open the file in the native desktop application associated with the file type. */
    Desktop = "desktop",
    /** Indicates that the user should be prompted to open the file in a web browser. */
    Web = "web"
}
/**
 * Types of Action Objects
 *
 * @beta
 */
declare enum ActionObjectType {
    /** Represents content within a Microsoft 365 application. */
    M365Content = "m365content"
}
/**
 * Data pertaining to object(s) the action is being performed on
 *
 * @param T The type of action being implemented
 *
 * @beta
 */
interface BaseActionObject<T extends ActionObjectType> {
    /** Represents action type. */
    type: T;
}
/**
 * Stores information needed to represent content stored in OneDrive or Sharepoint
 *
 * @beta
 */
interface M365ContentAction extends BaseActionObject<ActionObjectType.M365Content> {
    /**
     * Only office content IDs are passed to the app. Apps should use these ids
     * to query the Microsoft graph for more details.
     */
    itemId: string;
    /** Represents an optional secondary identifier for an action in a Microsoft 365 content item. */
    secondaryId?: SecondaryId;
}
/**
 * Contains additional IDs of the content that the action is triggered from. Maps to ids used in the Graph.
 *
 * @beta
 */
interface SecondaryId {
    /** Name of the secondary id that should be used. */
    name: SecondaryM365ContentIdName;
    /** The secondary id value that can be used to retrieve M365 content. */
    value: string;
}
/**
 * These correspond with field names in the MSGraph.
 * See [commonly accessed resources](https://learn.microsoft.com/graph/api/resources/onedrive?view=graph-rest-1.0#commonly-accessed-resources).
 * @beta
 */
declare enum SecondaryM365ContentIdName {
    /** OneDrive ID */
    DriveId = "driveId",
    /** Teams Group ID */
    GroupId = "groupId",
    /** SharePoint ID */
    SiteId = "siteId",
    /** User ID */
    UserId = "userId"
}
/**
 * Information about an Action.
 *
 * @remarks
 * This contains Id of the action, and the information about the object that triggered the action.
 * @beta
 */
interface ActionInfo {
    /**
     * Id of the action. Maps to the action id supplied inside the manifest
     */
    actionId: string;
    /**
     * Array of corresponding action objects
     */
    actionObjects: BaseActionObject<ActionObjectType>[];
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use the {@link app.Context} interface and its updated properties instead.
 *
 * @remarks
 * For more details about the updated {@link app.Context} interface, visit the
 * [Teams JavaScript client SDK](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/using-teams-client-sdk#updates-to-the-context-interface)
 * overview article.
 *
 * Represents the structure of the received context message.
 */
interface Context$1 {
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link ActionInfo | app.Context.actionInfo} instead
     *
     * Common information applicable to all content actions
     */
    actionInfo?: ActionInfo;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.groupId | app.Context.team.groupId} instead
     *
     * The Office 365 group ID for the team with which the content is associated.
     * This field is available only when the identity permission is requested in the manifest.
     */
    groupId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.internalId | app.Context.team.internalId} instead
     *
     * The Microsoft Teams ID for the team with which the content is associated.
     */
    teamId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.displayName | app.Context.team.displayName} instead
     *
     * The name for the team with which the content is associated.
     */
    teamName?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.id | app.Context.channel.id} instead
     *
     * The Microsoft Teams ID for the channel with which the content is associated.
     */
    channelId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.displayName | app.Context.channel.displayName} instead
     *
     * The name for the channel with which the content is associated.
     */
    channelName?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.membershipType | app.Context.channel.membershipType} instead
     *
     * The type of the channel with which the content is associated.
     */
    channelType?: ChannelType;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.id | app.Context.page.id} instead
     *
     * The developer-defined unique ID for the entity this content points to.
     */
    entityId: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.subPageId | app.Context.page.subPageId} instead
     *
     * The developer-defined unique ID for the sub-entity this content points to.
     * This field should be used to restore to a specific state within an entity,
     * such as scrolling to or activating a specific piece of content.
     */
    subEntityId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.locale | app.Context.app.locale} instead
     *
     * The current locale that the user has configured for the app formatted as
     * languageId-countryId (for example, en-us).
     */
    locale: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.osLocaleInfo | app.Context.app.osLocaleInfo} instead
     *
     * More detailed locale info from the user's OS if available. Can be used together with
     * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
     * time format configuration
     */
    osLocaleInfo?: LocaleInfo;
    /**
     * @deprecated
     *
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.loginHint | app.Context.user.loginHint} or
     * {@link app.UserInfo.userPrincipalName | app.Context.user.userPrincipalName} instead.
     * The UPN of the current user.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    upn?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TenantInfo.id | app.Context.user.tenant.id} instead
     *
     * The Microsoft Entra tenant ID of the current user.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    tid?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.theme | app.Context.app.theme} instead
     *
     * The current UI theme.
     */
    theme?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.isFullScreen | app.Context.page.isFullScreen} instead
     *
     * Indication whether the tab is in full-screen mode.
     */
    isFullScreen?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.type | app.Context.team.type} instead
     *
     * The type of the team.
     */
    teamType?: TeamType;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.teamSiteUrl | app.Context.sharePointSite.teamSiteUrl} instead
     *
     * The root SharePoint site associated with the team.
     */
    teamSiteUrl?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.teamSiteDomain | app.Context.sharePointSite.teamSiteDomain} instead
     *
     * The domain of the root SharePoint site associated with the team.
     */
    teamSiteDomain?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.teamSitePath | app.Context.sharePointSite.teamSitePath} instead
     *
     * The relative path to the SharePoint site associated with the team.
     */
    teamSitePath?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.ownerTenantId | app.Context.channel.ownerTenantId} instead
     *
     * The tenant ID of the host team.
     */
    hostTeamTenantId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.ownerGroupId | app.Context.channel.ownerGroupId} instead
     *
     * The Microsoft Entra group ID of the host team.
     */
    hostTeamGroupId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.relativeUrl | app.Context.channel.relativeUrl} instead
     *
     * The relative path to the SharePoint folder associated with the channel.
     */
    channelRelativeUrl?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppHostInfo.sessionId | app.Context.app.host.sessionId} instead
     *
     * Unique ID for the current Teams session for use in correlating telemetry data.
     */
    sessionId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.userRole | app.Context.team.userRole} instead
     *
     * The user's role in the team.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to the user's role, and never as proof of her role.
     */
    userTeamRole?: UserTeamRole;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChatInfo.id | app.Context.chat.id} instead
     *
     * The Microsoft Teams ID for the chat with which the content is associated.
     */
    chatId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.loginHint | app.Context.user.loginHint} instead
     *
     * A value suitable for use as a login_hint when authenticating with Microsoft Entra ID.
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    loginHint?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.userPrincipalName | app.Context.user.userPrincipalName} instead
     *
     * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    userPrincipalName?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.id | app.Context.user.id} instead
     *
     * The Microsoft Entra object ID of the current user.
     * Because a malicious party run your content in a browser, this value should
     * be used only as a hint as to who the user is and never as proof of identity.
     * This field is available only when the identity permission is requested in the manifest.
     */
    userObjectId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.isArchived | app.Context.team.isArchived} instead
     *
     * Indicates whether team is archived.
     * Apps should use this as a signal to prevent any changes to content associated with archived teams.
     */
    isTeamArchived?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppHostInfo.name | app.Context.app.host.name} instead
     *
     * The name of the host client. Possible values are: Office, Orange, Outlook, Teams
     */
    hostName?: HostName;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppHostInfo.clientType | app.Context.app.host.clientType} instead
     *
     * The type of the host client. Possible values are : android, ios, web, desktop, rigel(deprecated, use teamsRoomsWindows instead),
     * surfaceHub, teamsRoomsWindows, teamsRoomsAndroid, teamsPhones, teamsDisplays
     */
    hostClientType?: HostClientType;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.frameContext | app.Context.page.frameContext} instead
     *
     * The context where tab url is loaded (content, task, setting, remove, sidePanel)
     */
    frameContext?: FrameContexts;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.Context | app.Context.sharepoint} instead
     *
     * SharePoint context. This is only available when hosted in SharePoint.
     */
    sharepoint?: any;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TenantInfo.teamsSku | app.Context.tenant.teamsSku} instead
     *
     * The type of license for the current users tenant.
     */
    tenantSKU?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.licenseType | app.Context.user.licenseType} instead
     *
     * The license type for the current user.
     */
    userLicenseType?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.parentMessageId | app.Context.app.parentMessageId} instead
     *
     * The ID of the parent message from which this task module was launched.
     * This is only available in task modules launched from bot cards.
     */
    parentMessageId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppHostInfo.ringId | app.Context.app.host.ringId} instead
     *
     * Current ring ID
     */
    ringId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.sessionId | app.Context.app.sessionId} instead
     *
     * Unique ID for the current session for use in correlating telemetry data. A session corresponds to the lifecycle of an app. A new session begins upon the creation of a webview (on Teams mobile) or iframe (in Teams desktop) hosting the app, and ends when it is destroyed.
     */
    appSessionId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.appLaunchId | app.Context.app.appLaunchId} instead
     *
     * ID for the current visible app which is different for across cached sessions. Used for correlating telemetry data``
     */
    appLaunchId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.isCallingAllowed | app.Context.user.isCallingAllowed} instead
     *
     * Represents whether calling is allowed for the current logged in User
     */
    isCallingAllowed?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.isPSTNCallingAllowed | app.Context.user.isPSTNCallingAllowed} instead
     *
     * Represents whether PSTN calling is allowed for the current logged in User
     */
    isPSTNCallingAllowed?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.MeetingInfo.id | app.Context.meeting.id} instead
     *
     * Meeting Id used by tab when running in meeting context
     */
    meetingId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.ChannelInfo.defaultOneNoteSectionId | app.Context.channel.defaultOneNoteSectionId} instead
     *
     * The OneNote section ID that is linked to the channel.
     */
    defaultOneNoteSectionId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.isMultiWindow | app.Context.page.isMultiWindow} instead
     *
     * Indication whether the tab is in a pop out window
     */
    isMultiWindow?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.isBackgroundLoad | app.Context.page.isBackgroundLoad} instead
     *
     * Indication whether the tab is being loaded in the background
     */
    isBackgroundLoad?: boolean;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.iconPositionVertical | app.Context.app.iconPositionVertical} instead
     *
     * Personal app icon y coordinate position
     */
    appIconPosition?: number;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.PageInfo.sourceOrigin | app.Context.page.sourceOrigin} instead
     *
     * Source origin from where the tab is opened
     */
    sourceOrigin?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.userClickTime | app.Context.app.userClickTime} instead
     *
     * Time when the user clicked on the tab using the date.
     *
     * For measuring elapsed time between the moment the user click the tab, use {@link app.AppInfo.userClickTimeV2 | app.Context.app.userClickTimeV2} instead as it uses the performance timer API.
     */
    userClickTime?: number;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.userClickTimeV2 | app.Context.app.userClickTimeV2} instead
     *
     * Time when the user click on the app by using the performance timer API. Useful for measuring elapsed time accurately.
     *
     * For displaying the time when the user clicked on the app, please use {@link app.AppInfo.userClickTime | app.Context.app.userClickTime} as it uses the date.
     */
    userClickTimeV2?: number;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.TeamInfo.templateId | app.Context.team.templateId} instead
     *
     * Team Template ID if there was a Team Template associated with the creation of the team.
     */
    teamTemplateId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.AppInfo.userFileOpenPreference | app.Context.app.userFileOpenPreference} instead
     *
     * Where the user prefers the file to be opened from by default during file open
     */
    userFileOpenPreference?: FileOpenPreference;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.UserInfo.displayName | app.Context.user.displayName} instead
     *
     * The address book name of the current user.
     */
    userDisplayName?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.teamSiteId | app.Context.sharePointSite.teamSiteId} instead
     *
     * Teamsite ID, aka sharepoint site id.
     */
    teamSiteId?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.mySiteDomain | app.Context.sharePointSite.mySiteDomain} instead
     *
     * The SharePoint my site domain associated with the user.
     */
    mySiteDomain?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.SharePointSiteInfo.mySitePath | app.Context.sharePointSite.mySitePath} instead
     *
     * The SharePoint relative path to the current users mysite
     */
    mySitePath?: string;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link app.Context.dialogParameters} instead
     *
     * When `processActionCommand` activates a dialog, this dialog should automatically fill in some fields with information. This information comes from M365 and is given to `processActionCommand` as `extractedParameters`.
     * App developers need to use these `extractedParameters` in their dialog.
     * They help pre-fill the dialog with necessary information (`dialogParameters`) along with other details.
     */
    dialogParameters?: Record<string, string>;
}
/** Represents the parameters used to share a deep link. */
interface ShareDeepLinkParameters {
    /**
     * The developer-defined unique ID for the sub-page to which this deep link points in the current page.
     * This field should be used to restore to a specific state within a page, such as scrolling to or activating a specific piece of content.
     */
    subPageId: string;
    /**
     * The label for the sub-page that should be displayed when the deep link is rendered in a client.
     */
    subPageLabel: string;
    /**
     * The fallback URL to which to navigate the user if the client cannot render the page.
     * This URL should lead directly to the sub-entity.
     */
    subPageWebUrl?: string;
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link ShareDeepLinkParameters} instead.
 */
interface DeepLinkParameters {
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
 * @hidden
 * Shared Dialog Properties
 */
interface BaseDialogInfo {
    /**
     * The requested size of the dialog
     */
    size: DialogSize;
    /**
     * Title of the dialog module.
     */
    title?: string;
}
/**
 * Data structure to describe dialog information needed to open an Adaptive Card-based dialog.
 */
interface AdaptiveCardDialogInfo extends BaseDialogInfo {
    /**
     * JSON defining an Adaptive Card.
     */
    card: string;
}
/**
 * Data structure to describe dialog information needed to open a bot-based Adaptive Card-based dialog.
 */
interface BotAdaptiveCardDialogInfo extends AdaptiveCardDialogInfo {
    /**
     * Specifies a bot ID to send the result of the user's interaction with the dialog module.
     * The bot will receive a task/complete invoke event with a JSON object
     * in the event payload.
     */
    completionBotId: string;
}
/**
 * Data structure to represent the size of a dialog
 */
interface DialogSize {
    /**
     * The requested height of the webview/iframe.
     */
    height: DialogDimension | number;
    /**
     * The requested width of the webview/iframe.
     */
    width: DialogDimension | number;
}
/**
 * Data structure to describe dialog information needed to open a url-based dialog.
 */
interface UrlDialogInfo extends BaseDialogInfo {
    /**
     * The url to be rendered in the webview/iframe.
     *
     * @remarks
     * The domain of the url must match at least one of the
     * valid domains specified in the [validDomains block](https://learn.microsoft.com/microsoftteams/platform/resources/schema/manifest-schema#validdomains) of the app manifest
     */
    url: string;
    /**
     * If client doesnt support the URL, the URL that needs to be opened in the browser.
     */
    fallbackUrl?: string;
}
/**
 * Data structure to describe dialog information needed to open a bot based dialog.
 */
interface BotUrlDialogInfo extends UrlDialogInfo {
    /**
     * Specifies a bot ID to send the result of the user's interaction with the task module.
     * The bot will receive a task/complete invoke event with a JSON object
     * in the event payload.
     */
    completionBotId: string;
}
/**
 * Data structure to describe dialog information
 */
interface DialogInfo {
    /**
     * The url to be rendered in the webview/iframe.
     *
     * @remarks
     * The domain of the url must match at least one of the
     * valid domains specified in the validDomains block of the manifest
     */
    url?: string;
    /**
     * JSON defining an adaptive card.
     */
    card?: string;
    /**
     * The requested height of the webview/iframe.
     */
    height?: DialogDimension | number;
    /**
     * The requested width of the webview/iframe.
     */
    width?: DialogDimension | number;
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
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link DialogInfo} instead.
 */
type TaskInfo = DialogInfo;
/**
 * @beta
 * Data structure to be used with the {@link app.lifecycle.registerOnResumeHandler app.lifecycle.registerOnResumeHandler(handler: (context: ResumeContext) => void): void} to pass the context to the app.
 */
interface ResumeContext {
    /**
     * The entity that is requested to be loaded
     */
    entityId: string;
    /**
     * The content URL that is requested to be loaded
     */
    contentUrl: URL;
}
/**
 * @deprecated
 * As of 2.14.1, please use {@link ResumeContext} instead.
 */
interface LoadContext {
    /**
     * The entity that is requested to be loaded
     */
    entityId: string;
    /**
     * The content URL that is requested to be loaded
     */
    contentUrl: string;
}
/** Represents information about a frame within a tab or dialog module. */
interface FrameInfo {
    /**
     * The current URL that needs to be used in the iframe if the tab is reloaded
     */
    contentUrl: string;
    /**
     * The current URL that needs to be used for opening the website when the user clicks on 'Go to website'
     */
    websiteUrl: string;
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link FrameInfo} instead.
 */
type FrameContext = FrameInfo;
/** Represents an error that occurs during the execution of an app or integration. */
interface SdkError {
    /**
    error code
    */
    errorCode: ErrorCode;
    /**
    Optional description for the error. This may contain useful information for web-app developers.
    This string will not be localized and is not for end-user consumption.
    App should not depend on the string content. The exact value may change. This is only for debugging purposes.
    */
    message?: string;
}
/** Error codes used to identify different types of errors that can occur while developing apps. */
declare enum ErrorCode {
    /**
     * API not supported in the current platform.
     */
    NOT_SUPPORTED_ON_PLATFORM = 100,
    /**
     * Internal error encountered while performing the required operation.
     */
    INTERNAL_ERROR = 500,
    /**
     * API is not supported in the current context
     */
    NOT_SUPPORTED_IN_CURRENT_CONTEXT = 501,
    /**
    Permissions denied by user
    */
    PERMISSION_DENIED = 1000,
    /**
     * Network issue
     */
    NETWORK_ERROR = 2000,
    /**
     * Underlying hardware doesn't support the capability
     */
    NO_HW_SUPPORT = 3000,
    /**
     * One or more arguments are invalid
     */
    INVALID_ARGUMENTS = 4000,
    /**
     * User is not authorized for this operation
     */
    UNAUTHORIZED_USER_OPERATION = 5000,
    /**
     * Could not complete the operation due to insufficient resources
     */
    INSUFFICIENT_RESOURCES = 6000,
    /**
     * Platform throttled the request because of API was invoked too frequently
     */
    THROTTLE = 7000,
    /**
     * User aborted the operation
     */
    USER_ABORT = 8000,
    /**
     * Could not complete the operation in the given time interval
     */
    OPERATION_TIMED_OUT = 8001,
    /**
     * Platform code is old and doesn't implement this API
     */
    OLD_PLATFORM = 9000,
    /**
     * The file specified was not found on the given location
     */
    FILE_NOT_FOUND = 404,
    /**
     * The return value is too big and has exceeded our size boundries
     */
    SIZE_EXCEEDED = 10000
}
/**
 * Represents the major and minor versions of the Adaptive Card schema in the current host
 */
interface AdaptiveCardVersion {
    /** Represents the major version number. */
    majorVersion: number;
    /** Represents the minor version number. */
    minorVersion: number;
}
/**
 * @hidden
 * Eligibility Information for the app user.
 *
 * @beta
 */
interface AppEligibilityInformation {
    /**
     * Describes the user’s age group, which can have implications on which product they are able to use.
     */
    ageGroup: LegalAgeGroupClassification | null;
    /**
     * Describes the user’s chat experience based on their eligible licenses & their tenant’s eligible licenses.
     * A user will be in at most one cohort.
     */
    cohort: Cohort | null;
    /**
     * Indicates that the user is eligible for Microsoft Entra ID Authenticated Copilot experience.
     */
    isCopilotEligible: boolean;
    /**
     * Implementation may change to be based on tenant-home region rather than IP.
     */
    isCopilotEnabledRegion: boolean;
    /**
     * Indicates if the tenant admin has opted the user out of Copilot.
     */
    isOptedOutByAdmin: boolean;
    /**
     * Education Eligibility Information for the app user
     */
    userClassification: UserClassification | null;
}
/**
 * @hidden
 *
 * @beta
 */
interface UserClassificationWithEduType {
    /**
     * For EDU tenants only. Indicates if the tenant is higher ed or K12.
     */
    eduType: EduType;
    /**
     * Describes additional traits of the user that contribute to FRE experience, etc.
     */
    persona: Persona.Faculty | Persona.Student;
}
/**
 * @hidden
 *
 * @beta
 */
interface UserClassificationWithOtherType {
    persona: Persona.Other;
}
/**
 * @hidden
 *
 * @beta
 */
type UserClassification = UserClassificationWithEduType | UserClassificationWithOtherType;
/**
 * @hidden
 *
 * @beta
 */
declare enum Cohort {
    BCAIS = "bcais",
    BCWAF = "bcwaf",
    BCWBF = "bcwbf"
}
/**
 * @hidden
 *
 * @beta
 */
declare enum Persona {
    /**
     * User has a faculty license
     */
    Faculty = "faculty",
    /**
     * User has a student license
     */
    Student = "student",
    /**
     * When user is not a faculty or student
     */
    Other = "other"
}
/**
 * @hidden
 *
 * @beta
 */
declare enum LegalAgeGroupClassification {
    /**
     * The user is considered an adult based on the age-related regulations of their country or region.
     */
    Adult = "adult",
    /**
     * The user is a minor but is from a country or region that has no age-related regulations.
     */
    MinorNoParentalConsentRequired = "minorNoParentalConsentRequired",
    /**
     * Reserved for future use
     */
    MinorWithoutParentalConsent = "minorWithoutParentalConsent",
    /**
     * The user is considered a minor based on the age-related regulations of their country or region, and the administrator
     * of the account obtained appropriate consent from a parent or guardian.
     */
    MinorWithParentalConsent = "minorWithParentalConsent",
    /**
     * The user is from a country or region that has additional age-related regulations, such as the United States,
     * United Kingdom, European Union, or South Korea, and the user's age is between a minor and an adult age
     * (as stipulated based on country or region). Generally, this means that teenagers are considered as notAdult in regulated countries.
     */
    NonAdult = "nonAdult"
}
/**
 * @hidden
 *
 * @beta
 */
declare enum EduType {
    /**
     * User is from a tenant labeled as “HigherEd”
     */
    HigherEducation = "higherEducation",
    /**
     * User is from a tenant labeled as “K12”
     */
    K12 = "k12",
    /**
     * User is from a tenant labeled as “Others” (e.g. research institutions)
     */
    Other = "other"
}

/**
 * @hidden
 *
 * Information about all members in a chat
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface ChatMembersInformation {
    members: ThreadMember[];
}
/**
 * @hidden
 *
 * Information about a chat member
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface ThreadMember {
    /**
     * @hidden
     * The member's user principal name in the current tenant.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    upn: string;
}
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare enum NotificationTypes {
    fileDownloadStart = "fileDownloadStart",
    fileDownloadComplete = "fileDownloadComplete"
}
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface ShowNotificationParameters {
    message: string;
    notificationType: NotificationTypes;
}
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare enum ViewerActionTypes {
    view = "view",
    edit = "edit",
    editNew = "editNew"
}
/**
 * @hidden
 *
 * User setting changes that can be subscribed to
 */
declare enum UserSettingTypes {
    /**
     * @hidden
     * Use this key to subscribe to changes in user's file open preference
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    fileOpenPreference = "fileOpenPreference",
    /**
     * @hidden
     * Use this key to subscribe to theme changes
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    theme = "theme"
}
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface FilePreviewParameters {
    /**
     * @hidden
     * The developer-defined unique ID for the file.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    entityId?: string;
    /**
     * @hidden
     * The display name of the file.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    title?: string;
    /**
     * @hidden
     * An optional description of the file.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    description?: string;
    /**
     * @hidden
     * The file extension; e.g. pptx, docx, etc.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type: string;
    /**
     * @hidden
     * The size of the file in bytes.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    sizeInBytes?: number;
    /**
     * @hidden
     * A url to the source of the file, used to open the content in the user's default browser
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    objectUrl: string;
    /**
     * @hidden
     * Optional; an alternate self-authenticating url used to preview the file in Mobile clients and offer it for download by the user
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    downloadUrl?: string;
    /**
     * @hidden
     * Optional; an alternate url optimized for previewing the file in web and desktop clients
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    webPreviewUrl?: string;
    /**
     * @hidden
     * Optional; an alternate url that allows editing of the file in web and desktop clients
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    webEditUrl?: string;
    /**
     * @hidden
     * Optional; the base url of the site where the file is hosted
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    baseUrl?: string;
    /**
     * @hidden
     * Deprecated; prefer using {@linkcode viewerAction} instead
     * Optional; indicates whether the file should be opened in edit mode
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    editFile?: boolean;
    /**
     * @hidden
     * Optional; the developer-defined unique ID for the sub-entity to return to when the file stage closes.
     * This field should be used to restore to a specific state within an entity, such as scrolling to or activating a specific piece of content.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    subEntityId?: string;
    /**
     * @hidden
     * Optional; indicates the mode in which file should be opened. Takes precedence over edit mode.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    viewerAction?: ViewerActionTypes;
    /**
     * @hidden
     * Optional; indicates how user prefers to open the file
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    fileOpenPreference?: FileOpenPreference;
    /**
     * @hidden
     * Optional; id required to enable conversation button in files. Will be channel id in case file is shared in a channel or the chat id in p2p chat case.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    conversationId?: string;
}
/**
 * @hidden
 *
 * Query parameters used when fetching team information
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface TeamInstanceParameters {
    /**
     * @hidden
     * Flag allowing to select favorite teams only
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    favoriteTeamsOnly?: boolean;
}
/**
 * @hidden
 *
 * Information on userJoined Teams
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface UserJoinedTeamsInformation {
    /**
     * @hidden
     * List of team information
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    userJoinedTeams: TeamInformation[];
}

declare function uploadCustomApp(manifestBlob: Blob, onComplete?: (status: boolean, reason?: string) => void): void;
/**
 * @hidden
 * Sends a custom action MessageRequest to host or parent window
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @param callback - Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function sendCustomMessage(actionName: string, args?: any[], callback?: (...args: any[]) => void): void;
/**
 * @hidden
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @returns id of sent message
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function sendCustomEvent(actionName: string, args?: any[]): void;
/**
 * @hidden
 * Adds a handler for an action sent by a child window or parent window
 *
 * @param actionName - Specifies name of the action message to handle
 * @param customHandler - The callback to invoke when the action message is received. The return value is sent to the child
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function registerCustomHandler(actionName: string, customHandler: (...args: any[]) => any[]): void;
/**
 * @hidden
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 *
 * @param settingTypes - List of user setting changes to subscribe
 * @param handler - When a subscribed setting is updated this handler is called
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function registerUserSettingsChangeHandler(settingTypes: UserSettingTypes[], handler: (settingType: UserSettingTypes, value: any) => void): void;
/**
 * @hidden
 * Opens a client-friendly preview of the specified file.
 *
 * @param file - The file to preview.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function openFilePreview(filePreviewParameters: FilePreviewParameters): void;

interface OpenConversationRequest {
    /**
     * @hidden
     * The Id of the subEntity where the conversation is taking place
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    subEntityId: string;
    /**
     * @hidden
     * The title of the conversation
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    title: string;
    /**
     * @hidden
     * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    conversationId?: string;
    /**
     * @hidden
     * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    channelId?: string;
    /**
     * @hidden
     * The entity Id of the tab
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    entityId: string;
    /**
     * @hidden
     * A function that is called once the conversation Id has been created
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    onStartConversation?: (conversationResponse: ConversationResponse) => void;
    /**
     * @hidden
     * A function that is called if the pane is closed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    onCloseConversation?: (conversationResponse: ConversationResponse) => void;
}
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface ConversationResponse {
    /**
     * @hidden
     *
     * Limited to Microsoft-internal use
     * The Id of the subEntity where the conversation is taking place
     */
    subEntityId: string;
    /**
     * @hidden
     * The Id of the conversation. This is optional and should be specified whenever a previous conversation about a specific sub-entity has already been started before
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    conversationId?: string;
    /**
     * @hidden
     * The Id of the channel. This is optional and should be specified whenever a conversation is started or opened in a personal app scope
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    channelId?: string;
    /**
     * @hidden
     * The entity Id of the tab
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    entityId?: string;
}
/**
 * @hidden
 * Namespace to interact with the conversational subEntities inside the tab
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace conversations {
    /**
     * @hidden
     * Hide from docs
     * --------------
     * Allows the user to start or continue a conversation with each subentity inside the tab
     *
     * @returns Promise resolved upon completion
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function openConversation(openConversationRequest: OpenConversationRequest): Promise<void>;
    /**
     * @hidden
     *
     * Allows the user to close the conversation in the right pane
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function closeConversation(): void;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Allows retrieval of information for all chat members.
     * NOTE: This value should be used only as a hint as to who the members are
     * and never as proof of membership in case your app is being hosted by a malicious party.
     *
     * @returns Promise resolved with information on all chat members
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function getChatMembers(): Promise<ChatMembersInformation>;
    /**
     * Checks if the conversations capability is supported by the host
     * @returns boolean to represent whether conversations capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @beta
 * @hidden
 * Namespace to delegate copilot app specific APIs
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace copilot {
    /**
     * @beta
     * @hidden
     * User information required by specific apps
     * @internal
     * Limited to Microsoft-internal use
     */
    namespace eligibility {
        /**
         * @hidden
         * @internal
         * Limited to Microsoft-internal use
         * @beta
         * @returns boolean to represent whether copilot.eligibility capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
        /**
         * @hidden
         * @internal
         * Limited to Microsoft-internal use
         * @beta
         * @returns the copilot eligibility information about the user
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function getEligibilityInfo(): Promise<AppEligibilityInformation>;
    }
}

/**
 * This class is used for validating and deserializing the response from the host.
 *
 * @typeParam SerializedReturnValueFromHost The type of the response received from the host
 * @typeParam DeserializedReturnValueFromHost The type of the response after deserialization
 */
declare abstract class ResponseHandler<SerializedReturnValueFromHost, DeserializedReturnValueFromHost> {
    /**
     * Checks if the response from the host is valid.
     *
     * @param response The response from the host to validate
     *
     * @returns True if the response is valid, false otherwise
     */
    abstract validate(response: SerializedReturnValueFromHost): boolean;
    /**
     * This function converts the response from the host into a different format
     * before returning it to the caller (if needed).
     * @param response
     */
    abstract deserialize(response: SerializedReturnValueFromHost): DeserializedReturnValueFromHost;
}

/**
 * Interface for objects that can be serialized and passed to the host
 */
interface ISerializable {
    /**
     * @returns A serializable representation of the object, used for passing objects to the host.
     */
    serialize(): string | object;
}

/**
 * @hidden
 * Namespace to delegate authentication and message extension requests to the host
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace externalAppAuthentication {
    /*********** BEGIN REQUEST TYPE ************/
    /**
     * @hidden
     * Information about the bot request that should be resent by the host
     * @internal
     * Limited to Microsoft-internal use
     */
    type IOriginalRequestInfo = IQueryMessageExtensionRequest | IActionExecuteInvokeRequest;
    /**
     * @hidden
     * Parameters OauthWindow
     * @internal
     * Limited to Microsoft-internal use
     */
    type OauthWindowProperties = {
        /**
         * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        width?: number;
        /**
         * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        height?: number;
        /**
         * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
         * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page
         * to be opened in an external browser. If this flag is `false`, the page will be opened directly within the current hosting application.
         *
         * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
         * environment without an embedded browser.
         */
        isExternal?: boolean;
    };
    /**
     * @hidden
     * Parameters for the authentication pop-up. This interface is used exclusively with the externalAppAuthentication APIs
     * @internal
     * Limited to Microsoft-internal use
     */
    type AuthenticatePopUpParameters = {
        /**
         * The URL for the authentication pop-up.
         */
        url: URL;
        /**
         * The preferred width for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        width?: number;
        /**
         * The preferred height for the pop-up. This value can be ignored if outside the acceptable bounds.
         */
        height?: number;
        /**
         * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
         * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page specified in
         * the {@link url} property to be opened in an external browser.
         * If this flag is `false`, the page will be opened directly within the current hosting application.
         *
         * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
         * environment without an embedded browser.
         */
        isExternal?: boolean;
    };
    /**
     * @hidden
     * Parameters for SSO authentication. This interface is used exclusively with the externalAppAuthentication APIs
     * @internal
     * Limited to Microsoft-internal use
     */
    type AuthTokenRequestParameters = {
        /**
         * An optional list of claims which to pass to Microsoft Entra when requesting the access token.
         */
        claims?: string[];
        /**
         * An optional flag indicating whether to attempt the token acquisition silently or allow a prompt to be shown.
         */
        silent?: boolean;
    };
    /**
     * @hidden
     * Information about the message extension request that should be resent by the host. Corresponds to request schema in https://learn.microsoft.com/microsoftteams/platform/resources/messaging-extension-v3/search-extensions#receive-user-requests
     * @internal
     * Limited to Microsoft-internal use
     */
    interface IQueryMessageExtensionRequest {
        requestType: OriginalRequestType.QueryMessageExtensionRequest;
        commandId: string;
        parameters: {
            name: string;
            value: string;
        }[];
        queryOptions?: {
            count: number;
            skip: number;
        };
    }
    /**
     * @hidden
     * Information about the Action.Execute request that should be resent by the host. Corresponds to schema in https://adaptivecards.io/explorer/Action.Execute.html
     * @internal
     * Limited to Microsoft-internal use
     */
    interface IActionExecuteInvokeRequest {
        requestType: OriginalRequestType.ActionExecuteInvokeRequest;
        type: string;
        id: string;
        verb: string;
        data: string | Record<string, unknown>;
    }
    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     */
    class SerializableActionExecuteInvokeRequest implements ISerializable {
        private invokeRequest;
        constructor(invokeRequest: externalAppAuthentication.IActionExecuteInvokeRequest);
        serialize(): object | string;
    }
    /**
     * @beta
     * @hidden
     * Determines if the provided response object is an instance of IActionExecuteResponse
     * @internal
     * Limited to Microsoft-internal use
     * @param response The object to check whether it is of IActionExecuteResponse type
     */
    function isActionExecuteResponse(response: unknown): response is externalAppAuthentication.IActionExecuteResponse;
    /**
     * @hidden
     * This is the only allowed value for IActionExecuteInvokeRequest.type. Used for validation
     * @internal
     * Limited to Microsoft-internal use
     */
    const ActionExecuteInvokeRequestType = "Action.Execute";
    /**
     * @hidden
     * Used to differentiate between IOriginalRequestInfo types
     * @internal
     * Limited to Microsoft-internal use
     */
    enum OriginalRequestType {
        ActionExecuteInvokeRequest = "ActionExecuteInvokeRequest",
        QueryMessageExtensionRequest = "QueryMessageExtensionRequest"
    }
    /*********** END REQUEST TYPE ************/
    /*********** BEGIN RESPONSE TYPE ************/
    /**
     * @hidden
     * The response from the bot returned via the host
     * @internal
     * Limited to Microsoft-internal use
     */
    type IInvokeResponse = IQueryMessageExtensionResponse | IActionExecuteResponse;
    /**
     * @hidden
     * Used to differentiate between IInvokeResponse types
     * @internal
     * Limited to Microsoft-internal use
     */
    enum InvokeResponseType {
        ActionExecuteInvokeResponse = "ActionExecuteInvokeResponse",
        QueryMessageExtensionResponse = "QueryMessageExtensionResponse"
    }
    /**
     * @hidden
     * The response from the bot returned via the host for a message extension query request.
     * @internal
     * Limited to Microsoft-internal use
     */
    interface IQueryMessageExtensionResponse {
        responseType: InvokeResponseType.QueryMessageExtensionResponse;
        composeExtension?: ComposeExtensionResponse;
    }
    /**
     * @hidden
     * The response from the bot returned via the host for an Action.Execute request.
     * @internal
     * Limited to Microsoft-internal use
     */
    interface IActionExecuteResponse {
        responseType: InvokeResponseType.ActionExecuteInvokeResponse;
        value: Record<string, unknown>;
        signature?: string;
        statusCode: number;
        type: string;
    }
    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     */
    class ActionExecuteResponseHandler extends ResponseHandler<IActionExecuteResponse, IActionExecuteResponse> {
        validate(response: externalAppAuthentication.IActionExecuteResponse): boolean;
        deserialize(response: externalAppAuthentication.IActionExecuteResponse): externalAppAuthentication.IActionExecuteResponse;
    }
    /**
     * @hidden
     * The compose extension response returned for a message extension query request. `suggestedActions` will be present only when the type is is 'config' or 'auth'.
     * @internal
     * Limited to Microsoft-internal use
     */
    type ComposeExtensionResponse = {
        attachmentLayout: AttachmentLayout;
        type: ComposeResultTypes;
        attachments?: QueryMessageExtensionAttachment[];
        suggestedActions?: QueryMessageExtensionSuggestedActions;
        text?: string;
    };
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type QueryMessageExtensionSuggestedActions = {
        actions: Action[];
    };
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type Action = {
        type: string;
        title: string;
        value: string;
    };
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type QueryMessageExtensionCard = {
        contentType: string;
        content: Record<string, unknown>;
        fallbackHtml?: string;
        signature?: string;
    };
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type QueryMessageExtensionAttachment = QueryMessageExtensionCard & {
        preview?: QueryMessageExtensionCard;
    };
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type AttachmentLayout = 'grid' | 'list';
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type ComposeResultTypes = 'auth' | 'config' | 'message' | 'result' | 'silentAuth';
    /*********** END RESPONSE TYPE ************/
    /*********** BEGIN ERROR TYPE ***********/
    interface InvokeError {
        errorCode: InvokeErrorCode;
        message?: string;
    }
    /**
     * @beta
     * @hidden
     * Determines if the provided error object is an instance of InvokeError
     * @internal
     * Limited to Microsoft-internal use
     * @param err The error object to check whether it is of InvokeError type
     */
    function isInvokeError(err: unknown): err is externalAppAuthentication.InvokeError;
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum InvokeErrorCode {
        INTERNAL_ERROR = "INTERNAL_ERROR"
    }
    /**
     * @hidden
     * Wrapper to differentiate between InvokeError and IInvokeResponse response from host
     * @internal
     * Limited to Microsoft-internal use
     */
    type InvokeErrorWrapper = InvokeError & {
        responseType: undefined;
    };
    /**
     * @beta
     * @hidden
     * Signals to the host to perform authentication using the given authentication parameters and then resend the request to the application specified by the app ID with the authentication result.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application backend to which the request and authentication response should be sent. This must be a UUID
     * @param authenticateParameters Parameters for the authentication pop-up
     * @param originalRequestInfo Information about the original request that should be resent
     * @returns A promise that resolves to the IInvokeResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
     */
    function authenticateAndResendRequest(appId: string, authenticateParameters: AuthenticatePopUpParameters, originalRequestInfo: IOriginalRequestInfo): Promise<IInvokeResponse>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform SSO authentication for the application specified by the app ID
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application backend for which the host should attempt SSO authentication. This must be a UUID
     * @param authTokenRequest Parameters for SSO authentication
     * @returns A promise that resolves when authentication and succeeds and rejects with InvokeError on failure
     */
    function authenticateWithSSO(appId: string, authTokenRequest: AuthTokenRequestParameters): Promise<void>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform SSO authentication for the application specified by the app ID and then resend the request to the application backend with the authentication result
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application backend for which the host should attempt SSO authentication and resend the request and authentication response. This must be a UUID.
     * @param authTokenRequest Parameters for SSO authentication
     * @param originalRequestInfo Information about the original request that should be resent
     * @returns A promise that resolves to the IInvokeResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
     */
    function authenticateWithSSOAndResendRequest(appId: string, authTokenRequest: AuthTokenRequestParameters, originalRequestInfo: IOriginalRequestInfo): Promise<IInvokeResponse>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform Oauth2 authentication for the application specified by the title ID
     * @internal
     * Limited to Microsoft-internal use
     * @param titleId ID of the acquisition
     * @param oauthConfigId lookup ID in token store
     * @param oauthWindowParameters parameters for the signIn window
     * @returns A promise that resolves when authentication succeeds and rejects with InvokeError on failure
     */
    function authenticateWithOauth2(titleId: string, oauthConfigId: string, oauthWindowParameters: OauthWindowProperties): Promise<void>;
    /**
     * @beta
     * @hidden
     * API to authenticate power platform connector plugins
     * @internal
     * Limited to Microsoft-internal use
     * @param titleId ID of the acquisition
     * @param signInUrl signInUrl for the connctor page listing the connector. This is optional
     * @param oauthWindowParameters parameters for the signIn window
     * @returns A promise that resolves when authentication succeeds and rejects with InvokeError on failure
     */
    function authenticateWithPowerPlatformConnectorPlugins(titleId: string, signInUrl?: URL, oauthWindowParameters?: OauthWindowProperties): Promise<void>;
    /**
     * @hidden
     * Checks if the externalAppAuthentication capability is supported by the host
     * @returns boolean to represent whether externalAppAuthentication capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @hidden
 * @internal
 * Limited to Microsoft-internal use; automatically called when library is initialized
 */
declare function initialize$3(): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, this function has been deprecated in favor of a Promise-based pattern using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}
 *
 * Registers handlers to be called with the result of an authentication flow triggered using {@link authentication.authenticate authentication.authenticate(authenticateParameters?: AuthenticateParameters): void}
 *
 * @param authenticateParameters - Configuration for authentication flow pop-up result communication
 */
declare function registerAuthenticationHandlers(authenticateParameters: AuthenticateParameters): void;
/**
 * Initiates an authentication flow which requires a new window.
 * There are two primary uses for this function:
 * 1. When your app needs to authenticate using a 3rd-party identity provider (not Microsoft Entra ID)
 * 2. When your app needs to show authentication UI that is blocked from being shown in an iframe (e.g., Microsoft Entra consent prompts)
 *
 * For more details, see [Enable authentication using third-party OAuth provider](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/auth-flow-tab)
 *
 * This function is *not* needed for "standard" Microsoft Entra SSO usage. Using {@link getAuthToken} is usually sufficient in that case. For more, see
 * [Enable SSO for tab apps](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview))
 *
 * @remarks
 * The authentication flow must start and end from the same domain, otherwise success and failure messages won't be returned to the window that initiated the call.
 * The [Teams authentication flow](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/auth-flow-tab) starts and ends at an endpoint on
 * your own service (with a redirect round-trip to the 3rd party identity provider in the middle).
 *
 * @param authenticateParameters - Parameters describing the authentication window used for executing the authentication flow
 *
 * @returns `Promise` that will be fulfilled with the result from the authentication pop-up, if successful. The string in this result is provided in the parameter
 * passed by your app when it calls {@link authentication.notifySuccess authentication.notifySuccess(result?: string): void} in the pop-up window after returning from the identity provider redirect.
 *
 * @throws `Error` if the authentication request fails or is canceled by the user. This error is provided in the parameter passed by your app when it calls
 * {@link authentication.notifyFailure authentication.notifyFailure(result?: string): void} in the pop-up window after returning from the identity provider redirect. However, in some cases it can also be provided by
 * the infrastructure depending on the failure (e.g., a user cancelation)
 *
 */
declare function authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise<string>;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} instead.
 *
 * The documentation for {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} applies
 * to this function.
 * The one difference is that instead of the result being returned via the `Promise`, the result is returned to the callback functions provided in the
 * `authenticateParameters` parameter.
 *
 * @param authenticateParameters - Parameters describing the authentication window used for executing the authentication flow and callbacks used for indicating the result
 *
 */
declare function authenticate(authenticateParameters?: AuthenticateParameters): void;
/**
 * Requests an Microsoft Entra token to be issued on behalf of your app in an SSO flow.
 * The token is acquired from the cache if it is not expired. Otherwise a request is sent to Microsoft Entra to
 * obtain a new token.
 * This function is used to enable SSO scenarios. See [Enable SSO for tab apps](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/authentication/tab-sso-overview)
 * for more details.
 *
 * @param authTokenRequest - An optional set of values that configure the token request.
 *
 * @returns `Promise` that will be resolved with the token, if successful.
 *
 * @throws `Error` if the request fails in some way
 */
declare function getAuthToken(authTokenRequest?: AuthTokenRequestParameters): Promise<string>;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link authentication.getAuthToken authentication.getAuthToken(authTokenRequest: AuthTokenRequestParameters): Promise\<string\>} instead.
 *
 * The documentation {@link authentication.getAuthToken authentication.getAuthToken(authTokenRequest: AuthTokenRequestParameters): Promise\<string\>} applies to this
 * function as well. The one difference when using this function is that the result is provided in the callbacks in the `authTokenRequest` parameter
 * instead of as a `Promise`.
 *
 * @param authTokenRequest - An optional set of values that configure the token request.
 * It contains callbacks to call in case of success/failure
 */
declare function getAuthToken(authTokenRequest?: AuthTokenRequest): void;
/**
 * @hidden
 * Requests the decoded Microsoft Entra user identity on behalf of the app.
 *
 * @returns Promise that resolves with the {@link UserProfile}.
 *
 * @throws `Error` object in case of any problems, the most likely of which is that the calling app does not have appropriate permissions
 * to call this method.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function getUser(): Promise<UserProfile>;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link authentication.getUser authentication.getUser(): Promise\<UserProfile\>} instead.
 *
 * @hidden
 * Requests the decoded Microsoft Entra user identity on behalf of the app.
 *
 * @param userRequest - It passes success/failure callbacks in the userRequest object(deprecated)
 *
 * @throws `Error` object in case of any problems, the most likely of which is that the calling app does not have appropriate permissions
 * to call this method.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function getUser(userRequest: UserRequest): void;
/**
 * When using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}, the
 * window that was opened to execute the authentication flow should call this method after authentiction to notify the caller of
 * {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} that the
 * authentication request was successful.
 *
 * @remarks
 * This function is usable only from the authentication window.
 * This call causes the authentication window to be closed.
 *
 * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives
 * this value in its callback or via the `Promise` return value
 */
declare function notifySuccess$2(result?: string): void;
/**
   * When using {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}, the
   * window that was opened to execute the authentication flow should call this method after authentiction to notify the caller of
   * {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} that the
   * authentication request failed.

   *
   * @remarks
   * This function is usable only on the authentication window.
   * This call causes the authentication window to be closed.
   *
   * @param result - Specifies a result for the authentication. If specified, the frame that initiated the authentication pop-up receives
   * this value in its callback or via the `Promise` return value
   * @param _callbackUrl - This parameter is deprecated and unused
   */
declare function notifyFailure$2(result?: string): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, this interface has been deprecated in favor of leveraging the `Promise` returned from {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>}
 *-------------------------
 * Used in {@link AuthenticateParameters} and {@link AuthTokenRequest}
 */
interface LegacyCallBacks {
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, this property has been deprecated in favor of a Promise-based pattern.
     *
     * A function that is called if the request succeeds.
     */
    successCallback?: (result: string) => void;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, this property has been deprecated in favor of a Promise-based pattern.
     *
     * A function that is called if the request fails, with the reason for the failure.
     */
    failureCallback?: (reason: string) => void;
}
/**
 * Describes the authentication pop-up parameters
 */
interface AuthenticatePopUpParameters {
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
     * Some identity providers restrict their authentication pages from being displayed in embedded browsers (e.g., a web view inside of a native application)
     * If the identity provider you are using prevents embedded browser usage, this flag should be set to `true` to enable the authentication page specified in
     * the {@link url} property to be opened in an external browser.
     * If this flag is `false`, the page will be opened directly within the current hosting application.
     *
     * This flag is ignored when the host for the application is a web app (as opposed to a native application) as the behavior is unnecessary in a web-only
     * environment without an embedded browser.
     */
    isExternal?: boolean;
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link authentication.authenticate authentication.authenticate(authenticateParameters: AuthenticatePopUpParameters): Promise\<string\>} and
 * the associated {@link AuthenticatePopUpParameters} instead.
 *
 * @see {@link LegacyCallBacks}
 */
type AuthenticateParameters = AuthenticatePopUpParameters & LegacyCallBacks;
/**
 * Describes authentication token request parameters
 */
interface AuthTokenRequestParameters {
    /**
     * @hidden
     * @internal
     * An list of resources for which to acquire the access token; only for internal Microsoft usage
     */
    resources?: string[];
    /**
     * An optional list of claims which to pass to Microsoft Entra when requesting the access token.
     */
    claims?: string[];
    /**
     * An optional flag indicating whether to attempt the token acquisition silently or allow a prompt to be shown.
     */
    silent?: boolean;
    /**
     * An optional identifier of the home tenant for which to acquire the access token for (used in cross-tenant shared channels).
     */
    tenantId?: string;
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link AuthTokenRequestParameters} instead.
 */
type AuthTokenRequest = AuthTokenRequestParameters & LegacyCallBacks;
/**
 * @hidden
 *
 * @internal
 * Limited to Microsoft-internal use
 */
interface UserProfile {
    /**
     * @hidden
     * The intended recipient of the token. The application that receives the token must verify that the audience
     * value is correct and reject any tokens intended for a different audience.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    aud: string;
    /**
     * @hidden
     * Identifies how the subject of the token was authenticated.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    amr: string[];
    /**
     * @hidden
     * Stores the time at which the token was issued. It is often used to measure token freshness.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    iat: number;
    /**
     * @hidden
     * Identifies the security token service (STS) that constructs and returns the token. In the tokens that Microsoft Entra
     * returns, the issuer is sts.windows.net. The GUID in the issuer claim value is the tenant ID of the Microsoft Entra
     * directory. The tenant ID is an immutable and reliable identifier of the directory.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    iss: string;
    /**
     * @hidden
     * Provides the last name, surname, or family name of the user as defined in the Microsoft Entra user object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    family_name: string;
    /**
     * @hidden
     * Provides the first or "given" name of the user, as set on the Microsoft Entra user object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    given_name: string;
    /**
     * @hidden
     * Provides a human-readable value that identifies the subject of the token. This value is not guaranteed to
     * be unique within a tenant and is designed to be used only for display purposes.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    unique_name: string;
    /**
     * @hidden
     * Contains a unique identifier of an object in Microsoft Entra. This value is immutable and cannot be reassigned or
     * reused. Use the object ID to identify an object in queries to Microsoft Entra.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    oid: string;
    /**
     * @hidden
     * Identifies the principal about which the token asserts information, such as the user of an application.
     * This value is immutable and cannot be reassigned or reused, so it can be used to perform authorization
     * checks safely. Because the subject is always present in the tokens the Microsoft Entra issues, we recommended
     * using this value in a general-purpose authorization system.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    sub: string;
    /**
     * @hidden
     * An immutable, non-reusable identifier that identifies the directory tenant that issued the token. You can
     * use this value to access tenant-specific directory resources in a multitenant application. For example,
     * you can use this value to identify the tenant in a call to the Graph API.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    tid: string;
    /**
     * @hidden
     * Defines the end of the time interval within which a token is valid. The service that validates the token
     * should verify that the current date is within the token lifetime; otherwise it should reject the token. The
     * service might allow for up to five minutes beyond the token lifetime to account for any differences in clock
     * time ("time skew") between Microsoft Entra and the service.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    exp: number;
    /**
     * @hidden
     * Defines the start of the time interval within which a token is valid. The service that validates the token
     * should verify that the current date is within the token lifetime; otherwise it should reject the token. The
     * service might allow for up to five minutes beyond the token lifetime to account for any differences in clock
     * time ("time skew") between Microsoft Entra and the service.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    nbf: number;
    /**
     * @hidden
     * Stores the user name of the user principal.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    upn: string;
    /**
     * @hidden
     * Stores the version number of the token.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    ver: string;
    /**
     * @hidden
     * Stores the data residency of the user.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    dataResidency?: DataResidency;
}
/**
 * @hidden
 * Limited set of data residencies information exposed to 1P application developers
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare enum DataResidency {
    /**
     * Public
     */
    Public = "public",
    /**
     * European Union Data Boundary
     */
    EUDB = "eudb",
    /**
     * Other, stored to cover fields that will not be exposed
     */
    Other = "other"
}
/**
 * @deprecated
 * As of TeamsJS v2.0.0, this interface has been deprecated in favor of a Promise-based pattern.
 * @hidden
 * Describes the UserRequest. Success callback describes how a successful request is handled.
 * Failure callback describes how a failed request is handled.
 * @internal
 * Limited to Microsoft-internal use
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

type authentication_d_AuthTokenRequest = AuthTokenRequest;
type authentication_d_AuthTokenRequestParameters = AuthTokenRequestParameters;
type authentication_d_AuthenticateParameters = AuthenticateParameters;
type authentication_d_AuthenticatePopUpParameters = AuthenticatePopUpParameters;
type authentication_d_DataResidency = DataResidency;
declare const authentication_d_DataResidency: typeof DataResidency;
type authentication_d_LegacyCallBacks = LegacyCallBacks;
type authentication_d_UserProfile = UserProfile;
type authentication_d_UserRequest = UserRequest;
declare const authentication_d_authenticate: typeof authenticate;
declare const authentication_d_getAuthToken: typeof getAuthToken;
declare const authentication_d_getUser: typeof getUser;
declare const authentication_d_registerAuthenticationHandlers: typeof registerAuthenticationHandlers;
declare namespace authentication_d {
  export { type authentication_d_AuthTokenRequest as AuthTokenRequest, type authentication_d_AuthTokenRequestParameters as AuthTokenRequestParameters, type authentication_d_AuthenticateParameters as AuthenticateParameters, type authentication_d_AuthenticatePopUpParameters as AuthenticatePopUpParameters, authentication_d_DataResidency as DataResidency, type authentication_d_LegacyCallBacks as LegacyCallBacks, type authentication_d_UserProfile as UserProfile, type authentication_d_UserRequest as UserRequest, authentication_d_authenticate as authenticate, authentication_d_getAuthToken as getAuthToken, authentication_d_getUser as getUser, initialize$3 as initialize, notifyFailure$2 as notifyFailure, notifySuccess$2 as notifySuccess, authentication_d_registerAuthenticationHandlers as registerAuthenticationHandlers };
}

/**
 * A namespace for enabling the suspension or delayed termination of an app when the user navigates away.
 * When an app registers for the registerBeforeSuspendOrTerminateHandler, it chooses to delay termination.
 * When an app registers for both registerBeforeSuspendOrTerminateHandler and registerOnResumeHandler, it chooses the suspension of the app .
 * Please note that selecting suspension doesn't guarantee prevention of background termination.
 * The outcome is influenced by factors such as available memory and the number of suspended apps.
 *
 * @beta
 */
/**
 * Register on resume handler function type
 *
 * @param context - Data structure to be used to pass the context to the app.
 */
type registerOnResumeHandlerFunctionType = (context: ResumeContext) => void;
/**
 * Register before suspendOrTerminate handler function type
 *
 * @returns void
 */
type registerBeforeSuspendOrTerminateHandlerFunctionType = () => Promise<void>;
/**
 * Registers a handler to be called before the page is suspended or terminated. Once a user navigates away from an app,
 * the handler will be invoked. App developers can use this handler to save unsaved data, pause sync calls etc.
 *
 * @param handler - The handler to invoke before the page is suspended or terminated. When invoked, app can perform tasks like cleanups, logging etc.
 * Upon returning, the app will be suspended or terminated.
 *
 */
declare function registerBeforeSuspendOrTerminateHandler(handler: registerBeforeSuspendOrTerminateHandlerFunctionType): void;
/**
 * Registers a handler to be called when the page has been requested to resume from being suspended.
 *
 * @param handler - The handler to invoke when the page is requested to be resumed. The app is supposed to navigate to
 * the appropriate page using the ResumeContext. Once done, the app should then call {@link notifySuccess}.
 *
 * @beta
 */
declare function registerOnResumeHandler(handler: registerOnResumeHandlerFunctionType): void;

declare const lifecycle_d_registerBeforeSuspendOrTerminateHandler: typeof registerBeforeSuspendOrTerminateHandler;
type lifecycle_d_registerBeforeSuspendOrTerminateHandlerFunctionType = registerBeforeSuspendOrTerminateHandlerFunctionType;
declare const lifecycle_d_registerOnResumeHandler: typeof registerOnResumeHandler;
type lifecycle_d_registerOnResumeHandlerFunctionType = registerOnResumeHandlerFunctionType;
declare namespace lifecycle_d {
  export { lifecycle_d_registerBeforeSuspendOrTerminateHandler as registerBeforeSuspendOrTerminateHandler, type lifecycle_d_registerBeforeSuspendOrTerminateHandlerFunctionType as registerBeforeSuspendOrTerminateHandlerFunctionType, lifecycle_d_registerOnResumeHandler as registerOnResumeHandler, type lifecycle_d_registerOnResumeHandlerFunctionType as registerOnResumeHandlerFunctionType };
}

/** App Initialization Messages */
declare const Messages: {
    /** App loaded. */
    AppLoaded: string;
    /** App initialized successfully. */
    Success: string;
    /** App initialization failed. */
    Failure: string;
    /** App initialization expected failure. */
    ExpectedFailure: string;
};
/**
 * Describes errors that caused app initialization to fail
 */
declare enum FailedReason {
    /**
     * Authentication failed
     */
    AuthFailed = "AuthFailed",
    /**
     * The application timed out
     */
    Timeout = "Timeout",
    /**
     * The app failed for a different reason
     */
    Other = "Other"
}
/**
 * Describes expected errors that occurred during an otherwise successful
 * app initialization
 */
declare enum ExpectedFailureReason {
    /**
     * There was a permission error
     */
    PermissionError = "PermissionError",
    /**
     * The item was not found
     */
    NotFound = "NotFound",
    /**
     * The network is currently throttled
     */
    Throttling = "Throttling",
    /**
     * The application is currently offline
     */
    Offline = "Offline",
    /**
     * The app failed for a different reason
     */
    Other = "Other"
}
/**
 * Represents the failed request sent during a failed app initialization.
 */
interface IFailedRequest {
    /**
     * The reason for the failure
     */
    reason: FailedReason;
    /**
     * This property is currently unused.
     */
    message?: string;
}
/**
 * Represents the failure request sent during an erroneous app initialization.
 */
interface IExpectedFailureRequest {
    /**
     * The reason for the failure
     */
    reason: ExpectedFailureReason;
    /**
     * A message that describes the failure
     */
    message?: string;
}
/**
 * Represents application information.
 */
interface AppInfo {
    /**
     * The current locale that the user has configured for the app formatted as
     * languageId-countryId (for example, en-us).
     */
    locale: string;
    /**
     * The current UI theme of the host. Possible values: "default", "dark", "contrast" or "glass".
     */
    theme: string;
    /**
     * Unique ID for the current session for use in correlating telemetry data. A session corresponds to the lifecycle of an app. A new session begins upon the creation of a webview (on Teams mobile) or iframe (in Teams desktop) hosting the app, and ends when it is destroyed.
     */
    sessionId: string;
    /**
     * Info of the host
     */
    host: AppHostInfo;
    /**
     * More detailed locale info from the user's OS if available. Can be used together with
     * the @microsoft/globe NPM package to ensure your app respects the user's OS date and
     * time format configuration
     */
    osLocaleInfo?: LocaleInfo;
    /**
     * Personal app icon y coordinate position
     */
    iconPositionVertical?: number;
    /**
     * Time when the user clicked on the tab using the date.
     *
     * For measuring elapsed time between the moment the user click the tab, use {@link app.AppInfo.userClickTimeV2 | app.Context.app.userClickTimeV2} instead as it uses the performance timer API.
     */
    userClickTime?: number;
    /**
     * Time when the user click on the app by using the performance timer API. Useful for measuring elapsed time accurately.
     *
     * For displaying the time when the user clicked on the app, please use {@link app.AppInfo.userClickTime | app.Context.app.userClickTime} as it uses the date.
     */
    userClickTimeV2?: number;
    /**
     * The ID of the parent message from which this task module was launched.
     * This is only available in task modules launched from bot cards.
     */
    parentMessageId?: string;
    /**
     * Where the user prefers the file to be opened from by default during file open
     */
    userFileOpenPreference?: FileOpenPreference;
    /**
     * ID for the current visible app which is different for across cached sessions. Used for correlating telemetry data.
     */
    appLaunchId?: string;
}
/**
 * Represents information about the application's host.
 */
interface AppHostInfo {
    /**
     * Identifies which host is running your app
     */
    name: HostName;
    /**
     * The client type on which the host is running
     */
    clientType: HostClientType;
    /**
     * Unique ID for the current Host session for use in correlating telemetry data.
     */
    sessionId: string;
    /**
     * Current ring ID
     */
    ringId?: string;
}
/**
 * Represents Channel information.
 */
interface ChannelInfo {
    /**
     * The Microsoft Teams ID for the channel with which the content is associated.
     */
    id: string;
    /**
     * The name for the channel with which the content is associated.
     */
    displayName?: string;
    /**
     * The relative path to the SharePoint folder associated with the channel.
     */
    relativeUrl?: string;
    /**
     * The type of the channel with which the content is associated.
     */
    membershipType?: ChannelType;
    /**
     * The OneNote section ID that is linked to the channel.
     */
    defaultOneNoteSectionId?: string;
    /**
     * The tenant ID of the team which owns the channel.
     */
    ownerTenantId?: string;
    /**
     * The Microsoft Entra group ID of the team which owns the channel.
     */
    ownerGroupId?: string;
}
/**
 * Represents Chat information.
 */
interface ChatInfo {
    /**
     * The Microsoft Teams ID for the chat with which the content is associated.
     */
    id: string;
}
/**
 * Represents Meeting information.
 */
interface MeetingInfo {
    /**
     * Meeting Id used by tab when running in meeting context
     */
    id: string;
}
/**
 * Represents Page information.
 */
interface PageInfo {
    /**
     * The developer-defined unique ID for the page this content points to.
     */
    id: string;
    /**
     * The context where page url is loaded (content, task, setting, remove, sidePanel)
     */
    frameContext: FrameContexts;
    /**
     * The developer-defined unique ID for the sub-page this content points to.
     * This field should be used to restore to a specific state within a page,
     * such as scrolling to or activating a specific piece of content.
     */
    subPageId?: string;
    /**
     * Indication whether the page is in full-screen mode.
     */
    isFullScreen?: boolean;
    /**
     * Indication whether the page is in a pop out window
     */
    isMultiWindow?: boolean;
    /**
     * Indicates whether the page is being loaded in the background as
     * part of an opt-in performance enhancement.
     */
    isBackgroundLoad?: boolean;
    /**
     * Source origin from where the page is opened
     */
    sourceOrigin?: string;
}
/**
 * Represents Team information.
 */
interface TeamInfo {
    /**
     * The Microsoft Teams ID for the team with which the content is associated.
     */
    internalId: string;
    /**
     * The name for the team with which the content is associated.
     */
    displayName?: string;
    /**
     * The type of the team.
     */
    type?: TeamType;
    /**
     * The Office 365 group ID for the team with which the content is associated.
     * This field is available only when the identity permission is requested in the manifest.
     */
    groupId?: string;
    /**
     * Indicates whether team is archived.
     * Apps should use this as a signal to prevent any changes to content associated with archived teams.
     */
    isArchived?: boolean;
    /**
     * Team Template ID if there was a Team Template associated with the creation of the team.
     */
    templateId?: string;
    /**
       * The user's role in the team.
  
       * Because a malicious party can run your content in a browser, this value should
       * be used only as a hint as to the user's role, and never as proof of her role.
       */
    userRole?: UserTeamRole;
}
/**
 * Represents User information.
 */
interface UserInfo {
    /**
     * The Microsoft Entra object id of the current user.
     *
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a optimization hint as to who the user is and never as proof of identity.
     * Specifically, this value should never be used to determine if a user is authorized to access
     * a resource; access tokens should be used for that.
     * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
     *
     * This field is available only when the identity permission is requested in the manifest.
     */
    id: string;
    /**
     * The address book name of the current user.
     */
    displayName?: string;
    /**
     * Represents whether calling is allowed for the current logged in User
     */
    isCallingAllowed?: boolean;
    /**
     * Represents whether PSTN calling is allowed for the current logged in User
     */
    isPSTNCallingAllowed?: boolean;
    /**
     * The license type for the current user. Possible values are:
     * "Unknown", "Teacher", "Student", "Free", "SmbBusinessVoice", "SmbNonVoice", "FrontlineWorker", "Anonymous"
     */
    licenseType?: string;
    /**
     * A value suitable for use when providing a login_hint to Microsoft Entra ID for authentication purposes.
     * See [Provide optional claims to your app](https://learn.microsoft.com/azure/active-directory/develop/active-directory-optional-claims#v10-and-v20-optional-claims-set)
     * for more information about the use of login_hint
     *
     * Because a malicious party can run your content in a browser, this value should
     * be used only as a optimization hint as to who the user is and never as proof of identity.
     * Specifically, this value should never be used to determine if a user is authorized to access
     * a resource; access tokens should be used for that.
     * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
     */
    loginHint?: string;
    /**
       * The UPN of the current user. This may be an externally-authenticated UPN (e.g., guest users).
  
       * Because a malicious party can run your content in a browser, this value should
       * be used only as a optimization hint as to who the user is and never as proof of identity.
       * Specifically, this value should never be used to determine if a user is authorized to access
       * a resource; access tokens should be used for that.
       * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
       */
    userPrincipalName?: string;
    /**
     * The tenant related info of the current user.
     */
    tenant?: TenantInfo;
}
/**
 * Represents Tenant information.
 */
interface TenantInfo {
    /**
       * The Microsoft Entra tenant ID of the current user.
  
       * Because a malicious party can run your content in a browser, this value should
       * be used only as a optimization hint as to who the user is and never as proof of identity.
       * Specifically, this value should never be used to determine if a user is authorized to access
       * a resource; access tokens should be used for that.
       * See {@link authentication.getAuthToken} and {@link authentication.authenticate} for more information on access tokens.
       */
    id: string;
    /**
     * The type of license for the current user's tenant. Possible values are enterprise, free, edu, and unknown.
     */
    teamsSku?: string;
}
/** Represents information about a SharePoint site */
interface SharePointSiteInfo {
    /**
     * The root SharePoint site associated with the team.
     */
    teamSiteUrl?: string;
    /**
     * The domain of the root SharePoint site associated with the team.
     */
    teamSiteDomain?: string;
    /**
     * The relative path to the SharePoint site associated with the team.
     */
    teamSitePath?: string;
    /**
     * Teamsite ID, aka sharepoint site id.
     */
    teamSiteId?: string;
    /**
     * The SharePoint my site domain associated with the user.
     */
    mySiteDomain?: string;
    /**
     * The SharePoint relative path to the current users mysite
     */
    mySitePath?: string;
}
/**
 * Represents structure of the received context message.
 */
interface Context {
    /**
     * Content Action Info
     *
     * @beta
     */
    actionInfo?: ActionInfo;
    /**
     * Properties about the current session for your app
     */
    app: AppInfo;
    /**
     * Info about the current page context hosting your app
     */
    page: PageInfo;
    /**
     * Info about the currently logged in user running the app.
     * If the current user is not logged in/authenticated (e.g. a meeting app running for an anonymously-joined partcipant) this will be `undefined`.
     */
    user?: UserInfo;
    /**
     * When running in the context of a Teams channel, provides information about the channel, else `undefined`
     */
    channel?: ChannelInfo;
    /**
     * When running in the context of a Teams chat, provides information about the chat, else `undefined`
     */
    chat?: ChatInfo;
    /**
     * When running in the context of a Teams meeting, provides information about the meeting, else `undefined`
     */
    meeting?: MeetingInfo;
    /**
     * When hosted in SharePoint, this is the [SharePoint PageContext](https://learn.microsoft.com/javascript/api/sp-page-context/pagecontext?view=sp-typescript-latest), else `undefined`
     */
    sharepoint?: any;
    /**
     * When running in Teams for an organization with a tenant, provides information about the SharePoint site associated with the team.
     * Will be `undefined` when not running in Teams for an organization with a tenant.
     */
    sharePointSite?: SharePointSiteInfo;
    /**
     * When running in Teams, provides information about the Team context in which your app is running.
     * Will be `undefined` when not running in Teams.
     */
    team?: TeamInfo;
    /**
     * When `processActionCommand` activates a dialog, this dialog should automatically fill in some fields with information. This information comes from M365 and is given to `processActionCommand` as `extractedParameters`.
     * App developers need to use these `extractedParameters` in their dialog.
     * They help pre-fill the dialog with necessary information (`dialogParameters`) along with other details.
     * If there's no key/value pairs passed, the object will be empty in the case
     */
    dialogParameters: Record<string, string>;
}
/**
 * This function is passed to registerOnThemeHandler. It is called every time the user changes their theme.
 */
type themeHandler = (theme: string) => void;
/**
 * Checks whether the Teams client SDK has been initialized.
 * @returns whether the Teams client SDK has been initialized.
 */
declare function isInitialized(): boolean;
/**
 * Gets the Frame Context that the App is running in. See {@link FrameContexts} for the list of possible values.
 * @returns the Frame Context.
 */
declare function getFrameContext(): FrameContexts | undefined;
/**
 * Initializes the library.
 *
 * @remarks
 * Initialize must have completed successfully (as determined by the resolved Promise) before any other library calls are made
 *
 * @param validMessageOrigins - Optionally specify a list of cross-frame message origins. This parameter is used if you know that your app
 * will be hosted on a custom domain (i.e., not a standard Microsoft 365 host like Teams, Outlook, etc.) Most apps will never need
 * to pass a value for this parameter.
 * Any domains passed in the array must have the https: protocol on the string otherwise they will be ignored. Example: https://www.example.com
 * @returns Promise that will be fulfilled when initialization has completed, or rejected if the initialization fails or times out
 */
declare function initialize$2(validMessageOrigins?: string[]): Promise<void>;
/**
 * @hidden
 * Undocumented function used to set a mock window for unit tests
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function _initialize(hostWindow: any): void;
/**
 * @hidden
 * Undocumented function used to clear state between unit tests
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function _uninitialize(): void;
/**
 * Retrieves the current context the frame is running in.
 *
 * @returns Promise that will resolve with the {@link app.Context} object.
 */
declare function getContext$1(): Promise<Context>;
/**
 * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
 */
declare function notifyAppLoaded$1(): void;
/**
 * Notifies the frame that app initialization is successful and is ready for user interaction.
 */
declare function notifySuccess$1(): void;
/**
 * Notifies the frame that app initialization has failed and to show an error page in its place.
 *
 * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
 * during initialization as well as an optional message.
 */
declare function notifyFailure$1(appInitializationFailedRequest: IFailedRequest): void;
/**
 * Notifies the frame that app initialized with some expected errors.
 *
 * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
 */
declare function notifyExpectedFailure$1(expectedFailureRequest: IExpectedFailureRequest): void;
/**
 * Registers a handler for theme changes.
 *
 * @remarks
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
declare function registerOnThemeChangeHandler$1(handler: themeHandler): void;
/**
 * This function opens deep links to other modules in the host such as chats or channels or
 * general-purpose links (to external websites). It should not be used for navigating to your
 * own or other apps.
 *
 * @remarks
 * If you need to navigate to your own or other apps, use:
 *
 * - {@link pages.currentApp.navigateToDefaultPage} for navigating to the default page of your own app
 * - {@link pages.currentApp.navigateTo} for navigating to a section of your own app
 * - {@link pages.navigateToApp} for navigating to other apps besides your own
 *
 * Many areas of functionality previously provided by deep links are now handled by strongly-typed functions in capabilities.
 * If your app is using a deep link to trigger these specific components, use the strongly-typed alternatives.
 * For example (this list is not exhaustive):
 * - To open an app installation dialog, use the {@link appInstallDialog} capability
 * - To start a call, use the {@link call} capability
 * - To open a chat, use the {@link chat} capability
 * - To open a dialog, use the {@link dialog} capability
 * - To create a new meeting, use the {@link calendar.composeMeeting} function
 * - To open a Stage View, use the {@link stageView} capability
 *
 * In each of these capabilities, you can use the `isSupported()` function to determine if the host supports that capability.
 * When using a deep link to trigger these components, there's no way to determine whether the host supports it.
 *
 * For more information on crafting deep links to the host, see [Configure deep links](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/deep-links)
 *
 * @param deepLink The host deep link or external web URL to which to navigate
 * @returns `Promise` that will be fulfilled when the navigation has initiated. A successful `Promise` resolution
 * does not necessarily indicate whether the target loaded successfully.
 */
declare function openLink(deepLink: string): Promise<void>;

type app_d_AppHostInfo = AppHostInfo;
type app_d_AppInfo = AppInfo;
type app_d_ChannelInfo = ChannelInfo;
type app_d_ChatInfo = ChatInfo;
type app_d_Context = Context;
type app_d_ExpectedFailureReason = ExpectedFailureReason;
declare const app_d_ExpectedFailureReason: typeof ExpectedFailureReason;
type app_d_FailedReason = FailedReason;
declare const app_d_FailedReason: typeof FailedReason;
type app_d_IExpectedFailureRequest = IExpectedFailureRequest;
type app_d_IFailedRequest = IFailedRequest;
type app_d_MeetingInfo = MeetingInfo;
declare const app_d_Messages: typeof Messages;
type app_d_PageInfo = PageInfo;
type app_d_SharePointSiteInfo = SharePointSiteInfo;
type app_d_TeamInfo = TeamInfo;
type app_d_TenantInfo = TenantInfo;
type app_d_UserInfo = UserInfo;
declare const app_d__initialize: typeof _initialize;
declare const app_d__uninitialize: typeof _uninitialize;
declare const app_d_getFrameContext: typeof getFrameContext;
declare const app_d_isInitialized: typeof isInitialized;
declare const app_d_openLink: typeof openLink;
type app_d_themeHandler = themeHandler;
declare namespace app_d {
  export { type app_d_AppHostInfo as AppHostInfo, type app_d_AppInfo as AppInfo, type app_d_ChannelInfo as ChannelInfo, type app_d_ChatInfo as ChatInfo, type app_d_Context as Context, app_d_ExpectedFailureReason as ExpectedFailureReason, app_d_FailedReason as FailedReason, type app_d_IExpectedFailureRequest as IExpectedFailureRequest, type app_d_IFailedRequest as IFailedRequest, type app_d_MeetingInfo as MeetingInfo, app_d_Messages as Messages, type app_d_PageInfo as PageInfo, type app_d_SharePointSiteInfo as SharePointSiteInfo, type app_d_TeamInfo as TeamInfo, type app_d_TenantInfo as TenantInfo, type app_d_UserInfo as UserInfo, app_d__initialize as _initialize, app_d__uninitialize as _uninitialize, getContext$1 as getContext, app_d_getFrameContext as getFrameContext, initialize$2 as initialize, app_d_isInitialized as isInitialized, lifecycle_d as lifecycle, notifyAppLoaded$1 as notifyAppLoaded, notifyExpectedFailure$1 as notifyExpectedFailure, notifyFailure$1 as notifyFailure, notifySuccess$1 as notifySuccess, app_d_openLink as openLink, registerOnThemeChangeHandler$1 as registerOnThemeChangeHandler, type app_d_themeHandler as themeHandler };
}

/**
 * A strongly-typed class used to represent a "valid" app id.
 *
 * Valid is a relative term, in this case. Truly valid app ids are UUIDs as documented in the schema:
 * https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema#id
 * However, there are some older internal/hard-coded apps which violate this schema and use names like
 * com.microsoft.teamspace.tab.youtube. For compatibility with these legacy apps, we unfortunately cannot
 * securely and completely validate app ids as UUIDs. Based on this, the validation is limited to checking
 * for script tags, length, and non-printable characters. Validation will be updated in the future to ensure
 * the app id is a valid UUID as legacy apps update.
 */
declare class AppId implements ISerializable {
    private readonly appIdAsString;
    /**
     * Creates a strongly-typed AppId from a string
     *
     * @param appIdAsString An app id represented as a string
     * @throws Error with a message describing the exact validation violation
     */
    constructor(appIdAsString: string);
    /**
     * @hidden
     * @internal
     *
     * @returns A serializable representation of an AppId, used for passing AppIds to the host.
     */
    serialize(): object | string;
    /**
     * Returns the app id as a string
     */
    toString(): string;
}

/**
 * Represents a validated email.
 */
declare class EmailAddress {
    /** Represents the input email address string */
    private readonly val;
    constructor(val: string);
    /**
     * Retrieve the validated email address as a string.
     */
    toString(): string;
}

/** Represents set of parameters needed to open the appInstallDialog. */
interface OpenAppInstallDialogParams {
    /** A unique identifier for the app being installed. */
    appId: string;
}
/**
 * Displays a dialog box that allows users to install a specific app within the host environment.
 *
 * @param openAPPInstallDialogParams - See {@link OpenAppInstallDialogParams | OpenAppInstallDialogParams} for more information.
 */
declare function openAppInstallDialog(openAPPInstallDialogParams: OpenAppInstallDialogParams): Promise<void>;
/**
 * Checks if the appInstallDialog capability is supported by the host
 * @returns boolean to represent whether the appInstallDialog capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
declare function isSupported$f(): boolean;

type appInstallDialog_d_OpenAppInstallDialogParams = OpenAppInstallDialogParams;
declare const appInstallDialog_d_openAppInstallDialog: typeof openAppInstallDialog;
declare namespace appInstallDialog_d {
  export { type appInstallDialog_d_OpenAppInstallDialogParams as OpenAppInstallDialogParams, isSupported$f as isSupported, appInstallDialog_d_openAppInstallDialog as openAppInstallDialog };
}

/**
 * Namespace to interact with the barcode scanning-specific part of the SDK.
 *
 * @beta
 */
/**
 * Data structure to customize the barcode scanning experience in scanBarCode API.
 * All properties in BarCodeConfig are optional and have default values in the platform
 *
 * @beta
 */
interface BarCodeConfig {
    /**
     * Optional; designates the scan timeout interval in seconds.
     * Default value is 30 seconds, max allowed value is 60 seconds.
     */
    timeOutIntervalInSec?: number;
}
/**
 * Scan Barcode or QRcode using camera
 *
 * @param barCodeConfig - input configuration to customize the barcode scanning experience
 *
 * @returns a scanned code
 *
 * @beta
 */
declare function scanBarCode(barCodeConfig: BarCodeConfig): Promise<string>;
/**
 * Checks whether or not media has user permission
 *
 * @returns true if the user has granted the app permission to media information, false otherwise
 *
 * @beta
 */
declare function hasPermission$1(): Promise<boolean>;
/**
 * Requests user permission for media
 *
 * @returns true if the user has granted the app permission to the media, false otherwise
 *
 * @beta
 */
declare function requestPermission$1(): Promise<boolean>;
/**
 * Checks if barCode capability is supported by the host
 * @returns boolean to represent whether the barCode capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$e(): boolean;

type barCode_d_BarCodeConfig = BarCodeConfig;
declare const barCode_d_scanBarCode: typeof scanBarCode;
declare namespace barCode_d {
  export { type barCode_d_BarCodeConfig as BarCodeConfig, hasPermission$1 as hasPermission, isSupported$e as isSupported, requestPermission$1 as requestPermission, barCode_d_scanBarCode as scanBarCode };
}

interface OpenChatRequest {
    /**
     * An optional message used when initiating chat
     */
    message?: string;
}
/**
 * Used when starting a chat with one person
 *
 * @see OpenGroupChatRequest for use when a chat with more than one person
 */
interface OpenSingleChatRequest extends OpenChatRequest {
    /**
     * The [Microsoft Entra UPN](https://learn.microsoft.com/entra/identity/hybrid/connect/plan-connect-userprincipalname) (usually but not always an e-mail address)
     * of the user with whom to begin a chat
     */
    user: string;
}
/**
 * Used when starting a chat with more than one person
 *
 * @see OpenSingleChatRequest for use in a chat with only one person
 */
interface OpenGroupChatRequest extends OpenChatRequest {
    /**
     * Array containing [Microsoft Entra UPNs](https://learn.microsoft.com/entra/identity/hybrid/connect/plan-connect-userprincipalname) (usually but not always an e-mail address)
     * of users with whom to begin a chat
     */
    users: string[];
    /**
     * The display name of a conversation for 3 or more users (chats with fewer than three users will ignore this field)
     */
    topic?: string;
}
/**
 * Contains functionality to start chat with others
 */
/**
 * Allows the user to open a chat with a single user and allows
 * for the user to specify the message they wish to send.
 *
 * @param openChatRequest: {@link OpenSingleChatRequest}- a request object that contains a user's email as well as an optional message parameter.
 *
 * @returns Promise resolved upon completion
 */
declare function openChat(openChatRequest: OpenSingleChatRequest): Promise<void>;
/**
 * Allows the user to create a chat with multiple users (2+) and allows
 * for the user to specify a message and name the topic of the conversation. If
 * only 1 user is provided into users array default back to origin openChat.
 *
 * @param openChatRequest: {@link OpenGroupChatRequest} - a request object that contains a list of user emails as well as optional parameters for message and topic (display name for the group chat).
 *
 * @returns Promise resolved upon completion
 */
declare function openGroupChat(openChatRequest: OpenGroupChatRequest): Promise<void>;
/**
 * Checks if the chat capability is supported by the host
 * @returns boolean to represent whether the chat capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
declare function isSupported$d(): boolean;

type chat_d_OpenGroupChatRequest = OpenGroupChatRequest;
type chat_d_OpenSingleChatRequest = OpenSingleChatRequest;
declare const chat_d_openChat: typeof openChat;
declare const chat_d_openGroupChat: typeof openGroupChat;
declare namespace chat_d {
  export { type chat_d_OpenGroupChatRequest as OpenGroupChatRequest, type chat_d_OpenSingleChatRequest as OpenSingleChatRequest, isSupported$d as isSupported, chat_d_openChat as openChat, chat_d_openGroupChat as openGroupChat };
}

/**
 * Interact with the system clipboard
 *
 * @beta
 */
/**
 * Function to copy data to clipboard.
 * @remarks
 * Note: clipboard.write only supports Text, HTML, PNG, and JPEG data format.
 *       MIME type for Text -> `text/plain`, HTML -> `text/html`, PNG/JPEG -> `image/(png | jpeg)`
 *       Also, JPEG will be converted to PNG image when copying to clipboard.
 *
 * @param blob - A Blob object representing the data to be copied to clipboard.
 * @returns A string promise which resolves to success message from the clipboard or
 *          rejects with error stating the reason for failure.
 */
declare function write(blob: Blob): Promise<void>;
/**
 * Function to read data from clipboard.
 *
 * @returns A promise blob which resolves to the data read from the clipboard or
 *          rejects stating the reason for failure.
 *          Note: Returned blob type will contain one of the MIME type `image/png`, `text/plain` or `text/html`.
 */
declare function read(): Promise<Blob>;
/**
 * Checks if clipboard capability is supported by the host
 * @returns boolean to represent whether the clipboard capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$c(): boolean;

declare const clipboard_d_read: typeof read;
declare const clipboard_d_write: typeof write;
declare namespace clipboard_d {
  export { isSupported$c as isSupported, clipboard_d_read as read, clipboard_d_write as write };
}

/**
 * Module for interaction with adaptive card dialogs that need to communicate with the bot framework
 *
 * @beta
 */
/**
 * Allows an app to open an adaptive card-based dialog module using bot.
 *
 * @param botAdaptiveCardDialogInfo - An object containing the parameters of the dialog module including completionBotId.
 * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
 *
 * @beta
 */
declare function open$3(botAdaptiveCardDialogInfo: BotAdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void;
/**
 * Checks if dialog.adaptiveCard.bot capability is supported by the host
 *
 * @returns boolean to represent whether dialog.adaptiveCard.bot is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$b(): boolean;

declare namespace bot_d$1 {
  export { isSupported$b as isSupported, open$3 as open };
}

/**
 * Subcapability for interacting with adaptive card dialogs
 * @beta
 */
/**
 * Allows app to open an adaptive card based dialog.
 *
 * @remarks
 * This function cannot be called from inside of a dialog
 *
 * @param adaptiveCardDialogInfo - An object containing the parameters of the dialog module {@link AdaptiveCardDialogInfo}.
 * @param submitHandler - Handler that triggers when a dialog fires an [Action.Submit](https://adaptivecards.io/explorer/Action.Submit.html) or when the user closes the dialog.
 *
 * @beta
 */
declare function open$2(adaptiveCardDialogInfo: AdaptiveCardDialogInfo, submitHandler?: DialogSubmitHandler): void;
/**
 * Checks if dialog.adaptiveCard module is supported by the host
 *
 * @returns boolean to represent whether dialog.adaptiveCard module is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$a(): boolean;

declare namespace adaptiveCard_d {
  export { bot_d$1 as bot, isSupported$a as isSupported, open$2 as open };
}

/**
 * Module to update the dialog
 *
 * @beta
 */
/**
 * Update dimensions - height/width of a dialog.
 *
 * @param dimensions - An object containing width and height properties.
 *
 * @beta
 */
declare function resize(dimensions: DialogSize): void;
/**
 * Checks if dialog.update capability is supported by the host
 * @returns boolean to represent whether dialog.update capabilty is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$9(): boolean;

declare const update_d_resize: typeof resize;
declare namespace update_d {
  export { isSupported$9 as isSupported, update_d_resize as resize };
}

/**
 * Module to open a dialog that sends results to the bot framework
 *
 * @beta
 */
/**
 * Allows an app to open a dialog that sends submitted data to a bot.
 *
 * @param botUrlDialogInfo - An object containing the parameters of the dialog module including completionBotId.
 * @param submitHandler - Handler that triggers when the dialog has been submitted or closed.
 * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
 *
 * @returns a function that can be used to send messages to the dialog.
 *
 * @beta
 */
declare function open$1(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void;
/**
 * Checks if dialog.url.bot capability is supported by the host
 *
 * @returns boolean to represent whether dialog.url.bot is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$8(): boolean;

declare namespace bot_d {
  export { isSupported$8 as isSupported, open$1 as open };
}

/**
 * Subcapability that allows communication between the dialog and the parent app.
 *
 * @remarks
 * Note that dialog can be invoked from parentless scenarios e.g. Search Message Extensions. The subcapability `parentCommunication` is not supported in such scenarios.
 *
 * @beta
 */
/**
 *  Send message to the parent from dialog
 *
 * @remarks
 * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
 *
 * @param message - The message to send to the parent
 *
 * @beta
 */
declare function sendMessageToParentFromDialog(message: any): void;
/**
 *  Send message to the dialog from the parent
 *
 * @param message - The message to send
 *
 * @beta
 */
declare function sendMessageToDialog(message: any): void;
/**
 * Register a listener that will be triggered when a message is received from the app that opened the dialog.
 *
 * @remarks
 * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
 *
 * @param listener - The listener that will be triggered.
 *
 * @beta
 */
declare function registerOnMessageFromParent(listener: PostMessageChannel): void;
/**
 * Checks if dialog.url.parentCommunication capability is supported by the host
 *
 * @returns boolean to represent whether dialog.url.parentCommunication capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$7(): boolean;

declare const parentCommunication_d_registerOnMessageFromParent: typeof registerOnMessageFromParent;
declare const parentCommunication_d_sendMessageToDialog: typeof sendMessageToDialog;
declare const parentCommunication_d_sendMessageToParentFromDialog: typeof sendMessageToParentFromDialog;
declare namespace parentCommunication_d {
  export { isSupported$7 as isSupported, parentCommunication_d_registerOnMessageFromParent as registerOnMessageFromParent, parentCommunication_d_sendMessageToDialog as sendMessageToDialog, parentCommunication_d_sendMessageToParentFromDialog as sendMessageToParentFromDialog };
}

/**
 * Allows app to open a url based dialog.
 *
 * @remarks
 * This function cannot be called from inside of a dialog
 *
 * @param urlDialogInfo - An object containing the parameters of the dialog module.
 * @param submitHandler - Handler that triggers when a dialog calls the {@linkcode submit} function or when the user closes the dialog.
 * @param messageFromChildHandler - Handler that triggers if dialog sends a message to the app.
 *
 * @beta
 */
declare function open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void;
/**
 * Submit the dialog module and close the dialog
 *
 * @remarks
 * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
 *
 * @param result - The result to be sent to the bot or the app. Typically a JSON object or a serialized version of it,
 *  If this function is called from a dialog while {@link M365ContentAction} is set in the context object by the host, result will be ignored
 *
 * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
 *
 * @beta
 */
declare function submit(result?: string | object, appIds?: string | string[]): void;
/**
 * Checks if dialog.url module is supported by the host
 *
 * @returns boolean to represent whether dialog.url module is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$6(): boolean;
/**
 * @hidden
 *
 * Convert UrlDialogInfo to DialogInfo to send the information to host in {@linkcode open} API.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function getDialogInfoFromUrlDialogInfo(urlDialogInfo: UrlDialogInfo): DialogInfo;
/**
 * @hidden
 *
 * Convert BotUrlDialogInfo to DialogInfo to send the information to host in {@linkcode bot.open} API.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare function getDialogInfoFromBotUrlDialogInfo(botUrlDialogInfo: BotUrlDialogInfo): DialogInfo;

declare const url_d_getDialogInfoFromBotUrlDialogInfo: typeof getDialogInfoFromBotUrlDialogInfo;
declare const url_d_getDialogInfoFromUrlDialogInfo: typeof getDialogInfoFromUrlDialogInfo;
declare const url_d_open: typeof open;
declare const url_d_submit: typeof submit;
declare namespace url_d {
  export { bot_d as bot, url_d_getDialogInfoFromBotUrlDialogInfo as getDialogInfoFromBotUrlDialogInfo, url_d_getDialogInfoFromUrlDialogInfo as getDialogInfoFromUrlDialogInfo, isSupported$6 as isSupported, url_d_open as open, parentCommunication_d as parentCommunication, url_d_submit as submit };
}

/**
 * This group of capabilities enables apps to show modal dialogs. There are two primary types of dialogs: URL-based dialogs and [Adaptive Card](https://learn.microsoft.com/adaptive-cards/) dialogs.
 * Both types of dialogs are shown on top of your app, preventing interaction with your app while they are displayed.
 * - URL-based dialogs allow you to specify a URL from which the contents will be shown inside the dialog.
 *   - For URL dialogs, use the functions and interfaces in the {@link url} module.
 * - Adaptive Card-based dialogs allow you to provide JSON describing an Adaptive Card that will be shown inside the dialog.
 *   - For Adaptive Card dialogs, use the functions and interfaces in the {@link adaptiveCard} module.
 *
 * @remarks Note that dialogs were previously called "task modules". While they have been renamed for clarity, the functionality has been maintained.
 * For more details, see [Dialogs](https://learn.microsoft.com/microsoftteams/platform/task-modules-and-cards/what-are-task-modules)
 *
 * @beta
 */
/**
 * Data Structure to represent the SDK response when dialog closes
 *
 * @beta
 */
interface ISdkResponse {
    /**
     * Error in case there is a failure before dialog submission
     */
    err?: string;
    /**
     * Value provided in the `result` parameter by the dialog when the {@linkcode url.submit} function
     * was called.
     * If the dialog was closed by the user without submitting (e.g., using a control in the corner
     * of the dialog), this value will be `undefined` here.
     */
    result?: string | object;
}
/**
 * Handler used to receive and process messages sent between a dialog and the app that launched it
 * @beta
 */
type PostMessageChannel = (message: any) => void;
/**
 * Handler used for receiving results when a dialog closes, either the value passed by {@linkcode url.submit}
 * or an error if the dialog was closed by the user.
 *
 * @see {@linkcode ISdkResponse}
 *
 * @beta
 */
type DialogSubmitHandler = (result: ISdkResponse) => void;
/**
 * @hidden
 * Hide from docs because this function is only used during initialization
 *
 * Adds register handlers for messageForChild upon initialization and only in the tasks FrameContext. {@link FrameContexts.task}
 * Function is called during app initialization
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
declare function initialize$1(): void;
/**
 * This function currently serves no purpose and should not be used. All functionality that used
 * to be covered by this method is now in subcapabilities and those isSupported methods should be
 * used directly.
 *
 * @hidden
 */
declare function isSupported$5(): boolean;

type dialog_d_DialogSubmitHandler = DialogSubmitHandler;
type dialog_d_ISdkResponse = ISdkResponse;
type dialog_d_PostMessageChannel = PostMessageChannel;
declare namespace dialog_d {
  export { type dialog_d_DialogSubmitHandler as DialogSubmitHandler, type dialog_d_ISdkResponse as ISdkResponse, type dialog_d_PostMessageChannel as PostMessageChannel, adaptiveCard_d as adaptiveCard, initialize$1 as initialize, isSupported$5 as isSupported, update_d as update, url_d as url };
}

/**
 * @beta
 * Nested app auth capabilities
 */
declare namespace nestedAppAuth {
    /**
     * Checks if MSAL-NAA channel recommended by the host
     * @returns true if host is recommending NAA channel and false otherwise
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    function isNAAChannelRecommended(): boolean;
}

/**
 * Allows user to choose location on map
 *
 * @returns Promise that will resolve with {@link geoLocation.Location} object chosen by the user or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
declare function chooseLocation(): Promise<Location>;
/**
 * Shows the location on map corresponding to the given coordinates
 *
 * @param location - Location to be shown on the map
 * @returns Promise that resolves when the location dialog has been closed or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
declare function showLocation(location: Location): Promise<void>;
/**
 * Checks if geoLocation.map capability is supported by the host
 * @returns boolean to represent whether geoLocation.map is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$4(): boolean;

declare const map_d_chooseLocation: typeof chooseLocation;
declare const map_d_showLocation: typeof showLocation;
declare namespace map_d {
  export { map_d_chooseLocation as chooseLocation, isSupported$4 as isSupported, map_d_showLocation as showLocation };
}

/**
 * Namespace to interact with the geoLocation module-specific part of the SDK. This is the newer version of location module.
 *
 * @beta
 */
/**
 * Data struture to represent the location information
 *
 * @beta
 */
interface Location {
    /**
        Latitude of the location
        */
    latitude: number;
    /**
        Longitude of the location
        */
    longitude: number;
    /**
        Accuracy describes the maximum distance in meters from the captured coordinates to the possible actual location
        @remarks
        This property is only in scope for mobile
        */
    accuracy?: number;
    /**
        Time stamp when the location was captured
        */
    timestamp?: number;
}
/**
 * Fetches current user coordinates
 * @returns Promise that will resolve with {@link geoLocation.Location} object or reject with an error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
declare function getCurrentLocation(): Promise<Location>;
/**
 * Checks whether or not location has user permission
 *
 * @returns Promise that will resolve with true if the user had granted the app permission to location information, or with false otherwise,
 * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
declare function hasPermission(): Promise<boolean>;
/**
 * Requests user permission for location
 *
 * @returns true if the user consented permission for location, false otherwise
 * @returns Promise that will resolve with true if the user consented permission for location, or with false otherwise,
 * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
 *
 * @beta
 */
declare function requestPermission(): Promise<boolean>;
/**
 * Checks if geoLocation capability is supported by the host
 * @returns boolean to represent whether geoLocation is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
declare function isSupported$3(): boolean;

type geoLocation_d_Location = Location;
declare const geoLocation_d_getCurrentLocation: typeof getCurrentLocation;
declare const geoLocation_d_hasPermission: typeof hasPermission;
declare const geoLocation_d_requestPermission: typeof requestPermission;
declare namespace geoLocation_d {
  export { type geoLocation_d_Location as Location, geoLocation_d_getCurrentLocation as getCurrentLocation, geoLocation_d_hasPermission as hasPermission, isSupported$3 as isSupported, map_d as map, geoLocation_d_requestPermission as requestPermission };
}

/**
 * @returns The {@linkcode AdaptiveCardVersion} representing the Adaptive Card schema
 * version supported by the host, or undefined if the host does not support Adaptive Cards
 */
declare function getAdaptiveCardSchemaVersion(): AdaptiveCardVersion | undefined;

/**
 * Navigation-specific part of the SDK.
 */
declare namespace pages {
    /** Callback function */
    type handlerFunctionType = () => void;
    /** Full screen function */
    type fullScreenChangeFunctionType = (isFullScreen: boolean) => void;
    /** Back button handler function */
    type backButtonHandlerFunctionType = () => boolean;
    /** Save event function */
    type saveEventType = (evt: pages.config.SaveEvent) => void;
    /** Remove event function */
    type removeEventType = (evt: pages.config.RemoveEvent) => void;
    /**
     * @hidden
     * List of enter focus action items
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum EnterFocusType {
        /**
         * Determines the previous direction to focus in app when hot keys entered.
         */
        PreviousLandmark = 0,
        /**
         * Determines the next direction to focus in app when hot keys entered.
         */
        NextLandmark = 1,
        /**
         * Determines if the focus should go to the particular content of the app.
         * Read - Focus should go to the content of the app.
         */
        Read = 2,
        /**
         * Determines if the focus should go to the particular content of the app.
         * Compose - Focus should go to the compose area (such as textbox) of the app.
         */
        Compose = 3
    }
    /**
     * Return focus action items
     */
    enum ReturnFocusType {
        /**
         * Determines the direction to focus in host for previous landmark.
         */
        PreviousLandmark = 0,
        /**
         * Determines the direction to focus in host for next landmark.
         */
        NextLandmark = 1,
        /**
         * Determines if the focus should go to the host's activity feed
         */
        GoToActivityFeed = 2
    }
    /**
     * @deprecated
     * Return focus to the host. Will move focus forward or backward based on where the application container falls in
     * the F6/tab order in the host.
     * On mobile hosts or hosts where there is no keyboard interaction or UI notion of "focus" this function has no
     * effect and will be a no-op when called.
     * @param navigateForward - Determines the direction to focus in host.
     */
    function returnFocus(navigateForward?: boolean): void;
    /**
     * Return focus to the host. Will attempt to send focus to the appropriate part of the host (as specified by returnFocusType) based on where the application container falls in
     * the F6/tab order in the host.
     * On mobile hosts or hosts where there is no keyboard interaction or UI notion of "focus" this function has no
     * effect and will be a no-op when called.
     * @param returnFocusType - Determines the type of focus to return to in the host.
     */
    function returnFocus(returnFocusType: pages.ReturnFocusType): void;
    /**
     * @hidden
     *
     * Registers a handler for specifying focus when it passes from the host to the application.
     * On mobile hosts or hosts where there is no UI notion of "focus" the handler registered with
     * this function will never be called.
     *
     * @param handler - The handler for placing focus within the application.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerFocusEnterHandler(handler: (navigateForward: boolean, enterFocusType?: EnterFocusType) => void): void;
    /**
     * Sets/Updates the current frame with new information
     *
     * @param frameInfo - Frame information containing the URL used in the iframe on reload and the URL for when the
     * user clicks 'Go To Website'
     */
    function setCurrentFrame(frameInfo: FrameInfo): void;
    /**
     * Initializes the library with context information for the frame
     *
     * @param frameInfo - Frame information containing the URL used in the iframe on reload and the URL for when the
     *  user clicks 'Go To Website'
     * @param callback - An optional callback that is executed once the application has finished initialization.
     * @param validMessageOrigins - An optional list of cross-frame message origins. They must have
     * https: protocol otherwise they will be ignored. Example: https:www.example.com
     */
    function initializeWithFrameContext(frameInfo: FrameInfo, callback?: handlerFunctionType, validMessageOrigins?: string[]): void;
    /**
     * Defines the configuration of the current or desired instance
     */
    interface InstanceConfig {
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
        entityId?: string;
    }
    /**
     * Gets the config for the current instance.
     * @returns Promise that resolves with the {@link InstanceConfig} object.
     */
    function getConfig(): Promise<InstanceConfig>;
    /**
     * @deprecated
     * As of 2.0.0, this API is deprecated and can be replaced by the standard JavaScript
     * API, window.location.href, when navigating the app to a new cross-domain URL. Any URL
     * that is redirected to must be listed in the validDomains block of the manifest. Please
     * remove any calls to this API.
     * @param url - The URL to navigate the frame to.
     * @returns Promise that resolves when the navigation has completed.
     */
    function navigateCrossDomain(url: string): Promise<void>;
    /**
     * Used to navigate to apps other than your own.
     *
     * If you are looking to navigate within your own app, use {@link pages.currentApp.navigateToDefaultPage} or {@link pages.currentApp.navigateTo}
     *
     * @param params Parameters for the navigation
     * @returns a `Promise` that will resolve if the navigation was successful or reject if it was not
     * @throws `Error` if the app ID is not valid or `params.webUrl` is defined but not a valid URL
     */
    function navigateToApp(params: AppNavigationParameters | NavigateToAppParams): Promise<void>;
    /**
     * Shares a deep link that a user can use to navigate back to a specific state in this page.
     * Please note that this method does not yet work on mobile hosts.
     *
     * @param deepLinkParameters - ID and label for the link and fallback URL.
     */
    function shareDeepLink(deepLinkParameters: ShareDeepLinkParameters): void;
    /**
     * Registers a handler for changes from or to full-screen view for a tab.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * On hosts where there is no support for making an app full screen, the handler registered
     * with this function will never be called.
     * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
     */
    function registerFullScreenHandler(handler: fullScreenChangeFunctionType): void;
    /**
     * Checks if the pages capability is supported by the host
     * @returns boolean to represent whether the appEntity capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    function isSupported(): boolean;
    /**
     * @deprecated
     * This interface has been deprecated in favor of a more type-safe interface using {@link pages.AppNavigationParameters}
     *
     * Parameters for the {@link pages.navigateToApp} function
     */
    interface NavigateToAppParams {
        /**
         * ID of the app to navigate to
         */
        appId: string;
        /**
         * Developer-defined ID of the page to navigate to within the app (formerly called `entityId`)
         */
        pageId: string;
        /**
         * Fallback URL to open if the navigation cannot be completed within the host (e.g. if the target app is not installed)
         */
        webUrl?: string;
        /**
         * Developer-defined ID describing the content to navigate to within the page. This ID is passed to the application
         * via the {@link app.PageInfo.subPageId} property on the {@link app.Context} object (retrieved by calling {@link app.getContext})
         */
        subPageId?: string;
        /**
         * For apps installed as a channel tab, this ID can be supplied to indicate in which Teams channel the app should be opened
         */
        channelId?: string;
        /**
       * Optional ID of the chat or meeting where the app should be opened
    
       */
        chatId?: string;
    }
    /**
     * Type-safer version of parameters for the {@link pages.navigateToApp} function
     */
    interface AppNavigationParameters {
        /**
         * ID of the app to navigate to
         */
        appId: AppId;
        /**
         * Developer-defined ID of the page to navigate to within the app (formerly called `entityId`)
         */
        pageId: string;
        /**
         * Fallback URL to open if the navigation cannot be completed within the host (e.g., if the target app is not installed)
         */
        webUrl?: URL;
        /**
         * Developer-defined ID describing the content to navigate to within the page. This ID is passed to the application
         * via the {@link app.PageInfo.subPageId} property on the {@link app.Context} object (retrieved by calling {@link app.getContext})
         */
        subPageId?: string;
        /**
         * For apps installed as a channel tab, this ID can be supplied to indicate in which Teams channel the app should be opened
         * This property has no effect in hosts where apps cannot be opened in channels
         */
        channelId?: string;
        /**
         * Optional ID of the chat or meeting where the app should be opened
         * This property has no effect in hosts where apps cannot be opened in chats or meetings
         */
        chatId?: string;
    }
    /**
     * Provides APIs for querying and navigating between contextual tabs of an application. Unlike personal tabs,
     * contextual tabs are pages associated with a specific context, such as channel or chat.
     */
    namespace tabs {
        /**
         * Navigates the hosted application to the specified tab instance.
         * @param tabInstance - The destination tab instance.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateToTab(tabInstance: TabInstance): Promise<void>;
        /**
         * Retrieves application tabs for the current user.
         * If no TabInstanceParameters are passed, the application defaults to favorite teams and favorite channels.
         * @param tabInstanceParameters - An optional set of flags that specify whether to scope call to favorite teams or channels.
         * @returns Promise that resolves with the {@link TabInformation}. Contains information for the user's tabs that are owned by this application {@link TabInstance}.
         */
        function getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation>;
        /**
         * Retrieves the most recently used application tabs for the current user.
         * @param tabInstanceParameters - An optional set of flags. Note this is currently ignored and kept for future use.
         * @returns Promise that resolves with the {@link TabInformation}. Contains information for the users' most recently used tabs {@link TabInstance}.
         */
        function getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation>;
        /**
         * Checks if the pages.tab capability is supported by the host
         * @returns boolean to represent whether the pages.tab capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * Provides APIs to interact with the configuration-specific part of the SDK.
     * This object is usable only on the configuration frame.
     */
    namespace config {
        /**
         * @hidden
         * Hide from docs because this function is only used during initialization
         *
         * Adds register handlers for settings.save and settings.remove upon initialization. Function is called in {@link app.initializeHelper}
         * @internal
         * Limited to Microsoft-internal use
         */
        function initialize(): void;
        /**
         * Sets the validity state for the configuration.
         * The initial value is false, so the user cannot save the configuration until this is called with true.
         * @param validityState - Indicates whether the save or remove button is enabled for the user.
         */
        function setValidityState(validityState: boolean): void;
        /**
         * Sets the configuration for the current instance.
         * This is an asynchronous operation; calls to getConfig are not guaranteed to reflect the changed state.
         * @param instanceConfig - The desired configuration for this instance.
         * @returns Promise that resolves when the operation has completed.
         */
        function setConfig(instanceConfig: InstanceConfig): Promise<void>;
        /**
         * Registers a handler for when the user attempts to save the configuration. This handler should be used
         * to create or update the underlying resource powering the content.
         * The object passed to the handler must be used to notify whether to proceed with the save.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when the user selects the Save button.
         */
        function registerOnSaveHandler(handler: saveEventType): void;
        /**
         * @hidden
         * Undocumented helper function with shared code between deprecated version and current version of the registerOnSaveHandler API.
         *
         * @internal
         * Limited to Microsoft-internal use
         *
         * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
         * @param handler - The handler to invoke when the user selects the Save button.
         * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
         */
        function registerOnSaveHandlerHelper(apiVersionTag: string, handler: (evt: SaveEvent) => void, versionSpecificHelper?: () => void): void;
        /**
         * Registers a handler for user attempts to remove content. This handler should be used
         * to remove the underlying resource powering the content.
         * The object passed to the handler must be used to indicate whether to proceed with the removal.
         * Only one handler may be registered at a time. Subsequent registrations will override the first.
         * @param handler - The handler to invoke when the user selects the Remove button.
         */
        function registerOnRemoveHandler(handler: removeEventType): void;
        /**
         * @hidden
         * Undocumented helper function with shared code between deprecated version and current version of the registerOnRemoveHandler API.
         *
         * @internal
         * Limited to Microsoft-internal use
         *
         * @param apiVersionTag - The API version tag, which is used for telemetry, composed by API version number and source API name.
         * @param handler - The handler to invoke when the user selects the Remove button.
         * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
         */
        function registerOnRemoveHandlerHelper(apiVersionTag: string, handler: (evt: RemoveEvent) => void, versionSpecificHelper?: () => void): void;
        /**
         * Registers a handler for when the tab configuration is changed by the user
         * @param handler - The handler to invoke when the user clicks on Settings.
         */
        function registerChangeConfigHandler(handler: handlerFunctionType): void;
        /**
         * Describes the results of the settings.save event. Includes result, notifySuccess, and notifyFailure
         * to indicate the return object (result) and the status of whether the settings.save call succeeded or not and why.
         */
        interface SaveEvent {
            /**
             * Object containing properties passed as arguments to the settings.save event.
             */
            result: SaveParameters;
            /**
             * Indicates that the underlying resource has been created and the config can be saved.
             */
            notifySuccess(): void;
            /**
             * Indicates that creation of the underlying resource failed and that the config cannot be saved.
             * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
             */
            notifyFailure(reason?: string): void;
        }
        /**
         * Describes the results of the settings.remove event. Includes notifySuccess, and notifyFailure
         * to indicate the status of whether the settings.save call succeeded or not and why.
         */
        interface RemoveEvent {
            /**
             * Indicates that the underlying resource has been removed and the content can be removed.
             */
            notifySuccess(): void;
            /**
             * Indicates that removal of the underlying resource failed and that the content cannot be removed.
             * @param reason - Specifies a reason for the failure. If provided, this string is displayed to the user; otherwise a generic error is displayed.
             */
            notifyFailure(reason?: string): void;
        }
        /**
         * Parameters used in the settings.save event
         */
        interface SaveParameters {
            /**
             * Connector's webhook Url returned as arguments to settings.save event as part of user clicking on Save
             */
            webhookUrl?: string;
        }
        /**
         * Checks if the pages.config capability is supported by the host
         * @returns boolean to represent whether the pages.config capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * Provides APIs for handling the user's navigational history.
     */
    namespace backStack {
        /**
         * @hidden
         * Register backButtonPress handler.
         *
         * @internal
         * Limited to Microsoft-internal use.
         */
        function _initialize(): void;
        /**
         * Navigates back in the hosted application. See {@link pages.backStack.registerBackButtonHandler} for notes on usage.
         * @returns Promise that resolves when the navigation has completed.
         */
        function navigateBack(): Promise<void>;
        /**
         * Registers a handler for user presses of the host client's back button. Experiences that maintain an internal
         * navigation stack should use this handler to navigate the user back within their frame. If an application finds
         * that after running its back button handler it cannot handle the event it should call the navigateBack
         * method to ask the host client to handle it instead.
         * @param handler - The handler to invoke when the user presses the host client's back button.
         */
        function registerBackButtonHandler(handler: backButtonHandlerFunctionType): void;
        /**
         * @hidden
         * Undocumented helper function with shared code between deprecated version and current version of the registerBackButtonHandler API.
         *
         * @internal
         * Limited to Microsoft-internal use
         * @param apiVersionTag - The tag indicating API version number with name
         * @param handler - The handler to invoke when the user presses the host client's back button.
         * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
         */
        function registerBackButtonHandlerHelper(apiVersionTag: string, handler: () => boolean, versionSpecificHelper?: () => void): void;
        /**
         * Checks if the pages.backStack capability is supported by the host
         * @returns boolean to represent whether the pages.backStack capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * @hidden
     * Hide from docs
     * ------
     * Provides APIs to interact with the full-trust part of the SDK. Limited to 1P applications
     * @internal
     * Limited to Microsoft-internal use
     */
    namespace fullTrust {
        /**
         * @hidden
         * Hide from docs
         * ------
         * Place the tab into full-screen mode.
         *
         */
        function enterFullscreen(): void;
        /**
         * @hidden
         * Hide from docs
         * ------
         * Reverts the tab into normal-screen mode.
         */
        function exitFullscreen(): void;
        /**
         * @hidden
         *
         * Checks if the pages.fullTrust capability is supported by the host
         * @returns boolean to represent whether the pages.fullTrust capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * Provides APIs to interact with the app button part of the SDK.
     */
    namespace appButton {
        /**
         * Registers a handler for clicking the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
         */
        function onClick(handler: handlerFunctionType): void;
        /**
         * Registers a handler for entering hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
         */
        function onHoverEnter(handler: handlerFunctionType): void;
        /**
         * Registers a handler for exiting hover of the app button.
         * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
         * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
         */
        function onHoverLeave(handler: handlerFunctionType): void;
        /**
         * Checks if pages.appButton capability is supported by the host
         * @returns boolean to represent whether the pages.appButton capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * Provides functions for navigating within your own app
     *
     * @remarks
     * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
     */
    namespace currentApp {
        /**
         * Parameters provided to the {@link pages.currentApp.navigateTo} function
         */
        interface NavigateWithinAppParams {
            /**
             * The developer-defined unique ID for the page defined in the manifest or when first configuring
             * the page. (Known as {@linkcode Context.entityId} prior to TeamsJS v2.0.0)
             */
            pageId: string;
            /**
             * Optional developer-defined unique ID describing the content to navigate to within the page. This
             * can be retrieved from the Context object {@link app.PageInfo.subPageId | app.Context.page.subPageId}
             */
            subPageId?: string;
        }
        /**
         * Navigate within the currently running app
         *
         * @remarks
         * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
         *
         * @param params Parameters for the navigation
         * @returns `Promise` that will resolve if the navigation was successful and reject if not
         */
        function navigateTo(params: NavigateWithinAppParams): Promise<void>;
        /**
         * Navigate to the currently running app's first static page defined in the application
         * manifest.
         *
         * @returns `Promise` that will resolve if the navigation was successful and reject if not
         */
        function navigateToDefaultPage(): Promise<void>;
        /**
         * Checks if pages.currentApp capability is supported by the host
         * @returns boolean to represent whether the pages.currentApp capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
}

/** onComplete function type */
type onCompleteFunctionType = (status: boolean, reason?: string) => void;
/** addEventListner function type */
type addEventListnerFunctionType = (message: any) => void;
/** Represents a window or frame within the host app. */
interface IAppWindow {
    /**
     * Send a message to the AppWindow.
     *
     * @param message - The message to send
     * @param onComplete - The callback to know if the postMessage has been success/failed.
     */
    postMessage(message: any, onComplete?: onCompleteFunctionType): void;
    /**
     * Add a listener that will be called when an event is received from this AppWindow.
     *
     * @param type - The event to listen to. Currently the only supported type is 'message'.
     * @param listener - The listener that will be called
     */
    addEventListener(type: string, listener: Function): void;
}
/**
 * An object that application can utilize to establish communication
 * with the child window it opened, which contains the corresponding task.
 */
declare class ChildAppWindow implements IAppWindow {
    /**
     * Send a message to the ChildAppWindow.
     *
     * @param message - The message to send
     * @param onComplete - The callback to know if the postMessage has been success/failed.
     */
    postMessage(message: any, onComplete?: onCompleteFunctionType): void;
    /**
     * Add a listener that will be called when an event is received from the ChildAppWindow.
     *
     * @param type - The event to listen to. Currently the only supported type is 'message'.
     * @param listener - The listener that will be called
     */
    addEventListener(type: string, listener: addEventListnerFunctionType): void;
}
/**
 * An object that is utilized to facilitate communication with a parent window
 * that initiated the opening of current window. For instance, a dialog or task
 * module would utilize it to transmit messages to the application that launched it.
 */
declare class ParentAppWindow implements IAppWindow {
    /** Represents a parent window or frame. */
    private static _instance;
    /** Get the parent window instance. */
    static get Instance(): IAppWindow;
    /**
     * Send a message to the ParentAppWindow.
     *
     * @param message - The message to send
     * @param onComplete - The callback to know if the postMessage has been success/failed.
     */
    postMessage(message: any, onComplete?: onCompleteFunctionType): void;
    /**
     * Add a listener that will be called when an event is received from the ParentAppWindow.
     *
     * @param type - The event to listen to. Currently the only supported type is 'message'.
     * @param listener - The listener that will be called
     */
    addEventListener(type: string, listener: addEventListnerFunctionType): void;
}

/**
 * Namespace to interact with the menu-specific part of the SDK.
 * This object is used to show View Configuration, Action Menu and Navigation Bar Menu.
 */
declare namespace menus {
    /**
     * @hidden
     * Represents information about item in View Configuration.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface ViewConfiguration {
        /**
         * @hidden
         * Unique identifier of view.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        id: string;
        /**
         * @hidden
         * Display title of the view.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        title: string;
        /**
         * @hidden
         * Additional information for accessibility.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        contentDescription?: string;
    }
    /**
     * Defines how a menu item should appear in the NavBar.
     */
    enum DisplayMode {
        /**
         * Only place this item in the NavBar if there's room for it.
         * If there's no room, item is shown in the overflow menu.
         */
        ifRoom = 0,
        /**
         * Never place this item in the NavBar.
         * The item would always be shown in NavBar's overflow menu.
         */
        overflowOnly = 1
    }
    /**
     * @hidden
     * Represents information about menu item for Action Menu and Navigation Bar Menu.
     */
    class MenuItem {
        /**
         * @hidden
         * Unique identifier for the menu item.
         */
        id: string;
        /**
         * @hidden
         * Display title of the menu item.
         */
        title: string;
        /**
         * @hidden
         * Display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        icon: string;
        /**
         * @hidden
         * Selected state display icon of the menu item. The icon value must be a string having SVG icon content.
         */
        iconSelected?: string;
        /**
         * @hidden
         * Additional information for accessibility.
         */
        contentDescription?: string;
        /**
         * @hidden
         * State of the menu item
         */
        enabled: boolean;
        /**
         * @hidden
         * Interface to show list of items on selection of menu item.
         */
        viewData?: ViewData;
        /**
         * @hidden
         * Whether the menu item is selected or not
         */
        selected: boolean;
        /**
         * The Display Mode of the menu item.
         * Default Behaviour would be DisplayMode.ifRoom if null.
         * Refer {@link DisplayMode}
         */
        displayMode?: DisplayMode;
    }
    /**
     * @hidden
     * Represents information about view to show on Navigation Bar Menu item selection
     */
    interface ViewData {
        /**
         * @hidden
         * Display header title of the item list.
         */
        listTitle?: string;
        /**
         * @hidden
         * Type of the menu item.
         */
        listType: MenuListType;
        /**
         * @hidden
         * Array of MenuItem. Icon value will be required for all items in the list.
         */
        listItems: MenuItem[];
    }
    /**
     * @hidden
     * Represents information about type of list to display in Navigation Bar Menu.
     */
    enum MenuListType {
        dropDown = "dropDown",
        popOver = "popOver"
    }
    /**
     * @hidden
     * Register navBarMenuItemPress, actionMenuItemPress, setModuleView handlers.
     *
     * @internal
     * Limited to Microsoft-internal use.
     */
    function initialize(): void;
    /**
     * @hidden
     * Registers list of view configurations and it's handler.
     * Handler is responsible for listening selection of View Configuration.
     *
     * @param viewConfig - List of view configurations. Minimum 1 value is required.
     * @param handler - The handler to invoke when the user selects view configuration.
     */
    function setUpViews(viewConfig: ViewConfiguration[], handler: (id: string) => boolean): void;
    /**
     * @hidden
     * Used to set menu items on the Navigation Bar. If icon is available, icon will be shown, otherwise title will be shown.
     *
     * @param items List of MenuItems for Navigation Bar Menu.
     * @param handler The handler to invoke when the user selects menu item.
     */
    function setNavBarMenu(items: MenuItem[], handler: (id: string) => boolean): void;
    /** Parameters used to create an action menu within an app */
    interface ActionMenuParameters {
        /**
         * @hidden
         * Display title for Action Menu
         */
        title: string;
        /**
         * @hidden
         * List of MenuItems for Action Menu
         */
        items: MenuItem[];
    }
    /**
     * @hidden
     * Used to show Action Menu.
     *
     * @param params - Parameters for Menu Parameters
     * @param handler - The handler to invoke when the user selects menu item.
     */
    function showActionMenu(params: ActionMenuParameters, handler: (id: string) => boolean): void;
    /**
     * Checks if the menus capability is supported by the host
     * @returns boolean to represent whether the menus capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    function isSupported(): boolean;
}

/**
 * Interact with media, including capturing and viewing images.
 */
declare namespace media {
    /**
     * Function callback type used when calling {@link media.captureImage}.
     *
     * @param error - Error encountered during the API call, if any, {@link SdkError}
     * @param files - Collection of File objects (images) captured by the user. Will be an empty array in the case of an error.
     * */
    export type captureImageCallbackFunctionType = (error: SdkError, files: File[]) => void;
    /**
     * Function callback type used when calling {@link media.selectMedia}.
     *
     * @param error - Error encountered during the API call, if any, {@link SdkError}
     * @param attachments - Collection of {@link Media} objects selected by the user. Will be an empty array in the case of an error.
     * */
    export type selectMediaCallbackFunctionType = (error: SdkError, attachments: Media[]) => void;
    /** Error callback function type. */
    export type errorCallbackFunctionType = (error?: SdkError) => void;
    /**
     * Function callback type used when calling {@link media.scanBarCode}.
     *
     * @param error - Error encountered during the API call, if any, {@link SdkError}
     * @param decodedText - Decoded text from the barcode, if any. In the case of an error, this will be the empty string.
     * */
    export type scanBarCodeCallbackFunctionType = (error: SdkError, decodedText: string) => void;
    /**
     * Function callback type used when calling {@link media.Media.getMedia}
     *
     * @param error - Error encountered during the API call, if any, {@link SdkError}
     * @param blob - Blob of media returned. Will be a blob with no BlobParts, in the case of an error.
     * */
    export type getMediaCallbackFunctionType = (error: SdkError, blob: Blob) => void;
    /**
     * Enum for file formats supported
     */
    export enum FileFormat {
        /** Base64 encoding */
        Base64 = "base64",
        /** File id */
        ID = "id"
    }
    /**
     * File object that can be used to represent image or video or audio
     */
    export class File {
        /**
         * Content of the file. When format is Base64, this is the base64 content
         * When format is ID, this is id mapping to the URI
         * When format is base64 and app needs to use this directly in HTML tags, it should convert this to dataUrl.
         */
        content: string;
        /**
         * Format of the content
         */
        format: FileFormat;
        /**
         * Size of the file in KB
         */
        size: number;
        /**
         * MIME type. This can be used for constructing a dataUrl, if needed.
         */
        mimeType: string;
        /**
         * Optional: Name of the file
         */
        name?: string;
    }
    /**
     * Launch camera, capture image or choose image from gallery and return the images as a File[] object to the callback.
     *
     * @params callback - Callback will be called with an @see SdkError if there are any.
     * If error is null or undefined, the callback will be called with a collection of @see File objects
     * @remarks
     * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
     * Note: For desktop, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
     *
     */
    export function captureImage(callback: captureImageCallbackFunctionType): void;
    /**
     * Checks whether or not media has user permission
     *
     * @returns Promise that will resolve with true if the user had granted the app permission to media information, or with false otherwise,
     * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
     *
     * @beta
     */
    export function hasPermission(): Promise<boolean>;
    /**
     * Requests user permission for media
     *
     * @returns Promise that will resolve with true if the user consented permission for media, or with false otherwise,
     * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
     *
     * @beta
     */
    export function requestPermission(): Promise<boolean>;
    /**
     * Media object returned by the select Media API
     */
    export class Media extends File {
        constructor(that?: Media);
        /**
         * A preview of the file which is a lightweight representation.
         * In case of images this will be a thumbnail/compressed image in base64 encoding.
         */
        preview: string;
        /**
         * Gets the media in chunks irrespective of size, these chunks are assembled and sent back to the webapp as file/blob
         * @param callback - callback is called with the @see SdkError if there is an error
         * If error is null or undefined, the callback will be called with @see Blob.
         */
        getMedia(callback: getMediaCallbackFunctionType): void;
        /** Function to retrieve media content, such as images or videos, via callback. */
        private getMediaViaCallback;
        /** Function to retrieve media content, such as images or videos, via handler. */
        private getMediaViaHandler;
    }
    /**
     * Input parameter supplied to the select Media API
     */
    export interface MediaInputs {
        /**
         * Only one media type can be selected at a time
         */
        mediaType: MediaType;
        /**
         * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
         */
        maxMediaCount: number;
        /**
         * Additional properties for customization of select media - Image in mobile devices
         */
        imageProps?: ImageProps;
        /**
         * Additional properties for customization of select media - Video in mobile devices
         */
        videoProps?: VideoProps;
        /**
         * Additional properties for customization of select media - VideoAndImage in mobile devices
         */
        videoAndImageProps?: VideoAndImageProps;
        /**
         * Additional properties for audio capture flows.
         */
        audioProps?: AudioProps;
    }
    /**
     * @hidden
     * Hide from docs
     * --------
     * All properties common to Image and Video Props
     */
    interface MediaProps {
        /**
         * @hidden
         * Optional; Lets the developer specify the media source, more than one can be specified.
         * Default value is both camera and gallery
         */
        sources?: Source[];
        /**
         * @hidden
         * Optional; Specify in which mode the camera will be opened.
         * Default value is Photo
         */
        startMode?: CameraStartMode;
        /**
         * @hidden
         * Optional; indicate if user is allowed to move between front and back camera
         * Default value is true
         */
        cameraSwitcher?: boolean;
    }
    /**
     *  All properties in ImageProps are optional and have default values in the platform
     */
    export interface ImageProps extends MediaProps {
        /**
         * Optional; indicate if inking on the selected Image is allowed or not
         * Default value is true
         */
        ink?: boolean;
        /**
         * Optional; indicate if putting text stickers on the selected Image is allowed or not
         * Default value is true
         */
        textSticker?: boolean;
        /**
         * Optional; indicate if image filtering mode is enabled on the selected image
         * Default value is false
         */
        enableFilter?: boolean;
        /**
         * Optional; Lets the developer specify the image output formats, more than one can be specified.
         * Default value is Image.
         */
        imageOutputFormats?: ImageOutputFormats[];
    }
    /**
     * All properties in VideoProps are optional and have default values in the platform
     */
    export interface VideoProps extends MediaProps {
        /**
         * Optional; the maximum duration in seconds after which the recording should terminate automatically.
         * Default value is defined by the platform serving the API.
         */
        maxDuration?: number;
        /**
         * Optional; to determine if the video capturing flow needs to be launched
         * in Full Screen Mode (Lens implementation) or PictureInPicture Mode (Native implementation).
         * Default value is true, indicating video will always launch in Full Screen Mode via lens.
         */
        isFullScreenMode?: boolean;
        /**
         * Optional; controls the visibility of stop button in PictureInPicture Mode.
         * Default value is true, indicating the user will be able to stop the video.
         */
        isStopButtonVisible?: boolean;
        /**
         * Optional; setting VideoController will register your app to listen to the lifecycle events during the video capture flow.
         * Your app can also dynamically control the experience while capturing the video by notifying the host client.
         */
        videoController?: VideoController;
    }
    /**
     * All properties in VideoAndImageProps are optional and have default values in the platform
     */
    export interface VideoAndImageProps extends ImageProps, VideoProps {
    }
    /**
     *  All properties in AudioProps are optional and have default values in the platform
     */
    export interface AudioProps {
        /**
         * Optional; the maximum duration in minutes after which the recording should terminate automatically
         * Default value is defined by the platform serving the API.
         */
        maxDuration?: number;
    }
    /**
     * @hidden
     * Hide from docs
     * --------
     * Base class which holds the callback and notifies events to the host client
     */
    abstract class MediaController<T> {
        /** Callback that can be registered to handle events related to the playback and control of video content. */
        protected controllerCallback?: T;
        constructor(controllerCallback?: T);
        protected abstract getMediaType(): MediaType;
        /**
         * @hidden
         * Hide from docs
         * --------
         * This function will be implemented by the respective media class which holds the logic
         * of specific events that needs to be notified to the app.
         * @param mediaEvent indicates the event signed by the host client to the app
         */
        protected abstract notifyEventToApp(mediaEvent: MediaControllerEvent): void;
        /**
         * @hidden
         * Hide from docs
         * --------
         * Function to notify the host client to programatically control the experience
         * @param mediaEvent indicates what the event that needs to be signaled to the host client
         * Optional; @param callback is used to send app if host client has successfully handled the notification event or not
         */
        protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: errorCallbackFunctionType): void;
        /**
         * Function to programatically stop the ongoing media event
         * Optional; @param callback is used to send app if host client has successfully stopped the event or not
         */
        stop(callback?: errorCallbackFunctionType): void;
    }
    /**
     * Callback which will register your app to listen to lifecycle events during the video capture flow
     */
    export interface VideoControllerCallback {
        /** The event is a type of callback that can be enlisted to handle various events linked to `onRecordingStarted`, which helps with playback of video content. */
        onRecordingStarted?(): void;
    }
    /**
     * VideoController class is used to communicate between the app and the host client during the video capture flow
     */
    export class VideoController extends MediaController<VideoControllerCallback> {
        /** Gets media type video. */
        protected getMediaType(): MediaType;
        /** Notify or send an event related to the playback and control of video content to a registered application. */
        notifyEventToApp(mediaEvent: MediaControllerEvent): void;
    }
    /**
     * @beta
     * Events which are used to communicate between the app and the host client during the media recording flow
     */
    export enum MediaControllerEvent {
        /** Start recording. */
        StartRecording = 1,
        /** Stop recording. */
        StopRecording = 2
    }
    /**
     * The modes in which camera can be launched in select Media API
     */
    export enum CameraStartMode {
        /** Photo mode. */
        Photo = 1,
        /** Document mode. */
        Document = 2,
        /** Whiteboard mode. */
        Whiteboard = 3,
        /** Business card mode. */
        BusinessCard = 4
    }
    /**
     * Specifies the image source
     */
    export enum Source {
        /** Image source is camera. */
        Camera = 1,
        /** Image source is gallery. */
        Gallery = 2
    }
    /**
     * Specifies the type of Media
     */
    export enum MediaType {
        /** Media type photo or image */
        Image = 1,
        /** Media type video. */
        Video = 2,
        /** Media type video and image. */
        VideoAndImage = 3,
        /** Media type audio. */
        Audio = 4
    }
    /**
     * Input for view images API
     */
    export interface ImageUri {
        /** Image location */
        value: string;
        /** Image Uri type */
        type: ImageUriType;
    }
    /**
     * ID contains a mapping for content uri on platform's side, URL is generic
     */
    export enum ImageUriType {
        /** Image Id. */
        ID = 1,
        /** Image URL. */
        URL = 2
    }
    /**
     * Specifies the image output formats.
     */
    export enum ImageOutputFormats {
        /** Outputs image.  */
        IMAGE = 1,
        /** Outputs pdf. */
        PDF = 2
    }
    /**
     * Media chunks an output of getMedia API from platform
     */
    export interface MediaChunk {
        /**
         * Base 64 data for the requested uri
         */
        chunk: string;
        /**
         * chunk sequence number
         */
        chunkSequence: number;
    }
    /**
     * Output of getMedia API from platform
     */
    export interface MediaResult {
        /**
         * error encountered in getMedia API
         */
        error: SdkError;
        /**
         * Media chunk which will be assemebled and converted into a blob
         */
        mediaChunk: MediaChunk;
    }
    /**
     * Helper object to assembled media chunks
     */
    export interface AssembleAttachment {
        /** A number representing the sequence of the attachment in the media chunks. */
        sequence: number;
        /** A Blob object representing the data of the media chunks. */
        file: Blob;
    }
    /**
     * Select an attachment using camera/gallery
     *
     * @param mediaInputs - The input params to customize the media to be selected
     * @param callback - The callback to invoke after fetching the media
     */
    export function selectMedia(mediaInputs: MediaInputs, callback: selectMediaCallbackFunctionType): void;
    /**
     * View images using native image viewer
     *
     * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
     * @param callback - returns back error if encountered, returns null in case of success
     */
    export function viewImages(uriList: ImageUri[], callback: errorCallbackFunctionType): void;
    /**
     * Barcode configuration supplied to scanBarCode API to customize barcode scanning experience in mobile
     * All properties in BarCodeConfig are optional and have default values in the platform
     */
    export interface BarCodeConfig {
        /**
         * Optional; Lets the developer specify the scan timeout interval in seconds
         * Default value is 30 seconds and max allowed value is 60 seconds
         */
        timeOutIntervalInSec?: number;
    }
    /**
     * @deprecated
     * As of 2.1.0, please use {@link barCode.scanBarCode barCode.scanBarCode(config?: BarCodeConfig): Promise\<string\>} instead.
  
     * Scan Barcode/QRcode using camera
     *
     * @remarks
     * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
     *
     * @param callback - callback to invoke after scanning the barcode
     * @param config - optional input configuration to customize the barcode scanning experience
     */
    export function scanBarCode(callback: scanBarCodeCallbackFunctionType, config?: BarCodeConfig): void;
    export {  };
}

/**
 * Namespace to power up the in-app browser experiences in the host app.
 * For e.g., opening a URL in the host app inside a browser
 *
 * @beta
 */
declare namespace secondaryBrowser {
    /**
     * Open a URL in the secondary browser.
     *
     * On mobile, this is the in-app browser.
     *
     * On web and desktop, please use the `window.open()` method or other native external browser methods.
     *
     * @param url Url to open in the browser
     * @returns Promise that successfully resolves if the URL  opens in the secondaryBrowser
     * or throws an error {@link SdkError} incase of failure before starting navigation
     *
     * @remarks Any error that happens after navigation begins is handled by the platform browser component and not returned from this function.
     * @beta
     */
    function open(url: URL): Promise<void>;
    /**
     * Checks if secondaryBrowser capability is supported by the host
     * @returns boolean to represent whether secondaryBrowser is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    function isSupported(): boolean;
}

/**
 * @deprecated
 * As of 2.1.0, please use geoLocation namespace.
 *
 * Namespace to interact with the location module-specific part of the SDK.
 */
declare namespace location {
    /** Get location callback function type */
    type getLocationCallbackFunctionType = (error: SdkError, location: Location) => void;
    /** Show location callback function type */
    type showLocationCallbackFunctionType = (error: SdkError, status: boolean) => void;
    /**
     * @deprecated
     * Data Structure to set the location properties in getLocation call.
     */
    interface LocationProps {
        /**
        whether user can alter location or not
        if false, user will be shown current location
        and wouldn't be allowed to alter it
        */
        allowChooseLocation: boolean;
        /**
        whether selected location should be shown to user on map or not.
        If allowChooseLocation is true, this parameter will be ignored by platform.
        If allowChooseLocation is false, and this parameter is not provided, default
        value will be false.
        */
        showMap?: boolean;
    }
    /**
     * @deprecated
     * Data struture to represent the location information
     */
    interface Location {
        /**
        Latitude of the location
        */
        latitude: number;
        /**
        Longitude of the location
        */
        longitude: number;
        /**
        Accuracy of the coordinates captured
        */
        accuracy?: number;
        /**
        Time stamp when the location was captured
        */
        timestamp?: number;
    }
    /**
     * @deprecated
     * As of 2.1.0, please use one of the following functions:
     * - {@link geoLocation.getCurrentLocation geoLocation.getCurrentLocation(): Promise\<Location\>} to get the current location.
     * - {@link geoLocation.map.chooseLocation geoLocation.map.chooseLocation(): Promise\<Location\>} to choose location on map.
     *
     * Fetches user location
     * @param props {@link LocationProps} - Specifying how the location request is handled
     * @param callback - Callback to invoke when current user location is fetched
     */
    function getLocation(props: LocationProps, callback: getLocationCallbackFunctionType): void;
    /**
     * @deprecated
     * As of 2.1.0, please use {@link geoLocation.map.showLocation geoLocation.map.showLocation(location: Location): Promise\<void\>} instead.
     *
     * Shows the location on map corresponding to the given coordinates
     *
     * @param location - Location to be shown on the map
     * @param callback - Callback to invoke when the location is opened on map
     */
    function showLocation(location: Location, callback: showLocationCallbackFunctionType): void;
    /**
     * @deprecated
     * As of 2.1.0, please use geoLocation namespace, and use {@link geoLocation.isSupported geoLocation.isSupported: boolean} to check if geoLocation is supported.
     *
     * Checks if Location capability is supported by the host
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @returns boolean to represent whether Location is supported
     */
    function isSupported(): boolean;
}

/**
 * Interact with meetings, including retrieving meeting details, getting mic status, and sharing app content.
 * This namespace is used to handle meeting related functionality like
 * get meeting details, get/update state of mic, sharing app content and more.
 *
 * To learn more, visit https://aka.ms/teamsmeetingapps
 */
declare namespace meeting {
    /** Error callback function type */
    export type errorCallbackFunctionType = (error: SdkError | null, result: boolean | null) => void;
    /** Get live stream state callback function type */
    export type getLiveStreamStateCallbackFunctionType = (error: SdkError | null, liveStreamState: LiveStreamState | null) => void;
    /** Live stream error callback function type */
    export type liveStreamErrorCallbackFunctionType = (error: SdkError | null) => void;
    /** Register live stream changed handler function type */
    export type registerLiveStreamChangedHandlerFunctionType = (liveStreamState: LiveStreamState) => void;
    /** Get app content stage sharing capabilities callback function type */
    export type getAppContentCallbackFunctionType = (error: SdkError | null, appContentStageSharingCapabilities: IAppContentStageSharingCapabilities | null) => void;
    /** Get app content stage sharing state callback function type */
    export type getAppContentStageCallbackFunctionType = (error: SdkError | null, appContentStageSharingState: IAppContentStageSharingState | null) => void;
    /** Register speaking state change handler function type */
    export type registerSpeakingStateChangeHandlerFunctionType = (speakingState: ISpeakingState) => void;
    /**
     * @hidden
     * Data structure to represent meeting details
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IMeetingDetailsResponse {
        /**
         * @hidden
         * details object
         */
        details: IMeetingDetails | ICallDetails;
        /**
         * @hidden
         * conversation object
         */
        conversation: IConversation;
        /**
         * @hidden
         * organizer object
         */
        organizer: IOrganizer;
    }
    /**
     * @hidden
     * Hide from docs
     * Base data structure to represent a meeting or call detail
     */
    export interface IMeetingOrCallDetailsBase<T> {
        /**
         * @hidden
         * Scheduled start time of the meeting or start time of the call
         */
        scheduledStartTime: string;
        /**
         * @hidden
         * url to join the current meeting or call
         */
        joinUrl?: string;
        /**
         * @hidden
         * type of the meeting or call
         */
        type?: T;
    }
    /**
     * @hidden
     * Hide from docs
     * Data structure to represent call participant identifiers
     */
    interface ICallParticipantIdentifiers {
        /**
         * Phone number of a caller
         */
        phoneNumber?: string;
        /**
         * Email of a caller
         */
        email?: EmailAddress;
    }
    /**
     * @hidden
     * Hide from docs
     * Data structure to represent call details
     */
    export interface ICallDetails extends IMeetingOrCallDetailsBase<CallType> {
        /**
         * @deprecated please use {@link ICallDetails.originalCallerInfo} instead
         *
         * @hidden
         * Phone number of a PSTN caller or email of a VoIP caller
         */
        originalCaller?: string;
        /**
         * @hidden
         * Object representing the original caller
         */
        originalCallerInfo?: ICallParticipantIdentifiers;
        /**
         * @hidden
         * Identifier for the current call
         */
        callId?: string;
        /**
         * @deprecated please use {@link ICallDetails.dialedEntityInfo} instead
         *
         * @hidden
         * Phone number of a PSTN callee or email of a VoIP callee
         */
        dialedEntity?: never;
        /**
         * @hidden
         * Object representing the entity the caller dialed
         */
        dialedEntityInfo?: never;
        /**
         * @hidden
         * Tracking identifier for grouping related calls
         */
        trackingId?: never;
    }
    /**
     * @hidden
     * Hide from docs
     * Data structure to represent meeting details.
     */
    export interface IMeetingDetails extends IMeetingOrCallDetailsBase<MeetingType> {
        /**
         * @hidden
         * Scheduled end time of the meeting
         */
        scheduledEndTime: string;
        /**
         * @hidden
         * event id of the meeting
         */
        id?: string;
        /**
         * @hidden
         * meeting title name of the meeting
         */
        title?: string;
    }
    /**
     * @hidden
     * Data structure to represent a conversation object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IConversation {
        /**
         * @hidden
         * conversation id of the meeting
         */
        id: string;
    }
    /**
     * @hidden
     * Data structure to represent an organizer object.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IOrganizer {
        /**
         * @hidden
         * organizer id of the meeting
         */
        id?: string;
        /**
         * @hidden
         * tenant id of the meeting
         */
        tenantId?: string;
    }
    /**
     * Represents the current Real-Time Messaging Protocol (RTMP) live streaming state of a meeting.
     *
     * @remarks
     * RTMP is a popular communication protocol for streaming audio, video, and data over the Internet.
     */
    export interface LiveStreamState {
        /**
         * true when the current meeting is being streamed through RTMP, or false if it is not.
         */
        isStreaming: boolean;
        /**
         * error object in case there is a failure
         */
        error?: {
            /** error code from the streaming service, e.g. IngestionFailure */
            code: string;
            /** detailed error message string */
            message?: string;
        };
    }
    /** Defines additional sharing options which can be provided to the {@link shareAppContentToStage} API. */
    export interface IShareAppContentToStageOptions {
        /**
         * The protocol option for sharing app content to the meeting stage. Defaults to `Collaborative`.
         * See {@link SharingProtocol} for more information.
         */
        sharingProtocol?: SharingProtocol;
    }
    /** Represents app permission to share contents to meeting. */
    export interface IAppContentStageSharingCapabilities {
        /**
         * indicates whether app has permission to share contents to meeting stage.
         * true when your `configurableTabs` or `staticTabs` entry's `context` array includes `meetingStage`.
         */
        doesAppHaveSharePermission: boolean;
    }
    /** Represents app being shared to stage. */
    export interface IAppContentStageSharingState {
        /**
         * indicates whether app is currently being shared to stage
         */
        isAppSharing: boolean;
    }
    /**
     * Property bag for the speakingState changed event
     *
     */
    export interface ISpeakingState {
        /**
         * true when one or more participants in a meeting are speaking, or false if no participants are speaking
         */
        isSpeakingDetected: boolean;
        /**
         * error object in case there is a failure
         */
        error?: SdkError;
    }
    /**
     * Property bag for the meeting reaction received event
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface MeetingReactionReceivedEventData {
        /**
         * Indicates the type of meeting reaction received
         *
         * @hidden
         * Hide from docs.
         */
        meetingReactionType?: MeetingReactionType;
        /**
         * error object in case there is a failure
         *
         * @hidden
         * Hide from docs.
         */
        error?: SdkError;
    }
    /**
     * Interface for raiseHandState properties
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface IRaiseHandState {
        /** Indicates whether the selfParticipant's hand is raised or not
         *
         * @hidden
         * Hide from docs.
         */
        isHandRaised: boolean;
    }
    /**
     * Property bag for the raiseHandState changed event
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface RaiseHandStateChangedEventData {
        /**
         * entire raiseHandState object for the selfParticipant
         *
         * @hidden
         * Hide from docs.
         */
        raiseHandState: IRaiseHandState;
        /**
         * error object in case there is a failure
         *
         * @hidden
         * Hide from docs.
         */
        error?: SdkError;
    }
    /**
     * Interface for mic state change
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface MicState {
        /**
         * Indicates the mute status of the mic
         */
        isMicMuted: boolean;
    }
    /**
     * Interface for RequestAppAudioHandling properties
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface RequestAppAudioHandlingParams {
        /**
         * Indicates whether the app is requesting to start handling audio, or if
         * it's giving audio back to the host
         */
        isAppHandlingAudio: boolean;
        /**
         * Callback for the host to tell the app to change its microphone state
         * @param micState The microphone state for the app to use
         * @returns A promise with the updated microphone state
         */
        micMuteStateChangedCallback: (micState: MicState) => Promise<MicState>;
        /**
         * Callback for the host to tell the app to change its speaker selection
         */
        audioDeviceSelectionChangedCallback?: (selectedDevices: AudioDeviceSelection | SdkError) => void;
    }
    /**
     * Interface for AudioDeviceSelection from host selection.
     * If the speaker or the microphone is undefined or don't have a device label, you can try to find the default devices
     * by using
     * ```ts
     * const devices = await navigator.mediaDevices.enumerateDevices();
     * const defaultSpeaker = devices.find((d) => d.deviceId === 'default' && d.kind === 'audiooutput');
     * const defaultMic = devices.find((d) => d.deviceId === 'default' && d.kind === 'audioinput');
     * ```
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface AudioDeviceSelection {
        speaker?: AudioDeviceInfo;
        microphone?: AudioDeviceInfo;
    }
    /**
     * Interface for AudioDeviceInfo, includes a device label with the same format as {@link MediaDeviceInfo.label}
     *
     * Hosted app can use this label to compare it with the device info fetched from {@link navigator.mediaDevices.enumerateDevices()}.
     * {@link MediaDeviceInfo} has  {@link MediaDeviceInfo.deviceId} as an unique identifier, but that id is also unique to the origin
     * of the calling application, so {@link MediaDeviceInfo.deviceId} cannot be used here as an identifier. Notice there are some cases
     * that devices may have the same device label, but we don't have a better way to solve this, keep this as a known limitation for now.
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export interface AudioDeviceInfo {
        deviceLabel: string;
    }
    /**
     * Different types of meeting reactions that can be sent/received
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export enum MeetingReactionType {
        like = "like",
        heart = "heart",
        laugh = "laugh",
        surprised = "surprised",
        applause = "applause"
    }
    /**
     * Represents the type of a meeting
     *
     * @hidden
     * Hide from docs.
     *
     * @remarks
     * Teams has several types of meetings to account for different user scenarios and requirements.
     */
    export enum MeetingType {
        /**
         * Used when the meeting type is not known.
         *
         * @remarks
         * This response is not an expected case.
         */
        Unknown = "Unknown",
        /**
         * Used for group call meeting types.
         *
         * @remarks
         * To test this meeting type in Teams, start a chat with two or more users and click the "Call" button.
         * Note that a group call may return as this or {@link CallType.GroupCall}. These two different response types should be considered as equal.
         */
        Adhoc = "Adhoc",
        /**
         * Used for single-occurrence meetings that have been scheduled in advance.
         *
         * @remarks
         * To create a meeting of this type in Teams, press the "New meeting" button from the calendar and enter a meeting title.
         * Before saving, ensure that the "Online Meeting" field is checked.
         */
        Scheduled = "Scheduled",
        /**
         * Used for meetings that occur on a recurring basis.
         *
         * @remarks
         * To create a meeting of this type in Teams, press the "New meeting" button from the calendar, enter a meeting title, and then change the field labeled "Does not repeat" to some other value.
         * Before saving, ensure that the "Online Meeting" field is checked.
         */
        Recurring = "Recurring",
        /**
         * Used for webinars.
         *
         * @remarks
         * Meeting apps are only supported for those in the "event group" of a webinar, which are those who'll be presenting and producing the webinar.
         * To learn how to create a meeting of this type, visit https://aka.ms/teams/howto/webinars.
         */
        Broadcast = "Broadcast",
        /**
         * Used for meet now meetings, which are meetings users create on the fly.
         *
         * @remarks
         * To create a meeting of this type, click the "Meet now" button from the calendar in Teams or the "Teams call" button in Outlook.
         */
        MeetNow = "MeetNow"
    }
    /**
     * Represents the type of a call.
     *
     * @hidden
     * Hide from docs.
     */
    export enum CallType {
        /**
         * Represents a call between two people.
         *
         * @remarks
         * To test this feature, start a chat with one other user and click the "Call" button.
         */
        OneOnOneCall = "oneOnOneCall",
        /**
         * Represents a call between more than two people.
         *
         * @remarks
         * To test this meeting type in Teams, start a chat with two or more users and click the "Call" button.
         * Note that a group call may return as this or {@link MeetingType.Adhoc}. These two different response types should be considered as equal.
         */
        GroupCall = "groupCall"
    }
    /**
     * Represents the protocol option for sharing app content to the meeting stage.
     */
    export enum SharingProtocol {
        /**
         * The default protocol for sharing app content to stage. To learn more, visit https://aka.ms/teamsjs/shareAppContentToStage
         */
        Collaborative = "Collaborative",
        /**
         * A read-only protocol for sharing app content to stage, which uses screen sharing in meetings. If provided, this protocol will open
         * the specified `contentUrl` passed to the {@link shareAppContentToStage} API in a new instance and screen share that instance.
         */
        ScreenShare = "ScreenShare"
    }
    /**
     * Allows an app to get the incoming audio speaker setting for the meeting user.
     * To learn more, visit https://aka.ms/teamsjs/getIncomingClientAudioState
     *
     * @remarks
     * Use {@link toggleIncomingClientAudio} to toggle the current audio state.
     * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingParticipant.ToggleIncomingAudio.Chat` RSC permission in your app manifest.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
     *
     * @param callback - Callback contains 2 parameters, `error` and `result`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when fetch is successful.
     * `result` will be true when incoming audio is muted and false when incoming audio is unmuted, or null when the request fails.
     */
    export function getIncomingClientAudioState(callback: errorCallbackFunctionType): void;
    /**
     * Allows an app to toggle the incoming audio speaker setting for the meeting user from mute to unmute or vice-versa.
     * To learn more, visit https://aka.ms/teamsjs/toggleIncomingClientAudio
     *
     * @remarks
     * Use {@link getIncomingClientAudioState} to get the current audio state.
     * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingParticipant.ToggleIncomingAudio.Chat` RSC permission in your app manifest.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
     *
     * @param callback - Callback contains 2 parameters, `error` and `result`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when toggle is successful.
     * `result` will be true when incoming audio is muted and false when incoming audio is unmuted, or null when the toggling fails.
     */
    export function toggleIncomingClientAudio(callback: errorCallbackFunctionType): void;
    /**
     * @throws error if your app manifest does not include the `OnlineMeeting.ReadBasic.Chat` RSC permission.
     * Find the app manifest reference at https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema.
     * Find the RSC reference at https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent.
     *
     * @hidden
     * Allows an app to get the meeting details for the meeting
     *
     * @param callback - Callback contains 2 parameters, `error` and `meetingDetailsResponse`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when get is successful
     * `result` can either contain a {@link IMeetingDetailsResponse} value, in case of a successful get or null when the get fails
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getMeetingDetails(callback: (error: SdkError | null, meetingDetails: IMeetingDetailsResponse | null) => void): void;
    /**
     * @throws error if your app manifest does not include both the `OnlineMeeting.ReadBasic.Chat` RSC permission
     * and the `OnlineMeetingParticipant.Read.Chat` RSC permission.
     * Find the app manifest reference at https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema.
     * Find the RSC reference at https://learn.microsoft.com/en-us/microsoftteams/platform/graph-api/rsc/resource-specific-consent.
     *
     * @throws `not supported on platform` error if your app is run on a host that does not support returning additional meeting details.
     *
     * @hidden
     * Allows an app to get the additional meeting details for the meeting.
     * Some additional details are returned on a best-effort basis. They may not be present for every meeting.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function getMeetingDetailsVerbose(): Promise<IMeetingDetailsResponse>;
    /**
     * @hidden
     * Allows an app to get the authentication token for the anonymous or guest user in the meeting
     *
     * @param callback - Callback contains 2 parameters, `error` and `authenticationTokenOfAnonymousUser`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when get is successful
     * `authenticationTokenOfAnonymousUser` can either contain a string value, in case of a successful get or null when the get fails
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getAuthenticationTokenForAnonymousUser(callback: (error: SdkError | null, authenticationTokenOfAnonymousUser: string | null) => void): void;
    /**
     * Allows an app to get the state of the outgoing live stream in the current meeting.
     *
     * @remarks
     * Use {@link requestStartLiveStreaming} or {@link requestStopLiveStreaming} to start/stop a live stream.
     * This API can only be used in the `sidePanel` frame context.
     * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
     *
     * @param callback - Callback contains 2 parameters: `error` and `liveStreamState`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when the request is successful
     * `liveStreamState` can either contain a `LiveStreamState` value, or null when operation fails
     */
    export function getLiveStreamState(callback: getLiveStreamStateCallbackFunctionType): void;
    /**
     * Allows an app to ask the local user to begin live streaming the current meeting to the given Real-Time Messaging Protocol (RTMP) stream url.
     * A confirmation dialog will be shown to the local user with options to "Allow" or "Cancel" this request.
     *
     * @remarks
     * Meeting content (e.g., user video, screenshare, audio, etc.) can be externally streamed to any platform that supports the popular RTMP standard.
     * Content broadcasted through RTMP is automatically formatted and cannot be customized.
     * Use {@link getLiveStreamState} or {@link registerLiveStreamChangedHandler} to get updates on the live stream state.
     * This API can only be used in the `sidePanel` frame context.
     * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
     *
     * @param callback - completion callback that contains an `error` parameter, which can be of type `SdkError` in case of an error, or null when operation is successful
     * @param streamUrl - the url to the RTMP stream resource
     * @param streamKey - the key to the RTMP stream resource
     */
    export function requestStartLiveStreaming(callback: liveStreamErrorCallbackFunctionType, streamUrl: string, streamKey?: string): void;
    /**
     * Allows an app to request that live streaming be stopped.
     *
     * @remarks
     * Use {@link getLiveStreamState} or {@link registerLiveStreamChangedHandler} to get updates on the live stream state.
     * This API can only be used in the `sidePanel` frame context.
     * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
     *
     * @param callback - completion callback that contains an error parameter, which can be of type `SdkError` in case of an error, or null when operation is successful
     */
    export function requestStopLiveStreaming(callback: liveStreamErrorCallbackFunctionType): void;
    /**
     * Registers an event handler for state changes to the live stream.
     *
     * @remarks
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     * Use {@link requestStartLiveStreaming} or {@link requestStopLiveStreaming} to start/stop a live stream.
     * This API can only be used in the `sidePanel` frame context.
     * The `meetingExtensionDefinition.supportsStreaming` field in your app manifest must be `true` to use this API.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/meetingExtensionDefinition.
     *
     * @param handler - The handler to invoke when the live stream state changes
     */
    export function registerLiveStreamChangedHandler(handler: registerLiveStreamChangedHandlerFunctionType): void;
    /**
     * Allows an app to share a given URL to the meeting stage for all users in the meeting.
     * To learn more, visit https://aka.ms/teamsjs/shareAppContentToStage
     *
     * @remarks
     * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
     * For private scheduled meetings, meet now, or calls, include the `MeetingStage.Write.Chat` RSC permission in your app manifest.
     * For channel meetings, include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     * Use {@link getAppContentStageSharingCapabilities} to determine if the local user is eligible to use this API.
     * Use {@link getAppContentStageSharingState} to determine whether app content is already being shared to the meeting stage.
     *
     * @param callback - Callback contains 2 parameters, `error` and `result`.
     * `error` can either contain an error of type `SdkError`, in case of an error, or null when share is successful
     * `result` can either contain a true value, in case of a successful share or null when the share fails
     * @param appContentUrl - is the input URL to be shared to the meeting stage.
     * the URL origin must be included in your app manifest's `validDomains` field.
     * @param shareOptions - is an object that contains additional sharing options. If omitted, the default
     * sharing protocol will be `Collaborative`. See {@link IShareAppContentToStageOptions} for more information.
     */
    export function shareAppContentToStage(callback: errorCallbackFunctionType, appContentUrl: string, shareOptions?: IShareAppContentToStageOptions): void;
    /**
     * Allows an app to request whether the local user's app version has the required app manifest permissions to share content to meeting stage.
     * To learn more, visit https://aka.ms/teamsjs/getAppContentStageSharingCapabilities
     *
     * @remarks
     * If you are updating your published app to include the share to stage feature, you can use this API to prompt users to update their app if they are using an older version.
     * Your app's `configurableTabs` or `staticTabs` entry's `context` array must include `meetingStage` for `doesAppHaveSharePermission` to be `true` in the `callback` response.
     *
     * @throws error if API is being used outside of `sidePanel` or `meetingStage` frame contexts.
     * @throws error if your app manifest does not include the `MeetingStage.Write.Chat` RSC permission in your app manifest in a private scheduled meeting, meet now, or call --
     * or if it does not include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest in a channel meeting.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     *
     * @param callback - Completion callback contains 2 parameters: `error` and `appContentStageSharingCapabilities`.
     * `error` can either contain an error of type `SdkError` (error indication), or null (non-error indication).
     * `appContentStageSharingCapabilities` will contain an {@link IAppContentStageSharingCapabilities} object if the request succeeds, or null if it failed.
     */
    export function getAppContentStageSharingCapabilities(callback: getAppContentCallbackFunctionType): void;
    /**
     * @hidden
     * Hide from docs.
     * Terminates current stage sharing session in meeting
     *
     * @param callback - Callback contains 2 parameters, error and result.
     * error can either contain an error of type SdkError (error indication), or null (non-error indication)
     * result can either contain a true boolean value (successful termination), or null (unsuccessful fetch)
     */
    export function stopSharingAppContentToStage(callback: errorCallbackFunctionType): void;
    /**
     * Provides information related to current stage sharing state for your app.
     * To learn more, visit https://aka.ms/teamsjs/getAppContentStageSharingState
     *
     * @remarks
     * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
     * For private scheduled meetings, meet now, or calls, include the `MeetingStage.Write.Chat` RSC permission in your app manifest.
     * For channel meetings, include the `ChannelMeetingStage.Write.Group` RSC permission in your app manifest.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     *
     * @param callback - Callback contains 2 parameters, `error` and `appContentStageSharingState`.
     * error can either contain an error of type SdkError (error indication), or null (non-error indication)
     * `appContentStageSharingState` can either contain an `IAppContentStageSharingState` object if the request succeeds, or null if it failed
     */
    export function getAppContentStageSharingState(callback: getAppContentStageCallbackFunctionType): void;
    /**
     * Registers a handler for changes to participant speaking states.
     * To learn more, visit https://aka.ms/teamsjs/registerSpeakingStateChangeHandler
     *
     * @remarks
     * This API returns {@link ISpeakingState}, which will have `isSpeakingDetected` and/or an error object.
     * If any participant is speaking, `isSpeakingDetected` will be true, or false if no participants are speaking.
     * Only one handler can be registered at a time. Subsequent registrations replace existing registrations.
     * This API can only be used in the `sidePanel` and `meetingStage` frame contexts.
     * For private scheduled meetings, meet now, or calls, include the `OnlineMeetingIncomingAudio.Detect.Chat` RSC permission in your app manifest.
     * For channel meetings, include the `OnlineMeetingIncomingAudio.Detect.Group` RSC permission in your app manifest.
     * Find the app manifest reference at https://aka.ms/teamsAppManifest/authorization.
     *
     * @param handler The handler to invoke when the speaking state of any participant changes (start/stop speaking).
     */
    export function registerSpeakingStateChangeHandler(handler: registerSpeakingStateChangeHandlerFunctionType): void;
    /**
     * Registers a handler for changes to the selfParticipant's (current user's) raiseHandState. If the selfParticipant raises their hand, isHandRaised
     * will be true. By default and if the selfParticipant hand is lowered, isHandRaised will be false. This API will return {@link RaiseHandStateChangedEventData}
     * that will have the raiseHandState or an error object. Only one handler can be registered at a time. A subsequent registration
     * replaces an existing registration.
     *
     * @param handler The handler to invoke when the selfParticipant's (current user's) raiseHandState changes.
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function registerRaiseHandStateChangedHandler(handler: (eventData: RaiseHandStateChangedEventData) => void): void;
    /**
     * Registers a handler for receiving meeting reactions. When the selfParticipant (current user) successfully sends a meeting reaction and it is being rendered on the UI, the meetingReactionType will be populated. Only one handler can be registered
     * at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the selfParticipant (current user) successfully sends a meeting reaction
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function registerMeetingReactionReceivedHandler(handler: (eventData: MeetingReactionReceivedEventData) => void): void;
    /**
     * @hidden
     * Hide from docs beacuse it's only used internally as a serialization/deserialization type
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface ISerializedJoinMeetingParams {
        joinWebUrl: string;
        source: EventActionSource;
    }
    /**
     * This function is used to join a meeting.
     * This opens a meeting in a new window for the desktop app.
     * In case of a web app, it will close the current app and open the meeting in the same tab.
     * There is currently no support or experience for this on mobile platforms.
     * @param joinMeetingParams This takes {@link JoinMeetingParams} for joining the meeting. If source isn't passed then it is marked as 'Other' by default.
     * @throws error if the meeting join fails, the promise will reject to an object with the error message.
     */
    export function joinMeeting(joinMeetingParams: JoinMeetingParams): Promise<void>;
    /**
     * Contains information associated with parameters required for joining the Microsoft Teams meetings.
     * More details regarding parameters can be found at:
     * [Online Meeting Base - Microsoft Graph v1.0](https://learn.microsoft.com/en-us/graph/api/resources/onlinemeetingbase?view=graph-rest-1.0)
     */
    export interface JoinMeetingParams {
        /** The join URL of the online meeting. */
        joinWebUrl: URL;
        /** The source of the join button click. If not passed, 'Other' is the default value of source. {@link EventActionSource} */
        source?: EventActionSource;
    }
    /** The source of the join button click. */
    export enum EventActionSource {
        /**
         * Source is calendar grid context menu.
         */
        M365CalendarGridContextMenu = "m365_calendar_grid_context_menu",
        /**
         * Source is calendar grid peek.
         */
        M365CalendarGridPeek = "m365_calendar_grid_peek",
        /**
         * Source is calendar grid event card join button.
         */
        M365CalendarGridEventCardJoinButton = "m365_calendar_grid_event_card_join_button",
        /**
         * Source is calendar form ribbon join button.
         */
        M365CalendarFormRibbonJoinButton = "m365_calendar_form_ribbon_join_button",
        /**
         * Source is calendar form join teams meeting button.
         */
        M365CalendarFormJoinTeamsMeetingButton = "m365_calendar_form_join_teams_meeting_button",
        /**
         * Other sources.
         */
        Other = "other"
    }
    /**
     * Nested namespace for functions to control behavior of the app share button
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export namespace appShareButton {
        /**
         * Property bag for the setVisibilityInfo
         *
         * @hidden
         * Hide from docs.
         *
         * @internal
         * Limited to Microsoft-internal use
         *
         * @beta
         */
        interface ShareInformation {
            /**
             * boolean flag to set show or hide app share button
             */
            isVisible: boolean;
            /**
             * optional string contentUrl, which will override contentUrl coming from Manifest
             */
            contentUrl?: string;
        }
        /**
         * By default app share button will be hidden and this API will govern the visibility of it.
         *
         * This function can be used to hide/show app share button in meeting,
         * along with contentUrl (overrides contentUrl populated in app manifest)
         * @throws standard Invalid Url error
         * @param shareInformation has two elements, one isVisible boolean flag and another
         * optional string contentUrl, which will override contentUrl coming from Manifest
         *
         * @hidden
         * Hide from docs.
         *
         * @internal
         * Limited to Microsoft-internal use
         *
         * @beta
         */
        function setOptions(shareInformation: ShareInformation): void;
    }
    /**
     * Have the app handle audio (mic & speaker) and turn off host audio.
     *
     * When {@link RequestAppAudioHandlingParams.isAppHandlingAudio} is true, the host will switch to audioless mode
     *   Registers for mic mute status change events, which are events that the app can receive from the host asking the app to
     *   mute or unmute the microphone.
     *
     * When {@link RequestAppAudioHandlingParams.isAppHandlingAudio} is false, the host will switch out of audioless mode
     *   Unregisters the mic mute status change events so the app will no longer receive these events
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     * @throws Error if {@link RequestAppAudioHandlingParams.micMuteStateChangedCallback} parameter is not defined
     *
     * @param requestAppAudioHandlingParams - {@link RequestAppAudioHandlingParams} object with values for the audio switchover
     * @param callback - Callback with one parameter, the result
     * can either be true (the host is now in audioless mode) or false (the host is not in audioless mode)
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function requestAppAudioHandling(requestAppAudioHandlingParams: RequestAppAudioHandlingParams, callback: (isHostAudioless: boolean) => void): void;
    /**
     * Notifies the host that the microphone state has changed in the app.
     * @param micState - The new state that the microphone is in
     *   isMicMuted - Boolean to indicate the current mute status of the mic.
     *
     * @hidden
     * Hide from docs.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    export function updateMicState(micState: MicState): void;
    export {  };
}

declare namespace monetization {
    /**
     * @hidden
     * Data structure to represent a subscription plan.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface PlanInfo {
        /**
         * @hidden
         * plan id
         */
        planId: string;
        /**
         * @hidden
         * term of the plan
         */
        term: string;
    }
    /**
     * @hidden
     * Open dialog to start user's purchase experience
     *
     * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
     * error can either contain an error of type SdkError, incase of an error, or null when get is successful
     * @returns Promise that will be resolved when the operation has completed or rejected with SdkError value
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function openPurchaseExperience(planInfo?: PlanInfo): Promise<void>;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link monetization.openPurchaseExperience monetization.openPurchaseExperience(planInfo?: PlanInfo): Promise\<void\>} instead.
     *
     * @hidden
     * Open dialog to start user's purchase experience
     *
     * @param callback Callback contains 1 parameters, error.
     * @param planInfo optional parameter. It contains info of the subscription plan pushed to users.
     * error can either contain an error of type SdkError, incase of an error, or null when get is successful
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function openPurchaseExperience(callback: (error: SdkError | null) => void, planInfo?: PlanInfo): void;
    /**
     * @hidden
     *
     * Checks if the monetization capability is supported by the host
     * @returns boolean to represent whether the monetization capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    function isSupported(): boolean;
}

/**
 * Interact with the user's calendar, including opening calendar items and composing meetings.
 */
/**
 * Opens a calendar item.
 *
 * @param openCalendarItemParams - object containing unique ID of the calendar item to be opened.
 */
declare function openCalendarItem(openCalendarItemParams: OpenCalendarItemParams): Promise<void>;
/**
 * Compose a new meeting in the user's calendar.
 *
 * @param composeMeetingParams - object containing various properties to set up the meeting details.
 */
declare function composeMeeting(composeMeetingParams: ComposeMeetingParams): Promise<void>;
/**
 * Checks if the calendar capability is supported by the host
 * @returns boolean to represent whether the calendar capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
declare function isSupported$2(): boolean;
/** Open calendar item parameters. */
interface OpenCalendarItemParams {
    /** An unique base64-encoded string id that represents the event's unique identifier of the calendar item to be opened. */
    itemId: string;
}
/** Compose meeting parameters */
interface ComposeMeetingParams {
    /** An array of email addresses, user name, or user id of the attendees to invite to the meeting. */
    attendees?: string[];
    /** The start time of the meeting in MM/DD/YYYY HH:MM:SS format. */
    startTime?: string;
    /** The end time of the meeting in MM/DD/YYYY HH:MM:SS format. */
    endTime?: string;
    /** The subject line of the meeting. */
    subject?: string;
    /** The body content of the meeting. */
    content?: string;
}

type calendar_d_ComposeMeetingParams = ComposeMeetingParams;
type calendar_d_OpenCalendarItemParams = OpenCalendarItemParams;
declare const calendar_d_composeMeeting: typeof composeMeeting;
declare const calendar_d_openCalendarItem: typeof openCalendarItem;
declare namespace calendar_d {
  export { type calendar_d_ComposeMeetingParams as ComposeMeetingParams, type calendar_d_OpenCalendarItemParams as OpenCalendarItemParams, calendar_d_composeMeeting as composeMeeting, isSupported$2 as isSupported, calendar_d_openCalendarItem as openCalendarItem };
}

/**
 * Used to interact with mail capability, including opening and composing mail.
 */
declare namespace mail {
    /**
     * Opens a mail message in the host.
     *
     * @param openMailItemParams - Object that specifies the ID of the mail message.
     */
    export function openMailItem(openMailItemParams: OpenMailItemParams): Promise<void>;
    /**
     * Compose a new email in the user's mailbox.
     *
     * @param composeMailParams - Object that specifies the type of mail item to compose and the details of the mail item.
     *
     */
    export function composeMail(composeMailParams: ComposeMailParams): Promise<void>;
    /**
     * Checks if the mail capability is supported by the host
     * @returns boolean to represent whether the mail capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean;
    /** Defines the parameters used to open a mail item in the user's mailbox */
    export interface OpenMailItemParams {
        /** An unique base64-encoded string id that represents the itemId or messageId. */
        itemId: string;
    }
    /** Defines compose mail types. */
    export enum ComposeMailType {
        /** Compose a new mail message. */
        New = "new",
        /** Compose a reply to the sender of an existing mail message. */
        Reply = "reply",
        /** Compose a reply to all recipients of an existing mail message. */
        ReplyAll = "replyAll",
        /** Compose a new mail message with the content of an existing mail message forwarded to a new recipient. */
        Forward = "forward"
    }
    /**
     * Foundational interface for all other mail compose interfaces
     * Used for holding the type of mail item being composed
     *
     * @typeParam T - the identity type.
     * @see {@link mail.ComposeMailType}
     */
    interface ComposeMailBase<T extends ComposeMailType> {
        /** Type of the mail item being composed. */
        type: T;
    }
    /**
     * Parameters supplied when composing a new mail item
     */
    export interface ComposeNewParams extends ComposeMailBase<ComposeMailType.New> {
        /**
         * The To: recipients for the message
         */
        toRecipients?: string[];
        /**
         * The Cc: recipients for the message
         */
        ccRecipients?: string[];
        /**
         * The Bcc: recipients for the message
         */
        bccRecipients?: string[];
        /**
         * The subject of the message
         */
        subject?: string;
        /**
         * The body of the message
         */
        message?: string;
    }
    /**
     * Parameters supplied when composing a reply to or forward of a message
     *
     * @see {@link ComposeMailType}
     */
    export interface ComposeReplyOrForwardParams<T extends ComposeMailType> extends ComposeMailBase<T> {
        /** An unique base64-encoded string id that represents the mail message. */
        itemid: string;
    }
    /**
     * Parameters supplied to {@link composeMail} when composing a new mail item
     *
     * @see {@link ComposeNewParams}
     * @see {@link ComposeReplyOrForwardParams}
     * @see {@link ComposeMailType}
     */
    export type ComposeMailParams = ComposeNewParams | ComposeReplyOrForwardParams<ComposeMailType.Reply> | ComposeReplyOrForwardParams<ComposeMailType.ReplyAll> | ComposeReplyOrForwardParams<ComposeMailType.Forward>;
    export {  };
}

declare namespace teamsCore {
    /** Ready to unload function type */
    type readyToUnloadFunctionType = () => void;
    /** Register on load handler function type */
    type registerOnLoadHandlerFunctionType = (context: LoadContext) => void;
    /** Register before unload handler function type */
    type registerBeforeUnloadHandlerFunctionType = (readyToUnload: readyToUnloadFunctionType) => boolean;
    /**
     * Enable print capability to support printing page using Ctrl+P and cmd+P
     */
    function enablePrintCapability(): void;
    /**
     * default print handler
     */
    function print(): void;
    /**
     * Registers a handler to be called when the page has been requested to load.
     *
     * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/app-caching)
     * for a more detailed explanation about using this API.
     *
     * @param handler - The handler to invoke when the page is loaded.
     *
     * @beta
     */
    function registerOnLoadHandler(handler: registerOnLoadHandlerFunctionType): void;
    /**
     * @hidden
     * Undocumented helper function with shared code between deprecated version and current version of the registerOnLoadHandler API.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @param apiVersionTag - The tag indicating API version number with name
     * @param handler - The handler to invoke when the page is loaded.
     * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
     *
     * @deprecated
     */
    function registerOnLoadHandlerHelper(apiVersionTag: string, handler: registerOnLoadHandlerFunctionType, versionSpecificHelper?: () => void): void;
    /**
     * Registers a handler to be called before the page is unloaded.
     *
     * @remarks Check out [App Caching in Teams](https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/app-caching)
     * for a more detailed explanation about using this API.
     *
     * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
     * invoke the readyToUnload function provided to it once it's ready to be unloaded.
     *
     * @beta
     */
    function registerBeforeUnloadHandler(handler: registerBeforeUnloadHandlerFunctionType): void;
    /**
     * @hidden
     * Undocumented helper function with shared code between deprecated version and current version of the registerBeforeUnloadHandler API.
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @param handler - - The handler to invoke before the page is unloaded. If this handler returns true the page should
     * invoke the readyToUnload function provided to it once it's ready to be unloaded.
     * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
     *
     * @deprecated
     */
    function registerBeforeUnloadHandlerHelper(apiVersionTag: string, handler: registerBeforeUnloadHandlerFunctionType, versionSpecificHelper?: () => void): void;
    /**
     * Checks if teamsCore capability is supported by the host
     *
     * @returns boolean to represent whether the teamsCore capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     */
    function isSupported(): boolean;
}

declare namespace people {
    /** Select people callback function type */
    type selectPeopleCallbackFunctionType = (error: SdkError, people: PeoplePickerResult[]) => void;
    /**
     * Launches a people picker and allows the user to select one or more people from the list
     * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
     
     * @param callback - Returns list of JSON object of type PeoplePickerResult which consists of Microsoft Entra IDs, display names and emails of the selected users
     * @param peoplePickerInputs - Input parameters to launch customized people picker
     * @returns Promise that will be fulfilled when the operation has completed
     */
    function selectPeople(peoplePickerInputs?: PeoplePickerInputs): Promise<PeoplePickerResult[]>;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link people.selectPeople people.selectPeople(peoplePickerInputs?: PeoplePickerInputs): Promise\<PeoplePickerResult[]\>} instead.
     *
     * Launches a people picker and allows the user to select one or more people from the list
     * If the app is added to personal app scope the people picker launched is org wide and if the app is added to a chat/channel, people picker launched is also limited to the members of chat/channel
     
     * @param callback - Returns list of JSON object of type PeoplePickerResult which consists of Microsoft Entra IDs, display names and emails of the selected users
     * @param peoplePickerInputs - Input parameters to launch customized people picker
     */
    function selectPeople(callback: selectPeopleCallbackFunctionType, peoplePickerInputs?: PeoplePickerInputs): void;
    /**
     * Input parameter supplied to the People Picker API
     */
    interface PeoplePickerInputs {
        /**
         * Optional; Set title for the people picker
         * Default value is "Select people" for multiselect and "Select a person" for single select
         */
        title?: string;
        /**
         * Optional; Microsoft Entra IDs of the users to be pre-populated in the search box of people picker control
         * If single select is enabled this value, only the first user in the list will be pre-populated
         * Default value is null
         */
        setSelected?: string[];
        /**
         * Optional; launches the people picker in org wide scope even if the app is added to a chat or channel
         * Default value is false
         */
        openOrgWideSearchInChatOrChannel?: boolean;
        /**
         * Optional; launches the people picker for which only 1 person can be selected
         * Default value is false
         */
        singleSelect?: boolean;
    }
    /**
     * Output user object of people picker API
     */
    interface PeoplePickerResult {
        /**
         * user object ID (also known as Microsoft Entra ID) of the selected user
         */
        objectId: string;
        /**
         * Optional; display name of the selected user
         */
        displayName?: string;
        /**
         * Optional; email of the selected user
         */
        email?: string;
    }
    /**
     * Checks if the people capability is supported by the host
     * @returns boolean to represent whether the people capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    function isSupported(): boolean;
}

/**
 * Represents a user's presence status
 */
declare enum PresenceStatus {
    /**
     * User is available and can be contacted
     */
    Available = "Available",
    /**
     * User is busy and should not be disturbed
     */
    Busy = "Busy",
    /**
     * User has explicitly set their status to "Do Not Disturb" and should not be contacted
     */
    DoNotDisturb = "DoNotDisturb",
    /**
     * User is temporarily away from their device
     */
    Away = "Away",
    /**
     * User is offline and cannot be contacted
     */
    Offline = "Offline",
    /**
     * User is out of office
     */
    OutOfOffice = "OutOfOffice"
}
/**
 * Out of office details for a user
 */
interface OutOfOfficeDetails {
    /**
     * Start time of OOF period (ISO string)
     */
    startTime: string;
    /**
     * End time of OOF period (ISO string)
     */
    endTime: string;
    /**
     * OOF message to display
     */
    message: string;
}
/**
 * Represents a user's presence information
 */
interface UserPresence {
    /**
     * User's current presence status
     */
    status: PresenceStatus;
    /**
     * Required custom status message (minimum 5 characters)
     */
    customMessage: string;
    /**
     * Optional out of office details
     * Only present when status is OutOfOffice
     */
    outOfOfficeDetails?: OutOfOfficeDetails;
}
/**
 * Parameters for getting a user's presence
 */
interface GetPresenceParams {
    /**
     * The user's UPN (email) to get presence for
     */
    upn: string;
}
/**
 * Parameters for setting presence
 */
interface SetPresenceParams {
    /**
     * New presence status to set
     */
    status: PresenceStatus;
    /**
     * Required custom status message (minimum 5 characters)
     */
    customMessage: string;
    /**
     * Optional out of office details
     * Only valid when status is OutOfOffice
     */
    outOfOfficeDetails?: OutOfOfficeDetails;
}
/**
 * Gets a user's current presence status
 * @param params Parameters for getting presence
 * @returns Promise resolving with the user's presence
 *
 * @throws Error if:
 * - The presence capability is not supported
 * - The library has not been initialized
 * - The UPN parameter is invalid
 */
declare function getPresence(params: GetPresenceParams): Promise<UserPresence>;
/**
 * Sets the current user's presence status
 * @param params Parameters for setting presence
 * @returns Promise that resolves when operation completes
 *
 * @throws Error if:
 * - The presence capability is not supported
 * - The library has not been initialized
 * - The status parameter is invalid
 * - The custom message parameter is invalid
 * - The out of office details are invalid
 */
declare function setPresence(params: SetPresenceParams): Promise<void>;
/**
 * Checks if presence capability is supported by the host
 * @returns boolean indicating if presence is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
declare function isSupported$1(): boolean;

type presence_d_GetPresenceParams = GetPresenceParams;
type presence_d_OutOfOfficeDetails = OutOfOfficeDetails;
type presence_d_PresenceStatus = PresenceStatus;
declare const presence_d_PresenceStatus: typeof PresenceStatus;
type presence_d_SetPresenceParams = SetPresenceParams;
type presence_d_UserPresence = UserPresence;
declare const presence_d_getPresence: typeof getPresence;
declare const presence_d_setPresence: typeof setPresence;
declare namespace presence_d {
  export { type presence_d_GetPresenceParams as GetPresenceParams, type presence_d_OutOfOfficeDetails as OutOfOfficeDetails, presence_d_PresenceStatus as PresenceStatus, type presence_d_SetPresenceParams as SetPresenceParams, type presence_d_UserPresence as UserPresence, presence_d_getPresence as getPresence, isSupported$1 as isSupported, presence_d_setPresence as setPresence };
}

/**
 * Namespace for profile related APIs.
 *
 * @beta
 */
declare namespace profile {
    /**
     * Opens a profile card at a specified position to show profile information about a persona.
     * @param showProfileRequest The parameters to position the card and identify the target user.
     * @returns Promise that will be fulfilled when the operation has completed
     *
     * @beta
     */
    function showProfile(showProfileRequest: ShowProfileRequest): Promise<void>;
    /**
     * The type of modalities that are supported when showing a profile.
     * Can be provided as an optional hint with the request and will be
     * respected if the hosting M365 application supports it.
     *
     * @beta
     */
    type Modality = 'Card' | 'Expanded';
    /**
     * The type of the profile trigger.
     *  - MouseHover: The user hovered a target.
     *  - Press: The target was pressed with either a mouse click or keyboard key press.
     *  - AppRequest: The show profile request is happening programmatically, without direct user interaction.
     *
     * @beta
     */
    type TriggerType = 'MouseHover' | 'Press' | 'AppRequest';
    /**
     * The set of identifiers that are supported for resolving the persona.
     *
     * At least one is required, and if multiple are provided then only the highest
     * priority one will be used (AadObjectId > Upn > Smtp). AAD is now known as "Microsoft Entra ID"
     *
     * @beta
     */
    type PersonaIdentifiers = {
        /**
         * The object id in Microsoft Entra.
         *
         * This id is guaranteed to be unique for an object within a tenant,
         * and so if provided will lead to a more performant lookup. It can
         * be resolved via MS Graph (see https://learn.microsoft.com/graph/api/resources/users
         * for examples).
         */
        readonly AadObjectId?: string;
        /**
         * The primary SMTP address.
         */
        readonly Smtp?: string;
        /**
         * The user principle name.
         */
        readonly Upn?: string;
    };
    /**
     * The persona to show the profile for.
     *
     * @beta
     */
    interface Persona {
        /**
         * The set of identifiers that are supported for resolving the persona.
         */
        identifiers: PersonaIdentifiers;
        /**
         * Optional display name override. If not specified the user's display name will be resolved normally.
         */
        displayName?: string;
    }
    /**
     * Input parameters provided to the showProfile API.
     *
     * @beta
     */
    interface ShowProfileRequest {
        /**
         * An optional hint to the hosting M365 application about which modality of the profile you want to show.
         */
        modality?: Modality;
        /**
         * The information about the persona to show the profile for.
         */
        persona: Persona;
        /**
         * The bounding rectangle of the target.
         */
        targetElementBoundingRect: DOMRect;
        /**
         * Specifies which user interaction was used to trigger the API call.
         */
        triggerType: TriggerType;
    }
    /**
     * Checks if the profile capability is supported by the host
     * @returns boolean to represent whether the profile capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    function isSupported(): boolean;
}

/**
 * Namespace to video extensibility of the SDK
 * @beta
 */
declare namespace videoEffects {
    /** Notify video frame processed function type */
    type notifyVideoFrameProcessedFunctionType = () => void;
    /** Notify error function type */
    type notifyErrorFunctionType = (errorMessage: string) => void;
    /**
     * Represents a video frame
     * @beta
     */
    interface VideoBufferData {
        /**
         * Video frame width
         */
        width: number;
        /**
         * Video frame height
         */
        height: number;
        /**
         * Video frame buffer
         */
        videoFrameBuffer: Uint8ClampedArray;
        /**
         * NV12 luma stride, valid only when video frame format is NV12
         */
        lumaStride?: number;
        /**
         * NV12 chroma stride, valid only when video frame format is NV12
         */
        chromaStride?: number;
        /**
         * RGB stride, valid only when video frame format is RGB
         */
        stride?: number;
        /**
         * The time stamp of the current video frame
         */
        timestamp?: number;
    }
    /**
     * Video frame format enum, currently only support NV12
     * @beta
     */
    enum VideoFrameFormat {
        /** Video format used for encoding and decoding YUV color data in video streaming and storage applications. */
        NV12 = "NV12"
    }
    /**
     * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
     * @beta
     */
    interface VideoFrameConfig {
        /**
         * Video format
         */
        format: VideoFrameFormat;
    }
    /**
     * Video effect change type enum
     * @beta
     */
    enum EffectChangeType {
        /**
         * Current video effect changed
         */
        EffectChanged = "EffectChanged",
        /**
         * Disable the video effect
         */
        EffectDisabled = "EffectDisabled"
    }
    /**
     * Predefined failure reasons for preparing the selected video effect
     * @beta
     */
    enum EffectFailureReason {
        /**
         * A wrong effect id is provide.
         * Use this reason when the effect id is not found or empty, this may indicate a mismatch between the app and its manifest or a bug of the host.
         */
        InvalidEffectId = "InvalidEffectId",
        /**
         * The effect can't be initialized
         */
        InitializationFailure = "InitializationFailure"
    }
    /**
     * Video effect change call back function definition
     * Return a Promise which will be resolved when the effect is prepared, or throw an {@link EffectFailureReason} on error.
     * @beta
     */
    type VideoEffectCallback = (effectId: string | undefined) => Promise<void>;
    /**
     * @beta
     * Video frame call back function definition
     * The callback will be called on every frame when running on the supported host.
     * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
     * The video app should call `notifyVideoFrameProcessed` to notify a successfully processed video frame.
     * The video app should call `notifyError` to notify a failure. When the failures accumulate to a certain number, the host will see the app is "frozen" and ask the user to close it or not.
     */
    type VideoBufferHandler = (videoBufferData: VideoBufferData, notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType, notifyError: notifyErrorFunctionType) => void;
    /**
     * @beta
     * VideoFrame definition, align with the W3C spec: https://www.w3.org/TR/webcodecs/#videoframe-interface.
     * The current version of typescript doesn't have the definition of VideoFrame so we have to define it here.
     * At runtime it can be cast to VideoFrame directly: `(videoFrame as VideoFrame)`.
     */
    interface VideoFrame {
    }
    /**
     * @beta
     * Video frame data extracted from the media stream. More properties may be added in the future.
     */
    type VideoFrameData = {
        /**
         * The video frame from the media stream.
         */
        videoFrame: VideoFrame;
    };
    /**
     * @beta
     * Video frame call back function definition.
     * The callback will be called on every frame when running on the supported host.
     * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
     * The video app should resolve the promise to notify a successfully processed video frame.
     * The video app should reject the promise to notify a failure. When the failures accumulate to a certain number, the host will see the app is "frozen" and ask the user to close it or not.
     */
    type VideoFrameHandler = (receivedVideoFrame: VideoFrameData) => Promise<VideoFrame>;
    /**
     * @beta
     * Callbacks and configuration supplied to the host to process the video frames.
     */
    type RegisterForVideoFrameParameters = {
        /**
         * Callback function to process the video frames extracted from a media stream.
         */
        videoFrameHandler: VideoFrameHandler;
        /**
         * Callback function to process the video frames shared by the host.
         */
        videoBufferHandler: VideoBufferHandler;
        /**
         * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
         */
        config: VideoFrameConfig;
    };
    /**
     * Register callbacks to process the video frames if the host supports it.
     * @beta
     * @param parameters - Callbacks and configuration to process the video frames. A host may support either {@link VideoFrameHandler} or {@link VideoBufferHandler}, but not both.
     * To ensure the video effect works on all supported hosts, the video app must provide both {@link VideoFrameHandler} and {@link VideoBufferHandler}.
     * The host will choose the appropriate callback based on the host's capability.
     *
     * @example
     * ```typescript
     * videoEffects.registerForVideoFrame({
     *   videoFrameHandler: async (videoFrameData) => {
     *     const originalFrame = videoFrameData.videoFrame as VideoFrame;
     *     try {
     *       const processedFrame = await processFrame(originalFrame);
     *       return processedFrame;
     *     } catch (e) {
     *       throw e;
     *     }
     *   },
     *   videoBufferHandler: (
     *     bufferData: VideoBufferData,
     *     notifyVideoFrameProcessed: notifyVideoFrameProcessedFunctionType,
     *     notifyError: notifyErrorFunctionType
     *     ) => {
     *       try {
     *         processFrameInplace(bufferData);
     *         notifyVideoFrameProcessed();
     *       } catch (e) {
     *         notifyError(e);
     *       }
     *     },
     *   config: {
     *     format: videoEffects.VideoPixelFormat.NV12,
     *   }
     * });
     * ```
     */
    function registerForVideoFrame(parameters: RegisterForVideoFrameParameters): void;
    /**
     * Video extension should call this to notify host that the current selected effect parameter changed.
     * If it's pre-meeting, host will call videoEffectCallback immediately then use the videoEffect.
     * If it's the in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     * @beta
     * @param effectChangeType - the effect change type.
     * @param effectId - Newly selected effect id.
     */
    function notifySelectedVideoEffectChanged(effectChangeType: EffectChangeType, effectId: string | undefined): void;
    /**
     * Register a callback to be notified when a new video effect is applied.
     * @beta
     * @param callback - Function to be called when new video effect is applied.
     */
    function registerForVideoEffect(callback: VideoEffectCallback): void;
    /**
     * Checks if video capability is supported by the host.
     * @beta
     * @returns boolean to represent whether the video capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     */
    function isSupported(): boolean;
}

/**
 * Allows your application to interact with the host M365 application's search box.
 * By integrating your application with the host's search box, users can search
 * your app using the same search box they use elsewhere in Teams, Outlook, or Office.
 *
 * This functionality is in Beta.
 * @beta
 */
declare namespace search {
    /**
     * This interface contains information pertaining to the contents of the host M365 application's search box
     *
     * @beta
     */
    interface SearchQuery {
        /** The current search term in the host search experience */
        searchTerm: string;
        /** Timestamp sequence value to ensure messages are processed in correct order / combine them. */
        timestamp: number;
    }
    /**
     * This type will store the SearchQuery and allow other logic to be made inside the handler.
     *
     * @beta
     */
    type SearchQueryHandler = (query: SearchQuery) => void;
    /**
     * Allows the caller to register for various events fired by the host search experience.
     * Calling this function indicates that your application intends to plug into the host's search box and handle search events,
     * when the user is actively using your page/tab.
     *
     * The host may visually update its search box, e.g. with the name or icon of your application.
     *
     * Your application should *not* re-render inside of these callbacks, there may be a large number
     * of onChangeHandler calls if the user is typing rapidly in the search box.
     *
     * @param onClosedHandler - This handler will be called when the user exits or cancels their search.
     * Should be used to return your application to its most recent, non-search state. The value of {@link SearchQuery.searchTerm}
     * will be whatever the last query was before ending search.
     *
     * @param onExecuteHandler - The handler will be called when the user executes their
     * search (by pressing Enter for example). Should be used to display the full list of search results.
     * The value of {@link SearchQuery.searchTerm} is the complete query the user entered in the search box.
     *
     * @param onChangeHandler - This optional handler will be called when the user first starts using the
     * host's search box and as the user types their query. Can be used to put your application into a
     * word-wheeling state or to display suggestions as the user is typing.
     *
     * This handler will be called with an empty {@link SearchQuery.searchTerm} when search is beginning, and subsequently,
     * with the current contents of the search box.
     * @example
     * ``` ts
     * search.registerHandlers(
        query => {
          console.log('Update your application to handle the search experience being closed. Last query: ${query.searchTerm}');
        },
        query => {
          console.log(`Update your application to handle an executed search result: ${query.searchTerm}`);
        },
        query => {
          console.log(`Update your application with the changed search query: ${query.searchTerm}`);
        },
       );
     * ```
     *
     * @beta
     */
    function registerHandlers(onClosedHandler: SearchQueryHandler, onExecuteHandler: SearchQueryHandler, onChangeHandler?: SearchQueryHandler): void;
    /**
     * Allows the caller to unregister for all events fired by the host search experience. Calling
     * this function will cause your app to stop appearing in the set of search scopes in the hosts
     *
     * @beta
     */
    function unregisterHandlers(): void;
    /**
     * Checks if search capability is supported by the host
     * @returns boolean to represent whether the search capability is supported
     *
     * @throws Error if {@link app.initialize} has not successfully completed
     *
     * @beta
     */
    function isSupported(): boolean;
    /**
     * Clear the host M365 application's search box
     *
     * @beta
     */
    function closeSearch(): Promise<void>;
}

/**
 * Namespace to open a share dialog for web content.
 * For more info, see [Share to Teams from personal app or tab](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/share-to-teams-from-personal-app-or-tab)
 */
declare namespace sharing {
    /** shareWebContent callback function type */
    export type shareWebContentCallbackFunctionType = (err?: SdkError) => void;
    /** Type of message that can be sent or received by the sharing APIs */
    export const SharingAPIMessages: {
        /**
         * Share web content message.
         * @internal
         */
        shareWebContent: string;
    };
    type ContentType = 'URL';
    /** Represents parameters for base shared content. */
    interface IBaseSharedContent {
        /** Shared content type  */
        type: ContentType;
    }
    /** IShareRequestContentType defines share request type. */
    export type IShareRequestContentType = IURLContent;
    /** Represents IShareRequest parameters interface.
     * @typeparam T - The identity type
     */
    export interface IShareRequest<T> {
        /** Content of the share request. */
        content: T[];
    }
    /** Represents IURLContent parameters. */
    export interface IURLContent extends IBaseSharedContent {
        /** Type */
        type: 'URL';
        /**
         * Required URL
         */
        url: string;
        /**
         * Default initial message text
         */
        message?: string;
        /**
         * Show URL preview, defaults to true
         */
        preview?: boolean;
    }
    /**
     * Feature is under development
     * Opens a share dialog for web content
     *
     * @param shareWebContentRequest - web content info
     * @returns Promise that will be fulfilled when the operation has completed
     */
    export function shareWebContent(shareWebContentRequest: IShareRequest<IShareRequestContentType>): Promise<void>;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link sharing.shareWebContent sharing.shareWebContent(shareWebContentRequest: IShareRequest\<IShareRequestContentType\>): Promise\<void\>} instead.
     *
     * Feature is under development
     * Opens a share dialog for web content
     *
     * @param shareWebContentRequest - web content info
     * @param callback - optional callback
     */
    export function shareWebContent(shareWebContentRequest: IShareRequest<IShareRequestContentType>, callback: shareWebContentCallbackFunctionType): void;
    /**
     * Checks if the sharing capability is supported by the host
     * @returns boolean to represent whether the sharing capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean;
    /**
     * Namespace to get the list of content shared in a Teams meeting
     *
     * @beta
     */
    export namespace history {
        /**
         * Represents the data returned when calling {@link sharing.history.getContent}
         *
         * @beta
         */
        interface IContentResponse {
            /** Id of the app where the content was shared from */
            appId: string;
            /** Title of the shared content */
            title: string;
            /** Reference of the shared content */
            contentReference: string;
            /** Id of the thread where the content was shared. */
            threadId: string;
            /** Id of the user who shared the content. */
            author: string;
            /** Type of the shared content.
             * For sharing to Teams stage scenarios, this value would be `ShareToStage`
             * Other `contentType` values will be added and documented here over time
             */
            contentType: string;
        }
        /**
         * Get the list of content shared in a Teams meeting
         *
         * @throws Error if call capability is not supported
         * @throws Error if returned content details are invalid
         * @returns Promise that will resolve with the {@link IContentResponse} objects array
         *
         * @beta
         */
        function getContent(): Promise<IContentResponse[]>;
        /**
         * Checks if sharing.history capability is supported by the host
         * @returns boolean to represent whether the sharing.history capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         * @beta
         */
        function isSupported(): boolean;
    }
    export {  };
}

/**
 * Namespace to interact with the stage view specific part of the SDK.
 *
 *  @beta
 */
declare namespace stageView {
    /**
     * Parameters to open a stage view.
     */
    interface StageViewParams {
        /**
         * The ID of the Teams application to be opened.
         */
        appId: string;
        /**
         * The URL of the content to display.
         */
        contentUrl: string;
        /**
         * The chat or channel ID.
         */
        threadId: string;
        /**
         * The messageId identifies a particular channel meeting within the channel as specified by the threadId above. This should be used only when trying to open the stage view for a channel meeting. It will be a no-op for other scenarios
         */
        messageId?: string;
        /**
         * The title to give the stage view.
         */
        title?: string;
        /**
         * The Teams application website URL.
         */
        websiteUrl?: string;
        /**
         * The entity ID of the Teams application content being opened.
         */
        entityId?: string;
        /**
         * The open mode for stage content.
         * Optional param: if not passed, hosts can choose their default openMode.
         * If a host does not support any specific openMode, It will fallback to StageViewOpenMode.modal.
         */
        openMode?: StageViewOpenMode;
    }
    /**
     * The open mode for stage content.
     */
    enum StageViewOpenMode {
        /**
         * Open the content in a modal.
         */
        modal = "modal",
        /**
         * Open the content in a popped-out window.
         */
        popout = "popout",
        /**
         * Open the content in a popped-out window with chat collaboration.
         */
        popoutWithChat = "popoutWithChat"
    }
    /**
     *
     * Opens a stage view to display a Teams application
     * @beta
     * @param stageViewParams - The parameters to pass into the stage view.
     * @returns Promise that resolves or rejects with an error once the stage view is closed.
     */
    function open(stageViewParams: StageViewParams): Promise<void>;
    /**
     * Checks if stageView capability is supported by the host
     * @beta
     * @returns boolean to represent whether the stageView capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     */
    function isSupported(): boolean;
    /**
     * Namespace for actions that can be taken by the stage view itself.
     *
     * @beta
     */
    namespace self {
        /**
         * Closes the current stage view. This function will be a no-op if called from outside of a stage view.
         * @returns Promise that resolves or rejects with an error once the stage view is closed.
         *
         * @beta
         * @throws Error if stageView.self.close is not supported in the current context or if `app.initialize()` has not resolved successfully.
         */
        function close(): Promise<void>;
        /**
         * Checks if stageView.self capability is supported by the host
         * @beta
         * @returns boolean to represent whether the stageView.self capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         */
        function isSupported(): boolean;
    }
}

/**
 * @hidden
 *  Package version.
 */
declare const version = "ERROR: This value should be replaced by webpack!";

/**
 * @hidden
 * Interact with images. Allows the app developer ask the user to get images from their camera / camera roll / file system.
 *
 * @beta
 */
declare namespace visualMedia {
    /**
     * @hidden
     * All properties common to Image and Video Props
     *
     * @beta
     */
    interface VisualMediaProps {
        /**
         * @hidden
         * The maximum number of media items that can be selected at once is limited to values that are less than or equal to the maximum visual media selection limit.
         */
        maxVisualMediaCount: number;
    }
    /**
     * @hidden
     * The required value of the visualMedia files from gallery
     *
     * @beta
     */
    export interface GalleryProps {
        /**
         * The visualMedia source
         */
        source: Source.Gallery;
    }
    /**
     * @hidden
     * The required value of the visualMedia files from camera
     *
     * @beta
     */
    export interface CameraProps {
        /**
         * @hidden
         * The visualMedia source
         */
        source: Source.Camera;
        /**
         * @hidden
         * Optional; Specify whether users have the option to switch between the front and rear cameras. The default setting is FrontOrRear.
         * Default value is FrontOrRear
         */
        cameraRestriction?: CameraRestriction;
    }
    /**
     * @hidden
     * Indicate if user is allowed to move between front and back camera or stay in front/back camera only
     * If the camera option requested by the app isn't available, the SDK will silently default to the platform's standard camera.
     *
     * @beta
     */
    export enum CameraRestriction {
        /** User can move between front and back camera */
        FrontOrRear = 1,
        /** User can only use the front camera */
        FrontOnly = 2,
        /** User can only use the back camera */
        RearOnly = 3
    }
    /**
     * @hidden
     * Specifies the image source
     *
     * @beta
     */
    export enum Source {
        /** The camera is the source of visual media. */
        Camera = 1,
        /** The source of visual media is the gallery. */
        Gallery = 2
    }
    /**
     * @hidden
     * VisualMediaFile object that can be used to represent image or video from host apps.
     *
     * @beta
     */
    export interface VisualMediaFile {
        /**
         * @hidden
         * This is the base64 content of file.
         * If app needs to use this directly in HTML tags, it should convert this to a data url.
         */
        content: string;
        /**
         * @hidden
         * The size of file represented in VisualMediaFile in KB
         */
        sizeInKB: number;
        /**
         * @hidden
         * Name of the file (does not include the extension)
         */
        name: string;
        /**
         * @hidden
         * File's MIME type. More information on supported `mimeTypes`(https://docs.lens.xyz/docs/metadata-standards#supported-mime-types-for-imagesaudiovideos).
         */
        mimeType: string;
    }
    /**
     * @hidden
     * Checks whether or not visualMedia has user permission
     * @returns Promise that will resolve with true if the user had granted the app permission to media information(including Camera and Gallery permission), or with false otherwise,
     * In case of an error, promise will reject with the error.
     * @throws NOT_SUPPORTED_ON_PLATFORM Error if the DevicePermission.Media permission has not successfully granted.
     *
     * @beta
     */
    export function hasPermission(): Promise<boolean>;
    /**
     * @hidden
     * Requests user permission for visualMedia
     * @returns Promise that will resolve with true if the user consented permission for media(including Camera and Gallery permission), or with false otherwise,
     * In case of an error, promise will reject with the error.
     * @throws NOT_SUPPORTED_ON_PLATFORM Error if the DevicePermission.Media permission has not successfully granted.
     *
     * @beta
     */
    export function requestPermission(): Promise<boolean>;
    /**
     * @hidden
     * To enable this image capability will let the app developer ask the user to get images from camera/local storage
     *
     * @beta
     */
    export namespace image {
        /**
         * @hidden
         * CameraImageProperties is for the image taken from the camera
         *
         * @beta
         */
        interface CameraImageProperties extends VisualMediaProps {
            /**
             * @hidden
             * The source in CameraImageProperties should always be CameraProps
             */
            sourceProps: CameraProps;
        }
        /**
         * @hidden
         * CameraImageProperties is for the image taken from the camera
         *
         * @beta
         */
        interface GalleryImageProperties extends VisualMediaProps {
            /**
             * @hidden
             * The source in GalleryImageProperties should always be GalleryProps
             */
            sourceProps: GalleryProps;
        }
        /**
         * @hidden
         * Capture one or multiple image(s) using camera.
         * @param cameraImageInputs - The input params to customize the image(s) to be captured
         * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
         * @throws INVALID_ARGUMENTS Error if imageInputs is null or imageInputs.maxVisualMediaCount is greater than maxVisualMediaSelectionLimit or lesser than 1.
         *
         * @beta
         */
        function captureImages(cameraImageInputs: CameraImageProperties): Promise<VisualMediaFile[]>;
        /**
         * @hidden
         * Upload the existing image(s) from the gallery.
         * @param galleryImageInputs - The input params to customize the image(s) to be captured
         * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
         * @throws INVALID_ARGUMENTS Error if imageInputs is null or imageInputs.maxVisualMediaCount is greater than maxVisualMediaSelectionLimit or lesser than 1.
         *
         * @beta
         */
        function retrieveImages(galleryImageInputs: GalleryImageProperties): Promise<VisualMediaFile[]>;
        /**
         * @hidden
         * Checks if visualMedia.image capability is supported by the host
         * @returns boolean to represent whether visualMedia.image is supported
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         * @beta
         */
        function isSupported(): boolean;
    }
    export {  };
}

/**
 * Contains functionality enabling apps to query properties about how the host manages web storage (`Window.LocalStorage`)
 *
 * @beta
 */
declare namespace webStorage {
    /**
     * Checks if web storage (`Window.LocalStorage`) gets cleared when a user logs out from host
     *
     * @returns `true` if web storage gets cleared on logout and `false` if not
     *
     * @throws `Error` if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    function isWebStorageClearedOnUserLogOut(): Promise<boolean>;
    /**
     * Checks if webStorage capability is supported by the host
     * @returns boolean to represent whether the webStorage capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    function isSupported(): boolean;
}

/**
 * Used to interact with call functionality, including starting calls with other users.
 */
/** Modalities that can be associated with a call. */
declare enum CallModalities {
    /** Indicates that the modality is unknown or undefined. */
    Unknown = "unknown",
    /** Indicates that the call includes audio. */
    Audio = "audio",
    /** Indicates that the call includes video. */
    Video = "video",
    /** Indicates that the call includes video-based screen sharing. */
    VideoBasedScreenSharing = "videoBasedScreenSharing",
    /** Indicates that the call includes data sharing or messaging. */
    Data = "data"
}
/** Represents parameters for {@link startCall | StartCall}. */
interface StartCallParams {
    /**
     * Comma-separated list of user IDs representing the participants of the call.
     *
     * @remarks
     * Currently the User ID field supports the Microsoft Entra UserPrincipalName,
     * typically an email address, or in case of a PSTN call, it supports a pstn
     * mri 4:\<phonenumber>.
     */
    targets: string[];
    /**
     * List of modalities for the call. Defaults to [“audio”].
     */
    requestedModalities?: CallModalities[];
    /**
     * An optional parameter that informs about the source of the deep link
     */
    source?: string;
}
/**
 * Starts a call with other users
 *
 * @param startCallParams - Parameters for the call
 *
 * @throws Error if call capability is not supported
 * @throws Error if host notifies of a failed start call attempt in a legacy Teams environment
 * @returns always true if the host notifies of a successful call inititation
 */
declare function startCall(startCallParams: StartCallParams): Promise<boolean>;
/**
 * Checks if the call capability is supported by the host
 * @returns boolean to represent whether the call capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
declare function isSupported(): boolean;

type call_d_CallModalities = CallModalities;
declare const call_d_CallModalities: typeof CallModalities;
type call_d_StartCallParams = StartCallParams;
declare const call_d_isSupported: typeof isSupported;
declare const call_d_startCall: typeof startCall;
declare namespace call_d {
  export { call_d_CallModalities as CallModalities, type call_d_StartCallParams as StartCallParams, call_d_isSupported as isSupported, call_d_startCall as startCall };
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.notifyAppLoaded app.notifyAppLoaded(): void} instead.
 *
 * Notifies the frame that app has loaded and to hide the loading indicator if one is shown.
 */
declare function notifyAppLoaded(): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.notifySuccess app.notifySuccess(): void} instead.
 *
 * Notifies the frame that app initialization is successful and is ready for user interaction.
 */
declare function notifySuccess(): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.notifyFailure app.notifyFailure(appInitializationFailedRequest: IFailedRequest): void} instead.
 *
 * Notifies the frame that app initialization has failed and to show an error page in its place.
 * @param appInitializationFailedRequest - The failure request containing the reason for why the app failed
 * during initialization as well as an optional message.
 */
declare function notifyFailure(appInitializationFailedRequest: IFailedRequest): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.notifyExpectedFailure app.notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void} instead.
 *
 * Notifies the frame that app initialized with some expected errors.
 * @param expectedFailureRequest - The expected failure request containing the reason and an optional message
 */
declare function notifyExpectedFailure(expectedFailureRequest: IExpectedFailureRequest): void;

type appInitialization_d_ExpectedFailureReason = ExpectedFailureReason;
declare const appInitialization_d_ExpectedFailureReason: typeof ExpectedFailureReason;
type appInitialization_d_FailedReason = FailedReason;
declare const appInitialization_d_FailedReason: typeof FailedReason;
type appInitialization_d_IExpectedFailureRequest = IExpectedFailureRequest;
type appInitialization_d_IFailedRequest = IFailedRequest;
declare const appInitialization_d_Messages: typeof Messages;
declare const appInitialization_d_notifyAppLoaded: typeof notifyAppLoaded;
declare const appInitialization_d_notifyExpectedFailure: typeof notifyExpectedFailure;
declare const appInitialization_d_notifyFailure: typeof notifyFailure;
declare const appInitialization_d_notifySuccess: typeof notifySuccess;
declare namespace appInitialization_d {
  export { appInitialization_d_ExpectedFailureReason as ExpectedFailureReason, appInitialization_d_FailedReason as FailedReason, type appInitialization_d_IExpectedFailureRequest as IExpectedFailureRequest, type appInitialization_d_IFailedRequest as IFailedRequest, appInitialization_d_Messages as Messages, appInitialization_d_notifyAppLoaded as notifyAppLoaded, appInitialization_d_notifyExpectedFailure as notifyExpectedFailure, appInitialization_d_notifyFailure as notifyFailure, appInitialization_d_notifySuccess as notifySuccess };
}

/**
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
declare namespace thirdPartyCloudStorage {
    /**
     * Interface to assemble file chunks
     * @beta
     */
    interface AssembleAttachment {
        /** A number representing the sequence of the attachment in the file chunks. */
        sequence: number;
        /** A Blob object representing the data of the file chunks. */
        file: Blob;
    }
    /**
     * Object used to represent a file
     * @beta
     *
     */
    interface FilesFor3PStorage extends Blob {
        /**
         * A number that represents the number of milliseconds since the Unix epoch
         */
        lastModified: number;
        /**
         * Name of the file
         */
        name: string;
        /**
         * file type
         */
        type: string;
        /**
         * A string containing the path of the file relative to the ancestor directory the user selected
         */
        webkitRelativePath?: string;
    }
    /**
     * File chunks an output of getDragAndDropFiles API from platform
     * @beta
     */
    interface FileChunk {
        /**
         * Base 64 data for the requested uri
         */
        chunk: string;
        /**
         * chunk sequence number
         */
        chunkSequence: number;
        /**
         * Indicates whether this chunk is the final segment of a file
         */
        endOfFile: boolean;
    }
    /**
     * Output of getDragAndDropFiles API from platform
     * @beta
     */
    interface FileResult {
        /**
         * Error encountered in getDragAndDropFiles API
         */
        error?: SdkError;
        /**
         * File chunk which will be assemebled and converted into a blob
         */
        fileChunk: FileChunk;
        /**
         * File index of the file for which chunk data is getting recieved
         */
        fileIndex: number;
        /**
         * File type/MIME type which is getting recieved
         */
        fileType: string;
        /**
         * Indicates whether this file is the last one in a sequence.
         */
        isLastFile: boolean;
        /**
         * The name of the file.
         */
        fileName: string;
    }
    /**
     * Defines the callback function received from Third Party App
     * @beta
     */
    interface DragAndDropFileCallback {
        /**
         * Definition of the callback which is received from third party app when calling {@link thirdPartyCloudStorage.getDragAndDropFiles}
         * An array of drag and dropped files {@link thirdPartyCloudStorage.FilesFor3PStorage}
         * Error encountered during the API call {@link SdkError}
         */
        (files: FilesFor3PStorage[], error?: SdkError): void;
    }
    /**
     * Get drag-and-drop files using a callback.
     *
     * @param {string} dragAndDropInput - unique id which is a combination of replyToId + threadId of teams chat and channel.
     *   Both replyToId and threadId can be fetched from application context.
     * @param {DragAndDropFileCallback} dragAndDropFileCallback - callback
     *   A callback function to handle the result of the operation
     * @beta
     */
    function getDragAndDropFiles(dragAndDropInput: string, dragAndDropFileCallback: DragAndDropFileCallback): void;
    /**
     * Checks if the thirdPartyCloudStorage capability is supported by the host
     * @returns boolean to represent whether the thirdPartyCloudStorage capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     * @beta
     */
    function isSupported(): boolean;
}

/** Type of callback used to indicate when {@link executeDeepLink} completes */
type executeDeepLinkOnCompleteFunctionType = (status: boolean, reason?: string) => void;
/** Callback function type */
type callbackFunctionType = () => void;
/** Get context callback function type */
type getContextCallbackFunctionType = (context: Context$1) => void;
/** Get tab instances callback function type */
type getTabInstancesCallbackFunctionType = (tabInfo: TabInformation) => void;
/** Register back button handler function type */
type registerBackButtonHandlerFunctionType = () => boolean;
/** Register full screen handler function type */
type registerFullScreenHandlerFunctionType = (isFullScreen: boolean) => void;
/** Register on theme change handler function type */
type registerOnThemeChangeHandlerFunctionType = (theme: string) => void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.initialize app.initialize(validMessageOrigins?: string[]): Promise\<void\>} instead.
 *
 * Initializes the library. This must be called before any other SDK calls
 * but after the frame is loaded successfully.
 * @param callback - Optionally specify a callback to invoke when Teams SDK has successfully initialized
 * @param validMessageOrigins - Optionally specify a list of cross-frame message origins. This parameter is used if you know that your app
 * will be hosted on a custom domain (i.e., not a standard Microsoft 365 host like Teams, Outlook, etc.) Most apps will never need
 * to pass a value for this parameter.
 * Any domains passed in the array must have the https: protocol on the string otherwise they will be ignored. Example: https://www.example.com
 */
declare function initialize(callback?: callbackFunctionType, validMessageOrigins?: string[]): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.enablePrintCapability teamsCore.enablePrintCapability(): void} instead.
 *
 * Enable print capability to support printing page using Ctrl+P and cmd+P
 */
declare function enablePrintCapability(): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.print teamsCore.print(): void} instead.
 *
 * Default print handler
 */
declare function print(): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.getContext app.getContext(): Promise\<app.Context\>} instead.
 *
 * Retrieves the current context the frame is running in.
 *
 * @param callback - The callback to invoke when the {@link Context} object is retrieved.
 */
declare function getContext(callback: getContextCallbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link app.registerOnThemeChangeHandler app.registerOnThemeChangeHandler(handler: registerOnThemeChangeHandlerFunctionType): void} instead.
 *
 * Registers a handler for theme changes.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user changes their theme.
 */
declare function registerOnThemeChangeHandler(handler: registerOnThemeChangeHandlerFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.registerFullScreenHandler pages.registerFullScreenHandler(handler: registerFullScreenHandlerFunctionType): void} instead.
 *
 * Registers a handler for changes from or to full-screen view for a tab.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user toggles full-screen view for a tab.
 */
declare function registerFullScreenHandler(handler: registerFullScreenHandlerFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onClick pages.appButton.onClick(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
declare function registerAppButtonClickHandler(handler: callbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onHoverEnter pages.appButton.onHoverEnter(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
declare function registerAppButtonHoverEnterHandler(handler: callbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.appButton.onHoverLeave pages.appButton.onHoverLeave(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 *
 */
declare function registerAppButtonHoverLeaveHandler(handler: callbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.backStack.registerBackButtonHandler pages.backStack.registerBackButtonHandler(handler: registerBackButtonHandlerFunctionType): void} instead.
 *
 * Registers a handler for user presses of the Team client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an app finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the Teams client to handle it instead.
 *
 * @param handler - The handler to invoke when the user presses their Team client's back button.
 */
declare function registerBackButtonHandler(handler: registerBackButtonHandlerFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.registerOnLoadHandler teamsCore.registerOnLoadHandler(handler: (context: LoadContext) => void): void} instead.
 *
 * @hidden
 * Registers a handler to be called when the page has been requested to load.
 *
 * @param handler - The handler to invoke when the page is loaded.
 */
declare function registerOnLoadHandler(handler: (context: LoadContext) => void): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link teamsCore.registerBeforeUnloadHandler teamsCore.registerBeforeUnloadHandler(handler: (readyToUnload: callbackFunctionType) => boolean): void} instead.
 *
 * @hidden
 * Registers a handler to be called before the page is unloaded.
 *
 * @param handler - The handler to invoke before the page is unloaded. If this handler returns true the page should
 * invoke the readyToUnload function provided to it once it's ready to be unloaded.
 */
declare function registerBeforeUnloadHandler(handler: (readyToUnload: callbackFunctionType) => boolean): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.registerFocusEnterHandler pages.registerFocusEnterHandler(handler: (navigateForward: boolean) => void): void} instead.
 *
 * @hidden
 * Registers a handler when focus needs to be passed from teams to the place of choice on app.
 *
 * @param handler - The handler to invoked by the app when they want the focus to be in the place of their choice.
 */
declare function registerFocusEnterHandler(handler: (navigateForward: boolean) => boolean): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.registerChangeConfigHandler pages.config.registerChangeConfigHandler(handler: callbackFunctionType): void} instead.
 *
 * Registers a handler for when the user reconfigurated tab.
 *
 * @param handler - The handler to invoke when the user click on Settings.
 */
declare function registerChangeSettingsHandler(handler: callbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.getTabInstances pages.tabs.getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve for this user tabs that are owned by this app.
 * If no TabInstanceParameters are passed, the app defaults to favorite teams and favorite channels.
 *
 * @param callback - The callback to invoke when the {@link TabInstanceParameters} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Flags that specify whether to scope call to favorite teams or channels.
 */
declare function getTabInstances(callback: getTabInstancesCallbackFunctionType, tabInstanceParameters?: TabInstanceParameters): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.getMruTabInstances pages.tabs.getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise\<TabInformation\>} instead.
 *
 * Allows an app to retrieve the most recently used tabs for this user.
 *
 * @param callback - The callback to invoke when the {@link TabInformation} object is retrieved.
 * @param tabInstanceParameters - OPTIONAL Ignored, kept for future use
 */
declare function getMruTabInstances(callback: getTabInstancesCallbackFunctionType, tabInstanceParameters?: TabInstanceParameters): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.shareDeepLink pages.shareDeepLink(deepLinkParameters: DeepLinkParameters): void} instead.
 *
 * Shares a deep link that a user can use to navigate back to a specific state in this page.
 *
 * @param deepLinkParameters - ID and label for the link and fallback URL.
 */
declare function shareDeepLink(deepLinkParameters: DeepLinkParameters): void;
/**
 * @deprecated
 * This function was previously used for opening various types of links. As of TeamsJS v2.0.0, it has been replaced with multiple different
 * functions depending on the type of link:
 *
 * - Use {@link pages.currentApp.navigateToDefaultPage} to navigate to the default page of your own app
 * - Use {@link pages.currentApp.navigateTo} to navigate to a section of your own app
 * - Use {@link pages.navigateToApp} to navigate to other apps besides your own
 * - Use {@link app.openLink} for opening deep links to other parts of the host (e.g., to chats or channels) or
 * general-purpose links (e.g., to external websites).
 *
 * @param deepLink deep link.
 */
declare function executeDeepLink(deepLink: string, onComplete?: executeDeepLinkOnCompleteFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.setCurrentFrame pages.setCurrentFrame(frameInfo: FrameInfo): void} instead.
 *
 * Set the current Frame Context
 *
 * @param frameContext - FrameContext information to be set
 */
declare function setFrameContext(frameContext: FrameContext): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.initializeWithFrameContext pages.initializeWithFrameContext(frameInfo: FrameInfo, callback?: callbackFunctionType, validMessageOrigins?: string[],): void} instead.
 *
 * Initialize with FrameContext
 *
 * @param frameContext - FrameContext information to be set
 * @param callback - The optional callback to be invoked be invoked after initilizing the frame context
 * @param validMessageOrigins -  Optionally specify a list of cross frame message origins.
 * They must have https: protocol otherwise they will be ignored. Example: https:www.example.com
 */
declare function initializeWithFrameContext(frameContext: FrameContext, callback?: callbackFunctionType, validMessageOrigins?: string[]): void;

/**
 * Navigation specific part of the SDK.
 */
/** Navigation on complete handler function type */
type onCompleteHandlerFunctionType = (status: boolean, reason?: string) => void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.returnFocus pages.returnFocus(navigateForward?: boolean): void} instead.
 *
 * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
 *
 * @param navigateForward - Determines the direction to focus in teams app.
 */
declare function returnFocus(navigateForward?: boolean): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.navigateToTab pages.tabs.navigateToTab(tabInstance: TabInstance): Promise\<void\>} instead.
 *
 * Navigates the Microsoft Teams app to the specified tab instance.
 *
 * @param tabInstance - The tab instance to navigate to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
declare function navigateToTab(tabInstance: TabInstance, onComplete?: onCompleteHandlerFunctionType): void;
/**
 * @deprecated
 * As of 2.0.0, this API is deprecated and can be replaced by the standard JavaScript
 * API, window.location.href, when navigating the app to a new cross-domain URL. Any URL
 * that is redirected to must be listed in the validDomains block of the manifest. Please
 * remove any calls to this API.
 * @param url - The URL to navigate the frame to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
declare function navigateCrossDomain(url: string, onComplete?: onCompleteHandlerFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.backStack.navigateBack pages.backStack.navigateBack(): Promise\<void\>} instead.
 *
 * Navigates back in the Teams client.
 * See registerBackButtonHandler for more information on when it's appropriate to use this method.
 *
 * @param onComplete - The callback to invoke when the action is complete.
 */
declare function navigateBack(onComplete?: onCompleteHandlerFunctionType): void;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config} namespace instead.
 *
 * Namespace to interact with the settings-specific part of the SDK.
 * This object is usable only on the settings frame.
 */
/** Register on remove handler function type */
type registerOnRemoveHandlerFunctionType = (evt: RemoveEvent) => void;
/** Register on save handler function type */
type registerOnSaveHandlerFunctionType = (evt: SaveEvent) => void;
/** Set settings on complete function type */
type setSettingsOnCompleteFunctionType = (status: boolean, reason?: string) => void;
/** Get settings callback function type */
type getSettingsCallbackFunctionType = (instanceSettings: Settings) => void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config} instead.
 * @remarks
 * Renamed to config in pages.Config
 */
type Settings = pages.InstanceConfig;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.SaveEvent} instead.
 * @remarks
 * See pages.SaveEvent
 */
type SaveEvent = pages.config.SaveEvent;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.RemoveEvent} instead.
 * @remarks
 * See pages.RemoveEvent
 */
type RemoveEvent = pages.config.RemoveEvent;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.SaveParameters} instead.
 * @remarks
 * See pages.SaveParameters
 */
type SaveParameters = pages.config.SaveParameters;

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.setValidityState pages.config.setValidityState(validityState: boolean): void} instead.
 *
 * Sets the validity state for the settings.
 * The initial value is false, so the user cannot save the settings until this is called with true.
 *
 * @param validityState - Indicates whether the save or remove button is enabled for the user.
 */
declare function setValidityState(validityState: boolean): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.getConfig pages.getConfig(): Promise\<InstanceConfig\>} instead.
 *
 * Gets the settings for the current instance.
 *
 * @param callback - The callback to invoke when the {@link Settings} object is retrieved.
 */
declare function getSettings(callback: getSettingsCallbackFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.setConfig pages.config.setConfig(instanceSettings: Config): Promise\<void\>} instead.
 *
 * Sets the settings for the current instance.
 * This is an asynchronous operation; calls to getSettings are not guaranteed to reflect the changed state.
 *
 * @param - Set the desired settings for this instance.
 */
declare function setSettings(instanceSettings: Settings, onComplete?: setSettingsOnCompleteFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.registerOnSaveHandler pages.config.registerOnSaveHandler(handler: registerOnSaveHandlerFunctionType): void} instead.
 *
 * Registers a handler for when the user attempts to save the settings. This handler should be used
 * to create or update the underlying resource powering the content.
 * The object passed to the handler must be used to notify whether to proceed with the save.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 *
 * @param handler - The handler to invoke when the user selects the save button.
 */
declare function registerOnSaveHandler(handler: registerOnSaveHandlerFunctionType): void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.config.registerOnRemoveHandler pages.config.registerOnRemoveHandler(handler: registerOnRemoveHandlerFunctionType): void} instead.
 *
 * Registers a handler for user attempts to remove content. This handler should be used
 * to remove the underlying resource powering the content.
 * The object passed to the handler must be used to indicate whether to proceed with the removal.
 * Only one handler may be registered at a time. Subsequent registrations will override the first.
 *
 * @param handler - The handler to invoke when the user selects the remove button.
 */
declare function registerOnRemoveHandler(handler: registerOnRemoveHandlerFunctionType): void;

type settings_d_RemoveEvent = RemoveEvent;
type settings_d_SaveEvent = SaveEvent;
type settings_d_SaveParameters = SaveParameters;
type settings_d_Settings = Settings;
declare const settings_d_getSettings: typeof getSettings;
type settings_d_getSettingsCallbackFunctionType = getSettingsCallbackFunctionType;
declare const settings_d_registerOnRemoveHandler: typeof registerOnRemoveHandler;
type settings_d_registerOnRemoveHandlerFunctionType = registerOnRemoveHandlerFunctionType;
declare const settings_d_registerOnSaveHandler: typeof registerOnSaveHandler;
type settings_d_registerOnSaveHandlerFunctionType = registerOnSaveHandlerFunctionType;
declare const settings_d_setSettings: typeof setSettings;
type settings_d_setSettingsOnCompleteFunctionType = setSettingsOnCompleteFunctionType;
declare const settings_d_setValidityState: typeof setValidityState;
declare namespace settings_d {
  export { type settings_d_RemoveEvent as RemoveEvent, type settings_d_SaveEvent as SaveEvent, type settings_d_SaveParameters as SaveParameters, type settings_d_Settings as Settings, settings_d_getSettings as getSettings, type settings_d_getSettingsCallbackFunctionType as getSettingsCallbackFunctionType, settings_d_registerOnRemoveHandler as registerOnRemoveHandler, type settings_d_registerOnRemoveHandlerFunctionType as registerOnRemoveHandlerFunctionType, settings_d_registerOnSaveHandler as registerOnSaveHandler, type settings_d_registerOnSaveHandlerFunctionType as registerOnSaveHandlerFunctionType, settings_d_setSettings as setSettings, type settings_d_setSettingsOnCompleteFunctionType as setSettingsOnCompleteFunctionType, settings_d_setValidityState as setValidityState };
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link dialog} namespace instead.
 *
 * Namespace to interact with the task module-specific part of the SDK.
 * This object is usable only on the content frame.
 * The tasks namespace will be deprecated. Please use dialog for future developments.
 */
declare namespace tasks {
    /**
     * Function type that is used to receive the result when a task module is submitted by
     * calling {@link tasks.submitTask tasks.submitTask(result?: string | object, appIds?: string | string[]): void}
     *
     * @param err - If the task module failed, this string contains the reason for failure. If the task module succeeded, this value is the empty string.
     * @param result - On success, this is the value passed to the `result` parameter of {@link tasks.submitTask tasks.submitTask(result?: string | object, appIds?: string | string[]): void}. On failure, this is the empty string.
     */
    type startTaskSubmitHandlerFunctionType = (err: string, result: string | object) => void;
    /**
     * @deprecated
     * As of 2.8.0:
     * - For url-based dialogs, please use {@link dialog.url.open dialog.url.open(urlDialogInfo: UrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void} .
     * - For url-based dialogs with bot interaction, please use {@link dialog.url.bot.open dialog.url.bot.open(botUrlDialogInfo: BotUrlDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void}
     * - For Adaptive Card-based dialogs:
     *   - In Teams, please continue to use this function until the new functions in {@link dialog.adaptiveCard} have been fully implemented. You can tell at runtime when they are implemented in Teams by checking
     *     the return value of the {@link dialog.adaptiveCard.isSupported} function. This documentation line will also be removed once they have been fully implemented in Teams.
     *   - In all other hosts, please use {@link dialog.adaptiveCard.open dialog.adaptiveCard.open(cardDialogInfo: CardDialogInfo, submitHandler?: DialogSubmitHandler, messageFromChildHandler?: PostMessageChannel): void}
     *
     * Allows an app to open the task module.
     *
     * @param taskInfo - An object containing the parameters of the task module
     * @param submitHandler - Handler to call when the task module is completed
     */
    function startTask(taskInfo: TaskInfo, submitHandler?: startTaskSubmitHandlerFunctionType): IAppWindow;
    /**
     * @deprecated
     * As of TeamsJS v2.0.0, please use {@link dialog.update.resize dialog.update.resize(dimensions: DialogSize): void} instead.
     *
     * Update height/width task info properties.
     *
     * @param taskInfo - An object containing width and height properties
     */
    function updateTask(taskInfo: TaskInfo): void;
    /**
     * @deprecated
     * As of 2.8.0, please use {@link dialog.url.submit} instead.
     *
     * Submit the task module.
     *
     * @param result - Contains the result to be sent to the bot or the app. Typically a JSON object or a serialized version of it
     * @param appIds - Valid application(s) that can receive the result of the submitted dialogs. Specifying this parameter helps prevent malicious apps from retrieving the dialog result. Multiple app IDs can be specified because a web app from a single underlying domain can power multiple apps across different environments and branding schemes.
     */
    function submitTask(result?: string | object, appIds?: string | string[]): void;
    /**
     * Sets the height and width of the {@link TaskInfo} object to the original height and width, if initially specified,
     * otherwise uses the height and width values corresponding to {@link DialogDimension | TaskModuleDimension.Small}
     * @param taskInfo TaskInfo object from which to extract size info, if specified
     * @returns TaskInfo with height and width specified
     */
    function getDefaultSizeIfNotProvided(taskInfo: TaskInfo): TaskInfo;
}

/**
 * APIs involving Live Share, a framework for building real-time collaborative apps.
 * For more information, visit https://aka.ms/teamsliveshare
 *
 * @see LiveShareHost
 */
declare namespace liveShare {
    /**
     * @hidden
     * The meeting roles of a user.
     * Used in Live Share for its role verification feature.
     * For more information, visit https://learn.microsoft.com/microsoftteams/platform/apps-in-teams-meetings/teams-live-share-capabilities?tabs=javascript#role-verification-for-live-data-structures
     */
    enum UserMeetingRole {
        /**
         * Guest role.
         */
        guest = "Guest",
        /**
         * Attendee role.
         */
        attendee = "Attendee",
        /**
         * Presenter role.
         */
        presenter = "Presenter",
        /**
         * Organizer role.
         */
        organizer = "Organizer"
    }
    /**
     * @hidden
     * State of the current Live Share session's Fluid container.
     * This is used internally by the `LiveShareClient` when joining a Live Share session.
     */
    enum ContainerState {
        /**
         * The call to `LiveShareHost.setContainerId()` successfully created the container mapping
         * for the current Live Share session.
         */
        added = "Added",
        /**
         * A container mapping for the current Live Share session already exists.
         * This indicates to Live Share that a new container does not need be created.
         */
        alreadyExists = "AlreadyExists",
        /**
         * The call to `LiveShareHost.setContainerId()` failed to create the container mapping.
         * This happens when another client has already set the container ID for the session.
         */
        conflict = "Conflict",
        /**
         * A container mapping for the current Live Share session does not yet exist.
         * This indicates to Live Share that a new container should be created.
         */
        notFound = "NotFound"
    }
    /**
     * @hidden
     * Returned from `LiveShareHost.getFluidContainerId()` and `LiveShareHost.setFluidContainerId`.
     * This response specifies the container mapping information for the current Live Share session.
     */
    interface IFluidContainerInfo {
        /**
         * State of the containerId mapping.
         */
        containerState: ContainerState;
        /**
         * ID of the container to join for the meeting. Undefined if the container hasn't been
         * created yet.
         */
        containerId: string | undefined;
        /**
         * If true, the local client should create the container and then save the created containers
         * ID to the mapping service.
         */
        shouldCreate: boolean;
        /**
         * If `containerId` is undefined and `shouldCreate` is false, the container isn't ready
         * but another client is creating it. In this case, the local client should wait the specified
         * amount of time before calling `LiveShareHost.getFluidContainerId()` again.
         */
        retryAfter: number;
    }
    /**
     * @hidden
     * Returned from `LiveShareHost.getNtpTime()` to specify the global timestamp for the current
     * Live Share session.
     */
    interface INtpTimeInfo {
        /**
         * ISO 8601 formatted server time. For example: '2019-09-07T15:50-04:00'
         */
        ntpTime: string;
        /**
         * Server time expressed as the number of milliseconds since the ECMAScript epoch.
         */
        ntpTimeInUTC: number;
    }
    /**
     * @hidden
     * Returned from `LiveShareHost.getFluidTenantInfo()` to specify the Fluid service to use for the
     * current Live Share session.
     */
    interface IFluidTenantInfo {
        /**
         * The Fluid Tenant ID Live Share should use.
         */
        tenantId: string;
        /**
         * The Fluid service endpoint Live Share should use.
         */
        serviceEndpoint: string;
    }
    /**
     * @hidden
     * Returned from `LiveShareHost.getClientInfo()` to specify the client info for a
     * particular client in a Live Share session.
     */
    interface IClientInfo {
        /**
         * The host user's `userId` associated with a given `clientId`
         */
        userId: string;
        /**
         * User's meeting roles associated with a given `clientId`
         */
        roles: UserMeetingRole[];
        /**
         * The user's display name associated with a given `clientId`.
         * If this returns as `undefined`, the user may need to update their host client.
         */
        displayName?: string;
    }
    /**
     * Checks if the interactive capability is supported by the host
     * @returns boolean to represent whether the interactive capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    function isSupported(): boolean;
}
/**
 * Live Share host implementation for connecting to real-time collaborative sessions.
 * Designed for use with the `LiveShareClient` class in the `@microsoft/live-share` package.
 * Learn more at https://aka.ms/teamsliveshare
 *
 * @remarks
 * The `LiveShareClient` class from Live Share uses the hidden API's to join/manage the session.
 * To create a new `LiveShareHost` instance use the static `LiveShareHost.create()` function.
 */
declare class LiveShareHost {
    /**
     * @hidden
     * Returns the Fluid Tenant connection info for user's current context.
     */
    getFluidTenantInfo(): Promise<liveShare.IFluidTenantInfo>;
    /**
     * @hidden
     * Returns the fluid access token for mapped container Id.
     *
     * @param containerId Fluid's container Id for the request. Undefined for new containers.
     * @returns token for connecting to Fluid's session.
     */
    getFluidToken(containerId?: string): Promise<string>;
    /**
     * @hidden
     * Returns the ID of the fluid container associated with the user's current context.
     */
    getFluidContainerId(): Promise<liveShare.IFluidContainerInfo>;
    /**
     * @hidden
     * Sets the ID of the fluid container associated with the current context.
     *
     * @remarks
     * If this returns false, the client should delete the container they created and then call
     * `getFluidContainerId()` to get the ID of the container being used.
     * @param containerId ID of the fluid container the client created.
     * @returns A data structure with a `containerState` indicating the success or failure of the request.
     */
    setFluidContainerId(containerId: string): Promise<liveShare.IFluidContainerInfo>;
    /**
     * @hidden
     * Returns the shared clock server's current time.
     */
    getNtpTime(): Promise<liveShare.INtpTimeInfo>;
    /**
     * @hidden
     * Associates the fluid client ID with a set of user roles.
     *
     * @param clientId The ID for the current user's Fluid client. Changes on reconnects.
     * @returns The roles for the current user.
     */
    registerClientId(clientId: string): Promise<liveShare.UserMeetingRole[]>;
    /**
     * @hidden
     * Returns the roles associated with a client ID.
     *
     * @param clientId The Client ID the message was received from.
     * @returns The roles for a given client. Returns `undefined` if the client ID hasn't been registered yet.
     */
    getClientRoles(clientId: string): Promise<liveShare.UserMeetingRole[] | undefined>;
    /**
     * @hidden
     * Returns the `IClientInfo` associated with a client ID.
     *
     * @param clientId The Client ID the message was received from.
     * @returns The info for a given client. Returns `undefined` if the client ID hasn't been registered yet.
     */
    getClientInfo(clientId: string): Promise<liveShare.IClientInfo | undefined>;
    /**
     * Factories a new `LiveShareHost` instance for use with the `LiveShareClient` class
     * in the `@microsoft/live-share` package.
     *
     * @remarks
     * `app.initialize()` must first be called before using this API.
     * This API can only be called from `meetingStage` or `sidePanel` contexts.
     */
    static create(): LiveShareHost;
}

/**
 * @hidden
 * Namespace for an app to support a checkout flow by interacting with the marketplace cart in the host.
 * @beta
 */
declare namespace marketplace {
    /**
     * @hidden
     * the version of the current cart interface
     * which is forced to send to the host in the calls.
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     */
    export const cartVersion: CartVersion;
    /**
     * @hidden
     * Represents the cart object for the app checkout flow.
     * @beta
     */
    export interface Cart {
        /**
         * @hidden
         * Version of the cart.
         */
        readonly version: CartVersion;
        /**
         * @hidden
         * The uuid of the cart.
         */
        readonly id: string;
        /**
         * @hidden
         * The cart info.
         */
        readonly cartInfo: CartInfo;
        /**
         * @hidden
         * The cart items.
         */
        readonly cartItems: CartItem[];
    }
    /**
     * @hidden
     * Version of the cart that is used by the app.
     * @internal
     * Limited to Microsoft-internal use
     * @beta
     */
    interface CartVersion {
        /**
         * @hidden
         * Represents the major version of a cart, it
         * not compatible with the previous major version.
         */
        readonly majorVersion: number;
        /**
         * @hidden
         * The minor version of a cart, which is compatible
         * with the previous minor version in the same major version.
         */
        readonly minorVersion: number;
    }
    /**
     * @hidden
     * Represents the cart information
     * @beta
     */
    interface CartInfo {
        /**
         * @hidden
         * The country market where the products are selling.
         * Should be country code in ISO 3166-1 alpha-2 format, e.g. CA for Canada.
         * https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
         */
        readonly market: string;
        /**
         * @hidden
         * The identifier to tell the cart is checked out by admin or end user.
         */
        readonly intent: Intent;
        /**
         * @hidden
         * Locale the app should render for the user
         * Should be a BCP 47 language tag, e.g. en-US ([primary tag]-[ISO 3166-1 alpha-2 code]).
         * https://en.wikipedia.org/wiki/IETF_language_tag
         */
        readonly locale: string;
        /**
         * @hidden
         * The status of the cart.
         */
        readonly status: CartStatus;
        /**
         * @hidden
         * ISO 4217 currency code for the cart item price, e.g. USD for US Dollar.
         * https://en.wikipedia.org/wiki/ISO_4217
         */
        readonly currency: string;
        /**
         * @hidden
         * ISO 8601 timestamp string in UTC, indicates when the cart is created.
         * e.g. 2023-06-19T22:06:59Z
         * https://en.wikipedia.org/wiki/ISO_8601
         */
        readonly createdAt: string;
        /**
         * @hidden
         * ISO 8601 timestamp string in UTC, indicates when the cart is updated.
         * e.g. 2023-06-19T22:06:59Z
         * https://en.wikipedia.org/wiki/ISO_8601
         */
        readonly updatedAt: string;
    }
    /**
     * @hidden
     * Represents the basic cart item information.
     * @beta
     */
    export interface Item {
        /**
         * @hidden
         * The id of the cart item.
         */
        readonly id: string;
        /**
         * @hidden
         * The display name of the cart item.
         */
        readonly name: string;
        /**
         * @hidden
         * The quantity of the cart item.
         */
        readonly quantity: number;
        /**
         * @hidden
         * The price of the single cart item.
         */
        readonly price: number;
        /**
         * @hidden
         * The thumbnail imageURL of the cart item.
         */
        readonly imageURL?: URL;
    }
    /**
     * @hidden
     * Represents the cart item that could have accessories
     * @beta
     */
    export interface CartItem extends Item {
        /**
         * @hidden
         * Accessories to the item if existing.
         */
        readonly accessories?: Item[];
        /**
         * @hidden
         * The thumbnail imageURL of the cart item.
         */
        readonly imageURL?: URL;
    }
    /**
     * @hidden
     * Represents the persona creating the cart.
     * @beta
     */
    export enum Intent {
        /**
         * @hidden
         * The cart is created by admin of an organization in Teams Admin Center.
         */
        TACAdminUser = "TACAdminUser",
        /**
         * @hidden
         * The cart is created by admin of an organization in Teams.
         */
        TeamsAdminUser = "TeamsAdminUser",
        /**
         * @hidden
         * The cart is created by end user of an organization in Teams.
         */
        TeamsEndUser = "TeamsEndUser"
    }
    /**
     * @hidden
     * Represents the status of the cart.
     * @beta
     */
    export enum CartStatus {
        /**
         * @hidden
         * Cart is created but not checked out yet.
         */
        Open = "Open",
        /**
         * @hidden
         * Cart is checked out but not completed yet.
         */
        Processing = "Processing",
        /**
         * @hidden
         * Indicate checking out is completed and the host should
         * return a new cart in the next getCart call.
         */
        Processed = "Processed",
        /**
         * @hidden
         * Indicate checking out process is manually cancelled by the user
         */
        Closed = "Closed",
        /**
         * @hidden
         * Indicate checking out is failed and the host should
         * return a new cart in the next getCart call.
         */
        Error = "Error"
    }
    /**
     * @hidden
     * Represents the parameters to update the cart items.
     * @beta
     */
    export interface AddOrUpdateCartItemsParams {
        /**
         * @hidden
         * The uuid of the cart to be updated, target on the cart
         * being checked out  if cartId is not provided.
         */
        cartId?: string;
        /**
         * @hidden
         * A list of cart items object, for each item,
         * if item id exists in the cart, overwrite the item price and quantity,
         * otherwise add new items to cart.
         */
        cartItems: CartItem[];
    }
    /**
     * @hidden
     * Represents the parameters to remove the cart items.
     * @beta
     */
    export interface RemoveCartItemsParams {
        /**
         * @hidden
         * The uuid of the cart to be updated, target on the cart
         * being checked out if cartId is not provided.
         */
        cartId?: string;
        /**
         * @hidden
         * A list of cart id, delete the cart item accordingly.
         */
        cartItemIds: string[];
    }
    /**
     * @hidden
     * Represents the parameters to update the cart status.
     * @beta
     */
    export interface UpdateCartStatusParams {
        /**
         * @hidden
         * The uuid of the cart to be updated, target on the cart
         * being checked out if cartId is not provided.
         */
        cartId?: string;
        /**
         * @hidden
         * Status of the cart.
         */
        cartStatus: CartStatus;
        /**
         * @hidden
         * Extra info to the status.
         */
        statusInfo?: string;
    }
    /**
     * @hidden
     * Get the cart object owned by the host to checkout.
     * @returns A promise of the cart object in the cartVersion.
     * @beta
     */
    export function getCart(): Promise<Cart>;
    /**
     * @hidden
     * Add or update cart items in the cart owned by the host.
     * @param addOrUpdateCartItemsParams Represents the parameters to update the cart items.
     * @returns A promise of the updated cart object in the cartVersion.
     * @beta
     */
    export function addOrUpdateCartItems(addOrUpdateCartItemsParams: AddOrUpdateCartItemsParams): Promise<Cart>;
    /**
     * @hidden
     * Remove cart items from the cart owned by the host.
     * @param removeCartItemsParams The parameters to remove the cart items.
     * @returns A promise of the updated cart object in the cartVersion.
     * @beta
     */
    export function removeCartItems(removeCartItemsParams: RemoveCartItemsParams): Promise<Cart>;
    /**
     * @hidden
     * Update cart status in the cart owned by the host.
     * @param updateCartStatusParams The parameters to update the cart status.
     * @returns A promise of the updated cart object in the cartVersion.
     * @beta
     */
    export function updateCartStatus(updateCartStatusParams: UpdateCartStatusParams): Promise<Cart>;
    /**
     * @hidden
     * Checks if the marketplace capability is supported by the host.
     * @returns Boolean to represent whether the marketplace capability is supported.
     * @throws Error if {@linkcode app.initialize} has not successfully completed.
     * @beta
     */
    export function isSupported(): boolean;
    export {  };
}

/**
 * @hidden
 * Namespace to delegate authentication requests to the host for custom engine agents
 * @internal
 * Limited to Microsoft-internal use
 * @beta
 */
declare namespace externalAppAuthenticationForCEA {
    /**
     * @beta
     * @hidden
     * Signals to the host to perform SSO authentication for the application specified by the app ID, and then send the authResult to the application backend.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
     * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
     * @param authTokenRequest Parameters for SSO authentication
     * @throws InvokeError if the host encounters an error while authenticating
     * @returns A promise that resolves when authentication succeeds and rejects with InvokeError on failure
     */
    function authenticateWithSSO(appId: AppId, conversationId: string, authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters): Promise<void>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform authentication using the given authentication parameters and then send the auth result to the application backend.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
     * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
     * @param authenticateParameters Parameters for the authentication pop-up
     * @throws InvokeError if the host encounters an error while authenticating
     * @returns A promise that resolves from the application backend and rejects with InvokeError if the host encounters an error while authenticating
     */
    function authenticateWithOauth(appId: AppId, conversationId: string, authenticateParameters: externalAppAuthentication.AuthenticatePopUpParameters): Promise<void>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform authentication using the given authentication parameters and then resend the request to the application backend with the authentication result.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
     * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
     * @param authenticateParameters Parameters for the authentication pop-up
     * @param originalRequestInfo Information about the original request that should be resent
     * @throws InvokeError if the host encounters an error while authenticating or resending the request
     * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
     */
    function authenticateAndResendRequest(appId: AppId, conversationId: string, authenticateParameters: externalAppAuthentication.AuthenticatePopUpParameters, originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest): Promise<externalAppAuthentication.IActionExecuteResponse>;
    /**
     * @beta
     * @hidden
     * Signals to the host to perform SSO authentication for the application specified by the app ID and then resend the request to the application backend with the authentication result and originalRequestInfo
     * @internal
     * Limited to Microsoft-internal use
     * @param appId App ID of the app upon whose behalf Copilot is requesting authentication. This must be a UUID.
     * @param conversationId ConversationId To tell the bot what conversation the calls are coming from
     * @param authTokenRequest Parameters for SSO authentication
     * @param originalRequestInfo Information about the original request that should be resent
     * @throws InvokeError if the host encounters an error while authenticating or resending the request
     * @returns A promise that resolves to the IActionExecuteResponse from the application backend and rejects with InvokeError if the host encounters an error while authenticating or resending the request
     */
    function authenticateWithSSOAndResendRequest(appId: AppId, conversationId: string, authTokenRequest: externalAppAuthentication.AuthTokenRequestParameters, originalRequestInfo: externalAppAuthentication.IActionExecuteInvokeRequest): Promise<externalAppAuthentication.IActionExecuteResponse>;
    /**
     * @beta
     * @hidden
     * Checks if the externalAppAuthenticationForCEA capability is supported by the host
     * @returns boolean to represent whether externalAppAuthenticationForCEA capability is supported
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @hidden
 * Error codes that can be thrown from externalAppCommands and externalAppCardCommands Action Submit specifically
 * @internal
 * Limited to Microsoft-internal use
 */
declare enum ExternalAppErrorCode {
    INTERNAL_ERROR = "INTERNAL_ERROR"
}

/**
 * @hidden
 * Namespace to delegate adaptive card action execution to the host
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace externalAppCardActions {
    /**
     * @hidden
     * The type of deeplink action that was executed by the host
     * @internal
     * Limited to Microsoft-internal use
     */
    enum ActionOpenUrlType {
        DeepLinkDialog = "DeepLinkDialog",
        DeepLinkOther = "DeepLinkOther",
        DeepLinkStageView = "DeepLinkStageView",
        GenericUrl = "GenericUrl"
    }
    /**
     * @beta
     * @hidden
     * Error that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
     * and IExternalAppCardActionForCEAService.handleActionOpenUrl
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface ActionOpenUrlError {
        errorCode: ActionOpenUrlErrorCode;
        message?: string;
    }
    /**
     * @beta
     * @hidden
     * Error codes that can be thrown from IExternalAppCardActionService.handleActionOpenUrl
     * and IExternalAppCardActionForCEAService.handleActionOpenUrl
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum ActionOpenUrlErrorCode {
        INTERNAL_ERROR = "INTERNAL_ERROR",
        INVALID_LINK = "INVALID_LINK",
        NOT_SUPPORTED = "NOT_SUPPORTED"
    }
    /**
     * @beta
     * @hidden
     * The payload that is used when executing an Adaptive Card Action.Submit
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface IAdaptiveCardActionSubmit {
        id: string;
        data: string | Record<string, unknown>;
    }
    /**
     * @beta
     * @hidden
     * Error that can be thrown from IExternalAppCardActionService.handleActionSubmit
     * and IExternalAppCardActionForCEAService.handleActionSubmit
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface ActionSubmitError {
        errorCode: ExternalAppErrorCode;
        message?: string;
    }
    /**
     * @beta
     * @hidden
     * Delegates an Adaptive Card Action.Submit request to the host for the application with the provided app ID
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application the request is intended for. This must be a UUID
     * @param actionSubmitPayload The Adaptive Card Action.Submit payload
     * @param cardActionsConfig The card actions configuration. This indicates which subtypes should be handled by this API
     * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
     */
    function processActionSubmit(appId: string, actionSubmitPayload: IAdaptiveCardActionSubmit): Promise<void>;
    /**
     * @beta
     * @hidden
     * Delegates an Adaptive Card Action.OpenUrl request to the host for the application with the provided app ID.
     * If `fromElement` is not provided, the information from the manifest is used to determine whether the URL can
     * be processed by the host. Deep link URLs for plugins are not supported and will result in an error.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application the request is intended for. This must be a UUID
     * @param url The URL to open
     * @param fromElement The element on behalf of which the M365 app is making the request.
     * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
     */
    function processActionOpenUrl(appId: string, url: URL, fromElement?: {
        name: 'composeExtensions' | 'plugins';
    }): Promise<ActionOpenUrlType>;
    /**
     * @hidden
     * Checks if the externalAppCardActions capability is supported by the host
     * @returns boolean to represent whether externalAppCardActions capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @beta
 * @hidden
 * Namespace to delegate adaptive card action for Custom Engine Agent execution to the host
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace externalAppCardActionsForCEA {
    /**
     * @beta
     * @hidden
     * Delegates an Adaptive Card Action.OpenUrl request to the host for the application with the provided app ID.
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application the request is intended for. This must be a UUID
     * @param conversationId To tell the bot what conversation the calls are coming from
     * @param url The URL to open
     * @throws Error if the response has not successfully completed
     * @returns Promise that resolves to ActionOpenUrlType indicating the type of URL that was opened on success and rejects with ActionOpenUrlError if the request fails
     */
    function processActionOpenUrl(appId: AppId, conversationId: string, url: URL): Promise<externalAppCardActions.ActionOpenUrlType>;
    /**
     * @beta
     * @hidden
     * Delegates an Adaptive Card Action.Submit request to the host for the application with the provided app ID
     * @internal
     * Limited to Microsoft-internal use
     * @param appId ID of the application the request is intended for. This must be a UUID
     * @param conversationId To tell the bot what conversation the calls are coming from
     * @param actionSubmitPayload The Adaptive Card Action.Submit payload
     * @throws Error if host notifies of an error
     * @returns Promise that resolves when the request is completed and rejects with ActionSubmitError if the request fails
     */
    function processActionSubmit(appId: AppId, conversationId: string, actionSubmitPayload: externalAppCardActions.IAdaptiveCardActionSubmit): Promise<void>;
    /**
     * @beta
     * @hidden
     * Checks if the externalAppCardActionsForCEA capability is supported by the host
     * @returns boolean to represent whether externalAppCardActions capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @hidden
 * Namespace to delegate the ActionCommand to the host
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
declare namespace externalAppCommands {
    /**
     * @hidden
     * The payload of IActionCommandResponse
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    type IActionCommandResponse = ITextActionCommandResponse | ICardActionCommandResponse;
    /**
     * @hidden
     * The payload of IBaseActionCommandResponse
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    interface IBaseActionCommandResponse {
        taskModuleClosedReason: TaskModuleClosedReason;
    }
    /**
     * @hidden
     * The text result type
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    interface ITextActionCommandResponse extends IBaseActionCommandResponse {
        resultType: 'text';
        text: string | undefined;
    }
    /**
     * @hidden
     * The card result type
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    interface ICardActionCommandResponse extends IBaseActionCommandResponse {
        resultType: 'card';
        attachmentLayout: externalAppAuthentication.AttachmentLayout;
        attachments: externalAppAuthentication.QueryMessageExtensionAttachment[];
    }
    /**
     * @hidden
     * The result type for the ActionCommandResultType
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    type ActionCommandResultType = 'card' | 'text';
    /**
     * @hidden
     * The reason for the TaskModuleClosedReason
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    type TaskModuleClosedReason = 'Done' | 'CancelledByUser';
    /**
     *
     * @hidden
     * Error that can be thrown from IExternalAppCommandsService.processActionCommand
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    interface ActionCommandError {
        errorCode: ExternalAppErrorCode;
        message?: string;
    }
    /**
     * @internal
     * Limited to Microsoft-internal use
     * @hidden
     * This API delegates an ActionCommand request to the host for the application with the provided following parameters:
     *
     * @param appId ID of the application the request is intended for. This must be a UUID
     * @param commandId extensibilityProvider use this ID to look up the command declared by ActionME
     * @param extractedParameters are the key-value pairs that the dialog will be prepopulated with
     *
     * @returns Promise that resolves with the {@link IActionCommandResponse} when the request is completed and rejects with {@link ActionCommandError} if the request fails
     *
     * @beta
     */
    function processActionCommand(appId: string, commandId: string, extractedParameters: Record<string, string>): Promise<IActionCommandResponse>;
    /**
     * @hidden
     * Checks if the externalAppCommands capability is supported by the host
     * @returns boolean to represent whether externalAppCommands capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     *
     * @beta
     */
    function isSupported(): boolean;
}

declare namespace files {
    /**
     * @hidden
     *
     * Cloud storage providers registered with Microsoft Teams
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum CloudStorageProvider {
        Dropbox = "DROPBOX",
        Box = "BOX",
        Sharefile = "SHAREFILE",
        GoogleDrive = "GOOGLEDRIVE",
        Egnyte = "EGNYTE",
        SharePoint = "SharePoint"
    }
    interface IWopiThumbnail {
        size: number;
        url: string;
    }
    interface IWopiService {
        name: string;
        description: string;
        thumbnails: IWopiThumbnail[];
    }
    /**
     * @hidden
     *
     * External third-party cloud storages providers interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IExternalProvider extends IWopiService {
        providerType: CloudStorageProviderType;
        providerCode: CloudStorageProvider;
    }
    /**
     * @hidden
     *
     * Cloud storage provider type enums
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum CloudStorageProviderType {
        Sharepoint = 0,
        WopiIntegration = 1,
        Google = 2,
        OneDrive = 3,
        Recent = 4,
        Aggregate = 5,
        FileSystem = 6,
        Search = 7,
        AllFiles = 8,
        SharedWithMe = 9
    }
    /**
     * @hidden
     *
     * Cloud storage folder interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageFolder {
        /**
         * @hidden
         * ID of the cloud storage folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        id: string;
        /**
         * @hidden
         * Display Name/Title of the cloud storage folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        title: string;
        /**
         * @hidden
         * ID of the cloud storage folder in the provider
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        folderId: string;
        /**
         * @hidden
         * Type of the cloud storage folder provider integration
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        providerType: CloudStorageProviderType;
        /**
         * @hidden
         * Code of the supported cloud storage folder provider
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        providerCode: CloudStorageProvider;
        /**
         * @hidden
         * Display name of the owner of the cloud storage folder provider
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        ownerDisplayName: string;
        /**
         * @hidden
         * Sharepoint specific siteURL of the folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        siteUrl?: string;
        /**
         * @hidden
         * Sharepoint specific serverRelativeUrl of the folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        serverRelativeUrl?: string;
        /**
         * @hidden
         * Sharepoint specific libraryType of the folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        libraryType?: string;
        /**
         * @hidden
         * Sharepoint specific accessType of the folder
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        accessType?: string;
    }
    /**
     * @hidden
     *
     * Cloud storage item interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageFolderItem {
        /**
         * @hidden
         * ID of the item in the provider
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        id: string;
        /**
         * @hidden
         * Display name/title
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        title: string;
        /**
         * @hidden
         * Key to differentiate files and subdirectory
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        isSubdirectory: boolean;
        /**
         * @hidden
         * File extension
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        type: string;
        /**
         * @hidden
         * Last modifed time of the item
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        lastModifiedTime: string;
        /**
         * @hidden
         * Display size of the items in bytes
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        size: number;
        /**
         * @hidden
         * URL of the file
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        objectUrl: string;
        /**
         * @hidden
         * Temporary access token for the item
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        accessToken?: string;
    }
    /**
     * @hidden
     *
     * Files entity user interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IFilesEntityUser {
        /**
         * @hidden
         * User name.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        displayName: string;
        /**
         * @hidden
         * User email.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        email: string;
        /**
         * @hidden
         * User MRI.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        mri: string;
    }
    /**
     * @hidden
     *
     * Special Document Library enum
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum SpecialDocumentLibraryType {
        ClassMaterials = "classMaterials"
    }
    /**
     * @hidden
     *
     * Document Library Access enum
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum DocumentLibraryAccessType {
        Readonly = "readonly"
    }
    /**
     * @hidden
     *
     * SharePoint file interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface ISharePointFile {
        siteId?: string;
        siteUrl: string;
        objectId: string;
        objectUrl: string;
        openInWindowFileUrl: string;
        title: string;
        isFolder: boolean;
        serverRelativeUrl: string;
        lastModifiedByUser: IFilesEntityUser;
        lastModifiedTime: string;
        sentByUser: IFilesEntityUser;
        createdByUser: IFilesEntityUser;
        createdTime: string;
        size: number;
        type: string;
        spItemUrl?: string;
        libraryType?: SpecialDocumentLibraryType;
        accessType?: DocumentLibraryAccessType;
        etag?: string;
        remoteItem?: string;
        listUrl?: string;
    }
    /**
     * @hidden
     *
     * Download status enum
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum FileDownloadStatus {
        Downloaded = "Downloaded",
        Downloading = "Downloading",
        Failed = "Failed"
    }
    /**
     * @hidden
     *
     * Download Files interface
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface IFileItem {
        /**
         * @hidden
         * ID of the file metadata
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        objectId?: string;
        /**
         * @hidden
         * Path of the file
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        path?: string;
        /**
         * @hidden
         * Size of the file in bytes
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        sizeInBytes?: number;
        /**
         * @hidden
         * Download status
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        status?: FileDownloadStatus;
        /**
         * @hidden
         * Download timestamp
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        timestamp: Date;
        /**
         * @hidden
         * File name
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        title: string;
        /**
         * @hidden
         * Type of file i.e. the file extension.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        extension: string;
    }
    /**
     * @hidden
     * Object used to represent a file
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface File extends Blob {
        /**
         * A number that represents the number of milliseconds since the Unix epoch
         */
        lastModified: number;
        /**
         * Name of the file
         */
        name: string;
        /**
         * A string containing the path of the file relative to the ancestor directory the user selected
         */
        webkitRelativePath?: string;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Actions specific to 3P cloud storage provider file and / or account
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export enum CloudStorageProviderFileAction {
        Download = "DOWNLOAD",
        Upload = "UPLOAD",
        Delete = "DELETE"
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Interface for 3P cloud storage provider request content type
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderRequest<T> {
        content: T;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Base interface for 3P cloud storage provider action request content
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderContent {
        providerCode: CloudStorageProvider;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Interface representing 3P cloud storage provider add new file action.
     * The file extension represents type of file e.g. docx, pptx etc. and need not be prefixed with dot(.)
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderNewFileContent extends CloudStorageProviderContent {
        newFileName: string;
        newFileExtension: string;
        destinationFolder: CloudStorageFolderItem | ISharePointFile;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Interface representing 3P cloud storage provider rename existing file action
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderRenameFileContent extends CloudStorageProviderContent {
        existingFile: CloudStorageFolderItem | ISharePointFile;
        newFile: CloudStorageFolderItem | ISharePointFile;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Interface representing 3P cloud storage provider delete existing file(s) action
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderDeleteFileContent extends CloudStorageProviderContent {
        itemList: CloudStorageFolderItem[] | ISharePointFile[];
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Interface representing 3P cloud storage provider download existing file(s) action
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderDownloadFileContent extends CloudStorageProviderContent {
        itemList: CloudStorageFolderItem[] | ISharePointFile[];
    }
    /**
     * @hidden
     * Hide from docs
     * @beta
     *
     * Interface representing 3P cloud storage provider upload existing file(s) action
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface CloudStorageProviderUploadFileContent extends CloudStorageProviderContent {
        itemList: File[];
        destinationFolder: CloudStorageFolderItem | ISharePointFile;
    }
    /**
     * @hidden
     * Hide from docs
     *
     * Gets a list of cloud storage folders added to the channel. This function will not timeout;
     * the callback will only return when the host responds with a list of folders or error.
     *
     * @param channelId - ID of the channel whose cloud storage folders should be retrieved
     * @param callback - Callback that will be triggered post folders load
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getCloudStorageFolders(channelId: string, callback: (error: SdkError, folders: CloudStorageFolder[]) => void): void;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Initiates the add cloud storage folder flow
     *
     * @param channelId - ID of the channel to add cloud storage folder
     * @param callback - Callback that will be triggered post add folder flow is compelete
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function addCloudStorageFolder(channelId: string, callback: (error: SdkError, isFolderAdded: boolean, folders: CloudStorageFolder[]) => void): void;
    /**
     * @hidden
     * Hide from docs
     * ------
     *
     * Deletes a cloud storage folder from channel
     *
     * @param channelId - ID of the channel where folder is to be deleted
     * @param folderToDelete - cloud storage folder to be deleted
     * @param callback - Callback that will be triggered post delete
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function deleteCloudStorageFolder(channelId: string, folderToDelete: CloudStorageFolder, callback: (error: SdkError, isFolderDeleted: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     * ------
     *
     * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
     *
     * @param folder - Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
     * @param providerCode - Code of the cloud storage folder provider
     * @param callback - Callback that will be triggered post contents are loaded
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getCloudStorageFolderContents(folder: CloudStorageFolder | CloudStorageFolderItem, providerCode: CloudStorageProvider, callback: (error: SdkError, items: CloudStorageFolderItem[]) => void): void;
    /**
     * @hidden
     * Hide from docs
     * ------
     *
     * Open a cloud storage file in Teams
     *
     * @param file - cloud storage file that should be opened
     * @param providerCode - Code of the cloud storage folder provider
     * @param fileOpenPreference - Whether file should be opened in web/inline
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function openCloudStorageFile(file: CloudStorageFolderItem, providerCode: CloudStorageProvider, fileOpenPreference?: FileOpenPreference.Web | FileOpenPreference.Inline): void;
    /**
     * @hidden
     * Allow 1st party apps to call this function to get the external
     * third party cloud storage accounts that the tenant supports
     * @param excludeAddedProviders: return a list of support third party
     * cloud storages that hasn't been added yet.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getExternalProviders(excludeAddedProviders: boolean | undefined, callback: (error: SdkError, providers: IExternalProvider[]) => void): void;
    /**
     * @hidden
     * Allow 1st party apps to call this function to move files
     * among SharePoint and third party cloud storages.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function copyMoveFiles(selectedFiles: CloudStorageFolderItem[] | ISharePointFile[], providerCode: CloudStorageProvider, destinationFolder: CloudStorageFolderItem | ISharePointFile, destinationProviderCode: CloudStorageProvider, isMove: boolean | undefined, callback: (error?: SdkError) => void): void;
    /**
     * @hidden
     * Hide from docs
     *  ------
     *
     * Gets list of downloads for current user
     * @param callback Callback that will be triggered post downloads load
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getFileDownloads(callback: (error?: SdkError, files?: IFileItem[]) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Open download preference folder if fileObjectId value is undefined else open folder containing the file with id fileObjectId
     * @param fileObjectId - Id of the file whose containing folder should be opened
     * @param callback Callback that will be triggered post open download folder/path
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function openDownloadFolder(fileObjectId: string | undefined, callback: (error?: SdkError) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates add 3P cloud storage provider flow, where a pop up window opens for user to select required
     * 3P provider from the configured policy supported 3P provider list, following which user authentication
     * for selected 3P provider is performed on success of which the selected 3P provider support is added for user
     * @beta
     *
     * @param callback Callback that will be triggered post add 3P cloud storage provider action.
     * If the error is encountered (and hence passed back), no provider value is sent back.
     * For success scenarios, error value will be passed as null and a valid provider value is sent.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function addCloudStorageProvider(callback: (error?: SdkError, provider?: CloudStorageProvider) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates signout of 3P cloud storage provider flow, which will remove the selected
     * 3P cloud storage provider from the list of added providers. No other user input and / or action
     * is required except the 3P cloud storage provider to signout from
     *
     * @param logoutRequest 3P cloud storage provider remove action request content
     * @param callback Callback that will be triggered post signout of 3P cloud storage provider action
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function removeCloudStorageProvider(logoutRequest: CloudStorageProviderRequest<CloudStorageProviderContent>, callback: (error?: SdkError) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates the add 3P cloud storage file flow, which will add a new file for the given 3P provider
     *
     * @param addNewFileRequest 3P cloud storage provider add action request content
     * @param callback Callback that will be triggered post adding a new file flow is finished
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function addCloudStorageProviderFile(addNewFileRequest: CloudStorageProviderRequest<CloudStorageProviderNewFileContent>, callback: (error?: SdkError, actionStatus?: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates the rename 3P cloud storage file flow, which will rename an existing file in the given 3P provider
     *
     * @param renameFileRequest 3P cloud storage provider rename action request content
     * @param callback Callback that will be triggered post renaming an existing file flow is finished
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function renameCloudStorageProviderFile(renameFileRequest: CloudStorageProviderRequest<CloudStorageProviderRenameFileContent>, callback: (error?: SdkError, actionStatus?: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates the delete 3P cloud storage file(s) / folder (folder has to be empty) flow,
     * which will delete existing file(s) / folder from the given 3P provider
     *
     * @param deleteFileRequest 3P cloud storage provider delete action request content
     * @param callback Callback that will be triggered post deleting existing file(s) flow is finished
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function deleteCloudStorageProviderFile(deleteFileRequest: CloudStorageProviderRequest<CloudStorageProviderDeleteFileContent>, callback: (error?: SdkError, actionStatus?: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates the download 3P cloud storage file(s) flow,
     * which will download existing file(s) from the given 3P provider in the teams client side without sharing any file info in the callback
     *
     * @param downloadFileRequest 3P cloud storage provider download file(s) action request content
     * @param callback Callback that will be triggered post downloading existing file(s) flow is finished
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function downloadCloudStorageProviderFile(downloadFileRequest: CloudStorageProviderRequest<CloudStorageProviderDownloadFileContent>, callback: (error?: SdkError, actionStatus?: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Initiates the upload 3P cloud storage file(s) flow, which will upload file(s) to the given 3P provider
     * @beta
     *
     * @param uploadFileRequest 3P cloud storage provider upload file(s) action request content
     * @param callback Callback that will be triggered post uploading file(s) flow is finished
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function uploadCloudStorageProviderFile(uploadFileRequest: CloudStorageProviderRequest<CloudStorageProviderUploadFileContent>, callback: (error?: SdkError, actionStatus?: boolean) => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Register a handler to be called when a user's 3P cloud storage provider list changes i.e.
     * post adding / removing a 3P provider, list is updated
     *
     * @param handler - When 3P cloud storage provider list is updated this handler is called
     *
     * @internal Limited to Microsoft-internal use
     */
    export function registerCloudStorageProviderListChangeHandler(handler: () => void): void;
    /**
     * @hidden
     * Hide from docs
     *
     * Register a handler to be called when a user's 3P cloud storage provider content changes i.e.
     * when file(s) is/are added / renamed / deleted / uploaded, the list of files is updated
     *
     * @param handler - When 3P cloud storage provider content is updated this handler is called
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function registerCloudStorageProviderContentChangeHandler(handler: () => void): void;
    export {  };
}

declare namespace meetingRoom {
    /**
     * @hidden
     *
     * Data structure to represent a meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface MeetingRoomInfo {
        /**
         * @hidden
         * Endpoint id of the meeting room.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        endpointId: string;
        /**
         * @hidden
         * Device name of the meeting room.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        deviceName: string;
        /**
         * @hidden
         * Client type of the meeting room.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        clientType: string;
        /**
         * @hidden
         * Client version of the meeting room.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        clientVersion: string;
    }
    /**
     * @hidden
     * Type of Media control capabilities of a meeting room.
     */
    type MediaControls = 'toggleMute' | 'toggleCamera' | 'toggleCaptions' | 'volume';
    /**
     * @hidden
     * Types of Stage Layout control capabilities of a meeting room.
     */
    type StageLayoutControls = 'showVideoGallery' | 'showContent' | 'showVideoGalleryAndContent' | 'showLargeGallery' | 'showTogether';
    /**
     * @hidden
     * Types of Meeting Control capabilities of a meeting room.
     */
    type MeetingControls = 'leaveMeeting';
    /**
     * @hidden
     * Types of Stage Layout State of a meeting room.
     */
    type StageLayoutStates = 'Gallery' | 'Content + gallery' | 'Content' | 'Large gallery' | 'Together mode';
    /**
     * @hidden
     * Data structure to represent capabilities of a meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface MeetingRoomCapability {
        /**
         * @hidden
         * Media control capabilities, value can be "toggleMute", "toggleCamera", "toggleCaptions", "volume".
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        mediaControls: MediaControls[];
        /**
         * @hidden
         * Main stage layout control capabilities, value can be "showVideoGallery", "showContent", "showVideoGalleryAndContent", "showLargeGallery", "showTogether".
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        stageLayoutControls: StageLayoutControls[];
        /**
         * @hidden
         * Meeting control capabilities, value can be "leaveMeeting".
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        meetingControls: MeetingControls[];
    }
    /**
     * @hidden
     * Data structure to represent states of a meeting room.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export interface MeetingRoomState {
        /**
         * @hidden
         * Current mute state, true: mute, false: unmute.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        toggleMute: boolean;
        /**
         * @hidden
         * Current camera state, true: camera on, false: camera off.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        toggleCamera: boolean;
        /**
         * @hidden
         * Current captions state, true: captions on, false: captions off.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        toggleCaptions: boolean;
        /**
         * @hidden
         * Current main stage layout state, value can be one of "Gallery", "Content + gallery", "Content", "Large gallery" and "Together mode".
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        stageLayout: StageLayoutStates;
        /**
         * @hidden
         * Current leaveMeeting state, true: leave, false: no-op.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        leaveMeeting: boolean;
    }
    /**
     * @hidden
     * Fetch the meeting room info that paired with current client.
     *
     * @returns Promise resolved with meeting room info or rejected with SdkError value
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function getPairedMeetingRoomInfo(): Promise<MeetingRoomInfo>;
    /**
     * @hidden
     * Send a command to paired meeting room.
     *
     * @param commandName The command name.
     * @returns Promise resolved upon completion or rejected with SdkError value
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function sendCommandToPairedMeetingRoom(commandName: string): Promise<void>;
    /**
     * @hidden
     * Registers a handler for meeting room capabilities update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the capabilities of meeting room update.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function registerMeetingRoomCapabilitiesUpdateHandler(handler: (capabilities: MeetingRoomCapability) => void): void;
    /**
     * @hidden
     * Hide from docs
     * Registers a handler for meeting room states update.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler The handler to invoke when the states of meeting room update.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function registerMeetingRoomStatesUpdateHandler(handler: (states: MeetingRoomState) => void): void;
    /**
     * @hidden
     *
     * Checks if the meetingRoom capability is supported by the host
     * @returns boolean to represent whether the meetingRoom capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    export function isSupported(): boolean;
    export {  };
}

/**
 * @hidden
 * Namespace to request message ports from the host application.
 *
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace messageChannels {
    namespace telemetry {
        /**
         * @hidden
         * @beta
         *
         * Fetches a MessagePort to batch telemetry through the host's telemetry worker.
         * The port is cached once received, so subsequent calls return the same port.
         * @returns MessagePort.
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed,
         * if the host does not support the feature, or if the port request is rejected.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function getTelemetryPort(): Promise<MessagePort>;
        /**
         * @hidden
         *
         * @beta
         *
         * Checks if the messageChannels.telemetry capability is supported by the host
         * @returns boolean to represent whether the messageChannels.telemetry capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function isSupported(): boolean;
        /**
         * @hidden
         * Undocumented function used to clear state between unit tests
         *
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function _clearTelemetryPort(): void;
    }
    namespace dataLayer {
        /**
         * @hidden
         * @beta
         *
         * Fetches a MessagePort to allow access to the host's data layer worker.
         * The port is cached once received, so subsequent calls return the same port.
         * @returns MessagePort.
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed,
         * if the host does not support the feature, or if the port request is rejected.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function getDataLayerPort(): Promise<MessagePort>;
        /**
         * @hidden
         *
         * @beta
         *
         * Checks if the messageChannels.dataLayer capability is supported by the host
         * @returns boolean to represent whether the messageChannels.dataLayer capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function isSupported(): boolean;
        /**
         * @hidden
         * Undocumented function used to clear state between unit tests
         *
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function _clearDataLayerPort(): void;
    }
    /**
     * @hidden
     *
     * @beta
     *
     * Checks if the messageChannels capability is supported by the host
     * @returns boolean to represent whether the messageChannels capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

declare namespace notifications {
    /**
     * @hidden
     * display notification API.
     *
     * @param message - Notification message.
     * @param notificationType - Notification type
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function showNotification(showNotificationParameters: ShowNotificationParameters): void;
    /**
     * @hidden
     *
     * Checks if the notifications capability is supported by the host
     * @returns boolean to represent whether the notifications capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * This capability contains the APIs for handling events that happen to other applications on the host
 * *while* the developer's application is running. For example, if the developer wants to be notified
 * when another application has been installed.
 */
declare namespace otherAppStateChange {
    /**
     * @hidden
     * @beta
     * @internal
     * Limited to Microsoft-internal use
     *
     * Represent an event that has happened with other number of applications installed on this host.
     * (e.g. a new app has been installed)
     */
    interface OtherAppStateChangeEvent {
        /** An array of app ids that this event applies to */
        appIds: string[];
    }
    /**
     * @hidden
     * @beta
     * @internal
     * Limited to Microsoft-internal use
     *
     * A function handler that will be called whenever an event happens with some number of applications installed on this host.
     */
    type OtherAppStateChangeEventHandler = (event: OtherAppStateChangeEvent) => void;
    /**
     * @hidden
     * @beta
     * @internal
     * Limited to Microsoft-internal use
     *
     * This function allows an app to register a handler that will receive whenever other applications are installed
     * on the host while the developer's application is running.
     *
     * @param appInstallHandler - This handler will be called whenever apps are installed on the host.
     *
     * @throws Error if {@link app.initialize} has not successfully completed, if the platform
     * does not support the otherAppStateChange capability, or if a valid handler is not passed to the function.
     *
     * @example
     * ``` ts
     * if (otherAppStateChange.isSupported()) {
     *  otherAppStateChange.registerAppInstallationHandler((event: otherAppStateChange.OtherAppStateChangeEvent) => {
     *    // code to handle the event goes here
     *  });
     * }
     * ```
     */
    function registerAppInstallationHandler(appInstallHandler: OtherAppStateChangeEventHandler): void;
    /**
     * @hidden
     * @beta
     * @internal
     * Limited to Microsoft-internal use
     *
     * This function can be called so that the handler passed to {@link registerAppInstallationHandler}
     * will no longer receive app installation events. If this is called before registering a handler
     * it will have no effect.
     *
     * @throws Error if {@link app.initialize} has not successfully completed or if the platform
     * does not support the otherAppStateChange capability.
     */
    function unregisterAppInstallationHandler(): void;
    /**
     * Checks if the otherAppStateChange capability is supported by the host
     * @returns boolean to represent whether the otherAppStateChange capability is supported
     *
     * @throws Error if {@link app.initialize} has not successfully completed
     *
     * @beta
     */
    function isSupported(): boolean;
}

declare namespace remoteCamera {
    /**
     * @hidden
     * Data structure to represent patricipant details needed to request control of camera.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface Participant {
        /**
         * @hidden
         * Id of participant.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        id: string;
        /**
         * @hidden
         * Display name of participant.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        displayName?: string;
        /**
         * @hidden
         * Active indicates whether the participant's device is actively being controlled.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        active?: boolean;
    }
    /**
     * @hidden
     * Enum used to indicate possible camera control commands.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum ControlCommand {
        Reset = "Reset",
        ZoomIn = "ZoomIn",
        ZoomOut = "ZoomOut",
        PanLeft = "PanLeft",
        PanRight = "PanRight",
        TiltUp = "TiltUp",
        TiltDown = "TiltDown"
    }
    /**
     * @hidden
     * Data structure to indicate the current state of the device.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface DeviceState {
        /**
         * @hidden
         * All operation are available to apply.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        available: boolean;
        /**
         * @hidden
         * Either camera doesnt support to get state or It unable to apply command.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        error: boolean;
        /**
         * @hidden
         * Reset max out or already applied. Client Disable Reset.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        reset: boolean;
        /**
         * @hidden
         * ZoomIn maxed out.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        zoomIn: boolean;
        /**
         * @hidden
         * ZoomOut maxed out.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        zoomOut: boolean;
        /**
         * @hidden
         * PanLeft reached max left.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        panLeft: boolean;
        /**
         * @hidden
         * PanRight reached max right.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        panRight: boolean;
        /**
         * @hidden
         * TiltUp reached top.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        tiltUp: boolean;
        /**
         * @hidden
         * TiltDown reached bottom.
         *
         * @internal Limited to Microsoft-internal use
         */
        tiltDown: boolean;
    }
    /**
     * @hidden
     * Enum used to indicate the reason for the error.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum ErrorReason {
        CommandResetError = 0,
        CommandZoomInError = 1,
        CommandZoomOutError = 2,
        CommandPanLeftError = 3,
        CommandPanRightError = 4,
        CommandTiltUpError = 5,
        CommandTiltDownError = 6,
        SendDataError = 7
    }
    /**
     * @hidden
     * Data structure to indicate the status of the current session.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface SessionStatus {
        /**
         * @hidden
         * Whether the far-end user is controlling a  device.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        inControl: boolean;
        /**
         * @hidden
         * Reason the  control session was terminated.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        terminatedReason?: SessionTerminatedReason;
    }
    /**
     * @hidden
     * Enum used to indicate the reason the session was terminated.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum SessionTerminatedReason {
        None = 0,
        ControlDenied = 1,
        ControlNoResponse = 2,
        ControlBusy = 3,
        AckTimeout = 4,
        ControlTerminated = 5,
        ControllerTerminated = 6,
        DataChannelError = 7,
        ControllerCancelled = 8,
        ControlDisabled = 9,
        ControlTerminatedToAllowOtherController = 10
    }
    /**
     * @hidden
     * Fetch a list of the participants with controllable-cameras in a meeting.
     *
     * @param callback - Callback contains 2 parameters, error and participants.
     * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
     * participants can either contain an array of Participant objects, incase of a successful fetch or null when it fails
     * participants: object that contains an array of participants with controllable-cameras
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function getCapableParticipants(callback: (error: SdkError | null, participants: Participant[] | null) => void): void;
    /**
     * @hidden
     * Request control of a participant's camera.
     *
     * @param participant - Participant specifies the participant to send the request for camera control.
     * @param callback - Callback contains 2 parameters, error and requestResponse.
     * error can either contain an error of type SdkError, incase of an error, or null when fetch is successful
     * requestResponse can either contain the true/false value, incase of a successful request or null when it fails
     * requestResponse: True means request was accepted and false means request was denied
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function requestControl(participant: Participant, callback: (error: SdkError | null, requestResponse: boolean | null) => void): void;
    /**
     * @hidden
     * Send control command to the participant's camera.
     *
     * @param ControlCommand - ControlCommand specifies the command for controling the camera.
     * @param callback - Callback to invoke when the command response returns.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function sendControlCommand(ControlCommand: ControlCommand, callback: (error: SdkError | null) => void): void;
    /**
     * @hidden
     * Terminate the remote  session
     *
     * @param callback - Callback to invoke when the command response returns.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function terminateSession(callback: (error: SdkError | null) => void): void;
    /**
     * @hidden
     * Registers a handler for change in participants with controllable-cameras.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the list of participants with controllable-cameras changes.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerOnCapableParticipantsChangeHandler(handler: (participantChange: Participant[]) => void): void;
    /**
     * @hidden
     * Registers a handler for error.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when there is an error from the camera handler.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerOnErrorHandler(handler: (error: ErrorReason) => void): void;
    /**
     * @hidden
     * Registers a handler for device state change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the controlled device changes state.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerOnDeviceStateChangeHandler(handler: (deviceStateChange: DeviceState) => void): void;
    /**
     * @hidden
     * Registers a handler for session status change.
     * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
     *
     * @param handler - The handler to invoke when the current session status changes.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerOnSessionStatusChangeHandler(handler: (sessionStatusChange: SessionStatus) => void): void;
    /**
     * @hidden
     *
     * Checks if the remoteCamera capability is supported by the host
     * @returns boolean to represent whether the remoteCamera capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

/**
 * @hidden
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
declare namespace appEntity {
    /**
     * @hidden
     *
     * Information on an app entity
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface AppEntity {
        /**
         * @hidden
         * ID of the application
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        appId: string;
        /**
         * @hidden
         * URL for the application's icon
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        appIconUrl: string;
        /**
         * @hidden
         * Content URL for the app entity
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        contentUrl: string;
        /**
         * @hidden
         * The display name for the app entity
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        displayName: string;
        /**
         * @hidden
         * Website URL for the app entity. It is meant to be opened by the user in a browser.
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        websiteUrl: string;
    }
    /**
     * @hidden
     * Hide from docs
     * --------
     * Open the Tab Gallery and retrieve the app entity
     * @param threadId ID of the thread where the app entity will be created
     * @param categories A list of application categories that will be displayed in the opened tab gallery
     * @param subEntityId An object that will be made available to the application being configured
     *                      through the Context's subEntityId field.
     * @param callback Callback that will be triggered once the app entity information is available.
     *                 The callback takes two arguments: an SdkError in case something happened (i.e.
     *                 no permissions to execute the API) and the app entity configuration, if available
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function selectAppEntity(threadId: string, categories: string[], subEntityId: string, callback: (sdkError?: SdkError, appEntity?: AppEntity) => void): void;
    /**
     * @hidden
     *
     * Checks if the appEntity capability is supported by the host
     * @returns boolean to represent whether the appEntity capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
}

declare namespace teams {
    enum ChannelType {
        Regular = 0,
        Private = 1,
        Shared = 2
    }
    /**
     * @hidden
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface ChannelInfo {
        siteUrl: string;
        objectId: string;
        folderRelativeUrl: string;
        displayName: string;
        channelType: ChannelType;
    }
    /**
     * @hidden
     * Get a list of channels belong to a Team
     *
     * @param groupId - a team's objectId
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function getTeamChannels(groupId: string, callback: (error: SdkError, channels: ChannelInfo[]) => void): void;
    /**
     * @hidden
     * Allow 1st party apps to call this function when they receive migrated errors to inform the Hub/Host to refresh the siteurl
     * when site admin renames siteurl.
     *
     * @param threadId - ID of the thread where the app entity will be created; if threadId is not
     * provided, the threadId from route params will be used.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function refreshSiteUrl(threadId: string, callback: (error: SdkError) => void): void;
    /**
     * @hidden
     *
     * Checks if teams capability is supported by the host
     * @returns boolean to represent whether the teams capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
    /**
     * @hidden
     * @internal
     * Limited to Microsoft-internal use
     */
    namespace fullTrust {
        /**
         * @hidden
         * @internal
         * Limited to Microsoft-internal use
         */
        namespace joinedTeams {
            /**
             * @hidden
             * Allows an app to retrieve information of all user joined teams
             *
             * @param teamInstanceParameters - Optional flags that specify whether to scope call to favorite teams
             * @returns Promise that resolves with information about the user joined teams or rejects with an error when the operation has completed
             *
             * @internal
             * Limited to Microsoft-internal use
             */
            function getUserJoinedTeams(teamInstanceParameters?: TeamInstanceParameters): Promise<UserJoinedTeamsInformation>;
            /**
             * @hidden
             *
             * Checks if teams.fullTrust.joinedTeams capability is supported by the host
             * @returns boolean to represent whether the teams.fullTrust.joinedTeams capability is supported
             *
             * @throws Error if {@linkcode app.initialize} has not successfully completed
             *
             * @internal
             * Limited to Microsoft-internal use
             */
            function isSupported(): boolean;
        }
        /**
         * @hidden
         * Allows an app to get the configuration setting value
         *
         * @param key - The key for the config setting
         * @returns Promise that resolves with the value for the provided configuration setting or rejects with an error when the operation has completed
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function getConfigSetting(key: string): Promise<string>;
        /**
         * @hidden
         *
         * Checks if teams.fullTrust capability is supported by the host
         * @returns boolean to represent whether the teams.fullTrust capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        function isSupported(): boolean;
    }
}

/**
 * @hidden
 * Video effect change call back function definition
 * @beta
 *
 * @internal
 * Limited to Microsoft-internal use
 */
type VideoEffectCallBack = (effectId: string | undefined, effectParam?: string) => Promise<void>;

declare namespace videoEffectsEx {
    const frameProcessingTimeoutInMs = 2000;
    /**
     * @hidden
     * Error level when notifying errors to the host, the host will decide what to do acording to the error level.
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    enum ErrorLevel {
        Fatal = "fatal",
        Warn = "warn"
    }
    /**
     * @hidden
     * Video frame configuration supplied to the host to customize the generated video frame parameters
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface VideoFrameConfig extends videoEffects.VideoFrameConfig {
        /**
         * @hidden
         * Flag to indicate use camera stream to synthesize video frame or not.
         * Default value is true.
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        requireCameraStream?: boolean;
        /**
         * @hidden
         * Machine learning model to run in the host to do audio inference for you
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        audioInferenceModel?: ArrayBuffer;
        /**
         * @hidden
         * Specifies additional capabilities that should be applied to the video frame
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        requiredCapabilities?: string[];
    }
    /**
     * @hidden
     * Represents a video frame
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface VideoBufferData extends videoEffects.VideoBufferData {
        /**
         * @hidden
         * The model output if you passed in an {@linkcode VideoFrameConfig.audioInferenceModel}
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        audioInferenceResult?: Uint8Array;
    }
    /**
     * @hidden
     * The callback will be called on every frame when running on the supported host.
     * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
     * The video app should call `notifyVideoFrameProcessed` to notify a successfully processed video frame.
     * The video app should call `notifyError` to notify a failure. When the failures accumulate to a certain number(determined by the host), the host will see the app is "frozen" and give the user the option to close the app.
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type VideoBufferHandler = (videoBufferData: VideoBufferData, notifyVideoFrameProcessed: () => void, notifyError: (errorMessage: string) => void) => void;
    /**
     * @hidden
     * Video frame data extracted from the media stream. More properties may be added in the future.
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type VideoFrameData = videoEffects.VideoFrameData & {
        /**
         * @hidden
         * The model output if you passed in an {@linkcode VideoFrameConfig.audioInferenceModel}
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        audioInferenceResult?: Uint8Array;
        /**
         * @hidden
         * Additional metadata determined by capabilities specified in {@linkcode VideoFrameConfig.requiredCapabilities}
         * @beta
         *
         * @internal
         * Limited to Microsoft-internal use
         */
        attributes?: ReadonlyMap<string, Uint8Array>;
    };
    /**
     * @hidden
     * The callback will be called on every frame when running on the supported host.
     * We require the frame rate of the video to be at least 22fps for 720p, thus the callback should process a frame timely.
     * The video app should resolve the promise to notify a successfully processed video frame.
     * The video app should reject the promise to notify a failure. When the failures accumulate to a certain number(determined by the host), the host will see the app is "frozen" and give the user the option to close the app.
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    type VideoFrameHandler = (receivedVideoFrame: VideoFrameData) => Promise<videoEffects.VideoFrame>;
    /**
     * @hidden
     * @beta
     * Callbacks and configuration supplied to the host to process the video frames.
     * @internal
     * Limited to Microsoft-internal use
     */
    type RegisterForVideoFrameParameters = {
        /**
         * Callback function to process the video frames extracted from a media stream.
         */
        videoFrameHandler: VideoFrameHandler;
        /**
         * Callback function to process the video frames shared by the host.
         */
        videoBufferHandler: VideoBufferHandler;
        /**
         * Video frame configuration supplied to the host to customize the generated video frame parameters, like format
         */
        config: VideoFrameConfig;
    };
    /**
     * @hidden
     * Register to process video frames
     * @beta
     *
     * @param parameters - Callbacks and configuration to process the video frames. A host may support either {@link VideoFrameHandler} or {@link VideoBufferHandler}, but not both.
     * To ensure the video effect works on all supported hosts, the video app must provide both {@link VideoFrameHandler} and {@link VideoBufferHandler}.
     * The host will choose the appropriate callback based on the host's capability.
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerForVideoFrame(parameters: RegisterForVideoFrameParameters): void;
    /**
     * @hidden
     * Video extension should call this to notify host that the current selected effect parameter changed.
     * If it's pre-meeting, host will call videoEffectCallback immediately then use the videoEffect.
     * If it's the in-meeting scenario, we will call videoEffectCallback when apply button clicked.
     * @beta
     * @param effectChangeType - the effect change type.
     * @param effectId - Newly selected effect id. {@linkcode VideoEffectCallBack}
     * @param effectParam Variant for the newly selected effect. {@linkcode VideoEffectCallBack}
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function notifySelectedVideoEffectChanged(effectChangeType: videoEffects.EffectChangeType, effectId: string | undefined, effectParam?: string): void;
    /**
     * @hidden
     * Register the video effect callback, host uses this to notify the video extension the new video effect will by applied
     * @beta
     * @param callback - The VideoEffectCallback to invoke when registerForVideoEffect has completed
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function registerForVideoEffect(callback: VideoEffectCallBack): void;
    /**
     * @hidden
     * Personalized video effect
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    interface PersonalizedEffect {
        /**
         * Personalized effect id
         */
        id: string;
        /**
         * Display name
         */
        name: string;
        /**
         * Effect type defined by app
         */
        type: string;
        /**
         * Data URI of the thumbnail image content encoded in ASCII format using the base64 scheme
         */
        thumbnail: string;
    }
    /**
     * @hidden
     * Send personalized effects to Teams client
     * @beta
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function updatePersonalizedEffects(effects: PersonalizedEffect[]): void;
    /**
     * @hidden
     *
     * Checks if video capability is supported by the host
     * @beta
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @returns boolean to represent whether the video capability is supported
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function isSupported(): boolean;
    /**
     * @hidden
     * Sending fatal error notification to host. Call this function only when your app meets fatal error and can't continue.
     * The host will stop the video pipeline and terminate this session, and optionally, show an error message to the user.
     * @beta
     * @param errorMessage - The error message that will be sent to the host
     *
     * @internal
     * Limited to Microsoft-internal use
     */
    function notifyFatalError(errorMessage: string): void;
}

/**
 * @hidden
 * @internal
 * @beta
 * Limited to Microsoft-internal use
 *
 * This capability allows an app to associate apps with a host entity, such as a Teams channel or chat, and configure them as needed.
 */
declare namespace hostEntity {
    export enum AppTypes {
        edu = "EDU"
    }
    /**
     * Id of the teams entity like channel, chat
     */
    interface TeamsEntityId {
        threadId: string;
    }
    /**
     * Id of message in which channel meeting is created
     */
    export interface TeamsChannelMeetingEntityIds extends TeamsEntityId {
        parentMessageId: string;
    }
    /**
     * Id of the host entity
     */
    export type HostEntityIds = TeamsEntityId | TeamsChannelMeetingEntityIds;
    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * CRUD operations for tabs associated with apps
     */
    export namespace tab {
        /**
         * Represents information about a static tab instance
         */
        interface StaticTabInstance extends TabInstance {
            tabType: 'StaticTab';
        }
        /**
         * Represents information about a configurable tab instance
         */
        interface ConfigurableTabInstance extends TabInstance {
            tabType: 'ConfigurableTab';
        }
        /**
         * Represents information about a tab instance associated with a host entity like chat, channel or meeting. Cab be a configurable tab or static tab.
         */
        type HostEntityTabInstance = StaticTabInstance | ConfigurableTabInstance;
        /**
         * Represents all tabs associated with a host entity like chat, channel or meeting
         */
        interface HostEntityTabInstances {
            allTabs: HostEntityTabInstance[];
        }
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Launches host-owned UI that lets a user select an app, installs it if required,
         * runs through app configuration if required, and then associates the app with the threadId provided
         *
         * @param hostEntityIds Ids of the host entity like channel, chat or meeting
         *
         * @param appTypes What type of applications to show the user. If EDU is passed as appType, only apps supported by EDU tenant are shown.
         * If no value is passed, all apps are shown.
         *
         * @returns The HostEntityTabInstance of the newly associated app
         *
         * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or installing
         * or configuring or adding tab fails
         */
        function addAndConfigure(hostEntityIds: HostEntityIds, appTypes?: AppTypes[]): Promise<HostEntityTabInstance>;
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Returns all tab instances associated with a host entity
         *
         * @param hostEntityIds Ids of the host entity like channel, chat or meeting
         *
         * @returns Object with array of HostEntityTabInstance's associated with a host entity
         *
         * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid or fetching tabs fails
         */
        function getAll(hostEntityIds: HostEntityIds): Promise<HostEntityTabInstances>;
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Launches host-owned UI that lets a user re-configure the contentUrl of the tab
         *
         * @param tab Configurable tab instance that needs to be updated
         *
         * @param hostEntityIds Ids of the host entity like channel, chat or meeting
         *
         * @returns The HostEntityTabInstance of the updated tab
         *
         * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
         * re-configuring tab fails or if tab is a static tab
         */
        function reconfigure(tab: ConfigurableTabInstance, hostEntityIds: HostEntityIds): Promise<ConfigurableTabInstance>;
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Launches host-owned UI that lets a user rename the tab
         *
         * @param tab Configurable tab instance that needs to be updated
         *
         * @param hostEntityIds Ids of the host entity like channel, chat or meeting
         *
         * @returns The HostEntityTabInstance of the updated tab
         *
         * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation,
         * re-naming tab fails or if tab is a static tab
         */
        function rename(tab: ConfigurableTabInstance, hostEntityIds: HostEntityIds): Promise<ConfigurableTabInstance>;
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Launches host-owned UI that lets a user remove the tab
         *
         * @param tab tab instance that needs to be updated. Can be static tab or configurable tab.
         *
         * @param hostEntityIds Ids of the host entity like channel, chat or meeting
         *
         * @returns Boolean. Returns true if removing tab was successful
         *
         * @throws Error if host does not support this capability, library as not been initialized successfully, input parameters are invalid, user cancels operation or
         * removing tab fails
         */
        function remove(tab: HostEntityTabInstance, hostEntityIds: HostEntityIds): Promise<boolean>;
        /**
         * @hidden
         * @internal
         * @beta
         * Limited to Microsoft-internal use
         *
         * Checks if the hostEntity.tab capability is supported by the host
         * @returns boolean to represent whether the histEntity and hostEntity.tab capability is supported
         *
         * @throws Error if {@linkcode app.initialize} has not successfully completed
         */
        function isSupported(): boolean;
    }
    /**
     * @hidden
     * @internal
     * @beta
     * Limited to Microsoft-internal use
     *
     * Checks if the hostEntity capability is supported by the host
     * @returns boolean to represent whether the hostEntity capability is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     */
    export function isSupported(): boolean;
    export {  };
}

export { type ActionInfo, ActionObjectType, type AdaptiveCardDialogInfo, type AdaptiveCardVersion, AppId, type BaseActionObject, type BotAdaptiveCardDialogInfo, type BotUrlDialogInfo, ChannelType, type ChatMembersInformation, ChildAppWindow, type Context$1 as Context, type DeepLinkParameters, DialogDimension, type DialogInfo, type DialogSize, EmailAddress, ErrorCode, FileOpenPreference, type FilePreviewParameters, type FrameContext, FrameContexts, type FrameInfo, type GetPresenceParams, HostClientType, HostName, type IAppWindow, type ISerializable, LiveShareHost, type LoadContext, type LocaleInfo, type M365ContentAction, NotificationTypes, type OpenConversationRequest, type OpenGroupChatRequest, type OpenSingleChatRequest, ParentAppWindow, PresenceStatus, type ResumeContext, type SdkError, type SecondaryId, SecondaryM365ContentIdName, type SetPresenceParams, type ShareDeepLinkParameters, type ShowNotificationParameters, type TabInformation, type TabInstance, type TabInstanceParameters, type TaskInfo, DialogDimension as TaskModuleDimension, type TeamInformation, type TeamInstanceParameters, TeamType, type ThreadMember, type UrlDialogInfo, type UserJoinedTeamsInformation, type UserPresence, UserSettingTypes, UserTeamRole, ViewerActionTypes, type addEventListnerFunctionType, app_d as app, appEntity, appInitialization_d as appInitialization, appInstallDialog_d as appInstallDialog, authentication_d as authentication, barCode_d as barCode, calendar_d as calendar, call_d as call, type callbackFunctionType, chat_d as chat, clipboard_d as clipboard, conversations, copilot, dialog_d as dialog, enablePrintCapability, executeDeepLink, type executeDeepLinkOnCompleteFunctionType, externalAppAuthentication, externalAppAuthenticationForCEA, externalAppCardActions, externalAppCardActionsForCEA, externalAppCommands, files, geoLocation_d as geoLocation, getAdaptiveCardSchemaVersion, getContext, type getContextCallbackFunctionType, getMruTabInstances, getTabInstances, type getTabInstancesCallbackFunctionType, hostEntity, initialize, initializeWithFrameContext, liveShare, location, logs, mail, marketplace, media, meeting, meetingRoom, menus, messageChannels, monetization, navigateBack, navigateCrossDomain, navigateToTab, nestedAppAuth, notifications, type onCompleteFunctionType, type onCompleteHandlerFunctionType, openFilePreview, otherAppStateChange, pages, people, presence_d as presence, print, profile, registerAppButtonClickHandler, registerAppButtonHoverEnterHandler, registerAppButtonHoverLeaveHandler, registerBackButtonHandler, type registerBackButtonHandlerFunctionType, registerBeforeUnloadHandler, registerChangeSettingsHandler, registerCustomHandler, registerFocusEnterHandler, registerFullScreenHandler, type registerFullScreenHandlerFunctionType, registerOnLoadHandler, registerOnThemeChangeHandler, type registerOnThemeChangeHandlerFunctionType, registerUserSettingsChangeHandler, remoteCamera, returnFocus, search, secondaryBrowser, sendCustomEvent, sendCustomMessage, setFrameContext, settings_d as settings, shareDeepLink, sharing, stageView, tasks, teams, teamsCore, thirdPartyCloudStorage, uploadCustomApp, version, videoEffects, videoEffectsEx, visualMedia, webStorage };
