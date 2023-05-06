/** HostClientType represents the different client platforms on which host can be run. */
export enum HostClientType {
  /** Represents the desktop client of host, which is installed on a user's computer and runs as a standalone application. */
  desktop = 'desktop',
  /** Represents the web-based client of host, which runs in a web browser. */
  web = 'web',
  /** Represents the Android mobile client of host, which runs on Android devices such as smartphones and tablets. */
  android = 'android',
  /** Represents the iOS mobile client of host, which runs on iOS devices such as iPhones. */
  ios = 'ios',
  /** Represents the iPadOS client of host, which runs on iOS devices such as iPads. */
  ipados = 'ipados',
  /**
   * @deprecated
   * As of 2.0.0, please use {@link teamsRoomsWindows} instead.
   */
  rigel = 'rigel',
  /** Represents the client of host, which runs on surface hub devices. */
  surfaceHub = 'surfaceHub',
  /** Represents the client of host, which runs on Teams Rooms on Windows devices. More information on Microsoft Teams Rooms on Windows can be found [Microsoft Teams Rooms (Windows)](https://support.microsoft.com/office/microsoft-teams-rooms-windows-help-e667f40e-5aab-40c1-bd68-611fe0002ba2)*/
  teamsRoomsWindows = 'teamsRoomsWindows',
  /** Represents the client of host, which runs on Teams Rooms on Android devices. More information on Microsoft Teams Rooms on Android can be found [Microsoft Teams Rooms (Android)].(https://support.microsoft.com/office/get-started-with-teams-rooms-on-android-68517298-d513-46be-8d6d-d41db5e6b4b2)*/
  teamsRoomsAndroid = 'teamsRoomsAndroid',
  /** Represents the client of host, which runs on Teams phones. More information can be found [Microsoft Teams Phones](https://support.microsoft.com/office/get-started-with-teams-phones-694ca17d-3ecf-40ca-b45e-d21b2c442412) */
  teamsPhones = 'teamsPhones',
  /** Represents the client of host, which runs on Teams displays devices. More information can be found [Microsoft Teams Displays](https://support.microsoft.com/office/get-started-with-teams-displays-ff299825-7f13-4528-96c2-1d3437e6d4e6) */
  teamsDisplays = 'teamsDisplays',
}

/** HostName indicates the possible hosts for your application. */
export enum HostName {
  /**
   * Office.com and Office Windows App
   */
  office = 'Office',

  /**
   * For "desktop" specifically, this refers to the new, pre-release version of Outlook for Windows.
   * Also used on other platforms that map to a single Outlook client.
   */
  outlook = 'Outlook',

  /**
   * Outlook for Windows: the classic, native, desktop client
   */
  outlookWin32 = 'OutlookWin32',

  /**
   * Microsoft-internal test Host
   */
  orange = 'Orange',

  /**
   * Teams
   */
  teams = 'Teams',

  /**
   * Modern Teams
   */
  teamsModern = 'TeamsModern',
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
export enum FrameContexts {
  /**
   * App's frame context from where settings page can be accessed.
   * See [how to create a configuration page.]( https://learn.microsoft.com/microsoftteams/platform/tabs/how-to/create-tab-pages/configuration-page?tabs=teamsjs-v2)
   */
  settings = 'settings',
  /** The default context for the app where all the content of the app is displayed. */
  content = 'content',
  /** Frame context used when app is running in the authentication window launched by calling {@link authentication.authenticate} */
  authentication = 'authentication',
  /** The page shown when the user uninstalls the app. */
  remove = 'remove',
  /** A task module is a pop-up window that can be used to display a form, a dialog, or other interactive content within the host. */
  task = 'task',
  /** The side panel is a persistent panel that is displayed on the right side of the host and can be used to display content or UI that is relevant to the current page or tab. */
  sidePanel = 'sidePanel',
  /** The stage is a large area that is displayed at the center of the host and can be used to display content or UI that requires a lot of space, such as a video player or a document editor. */
  stage = 'stage',
  /** App's frame context from where meetingStage can be accessed in a meeting session, which is the primary area where video and presentation content is displayed during a meeting. */
  meetingStage = 'meetingStage',
}

/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
export enum TeamType {
  /** Represents a standard or classic team in host that is designed for ongoing collaboration and communication among a group of people. */
  Standard = 0,
  /**  Represents an educational team in host that is designed for classroom collaboration and communication among students and teachers. */
  Edu = 1,
  /** Represents a class team in host that is designed for classroom collaboration and communication among students and teachers in a structured environment. */
  Class = 2,
  /** Represents a professional learning community (PLC) team in host that is designed for educators to collaborate and share resources and best practices. */
  Plc = 3,
  /** Represents a staff team in host that is designed for staff collaboration and communication among staff members.*/
  Staff = 4,
}

/**
 * Indicates the various types of roles of a user in a team.
 */
export enum UserTeamRole {
  /** Represents that the user is an owner or administrator of the team. */
  Admin = 0,
  /** Represents that the user is a standard member of the team. */
  User = 1,
  /** Represents that the user does not have any role in the team. */
  Guest = 2,
}

/**
 * Dialog module dimension enum
 */
export enum DialogDimension {
  /** Represents a large-sized dialog box, which is typically used for displaying large amounts of content or complex workflows that require more space. */
  Large = 'large',
  /** Represents a medium-sized dialog box, which is typically used for displaying moderate amounts of content or workflows that require less space. */
  Medium = 'medium',
  /** Represents a small-sized dialog box, which is typically used for displaying simple messages or workflows that require minimal space.*/
  Small = 'small',
}

import { AdaptiveCardVersion, ErrorCode, SdkError } from './interfaces';
/**
 * @deprecated
 * As of 2.0.0, please use {@link DialogDimension} instead.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export import TaskModuleDimension = DialogDimension;

/**
 * The type of the channel with which the content is associated.
 */
export enum ChannelType {
  /** The default channel type. Type of channel is used for general collaboration and communication within a team. */
  Regular = 'Regular',
  /** Type of channel is used for sensitive or confidential communication within a team and is only accessible to members of the channel. */
  Private = 'Private',
  /** Type of channel is used for collaboration between multiple teams or groups and is accessible to members of all the teams or groups. */
  Shared = 'Shared',
}

/** An error object indicating that the requested operation or feature is not supported on the current platform or device.
 * @typedef {Object} SdkError
 */
export const errorNotSupportedOnPlatform: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };

/**
 * @hidden
 *
 * Minimum Adaptive Card version supported by the host.
 */
export const minAdaptiveCardVersion: AdaptiveCardVersion = { majorVersion: 1, minorVersion: 5 };
