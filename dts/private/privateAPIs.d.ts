import { ChatMembersInformation, ShowNotificationParameters, FilePreviewParameters, TeamInstanceParameters, UserJoinedTeamsInformation } from "./interfaces";
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all user joined teams
 * @param callback The callback to invoke when the {@link TeamInstanceParameters} object is retrieved.
 * @param teamInstanceParameters OPTIONAL Flags that specify whether to scope call to favorite teams
 */
export declare function getUserJoinedTeams(callback: (userJoinedTeamsInformation: UserJoinedTeamsInformation) => void, teamInstanceParameters?: TeamInstanceParameters): void;
/**
 * @private
 * Hide from docs
 * ------
 * Place the tab into full-screen mode.
 */
export declare function enterFullscreen(): void;
/**
 * @private
 * Hide from docs
 * ------
 * Reverts the tab into normal-screen mode.
 */
export declare function exitFullscreen(): void;
/**
 * @private
 * Hide from docs.
 * ------
 * Opens a client-friendly preview of the specified file.
 * @param file The file to preview.
 */
export declare function openFilePreview(filePreviewParameters: FilePreviewParameters): void;
/**
 * @private
 * Hide from docs.
 * ------
 * display notification API.
 * @param message Notification message.
 * @param notificationType Notification type
 */
export declare function showNotification(showNotificationParameters: ShowNotificationParameters): void;
/**
 * @private
 * Hide from docs.
 * ------
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 */
export declare function uploadCustomApp(manifestBlob: Blob, onComplete?: (status: boolean, reason?: string) => void): void;
/**
 * @private
 * Internal use only
 * Sends a custom action message to Teams.
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export declare function sendCustomMessage(actionName: string, args?: any[]): number;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to retrieve information of all chat members
 * Because a malicious party run your content in a browser, this value should
 * be used only as a hint as to who the members are and never as proof of membership.
 * @param callback The callback to invoke when the {@link ChatMembersInformation} object is retrieved.
 */
export declare function getChatMembers(callback: (chatMembersInformation: ChatMembersInformation) => void): void;
/**
 * @private
 * Hide from docs
 * ------
 * Allows an app to get the configuration setting value
 * @param callback The callback to invoke when the value is retrieved.
 * @param key The key for the config setting
 */
export declare function getConfigSetting(callback: (value: string) => void, key: string): void;
