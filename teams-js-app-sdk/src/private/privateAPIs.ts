/* eslint-disable @typescript-eslint/no-explicit-any */

import { ensureInitialized } from '../internal/internalAPIs';
import { UserSettingTypes } from './interfaces';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { Communication, sendMessageToParent, sendMessageEventToChild } from '../internal/communication';
import { menus } from './menus';
import { registerHandler } from '../internal/handlers';

export function initializePrivateApis(): void {
  menus.initialize();
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

  sendMessageToParent('uploadCustomApp', [manifestBlob], onComplete ? onComplete : getGenericOnCompleteHandler());
}

/**
 * @private
 * Internal use only
 * Sends a custom action MessageRequest to Teams or parent window
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @param callback Optionally specify a callback to receive response parameters from the parent
 * @returns id of sent message
 */
export function sendCustomMessage(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[],
  // tslint:disable-next-line:no-any
  callback?: (...args: any[]) => void,
): void {
  ensureInitialized();

  sendMessageToParent(actionName, args, callback);
}

/**
 * @private
 * Internal use only
 * Sends a custom action MessageEvent to a child iframe/window, only if you are not using auth popup.
 * Otherwise it will go to the auth popup (which becomes the child)
 * @param actionName Specifies name of the custom action to be sent
 * @param args Specifies additional arguments passed to the action
 * @returns id of sent message
 */
export function sendCustomEvent(
  actionName: string,
  // tslint:disable-next-line:no-any
  args?: any[],
): void {
  ensureInitialized();

  //validate childWindow
  if (!Communication.childWindow) {
    throw new Error('The child window has not yet been initialized or is not present');
  }
  sendMessageEventToChild(actionName, args);
}

/**
 * @private
 * Internal use only
 * Adds a handler for an action sent by a child window or parent window
 * @param actionName Specifies name of the action message to handle
 * @param customHandler The callback to invoke when the action message is received. The return value is sent to the child
 */
export function registerCustomHandler(
  actionName: string,
  customHandler: (
    // tslint:disable-next-line:no-any
    ...args: any[]
  ) => any[],
): void {
  ensureInitialized();
  registerHandler(actionName, (...args: any[]) => {
    return customHandler.apply(this, args);
  });
}

/**
 * @private
 * register a handler to be called when a user setting changes. The changed setting type & value is provided in the callback.
 * @param settingTypes List of user setting changes to subscribe
 * @param handler When a subscribed setting is updated this handler is called
 */
export function registerUserSettingsChangeHandler(
  settingTypes: UserSettingTypes[],
  handler: (settingType: UserSettingTypes, value: any) => void,
): void {
  ensureInitialized();

  registerHandler('userSettingsChange', handler, true, [settingTypes]);
}
