/**
 * Subcapability that allows communication between the dialog and the parent app.
 *
 * @remarks
 * Note that dialog can be invoked from parentless scenarios e.g. Search Message Extensions. The subcapability `parentCommunication` is not supported in such scenarios.
 *
 * @module
 */

import { sendMessageToParent } from '../../../internal/communication';
import { dialogTelemetryVersionNumber, storedMessages } from '../../../internal/dialogHelpers';
import { registerHandler, removeHandler } from '../../../internal/handlers';
import { ensureInitialized } from '../../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../../constants';
import { runtime } from '../../runtime';
import { PostMessageChannel } from '../dialog';

/**
 *  Send message to the parent from dialog
 *
 * @remarks
 * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
 *
 * @param message - The message to send to the parent
 */
export function sendMessageToParentFromDialog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any,
): void {
  ensureInitialized(runtime, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  sendMessageToParent(
    getApiVersionTag(
      dialogTelemetryVersionNumber,
      ApiName.Dialog_Url_ParentCommunication_SendMessageToParentFromDialog,
    ),
    'messageForParent',
    [message],
  );
}

/**
 *  Send message to the dialog from the parent
 *
 * @param message - The message to send
 */
export function sendMessageToDialog(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: any,
): void {
  ensureInitialized(runtime, FrameContexts.content, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  sendMessageToParent(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_Url_ParentCommunication_SendMessageToDialog),
    'messageForChild',
    [message],
  );
}

/**
 * Register a listener that will be triggered when a message is received from the app that opened the dialog.
 *
 * @remarks
 * This function is only intended to be called from code running within the dialog. Calling it from outside the dialog will have no effect.
 *
 * @param listener - The listener that will be triggered.
 */
export function registerOnMessageFromParent(listener: PostMessageChannel): void {
  ensureInitialized(runtime, FrameContexts.task);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  // We need to remove the original 'messageForChild'
  // handler since the original does not allow for post messages.
  // It is replaced by the user specified listener that is passed in.
  removeHandler('messageForChild');
  registerHandler(
    getApiVersionTag(
      dialogTelemetryVersionNumber,
      ApiName.Dialog_Url_ParentCommunication_RegisterMessageForChildHandler,
    ),
    'messageForChild',
    listener,
  );
  storedMessages.reverse();
  while (storedMessages.length > 0) {
    const message = storedMessages.pop();
    listener(message);
  }
}

/**
 * Checks if dialog.url.parentCommunication capability is supported by the host
 *
 * @returns boolean to represent whether dialog.url.parentCommunication capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && !!runtime.supports.dialog?.url?.parentCommunication;
}
