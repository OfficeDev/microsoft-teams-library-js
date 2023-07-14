/* eslint-disable @typescript-eslint/no-explicit-any */

import { Communication, sendMessageEventToChild, sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';
import { FilePreviewParameters, UserSettingTypes } from './interfaces';

/**
 * @hidden
 * Upload a custom App manifest directly to both team and personal scopes.
 * This method works just for the first party Apps.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function uploadCustomApp(manifestBlob: Blob, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized(runtime);

  sendMessageToParent('uploadCustomApp', [manifestBlob], onComplete ? onComplete : getGenericOnCompleteHandler());
}

/**
 * @hidden
 * Sends a custom action MessageRequest to host or parent window
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @param callback - Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendCustomMessage(actionName: string, args?: any[], callback?: (...args: any[]) => void): void {
  ensureInitialized(runtime);

  sendMessageToParent(actionName, args, callback);
}

/**
 * @hidden
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 *
 * @param actionName - Specifies name of the custom action to be sent
 * @param args - Specifies additional arguments passed to the action
 * @returns id of sent message
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function sendCustomEvent(actionName: string, args?: any[]): void {
  ensureInitialized(runtime);

  //validate childWindow
  if (!Communication.childWindow) {
    throw new Error('The child window has not yet been initialized or is not present');
  }
  sendMessageEventToChild(actionName, args);
}

/**
 * @hidden
 * Adds a handler for an action sent by a child window or parent window
 *
 * @param actionName - Specifies name of the action message to handle
 * @param customHandler - The callback to invoke when the action message is received. The return value is sent to the child
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerCustomHandler(actionName: string, customHandler: (...args: any[]) => any[]): void {
  ensureInitialized(runtime);
  registerHandler(actionName, (...args: any[]) => {
    return customHandler.apply(this, args);
  });
}

/**
 * @hidden
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 *
 * @param settingTypes - List of user setting changes to subscribe
 * @param handler - When a subscribed setting is updated this handler is called
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function registerUserSettingsChangeHandler(
  settingTypes: UserSettingTypes[],
  handler: (settingType: UserSettingTypes, value: any) => void,
): void {
  ensureInitialized(runtime);

  registerHandler('userSettingsChange', handler, true, [settingTypes]);
}

/**
 * @hidden
 * Opens a client-friendly preview of the specified file.
 *
 * @param file - The file to preview.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function openFilePreview(filePreviewParameters: FilePreviewParameters): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

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
    filePreviewParameters.subEntityId,
    filePreviewParameters.viewerAction,
    filePreviewParameters.fileOpenPreference,
    filePreviewParameters.conversationId,
  ];

  sendMessageToParent('openFilePreview', params);
}
