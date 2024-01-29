import { debug as registerLogger, Debugger } from 'debug';

const topLevelLogger = registerLogger('teamsJs');

/**
 * @internal
 * Limited to Microsoft-internal use
 *
 * Returns a logger for a given namespace, within the pre-defined top-level teamsJs namespace
 */
export function getLogger(namespace: string): Debugger {
  return topLevelLogger.extend(namespace);
}

/**
 * @hidden
 * Creates a string tag for labeling apiVersionTag, which is used for API function call to create message request
 * sent to host(s).
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function getApiVersionTag(apiVersionNumber: ApiVersionNumber, functionName: ApiName): string {
  return `${apiVersionNumber}_${functionName}`;
}

/**
 * @hidden
 * Check if apiVersionTag developer sends follows the pattern starting with a lowercase 'v', then
 * followed by one or more digits, then concatenated with underscore and some characters to indicate api name.
 * For example, 'v2_app.getContext'. If yes, return true. Otherwise, return false.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isFollowingApiVersionTagFormat(apiVersionTag: string): boolean {
  const pattern = /^v\d+_[\w.]+$/;
  return pattern.test(apiVersionTag);
}

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
  BarCode_HasPermission = 'barCode.hasPermission',
  BarCode_RequestPermission = 'barCode.requestPermission',
  BarCode_ScanBarCode = 'barCode.scanBarCode',
  Calendar_ComposeMeeting = 'calendar.composeMeeting',
  Calendar_OpenCalendarItem = 'calendar.openCalendarItem',
  Calendar_JoinMeeting = 'calendar.joinMeeting',
  Call_StartCall = 'call.startCall',
  Clipboard_Read = 'clipboard.read',
  Clipboard_Write = 'clipboard.write',
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
  Mail_ComposeMail = 'mail.composeMail',
  Mail_OpenMailItem = 'mail.openMailItem',
  Marketplace_AddOrUpdateCartItems = 'marketplace.addOrUpdateCartItems',
  Marketplace_GetCart = 'marketplace.getCart',
  Marketplace_RemoveCardItems = 'marketplace.removeCartItems',
  Marketplace_UpdateCartStatus = 'marketplace.updateCartStatus',
  Media_CaptureImage = 'media.captureImage',
  Media_Controller = 'media.controller',
  Media_GetMedia = 'media.getMedia',
  Media_HasPermission = 'media.hasPermission',
  Media_RequestPermission = 'media.requestPermission',
  Media_ScanBarCode = 'media.scanBarCode',
  Media_SelectMedia = 'media.selectMedia',
  Media_ViewImages = 'media.viewImages',
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
