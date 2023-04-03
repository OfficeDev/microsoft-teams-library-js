export enum HostClientType {
  desktop = 'desktop',
  web = 'web',
  android = 'android',
  ios = 'ios',
  ipados = 'ipados',
  /**
   * @deprecated
   * As of 2.0.0, please use {@link teamsRoomsWindows} instead.
   */
  rigel = 'rigel',
  surfaceHub = 'surfaceHub',
  teamsRoomsWindows = 'teamsRoomsWindows',
  teamsRoomsAndroid = 'teamsRoomsAndroid',
  teamsPhones = 'teamsPhones',
  teamsDisplays = 'teamsDisplays',
}

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

// Ensure these declarations stay in sync with the framework.
export enum FrameContexts {
  settings = 'settings',
  content = 'content',
  authentication = 'authentication',
  remove = 'remove',
  task = 'task',
  sidePanel = 'sidePanel',
  stage = 'stage',
  meetingStage = 'meetingStage',
}

/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
export enum TeamType {
  Standard = 0,
  Edu = 1,
  Class = 2,
  Plc = 3,
  Staff = 4,
}

/**
 * Indicates the various types of roles of a user in a team.
 */
export enum UserTeamRole {
  Admin = 0,
  User = 1,
  Guest = 2,
}

/**
 * Dialog module dimension enum
 */
export enum DialogDimension {
  Large = 'large',
  Medium = 'medium',
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
  Regular = 'Regular',
  Private = 'Private',
  Shared = 'Shared',
}

export const errorNotSupportedOnPlatform: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };

/**
 * @hidden
 *
 * Minimum Adaptive Card version supported by the host.
 */
export const minAdaptiveCardVersion: AdaptiveCardVersion = { majorVersion: 1, minorVersion: 5 };
