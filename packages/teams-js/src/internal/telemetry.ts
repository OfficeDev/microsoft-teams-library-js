import { debug as registerLogger, Debugger } from 'debug';

import { handleHostToAppPerformanceMetrics } from './handlers';
import { CallbackInformation } from './interfaces';
import { MessageResponse } from './messageObjects';
import { getCurrentTimestamp } from './utils';

import { UUID } from './uuidObject';

// Each teamsjs instance gets a unique identifier that will be prepended to every log statement
export const teamsJsInstanceIdentifier = new UUID();

// Every log statement will get prepended with the teamsJsInstanceIdentifier and a timestamp
const originalFormatArgsFunction = registerLogger.formatArgs;
registerLogger.formatArgs = function (args) {
  args[0] = `(${new Date().toISOString()}): ${args[0]} [${teamsJsInstanceIdentifier.toString()}]`;
  originalFormatArgsFunction.call(this, args);
};

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
 * v3 will be used for next beta version of APIs if they have used v2
 * @internal
 * Limited to Microsoft-internal use
 */
export const enum ApiVersionNumber {
  V_1 = 'v1',
  V_2 = 'v2',
  V_3 = 'v3',
}

/**
 * @internal
 * Limited to Microsoft-internal use
 */
export class HostToAppMessageDelayTelemetry {
  private static callbackInformation: Map<UUID, CallbackInformation> = new Map();

  /**
   * @internal
   * Limited to Microsoft-internal use
   *
   * Store information about a particular message.
   * @param messageUUID The message id for the request.
   * @param callbackInformation The information of the callback.
   */
  public static storeCallbackInformation(messageUUID: UUID, callbackInformation: CallbackInformation): void {
    HostToAppMessageDelayTelemetry.callbackInformation.set(messageUUID, callbackInformation);
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   */
  public static clearMessages(): void {
    HostToAppMessageDelayTelemetry.callbackInformation.clear();
  }

  /**
   * @internal
   * Limited to Microsoft-internal use
   *
   * Executes telemetry actions related to host to app performance metrics.
   * @param callbackId The message id for the request.
   * @param message The response from the host.
   * @param logger A logger for logging any possible error.
   */
  public static telemetryHostToAppPerformanceMetrics(
    callbackID: UUID,
    message: MessageResponse,
    logger: debug.Debugger,
  ): void {
    const callbackInformation = HostToAppMessageDelayTelemetry.callbackInformation.get(callbackID);
    if (callbackInformation && message.timestamp) {
      handleHostToAppPerformanceMetrics({
        actionName: callbackInformation.name,
        messageDelay: getCurrentTimestamp() - message.timestamp,
        messageWasCreatedAt: callbackInformation.calledAt,
      });
    } else {
      logger('Unable to send performance metrics for callback %i with arguments %o', callbackID, message.args);
    }
  }
}

export const enum ApiName {
  App_GetContext = 'app.getContext',
  App_Initialize = 'app.initialize',
  App_NotifyAppLoaded = 'app.notifyAppLoaded',
  App_NotifyExpectedFailure = 'app.notifyExpectedFailure',
  App_NotifyFailure = 'app.notifyFailure',
  App_NotifySuccess = 'app.notifySuccess',
  App_OpenLink = 'app.openLink',
  App_RegisterOnThemeChangeHandler = 'app.registerOnThemeChangeHandler',
  AppInitialization_NotifyAppLoaded = 'appInitialization.notifyAppLoaded',
  AppInitialization_NotifyExpectedFailure = 'appInitialization.notifyExpectedFailure',
  AppInitialization_NotifyFailure = 'appInitialization.notifyFailure',
  AppInitialization_NotifySuccess = 'appInitialization.notifySuccess',
  AppEntity_SelectAppEntity = 'appEntity.selectAppEntity',
  AppInstallDialog_OpenAppInstallDialog = 'appInstallDialog.openAppInstallDialog',
  AppWindow_ChildAppWindow_AddEventListener = 'appWindow.childAppWindow.addEventListener',
  AppWindow_ChildAppWindow_PostMessage = 'appWindow.childAppWindow.postMessage',
  AppWindow_ParentAppWindow_AddEventListener = 'appWindow.parentAppWindow.addEventListener',
  AppWindow_ParentAppWindow_PostMessage = 'appWindow.parentAppWindow.postMessage',
  Authentication_AuthenticationWindow_RegisterInitializeHandler = 'authentication.authenticationWindow.registerInitializeHandler',
  Authentication_AuthenticationWindow_RegisterNavigateCrossDomainHandler = 'authentication.authenticationWindow.registerNavigateCrossDomainHandler',
  Authentication_Authenticate = 'authentication.authenticate',
  Authentication_GetAuthToken = 'authentication.getAuthToken',
  Authentication_GetUser = 'authentication.getUser',
  Authentication_NotifyFailure = 'authentication.notifyFailure',
  Authentication_NotifySuccess = 'authentication.notifySuccess',
  Authentication_RegisterAuthenticateFailureHandler = 'authentication.registerAuthenticateFailureHandler',
  Authentication_RegisterAuthenticateSuccessHandler = 'authentication.registerAuthenticateSuccessHandler',
  BarCode_HasPermission = 'barCode.hasPermission',
  BarCode_RequestPermission = 'barCode.requestPermission',
  BarCode_ScanBarCode = 'barCode.scanBarCode',
  Calendar_ComposeMeeting = 'calendar.composeMeeting',
  Calendar_OpenCalendarItem = 'calendar.openCalendarItem',
  Meeting_JoinMeeting = 'meeting.joinMeeting',
  Call_StartCall = 'call.startCall',
  Chat_OpenChat = 'chat.openChat',
  Chat_OpenGroupChat = 'chat.openGroupChat',
  Clipboard_Read = 'clipboard.read',
  Clipboard_Write = 'clipboard.write',
  Conversations_CloseConversation = 'conversations.closeConversation',
  Conversations_GetChatMember = 'conversations.getChatMember',
  Conversations_OpenConversation = 'conversations.openConversation',
  Conversations_RegisterCloseConversationHandler = 'conversations.registerCloseConversationHandler',
  Conversations_RegisterStartConversationHandler = 'conversations.registerStartConversationHandler',
  Copilot_Eligibility_GetEligibilityInfo = 'copilot.eligibility.getEligibilityInfo',
  Dialog_AdaptiveCard_Bot_Open = 'dialog.adaptiveCard.bot.open',
  Dialog_AdaptiveCard_Open = 'dialog.adaptiveCard.open',
  Dialog_RegisterMessageForChildHandler = 'dialog.registerMessageForChildHandler',
  Dialog_Update_Resize = 'dialog.update.resize',
  Dialog_Url_Bot_Open = 'dialog.url.bot.open',
  Dialog_Url_Bot_RegisterMessageForParentHandler = 'dialog.url.bot.registerMessageForParentHandler',
  Dialog_Url_Open = 'dialog.url.open',
  Dialog_Url_RegisterMessageForParentHandler = 'dialog.url.registerMessageForParentHandler',
  Dialog_Url_Submit = 'dialog.url.submit',
  Dialog_Url_ParentCommunication_RegisterMessageForChildHandler = 'dialog.url.parentCommunication.registerMessageForChildHandler',
  Dialog_Url_ParentCommunication_SendMessageToParentFromDialog = 'dialog.url.parentCommunication.sendMessageToParentFromDialog',
  Dialog_Url_ParentCommunication_SendMessageToDialog = 'dialog.url.parentCommunication.sendMessageToDialog',
  ExternalAppAuthentication_AuthenticateAndResendRequest = 'externalAppAuthentication.authenticateAndResendRequest',
  ExternalAppAuthentication_AuthenticateWithSSO = 'externalAppAuthentication.authenticateWithSSO',
  ExternalAppAuthentication_AuthenticateWithSSOAndResendRequest = 'externalAppAuthentication.authenticateWithSSOAndResendRequest',
  ExternalAppAuthentication_AuthenticateWithOauth2 = 'externalAppAuthentication.authenticateWithOauth2',
  ExternalAppAuthentication_AuthenticateWithPowerPlatformConnectorPlugins = 'externalAppAuthentication.authenticateWithPowerPlatformConnectorPlugins',
  ExternalAppAuthenticationForCEA_AuthenticateWithOauth = 'externalAppAuthenticationForCEA.authenticateWithOauth',
  ExternalAppAuthenticationForCEA_AuthenticateWithSSO = 'externalAppAuthenticationForCEA.authenticateWithSSO',
  ExternalAppAuthenticationForCEA_AuthenticateAndResendRequest = 'externalAppAuthenticationForCEA.authenticateAndResendRequest',
  ExternalAppAuthenticationForCEA_AuthenticateWithSSOAndResendRequest = 'externalAppAuthenticationForCEA.authenticateWithSSOAndResendRequest',
  ExternalAppCardActions_ProcessActionOpenUrl = 'externalAppCardActions.processActionOpenUrl',
  ExternalAppCardActions_ProcessActionSubmit = 'externalAppCardActions.processActionSubmit',
  ExternalAppCardActionsForCEA_ProcessActionOpenUrl = 'externalAppCardActionsForCEA.processActionOpenUrl',
  ExternalAppCardActionsForCEA_ProcessActionSubmit = 'externalAppCardActionsForCEA.processActionSubmit',
  ExternalAppCommands_ProcessActionCommands = 'externalAppCommands.processActionCommand',
  Files_AddCloudStorageFolder = 'files.addCloudStorageFolder',
  Files_AddCloudStorageProvider = 'files.addCloudStorageProvider',
  Files_AddCloudStorageProviderFile = 'files.addCloudStorageProviderFile',
  Files_CopyMoveFiles = 'files.copyMoveFiles',
  Files_DeleteCloudStorageFolder = 'files.deleteCloudStorageFolder',
  Files_DeleteCloudStorageProviderFile = 'files.deleteCloudStorageProviderFile',
  Files_DownloadCloudStorageProviderFile = 'files.downloadCloudStorageProviderFile',
  Files_GetCloudStorageFolderContents = 'files.getCloudStorageFolderContents',
  Files_GetCloudStorageFolders = 'files.getCloudStorageFolders',
  Files_GetExternalProviders = 'files.getExternalProviders',
  Files_GetFileDownloads = 'files.getFileDownloads',
  Files_OpenCloudStorageFile = 'files.openCloudStorageFile',
  Files_OpenDownloadFolder = 'files.openDownloadFolder',
  Files_RegisterCloudStorageProviderContentChangeHandler = 'files.registerCloudStorageProviderContentChangeHandler',
  Files_RegisterCloudStorageProviderListChangeHandler = 'files.registerCloudStorageProviderListChangeHandler',
  Files_RemoveCloudStorageProvider = 'files.removeCloudStorageProvider',
  Files_RenameCloudStorageProviderFile = 'files.renameCloudStorageProviderFile',
  Files_UploadCloudStorageProviderFile = 'files.uploadCloudStorageProviderFile',
  GeoLocation_GetCurrentLocation = 'geoLocation.getCurrentLocation',
  GeoLocation_HasPermission = 'geoLocation.hasPermission',
  GeoLocation_Map_ChooseLocation = 'geoLocation.map.chooseLocation',
  GeoLocation_RequestPermission = 'geoLocation.requestPermission',
  GeoLocation_ShowLocation = 'geoLocation.showLocation',
  HandleBeforeUnload = 'handleBeforeUnload',
  HostEntity_Tab_addAndConfigureApp = 'hostEntity.tab.addAndConfigure',
  HostEntity_Tab_reconfigure = 'hostEntity.tab.reconfigure',
  HostEntity_Tab_rename = 'hostEntity.tab.rename',
  HostEntity_Tab_remove = 'hostEntity.tab.remove',
  HostEntity_Tab_getAll = 'hostEntity.tab.getAll',
  Interactive_GetClientInfo = 'interactive.getClientInfo',
  Interactive_GetClientRoles = 'interactive.getClientRoles',
  Interactive_GetFluidContainerId = 'interactive.getFluidContainerId',
  Interactive_GetFluidTenantInfo = 'interactive.getFluidTenantInfo',
  Interactive_GetFluidToken = 'interactive.getFluidToken',
  Interactive_GetNtpTime = 'interactive.getNtpTime',
  Interactive_RegisterClientId = 'interactive.registerClientId',
  Interactive_SetFluidContainerId = 'interactive.setFluidContainerId',
  Location_GetLocation = 'location.getLocation',
  Location_ShowLocation = 'location.showLocation',
  Logs_Receive = 'log.receive',
  Logs_RegisterLogRequestHandler = 'log.request',
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
  Media_RegisterGetMediaRequestHandler = 'media.registerGetMediaRequestHandler',
  Media_RequestPermission = 'media.requestPermission',
  Media_ScanBarCode = 'media.scanBarCode',
  Media_SelectMedia = 'media.selectMedia',
  Media_ViewImages = 'media.viewImages',
  Meeting_AppShareButton_SetOptions = 'meeting.appShareButton.setOptions',
  Meeting_GetAppContentStageSharingCapabilities = 'meeting.getAppContentStageSharingCapabilities',
  Meeting_GetAppContentStageSharingState = 'meeting.getAppContentStageSharingState',
  Meeting_GetAuthenticationTokenForAnonymousUser = 'meeting.getAuthenticationTokenForAnonymousUser',
  Meeting_GetIncomingClientAudioState = 'meeting.getIncomingClientAudioState',
  Meeting_GetLiveStreamState = 'meeting.getLiveStreamState',
  Meeting_GetMeetingDetails = 'meeting.getMeetingDetails',
  Meeting_GetMeetingDetailsVerbose = 'meeting.getMeetingDetailsVerbose',
  Meeting_RegisterAudioDeviceSelectionChangedHandler = 'meeting.registerAudioDeviceSelectionChangedHandler',
  Meeting_RegisterLiveStreamChangedHandler = 'meeting.registerLiveStreamChangedHandler',
  Meeting_RegisterMeetingReactionReceivedHandler = 'meeting.registerMeetingReactionReceivedHandler',
  Meeting_RegisterMicStateChangeHandler = 'meeting.registerMicStateChangeHandler',
  Meeting_RegisterRaiseHandStateChangedHandler = 'meeting.registerRaiseHandStateChangedHandler',
  Meeting_RegisterSpeakingStateChangeHandler = 'meeting.registerSpeakingStateChangeHandler',
  Meeting_RequestAppAudioHandling = 'meeting.requestAppAudioHandling',
  Meeting_RequestStartLiveStreaming = 'meeting.requestStartLiveStreaming',
  Meeting_RequestStopLiveStreaming = 'meeting.requestStopLiveStreaming',
  Meeting_SetMicStateWithReason = 'meeting.setMicStateWithReason',
  Meeting_ShareAppContentToStage = 'meeting.shareAppContentToStage',
  Meeting_StopSharingAppContentToStage = 'meeting.stopSharingAppContentToStage',
  Meeting_ToggleIncomingClientAudio = 'meeting.toggleIncomingClientAudio',
  MeetingRoom_GetPairedMeetingRoomInfo = 'meetingRoom.getPairedMeetingRoomInfo',
  MeetingRoom_RegisterMeetingRoomCapabilitiesUpdateHandler = 'meetingRoom.registerMeetingRoomCapabilitiesUpdateHandler',
  MeetingRoom_RegisterMeetingRoomStatesUpdateHandler = 'meetingRoom.registerMeetingRoomStatesUpdateHandler',
  MeetingRoom_SendCommandToPairedMeetingRoom = 'meetingRoom.sendCommandToPairedMeetingRoom',
  Menus_HandleActionMenuItemPress = 'menus.handleActionMenuItemPress',
  Menus_HandleNavBarMenuItemPress = 'menus.handleNavBarMenuItemPress',
  Menus_HandleViewConfigItemPress = 'menus.handleViewConfigItemPress',
  Menus_RegisterActionMenuItemPressHandler = 'menus.registerActionMenuItemPressHandler',
  Menus_RegisterNavBarMenuItemPressHandler = 'menus.registerNavBarMenuItemPressHandler',
  Menus_RegisterSetModuleViewHandler = 'menus.registerSetModuleViewHandler',
  Menus_SetNavBarMenu = 'menus.setNavBarMenu',
  Menus_SetUpViews = 'menus.setUpViews',
  Menus_ShowActionMenu = 'menus.showActionMenu',
  MessageChannels_Telemetry_GetTelemetryPort = 'messageChannels.telemetry.getTelemetryPort',
  MessageChannels_DataLayer_GetDataLayerPort = 'messageChannels.dataLayer.getDataLayerPort',
  Monetization_OpenPurchaseExperience = 'monetization.openPurchaseExperience',
  Navigation_NavigateBack = 'navigation.navigateBack',
  Navigation_NavigateCrossDomain = 'navigation.navigateCrossDomain',
  Navigation_NavigateToTab = 'navigation.navigateToTab',
  Navigation_ReturnFocus = 'navigation.returnFocus',
  Notifications_ShowNotification = 'notifications.showNotification',
  OtherAppStateChange_Install = 'otherApp.install',
  OtherAppStateChange_UnregisterInstall = 'otherApp.unregisterInstall',
  Pages_AppButton_OnClick = 'pages.appButton.onClick',
  Pages_AppButton_OnHoverEnter = 'pages.appButton.onHoverEnter',
  Pages_AppButton_OnHoverLeave = 'pages.appButton.onHoverLeave',
  Pages_BackStack_NavigateBack = 'pages.backStack.navigateBack',
  Pages_BackStack_RegisterBackButtonHandler = 'pages.backStack.registerBackButtonHandler',
  Pages_BackStack_RegisterBackButtonPressHandler = 'pages.backStack.registerBackButtonPressHandler',
  Pages_Config_RegisterChangeConfigHandler = 'pages.config.registerChangeConfigHandler',
  Pages_Config_RegisterOnRemoveHandler = 'pages.config.registerOnRemoveHandler',
  Pages_Config_RegisterOnSaveHandler = 'pages.config.registerOnSaveHandler',
  Pages_Config_RegisterSettingsRemoveHandler = 'pages.config.registerSettingsRemoveHandler',
  Pages_Config_RegisterSettingsSaveHandler = 'pages.config.registerSettingsSaveHandler',
  Pages_Config_SetConfig = 'pages.config.setConfig',
  Pages_Config_SetValidityState = 'pages.config.setValidityState',
  Pages_CurrentApp_NavigateTo = 'pages.currentApp.navigateTo',
  Pages_CurrentApp_NavigateToDefaultPage = 'pages.currentApp.navigateToDefaultPage',
  Pages_InitializeWithFrameContext = 'pages.initializeWithFrameContext',
  Pages_FullTrust_EnterFullscreen = 'pages.fullTrust.enterFullscreen',
  Pages_FullTrust_ExitFullscreen = 'pages.fullTrust.exitFullscreen',
  Pages_GetConfig = 'pages.getConfig.',
  Pages_NavigateCrossDomain = 'pages.navigateCrossDomain',
  Pages_NavigateToApp = 'pages.navigateToApp',
  Pages_RegisterFocusEnterHandler = 'pages.registerFocusEnterHandler',
  Pages_RegisterFullScreenHandler = 'pages.registerFullScreenHandler',
  Pages_RemoveEvent_NotifyFailure = 'pages.removeEvent.notifyFailure',
  Pages_RemoveEvent_NotifySuccess = 'pages.removeEvent.notifySuccess',
  Pages_ReturnFocus = 'pages.returnFocus',
  Pages_SaveEvent_NotifyFailure = 'pages.saveEvent.notifyFailure',
  Pages_SaveEvent_NotifySuccess = 'pages.saveEvent.notifySuccess',
  Pages_SetCurrentFrame = 'pages.setCurrentFrame',
  Pages_ShareDeepLink = 'pages.shareDeepLink',
  Pages_Tabs_GetMruTabInstances = 'pages.tabs.getMruTabInstances',
  Pages_Tabs_GetTabInstances = 'pages.tabs.getTabInstances',
  Pages_Tabs_NavigateToTab = 'pages.tabs.navigateToTab',
  People_SelectPeople = 'people.selectPeople',
  PrivateAPIs_OpenFilePreview = 'openFilePreview',
  PrivateAPIs_RegisterCustomHandler = 'registerCustomHandler',
  PrivateAPIs_RegisterUserSettingsChangeHandler = 'registerUserSettingsChangeHandler',
  PrivateAPIs_SendCustomMessage = 'sendCustomMessage',
  PrivateAPIs_UploadCustomApp = 'uploadCustomApp',
  Profile_ShowProfile = 'profile.showProfile',
  PublicAPIs_ExecuteDeepLink = 'executeDeepLink',
  PublicAPIs_GetContext = 'getContext',
  PublicAPIs_GetMruTabInstances = 'getMruTabInstances',
  PublicAPIs_GetTabInstances = 'getTabInstances',
  PublicAPIs_Initialize = 'initialize',
  PublicAPIs_InitializeWithFrameContext = 'initializeWithFrameContext',
  PublicAPIs_RegisterAppButtonClickHandler = 'registerAppButtonClickHandler',
  PublicAPIs_RegisterAppButtonHoverEnterHandler = 'registerAppButtonHoverEnterHandler',
  PublicAPIs_RegisterAppButtonHoverLeaveHandler = 'registerAppButtonHoverLeaveHandler',
  PublicAPIs_RegisterBackButtonHandler = 'registerBackButtonHandler',
  PublicAPIs_RegisterBeforeUnloadHandler = 'registerBeforeUnloadHandler',
  PublicAPIs_RegisterChangeSettingsHandler = 'registerChangeSettingsHandler',
  PublicAPIs_RegisterFocusEnterHandler = 'registerFocusEnterHandler',
  PublicAPIs_RegisterFullScreenHandler = 'registerFullScreenHandler',
  PublicAPIs_RegisterOnLoadHandler = 'registerOnLoadHandler',
  PublicAPIs_RegisterOnThemeChangeHandlerHelper = 'registerOnThemeChangeHandlerHelper',
  PublicAPIs_SetFrameContext = 'setFrameContext',
  PublicAPIs_ShareDeepLink = 'shareDeepLink',
  RegisterBeforeSuspendOrTerminateHandler = 'registerBeforeSuspendOrTerminateHandler',
  RegisterHandler = 'registerHandler',
  RegisterOnResumeHandler = 'registerOnResumeHandler',
  RegisterOnThemeChangeHandler = 'registerOnThemeChangeHandler',
  RemoteCamera_GetCapableParticipants = 'remoteCamera.getCapableParticipants',
  RemoteCamera_RegisterOnCapableParticipantsChangeHandler = 'remoteCamera.registerOnCapableParticipantsChangeHandler',
  RemoteCamera_RegisterOnDeviceStateChangeHandler = 'remoteCamera.registerOnDeviceStateChangeHandler',
  RemoteCamera_RegisterOnErrorHandler = 'remoteCamera.registerOnErrorHandler',
  RemoteCamera_RegisterOnSessionStatusChangeHandler = 'remoteCamera.registerOnSessionStatusChangeHandler',
  RemoteCamera_RequestControl = 'remoteCamera.requestControl',
  RemoteCamera_SendControlCommand = 'remoteCamera.sendControlCommand',
  RemoteCamera_TerminateSession = 'remoteCamera.terminateSession',
  Search_CloseSearch = 'search.closeSearch',
  Search_RegisterOnChangeHandler = 'search.registerOnChangeHandler',
  Search_RegisterOnClosedHandler = 'search.registerOnClosedHandler',
  Search_RegisterOnExecutedHandler = 'search.registerOnExecutedHandler',
  Search_UnregisterHandlers = 'search.unregisterHandlers',
  SecondaryBrowser_OpenUrl = 'secondaryBrowser.openUrl',
  Settings_GetSettings = 'settings.getSettings',
  Settings_RegisterOnRemoveHandler = 'settings.registerOnRemoveHandler',
  Settings_RegisterOnSaveHandler = 'settings.registerOnSaveHandler',
  Settings_Remove_Failure = 'settings.remove.failure',
  Settings_Remove_Success = 'settings.remove.success',
  Settings_Save_Failure = 'settings.save.failure',
  Settings_Save_Success = 'settings.save.success',
  Settings_SetSettings = 'settings.setSettings',
  Settings_SetValidityState = 'settings.setValidityState',
  Sharing_History_GetContent = 'sharing.history.getContent',
  Sharing_ShareWebContent = 'sharing.shareWebContent',
  StageView_Open = 'stageView.open',
  StageView_Self_Close = 'stageView.self.close',
  Tasks_StartTask = 'tasks.startTask',
  Tasks_SubmitTask = 'tasks.submitTask',
  Tasks_UpdateTask = 'tasks.updateTask',
  Teams_FullTrust_GetConfigSetting = 'teams.fullTrust.getConfigSetting',
  Teams_FullTrust_JoinedTeams_GetUserJoinedTeams = 'teams.fullTrust.joinedTeams.getUserJoinedTeams',
  Teams_GetTeamChannels = 'teams.getTeamChannels',
  Teams_RefreshSiteUrl = 'teams.refreshSiteUrl',
  TeamsAPIs_RegisterBeforeUnloadHandler = 'teamsAPIs_registerBeforeUnloadHandler',
  TeamsAPIs_RegisterOnLoadHandler = 'teamsAPIs_registerOnLoadHandler',
  ThirdPartyCloudStorage_GetDragAndDropFiles = 'thirdPartyCloudStorage.getDragAndDropFiles',
  VideoEffects_MediaStream_RegisterForVideoFrame = 'videoEffects.mediaStream.registerForVideoFrame',
  VideoEffects_NotifySelectedVideoEffectChanged = 'videoEffects.notifySelectedVideoEffectChanged',
  VideoEffects_NotifyError = 'videoEffects.notifyError',
  VideoEffects_NotifyVideoFrameProcessed = 'videoEffects.notifyVideoFrameProcessed',
  VideoEffects_RegisterEffectParameterChangeHandler = 'videoEffects.registerEffectParameterChangeHandler',
  VideoEffects_RegisterForVideoEffect = 'videoEffects.registerForVideoEffect',
  VideoEffects_RegisterForVideoFrame = 'videoEffects.registerForVideoFrame',
  VideoEffects_RegisterSetFrameProcessTimeLimitHandler = 'videoEffects.setFrameProcessTimeLimitHandler',
  VideoEffects_RegisterStartVideoExtensibilityVideoStreamHandler = 'videoEffects.startVideoExtensibilityVideoStreamHandler',
  VideoEffects_RegisterForVideoBufferHandler = 'videoEffects.registerForVideoBufferHandler',
  VideoEffectsEx_MediaStream_RegisterForVideoFrame = 'videoEffectsEX.mediaStream.registerForVideoFrame',
  VideoEffectsEx_NotifyError = 'videoEffectsEx.notifyError',
  VideoEffectsEx_NotifySelectedVideoEffectChanged = 'videoEffectsEx.notifySelectedVideoEffectChanged',
  VideoEffectsEx_NotifyVideoFrameProcessed = 'videoEffectsEx.notifyVideoFrameProcessed',
  VideoEffectsEx_RegisterEffectParameterChangeHandler = 'videoEffectsEx.registerEffectParamterChangeHandler',
  VideoEffectsEx_RegisterForVideoEffect = 'videoEffectsEx.registerForVideoEffect',
  VideoEffectsEx_RegisterForVideoFrame = 'videoEffectsEx.registerForVideoFrame',
  VideoEffectsEx_RegisterNewVideoFrameHandler = 'videoEffectsEx.registerNewVideoFrameHandler',
  VideoEffectsEx_RegisterSetFrameProcessTimeLimitHandler = 'videoEffectsEX.registerSetFrameProcessTimeLimitHandler',
  VideoEffectsEx_RegisterStartVideoExtensibilityVideoStreamHandler = 'videoEffectsEX.registerStartVideoExtensibilityVideoStreamHandler',
  VideoEffectsEx_UpdatePersonalizedEffects = 'videoEffectsEx.updatePersonalizedEffects',
  VideoEffectsUtils_EffectFailure = 'videoEffectsUtils.effectFailure',
  VideoEffectsUtils_ReportVideoEffectChanged = 'videoEffectsUtils.reportVideoEffectChanged',
  VideoEffectsUtils_TransformerWithMetadata_Constructor = 'videoEffectsUtils.transformerWithMetadata.constructor',
  VideoPerformanceMonitor_Constructor = 'videoPerformanceMonitor.performanceDataGenerated',
  VideoPerformanceMonitor_ReportFrameProcessed = 'videoPerformanceMonitor.reportFrameProcessed',
  VideoPerformanceMonitor_ReportTextureStreamAcquired = 'videoPerformanceMonitor.reportTextureStreamAcquired',
  VideoPerformanceMonitor_StartMonitorSlowFrameProcessing = 'videoPerformanceMonitor.startMonitorSlowFrameProcessing',
  VisualMedia_HasPermission = 'visualMedia.hasPermission',
  VisualMedia_Image_CaptureImages = 'visualMedia.image.captureImages',
  VisualMedia_Image_RetrieveImages = 'visualMedia.image.retrieveImages',
  VisualMedia_RequestPermission = 'visualMedia.requestPermission',
  WebStorage_IsWebStorageClearedOnUserLogOut = 'webStorage.isWebStorageClearedOnUserLogOut',
}
