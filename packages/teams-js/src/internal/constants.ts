/**
 * @hidden
 * The client version when all SDK APIs started to check platform compatibility for the APIs was 1.6.0.
 * Modified to 2.0.1 which is hightest till now so that if any client doesn't pass version in initialize function, it will be set to highest.
 * Mobile clients are passing versions, hence will be applicable to web and desktop clients only.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const defaultSDKVersionForCompatCheck = '2.0.1';

/**
 * @hidden
 * This is the client version when selectMedia API - VideoAndImage is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const videoAndImageMediaAPISupportVersion = '2.0.2';

/**
 * @hidden
 * This is the client version when selectMedia API - Video with non-full screen mode is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const nonFullScreenVideoModeAPISupportVersion = '2.0.3';

/**
 * @hidden
 * This is the client version when selectMedia API - ImageOutputFormats is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const imageOutputFormatsAPISupportVersion = '2.0.4';

/**
 * @hidden
 * Minimum required client supported version for {@link getUserJoinedTeams} to be supported on {@link HostClientType.android}
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const getUserJoinedTeamsSupportedAndroidClientVersion = '2.0.1';

/**
 * @hidden
 * This is the client version when location APIs (getLocation and showLocation) are supported.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const locationAPIsRequiredVersion = '1.9.0';

/**
 * @hidden
 * This is the client version when permisisons are supported
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const permissionsAPIsRequiredVersion = '2.0.1';

/**
 * @hidden
 * This is the client version when people picker API is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const peoplePickerRequiredVersion = '2.0.0';

/**
 * @hidden
 * This is the client version when captureImage API is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const captureImageMobileSupportVersion = '1.7.0';

/**
 * @hidden
 * This is the client version when media APIs are supported on all three platforms ios, android and web.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const mediaAPISupportVersion = '1.8.0';

/**
 * @hidden
 * This is the client version when getMedia API is supported via Callbacks on all three platforms ios, android and web.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const getMediaCallbackSupportVersion = '2.0.0';

/**
 * @hidden
 * This is the client version when scanBarCode API is supported on mobile.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const scanBarCodeAPIMobileSupportVersion = '1.9.0';

/**
 * @hidden
 * List of supported Host origins
 *
 * @internal
 * Limited to Microsoft-internal use
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
  'outlook.office.com',
  'outlook-sdf.office.com',
  'outlook.office365.com',
  'outlook-sdf.office365.com',
  'outlook.live.com',
  'outlook-sdf.live.com',
  '*.teams.microsoft.com',
  '*.www.office.com',
  'www.office.com',
  'word.office.com',
  'excel.office.com',
  'powerpoint.office.com',
  'www.officeppe.com',
  '*.www.microsoft365.com',
  'www.microsoft365.com',
];

/**
 * @hidden
 * USer specified message origins should satisfy this test
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const userOriginUrlValidationRegExp = /^https:\/\//;

/**
 * @hidden
 * The protocol used for deep links into Teams
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const teamsDeepLinkProtocol = 'https';

/**
 * @hidden
 * The host used for deep links into Teams
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const teamsDeepLinkHost = 'teams.microsoft.com';

/** @hidden */
export const errorLibraryNotInitialized = 'The library has not yet been initialized';

/** @hidden */
export const errorRuntimeNotInitialized = 'The runtime has not yet been initialized';

/** @hidden */
export const errorRuntimeNotSupported = 'The runtime version is not supported';
