export enum HostClientType {
  desktop = 'desktop',
  web = 'web',
  android = 'android',
  ios = 'ios',
  rigel = 'rigel',
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

export enum TaskModuleDimension {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

/**
 * The type of the channel with which the content is associated.
 */
export enum ChannelType {
  Regular = 'Regular',
  Private = 'Private',
}
