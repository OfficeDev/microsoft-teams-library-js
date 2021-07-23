export const version = '1.10.0';
/**
 * The SDK version when all SDK APIs started to check platform compatibility for the APIs was 1.6.0.
 * Modified to 2.0.1 which is hightest till now so that if any client doesn't pass version in initialize function, it will be set to highest.
 * Mobile clients are passing versions, hence will be applicable to web and desktop clients only.
 */
export const defaultSDKVersionForCompatCheck = '2.0.1';

/**
 * This is the SDK version when selectMedia API - VideoAndImage is supported on mobile.
 */
export const videoAndImageMediaAPISupportVersion = '2.0.2';

/**
 * Minimum required client supported version for {@link getUserJoinedTeams} to be supported on {@link HostClientType.android}
 */
export const getUserJoinedTeamsSupportedAndroidClientVersion = '2.0.1';

/**
 * This is the SDK version when location APIs (getLocation and showLocation) are supported.
 */
export const locationAPIsRequiredVersion = '1.9.0';

/**
 * This is the SDK version when people picker API is supported on mobile.
 */
export const peoplePickerRequiredVersion = '2.0.0';

/**
 * This is the SDK version when captureImage API is supported on mobile.
 */
export const captureImageMobileSupportVersion = '1.7.0';

/**
 * This is the SDK version when media APIs are supported on all three platforms ios, android and web.
 */
export const mediaAPISupportVersion = '1.8.0';

/**
 * This is the SDK version when getMedia API is supported via Callbacks on all three platforms ios, android and web.
 */
export const getMediaCallbackSupportVersion = '2.0.0';

/**
 * This is the SDK version when scanBarCode API is supported on mobile.
 */
export const scanBarCodeAPIMobileSupportVersion = '1.9.0';

/**
 * List of supported Host origins
 */
export const validOrigins = [
  'teams.microsoft.com',
  'teams.microsoft.us',
  'gov.teams.microsoft.us',
  'dod.teams.microsoft.us',
  'int.teams.microsoft.com',
  'teams.live.com',
  'devspaces.skype.com',
  'ssauth.skype.com',
  'local.teams.live.com', // local development
  'local.teams.live.com:8080', // local development
  'local.teams.office.com', // local development
  'local.teams.office.com:8080', // local development
  'msft.spoppe.com',
  '*.sharepoint.com',
  '*.sharepoint-df.com',
  '*.sharepointonline.com',
  'outlook.office.com',
  'outlook-sdf.office.com',
  '*.teams.microsoft.com',
  'www.office.com',
  'word.office.com',
  'excel.office.com',
  'powerpoint.office.com',
  'www.officeppe.com',
  '*.www.office.com',
];

/**
 * USer specified message origins should satisfy this test
 */
export const userOriginUrlValidationRegExp = /^https\:\/\//;
