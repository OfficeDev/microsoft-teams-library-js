import * as Handlers from '../../internal/handlers'; //Cannot used named imports because of conflict with some names
import { ensureInitialized } from '../../internal/internalAPIs';
import { ResumeContext } from '../interfaces';
import { runtime } from '../runtime';
/**
 * A namespace for enabling the suspension or delayed termination of an app when the user navigates away.
 * When an app registers for the registerBeforeSuspendOrTerminateHandler, it chooses to delay termination.
 * When an app registers for both registerBeforeSuspendOrTerminateHandler and registerOnResumeHandler, it chooses the suspension of the app .
 * Please note that selecting suspension doesn't guarantee prevention of background termination.
 * The outcome is influenced by factors such as available memory and the number of suspended apps.
 *
 * @beta
 */

/**
 * Register on resume handler function type
 *
 * @param context - Data structure to be used to pass the context to the app.
 */
export type registerOnResumeHandlerFunctionType = (context: ResumeContext) => void;

/**
 * Register before suspendOrTerminate handler function type
 *
 * @returns void
 */
export type registerBeforeSuspendOrTerminateHandlerFunctionType = () => Promise<void>;

/**
 * Registers a handler to be called before the page is suspended or terminated. Once a user navigates away from an app,
 * the handler will be invoked. App developers can use this handler to save unsaved data, pause sync calls etc.
 *
 * @param handler - The handler to invoke before the page is suspended or terminated. When invoked, app can perform tasks like cleanups, logging etc.
 * Upon returning, the app will be suspended or terminated.
 *
 */
export function registerBeforeSuspendOrTerminateHandler(
  handler: registerBeforeSuspendOrTerminateHandlerFunctionType,
): void {
  if (!handler) {
    throw new Error('[app.lifecycle.registerBeforeSuspendOrTerminateHandler] Handler cannot be null');
  }
  ensureInitialized(runtime);
  Handlers.registerBeforeSuspendOrTerminateHandler(handler);
}

/**
 * Registers a handler to be called when the page has been requested to resume from being suspended.
 *
 * @param handler - The handler to invoke when the page is requested to be resumed. The app is supposed to navigate to
 * the appropriate page using the ResumeContext. Once done, the app should then call {@link notifySuccess}.
 *
 * @beta
 */
export function registerOnResumeHandler(handler: registerOnResumeHandlerFunctionType): void {
  if (!handler) {
    throw new Error('[app.lifecycle.registerOnResumeHandler] Handler cannot be null');
  }
  ensureInitialized(runtime);
  Handlers.registerOnResumeHandler(handler);
}
