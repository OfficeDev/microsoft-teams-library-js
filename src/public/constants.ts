export const enum HostClientType {
  desktop = 'desktop',
  web = 'web',
  android = 'android',
  ios = 'ios',
  rigel = 'rigel',
}

/**
 * Indicates the team type, currently used to distinguish between different team
 * types in Office 365 for Education (team types 1, 2, 3, and 4).
 */
export const enum TeamType {
  Standard = 0,
  Edu = 1,
  Class = 2,
  Plc = 3,
  Staff = 4,
}

/**
 * Indicates the various types of roles of a user in a team.
 */
export const enum UserTeamRole {
  Admin = 0,
  User = 1,
  Guest = 2,
}

export const enum TaskModuleDimension {
  Large = 'large',
  Medium = 'medium',
  Small = 'small',
}

/**
 * The type of the channel with which the content is associated.
 */
export const enum ChannelType {
  Regular = 'Regular',
  Private = 'Private',
}
