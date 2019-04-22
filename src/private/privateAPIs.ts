import { ensureInitialized, sendMessageRequest } from "../internal/internalAPIs";
import { GlobalVars } from "../internal/globalVars";
import { frameContexts } from "../internal/constants";
import { ChatMembersInformation, ShowNotificationParameters, FilePreviewParameters, TeamInstanceParameters, UserJoinedTeamsInformation } from "./interfaces";
import { getGenericOnCompleteHandler, getGenericOnCompleteHandlerAsync } from "../internal/utils";

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
export function getUserJoinedTeams(
  callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void,
  teamInstanceParameters?: TeamInstanceParameters
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getUserJoinedTeams", [
    teamInstanceParameters
  ]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 * @returns Promise with {@link TeamInstanceParameters} object.
 */
export function getUserJoinedTeamsAsync(
  teamInstanceParameters?: TeamInstanceParameters
): Promise<UserJoinedTeamsInformation> {
  return new Promise<UserJoinedTeamsInformation>((resolve, reject) => {
    try {
      getUserJoinedTeams(userJoinedTeamsInformation => {
        resolve(userJoinedTeamsInformation);
      }, teamInstanceParameters);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @private
 * Hide from docs
 * ------
 * Place the tab into full-screen mode.
 */
export function enterFullscreen() {
  ensureInitialized(frameContexts.content);
  sendMessageRequest(GlobalVars.parentWindow, "enterFullscreen", []);
}

/**
 * @private
 * Hide from docs
 * ------
 * Reverts the tab into normal-screen mode. 
 */
export function exitFullscreen() {
  ensureInitialized(frameContexts.content);
  sendMessageRequest(GlobalVars.parentWindow, "exitFullscreen", []);
}

/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
export function openFilePreview(
  filePreviewParameters: FilePreviewParameters
): void {
  ensureInitialized(frameContexts.content);

  const params = [
    filePreviewParameters.entityId,
    filePreviewParameters.title,
    filePreviewParameters.description,
    filePreviewParameters.type,
    filePreviewParameters.objectUrl,
    filePreviewParameters.downloadUrl,
    filePreviewParameters.webPreviewUrl,
    filePreviewParameters.webEditUrl,
    filePreviewParameters.baseUrl,
    filePreviewParameters.editFile,
    filePreviewParameters.subEntityId
  ];

  sendMessageRequest(GlobalVars.parentWindow, "openFilePreview", params);
}

/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
export function showNotification(
  showNotificationParameters: ShowNotificationParameters
): void {
  ensureInitialized(frameContexts.content);
  const params = [
    showNotificationParameters.message,
    showNotificationParameters.notificationType
  ];
  sendMessageRequest(GlobalVars.parentWindow, "showNotification", params);
}

/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export function uploadCustomApp(manifestBlob: Blob, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "uploadCustomApp", [
    manifestBlob
  ]);
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler();
}

/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export function uploadCustomAppAsync(manifestBlob: Blob): Promise<boolean | string> {
  return new Promise<boolean | string>((resolve, reject) => {
    try {
      uploadCustomApp(manifestBlob, getGenericOnCompleteHandlerAsync(resolve, reject));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @private
 * Internal use only
 * Sends a custom action message to Teams.
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export function sendCustomMessage(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[]
): number {
  ensureInitialized();
  return sendMessageRequest(GlobalVars.parentWindow, actionName, args);
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
export function getChatMembers(
  callback: (chatMembersInformation: ChatMembersInformation) => void
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getChatMembers");
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @returns Promise with ChatMembersInformation object.
 */
export function getChatMembersAsync(
): Promise<ChatMembersInformation> {
  return new Promise<ChatMembersInformation>((resolve, reject) => {
    try {
      getChatMembers(chatMembersInformation => {
        resolve(chatMembersInformation);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to get the configuration setting value
 * @param callback The callback to invoke when the value is retrieved.
 * @param key The key for the config setting
 */
export function getConfigSetting(
  callback: (value: string) => void,
  key: string
): void {
  ensureInitialized();

  const messageId = sendMessageRequest(GlobalVars.parentWindow, "getConfigSetting", [
    key
  ]);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to get the configuration setting value
 * @param key The key for the config setting
 * @returns Promise with config setting value
 */
export function getConfigSettingAsync(
  key: string
): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    try {
      getConfigSetting(value => {
        resolve(value);
      }, key);
    } catch (error) {
      reject(error);
    }
  });
}
