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
  'bing.com',
  'edgeservices.bing.com',
  'www.bing.com',
  'www.staging-bing-int.com',
  'teams.cloud.microsoft',
  'outlook.cloud.microsoft',
  'm365.cloud.microsoft',
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

/** @hidden */
export const errorCallNotStarted = 'The call was not properly started';

/**
 * Use enum to set or update API version number
 * Note: V_0 = 'v0' is used for APIs who needs to be passed with correct version number
 * but haven't been implemented yet.
 * @internal
 * Limited to Microsoft-internal use
 */
export enum ApiVersionNumber {
  V_0 = 'v0',
  V_1 = 'v1',
  V_2 = 'v2',
  V_3 = 'v3',
}

export enum ApiName {
  App_GetContext = 'app.getContext',
  App_Initialize = 'app.initialize',
  App_NotifyAppLoaded = 'app.notifyAppLoaded',
  App_NotifyExpectedFailure = 'app.notifyExpectedFailure',
  App_NotifyFailure = 'app.notifyFailure',
  App_NotifySuccess = 'app.notifySuccess',
  App_OpenLink = 'app.openLink',
  App_RegisterOnThemeChangeHandler = 'app.registerOnThemeChangeHandler',
  AppEntity_SelectAppEntity = 'appEntity.selectAppEntity',
  Dialog_AdaptiveCard_Bot_Open = 'dialog.adaptiveCard.bot.open',
  Dialog_AdaptiveCard_Open = 'dialog.adaptiveCard.open',
  Dialog_Update_Resize = 'dialog.update.resize',
  Dialog_Url_Bot_Open = 'dialog.url.bot.open',
  Dialog_Url_Open = 'dialog.url.open',
  Dialog_Url_Submit = 'dialog.url.submit',
  Dialog_Url_SendMessageToParentFromDialog = 'dialog.url.sendMessageToParentFromDialog',
  Dialog_Url_SendMessageToDialog = 'dialog.url.sendMessageToDialog',
  GeoLocation_GetCurrentLocation = 'geoLocation.getCurrentLocation',
  GeoLocation_HasPermission = 'geoLocation.hasPermission',
  GeoLocation_Map_ChooseLocation = 'geoLocation.map.chooseLocation',
  GeoLocation_RequestPermission = 'geoLocation.hasPermission',
  GeoLocation_ShowLocation = 'geoLocation.showLocation',
  Location_GetLocation = 'location.getLocation',
  Location_ShowLocation = 'location.showLocation',
  Navigation_NavigateBack = 'navigation.navigateBack',
  Navigation_NavigateCrossDomain = 'navigation.navigateCrossDomain',
  Navigation_NavigateToTab = 'navigation.navigateToTab',
  Navigation_ReturnFocus = 'navigation.returnFocus',
  Pages_AppButton_OnClick = 'pages.appButton.onClick',
  Pages_AppButton_OnHoverEnter = 'pages.appButton.onHoverEnter',
  Pages_AppButton_OnHoverLeave = 'pages.appButton.onHoverLeave',
  Pages_BackStack_NavigateBack = 'pages.backStack.navigateBack',
  Pages_BackStack_RegisterBackButtonHandler = 'pages.backStack.registerBackButtonHandler',
  Pages_Config_RegisterChangeConfigHandler = 'pages.config.registerChangeConfigHandler',
  Pages_Config_RegisterOnRemoveHandlerHelper = 'pages.config.registerOnRemoveHandlerHelper',
  Pages_Config_RegisterOnSaveHandlerHelper = 'pages.config.registerOnSaveHandlerHelper',
  Pages_Config_SetConfig = 'pages.config.setConfig',
  Pages_Config_SetValidityState = 'pages.config.setValidityState',
  Pages_CurrentApp_NavigateTo = 'pages.currentApp.navigateTo',
  Pages_CurrentApp_NavigateToDefaultPage = 'pages.currentApp.navigateToDefaultPage',
  Pages_FullTrust_EnterFullscreen = 'pages.fullTrust.enterFullscreen',
  Pages_FullTrust_ExitFullscreen = 'pages.fullTrust.exitFullscreen',
  Pages_GetConfig = 'pages.getConfig.',
  Pages_NavigateCrossDomain = 'pages.navigateCrossDomain',
  Pages_NavigateToApp = 'pages.navigateToApp',
  Pages_RegisterFocusEnterHandler = 'pages.registerFocusEnterHandler',
  Pages_RegisterFullScreenHandler = 'pages.registerFullScreenHandler',
  Pages_ReturnFocus = 'pages.returnFocus',
  Pages_SetCurrentFrame = 'pages.setCurrentFrame',
  Pages_ShareDeepLink = 'pages.shareDeepLink',
  Pages_Tabs_GetMruTabInstances = 'pages.tabs.getMruTabInstances',
  Pages_Tabs_GetTabInstances = 'pages.tabs.getTabInstances',
  Pages_Tabs_NavigateToTab = 'pages.tabs.navigateToTab',
  PublicAPIs_ExecuteDeepLink = 'executeDeepLink',
  PublicAPIs_GetContext = 'getContext',
  PublicAPIs_GetMruTabInstances = 'getMruTabInstances',
  PublicAPIs_GetTabInstances = 'getTabInstances',
  PublicAPIs_Initialize = 'initialize',
  PublicAPIs_RegisterAppButtonClickHandler = 'registerAppButtonClickHandler',
  PublicAPIs_RegisterAppButtonHoverEnterHandler = 'registerAppButtonHoverEnterHandler',
  PublicAPIs_RegisterAppButtonHoverLeaveHandler = 'registerAppButtonHoverLeaveHandler',
  PublicAPIs_RegisterBackButtonHandler = 'registerBackButtonHandler',
  PublicAPIs_RegisterChangeSettingsHandler = 'registerChangeSettingsHandler',
  PublicAPIs_RegisterFocusEnterHandler = 'registerFocusEnterHandler',
  PublicAPIs_RegisterFullScreenHandler = 'registerFullScreenHandler',
  PublicAPIs_RegisterOnLoadHandler = 'registerOnLoadHandler',
  PublicAPIs_RegisterOnThemeChangeHandlerHelper = 'registerOnThemeChangeHandlerHelper',
  PublicAPIs_SetFrameContext = 'setFrameContext',
  PublicAPIs_ShareDeepLink = 'shareDeepLink',
  RegisterHandler = 'registerHandler',
  RegisterOnThemeChangeHandler = 'registerOnThemeChangeHandler',
  Settings_Remove_Failure = 'settings.remove.failure',
  Settings_Remove_Success = 'settings.remove.success',
  Settings_Save_Failure = 'settings.save.failure',
  Settings_Save_Success = 'settings.save.success',
  Tasks_StartTask = 'tasks.startTask',
  Tasks_SubmitTask = 'tasks.submitTask',
  Tasks_UpdateTask = 'tasks.updateTask',
}
