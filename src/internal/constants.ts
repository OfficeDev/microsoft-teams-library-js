import { generateRegExpFromUrls } from './utils';

export const version = '1.11.0-beta.2';
/**
 * The SDK version when all SDK APIs started to check platform compatibility for the APIs was 1.6.0.
 * Modified to 2.0.1 which is hightest till now so that if any client doesn't pass version in initialize function, it will be set to highest.
 * Mobile clients are passing versions, hence will be applicable to web and desktop clients only.
 */
export const defaultSDKVersionForCompatCheck = '2.0.1';

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
  'https://teams.microsoft.com',
  'https://teams.microsoft.us',
  'https://gov.teams.microsoft.us',
  'https://dod.teams.microsoft.us',
  'https://int.teams.microsoft.com',
  'https://teams.live.com',
  'https://devspaces.skype.com',
  'https://ssauth.skype.com',
  'https://local.teams.live.com', // local development
  'https://local.teams.live.com:8080', // local development
  'https://local.teams.office.com', // local development
  'https://local.teams.office.com:8080', // local development
  'https://msft.spoppe.com',
  'https://*.sharepoint.com',
  'https://*.sharepoint-df.com',
  'https://*.sharepointonline.com',
  'https://outlook.office.com',
  'https://outlook-sdf.office.com',
  'https://*.teams.microsoft.com',
  'https://www.office.com',
  'https://word.office.com',
  'https://excel.office.com',
  'https://powerpoint.office.com',
  'https://www.officeppe.com',
  'https://*.www.office.com',
];

export const validOriginRegExp = generateRegExpFromUrls(validOrigins);

/**
 * USer specified message origins should satisfy this test
 */
export const userOriginUrlValidationRegExp = /^https\:\/\//;
