/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * This group of capabilities enables apps to show modal dialogs. There are two primary types of dialogs: URL-based dialogs and [Adaptive Card](https://learn.microsoft.com/adaptive-cards/) dialogs.
 * Both types of dialogs are shown on top of your app, preventing interaction with your app while they are displayed.
 * - URL-based dialogs allow you to specify a URL from which the contents will be shown inside the dialog.
 *   - For URL dialogs, use the functions and interfaces in the {@link url} module.
 * - Adaptive Card-based dialogs allow you to provide JSON describing an Adaptive Card that will be shown inside the dialog.
 *   - For Adaptive Card dialogs, use the functions and interfaces in the {@link adaptiveCard} module.
 *
 * @remarks Note that dialogs were previously called "task modules". While they have been renamed for clarity, the functionality has been maintained.
 * For more details, see [Dialogs](https://learn.microsoft.com/microsoftteams/platform/task-modules-and-cards/what-are-task-modules)
 *
 * @module
 */

import { dialogTelemetryVersionNumber, handleDialogMessage } from '../../internal/dialogHelpers';
import { registerHandler, removeHandler } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { FrameContexts } from '../constants';
import { runtime } from '../runtime';
import * as adaptiveCard from './adaptiveCard/adaptiveCard';
import * as update from './update';
import * as url from './url/url';

/**
 * Data Structure to represent the SDK response when dialog closes
 */
export interface ISdkResponse {
  /**
   * Error in case there is a failure before dialog submission
   */
  err?: string;

  /**
   * Value provided in the `result` parameter by the dialog when the {@linkcode url.submit} function
   * was called.
   * If the dialog was closed by the user without submitting (e.g., using a control in the corner
   * of the dialog), this value will be `undefined` here.
   */
  result?: string | object;
}

/**
 * Handler used to receive and process messages sent between a dialog and the app that launched it
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PostMessageChannel = (message: any) => void;

/**
 * Handler used for receiving results when a dialog closes, either the value passed by {@linkcode url.submit}
 * or an error if the dialog was closed by the user.
 *
 * @see {@linkcode ISdkResponse}
 */
export type DialogSubmitHandler = (result: ISdkResponse) => void;

/**
 * @hidden
 * Hide from docs because this function is only used during initialization
 *
 * Adds register handlers for messageForChild upon initialization and only in the tasks FrameContext. {@link FrameContexts.task}
 * Function is called during app initialization
 * @internal
 * Limited to Microsoft-internal use
 */
export function initialize(): void {
  registerHandler(
    getApiVersionTag(dialogTelemetryVersionNumber, ApiName.Dialog_RegisterMessageForChildHandler),
    'messageForChild',
    handleDialogMessage,
    false,
  );
}

/**
 * This function currently serves no purpose and should not be used. All functionality that used
 * to be covered by this method is now in subcapabilities and those isSupported methods should be
 * used directly.
 *
 * @hidden
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.dialog ? true : false;
}

export { adaptiveCard, url, update };
