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
  /* `Standard = 0` is setting the value of the `Standard` enum member to 0. Enum members are assigned
  numeric values automatically starting from 0, but you can also explicitly set their values. In
  this case, `Standard` is being set to 0 explicitly. */
  Standard = 0,
  /* `Edu = 1` is setting the value of the `Edu` enum member to 1. Enum members are assigned numeric
  values automatically starting from 0, but you can also explicitly set their values. In this case,
  `Edu` is being set to 1 explicitly. */
  Edu = 1,
  /* `Class = 2` is defining an enum member with the name `Class` and a value of `2`. Enum members are
  assigned numeric values automatically starting from 0, but you can also explicitly set their
  values. In this case, `Class` is being set to 2 explicitly. */
  Class = 2,
  /* `Plc = 3` is defining an enum member with the name `Plc` and a value of `3` in the `TeamType`
  enum. This allows for `Plc` to be used as a valid option when referencing the `TeamType` enum. */
  Plc = 3,
  /* `Staff = 4` is defining an enum member with the name `Staff` and a value of `4` in the `TeamType`
  enum. This allows for `Staff` to be used as a valid option when referencing the `TeamType` enum. */
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
  /** Large size dialog */
  Large = 'large',
  /** Medium size dialog */
  Medium = 'medium',
  /** Small size dialog */
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
  /** Regular Channels is open to all team members. */
  Regular = 'Regular',
  /** Private channels are focused spaces for collaboration within your teams. Click [here](https://learn.microsoft.com/en-us/microsoftteams/private-channels) to know more.*/
  Private = 'Private',
  /** Shared channels creates collaboration spaces where you can invite people who are not in the team. Click [here](https://learn.microsoft.com/en-us/microsoftteams/shared-channels) to know more. */
  Shared = 'Shared',
}

export const errorNotSupportedOnPlatform: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };

/**
 * @hidden
 *
 * Minimum Adaptive Card version supported by the host.
 */
export const minAdaptiveCardVersion: AdaptiveCardVersion = { majorVersion: 1, minorVersion: 5 };
