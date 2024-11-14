import * as validOriginsJSON from '../artifactsForCDN/validDomains.json';

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
 * Fallback list of valid origins in JSON format
 *
 * @internal
 * Limited to Microsoft-internal use
 */
const validOriginsLocal = validOriginsJSON;

/**
 * @hidden
 * Fallback list of valid origins
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const validOriginsFallback = validOriginsLocal.validOrigins;

/**
 * @hidden
 * CDN endpoint of the list of valid origins
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export const validOriginsCdnEndpoint = new URL(
  'https://res.cdn.office.net/teams-js/validDomains/json/validDomains.json',
);

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

/** @hidden */
export const errorCallNotStarted = 'The call was not properly started';

export enum TeamsJSConsumptionSource {
  NPM = 'NPM',
  CDN = 'CDN',
  unknown = 'unkown',
}

// This assignment is replaced by the release pipeline
declare const CONSUMPTION_SOURCE = TeamsJSConsumptionSource.unknown;

/**
 * @hidden
 *  Package consumption source.
 */
export const consumptionSource = CONSUMPTION_SOURCE;
