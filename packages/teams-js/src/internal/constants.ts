export const version = '2.0.0-beta.0';
/**
 * @privateRemarks
 * The SDK version when all SDK APIs started to check platform compatibility for the APIs was 1.6.0.
 * Modified to 2.0.1 which is hightest till now so that if any client doesn't pass version in initialize function, it will be set to highest.
 * Mobile clients are passing versions, hence will be applicable to web and desktop clients only.
 *
 * @internal
 */
export const defaultSDKVersionForCompatCheck = '2.0.1';

/**
 * @privateRemarks
 * This is the SDK version when selectMedia API - VideoAndImage is supported on mobile.
 *
 * @internal
 */
export const videoAndImageMediaAPISupportVersion = '2.0.2';

/**
 * @privateRemarks
 * Minimum required client supported version for {@link getUserJoinedTeams} to be supported on {@link HostClientType.android}
 *
 * @internal
 */
export const getUserJoinedTeamsSupportedAndroidClientVersion = '2.0.1';

/**
 * @privateRemarks
 * This is the SDK version when location APIs (getLocation and showLocation) are supported.
 *
 * @internal
 */
export const locationAPIsRequiredVersion = '1.9.0';

/**
 * @privateRemarks
 * This is the SDK version when people picker API is supported on mobile.
 *
 * @internal
 */
export const peoplePickerRequiredVersion = '2.0.0';

/**
 * @privateRemarks
 * This is the SDK version when captureImage API is supported on mobile.
 *
 * @internal
 */
export const captureImageMobileSupportVersion = '1.7.0';

/**
 * @privateRemarks
 * This is the SDK version when media APIs are supported on all three platforms ios, android and web.
 *
 * @internal
 */
export const mediaAPISupportVersion = '1.8.0';

/**
 * @privateRemarks
 * This is the SDK version when getMedia API is supported via Callbacks on all three platforms ios, android and web.
 *
 * @internal
 */
export const getMediaCallbackSupportVersion = '2.0.0';

/**
 * @privateRemarks
 * This is the SDK version when scanBarCode API is supported on mobile.
 *
 * @internal
 */
export const scanBarCodeAPIMobileSupportVersion = '1.9.0';

/**
 * @privateRemarks
 * List of supported Host origins
 *
 * @internal
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
 * @privateRemarks
 * USer specified message origins should satisfy this test
 *
 * @internal
 */
export const userOriginUrlValidationRegExp = /^https:\/\//;
