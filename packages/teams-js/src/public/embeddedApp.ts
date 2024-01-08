import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { app } from './app';
import { FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * @beta
 * Capability that allows embedding other applications inside an existing application
 */
export namespace embeddedApp {
  /**
   * @beta
   * @returns true if embedded apps are supported in this host and false otherwise
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.embeddedApp ? true : false;
  }

  /**
   * Your app owns the iframe that is hosting the embedded app and must call this function
   * and wait for the promise to resolve before
   *
   * @param embeddedAppId The app id of an application that is being embedded in your app.
   * @param embeddedAppOrigin The origin of an application that will be embedded.
   * @param notifyAppLoadedHandler This optional handler will be called if the embedded app
   * wants to hide the loading experience and continue lazy loading.
   * @param notifySuccessHandler This optional handler will be called if the embedded app has
   * finished its entire load successfully.
   * Things like logging and cleanup can happen here.
   * @param notifyFailureHandler This optional handler will be called if the app failed to
   * load succcessfully. If this happens and no handler was passed in, {@link embeddedApp.stop}
   * will be called.
   *
   * @returns a Promise that resolves when the host has done what it needs to to respond to the new embedded app
   */
  export function start(
    embeddedAppId: string,
    embeddedAppOrigin: string,
    notifyAppLoadedHandler?: () => void,
    notifySuccessHandler?: () => void,
    notifyFailureHandler?: (details: app.FailedReason | app.ExpectedFailureReason) => void,
  ): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content); // which frame contexts do we allow this from?

    if (notifyAppLoadedHandler) {
      notifyAppLoadedHandler();
    }
    if (notifySuccessHandler) {
      notifySuccessHandler();
    }
    if (notifyFailureHandler) {
      notifyFailureHandler(app.FailedReason.Timeout);
    } else {
      // we call embeddedApp.stop() if no handler is passed in
    }

    return sendAndHandleSdkError('embeddedApp.start', {
      embeddedAppId: embeddedAppId,
      embeddedAppOrigin: embeddedAppOrigin,
    });
  }

  /**
   * This function tells the host that you are about to close the embedded app. It also gives the embedded app
   * an opportunity to suspend. We may want to allow the caller to pass in an optional timeout for this
   * @returns a Promise that resolves when the embedded app has been given enough time to handle the stop event.
   */
  export async function stop(): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content); // which frame contexts do we allow this from?

    return new Promise((resolve, reject) => {
      suspend()
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          reject(error);
        });
      sendAndHandleSdkError('embeddedApp.stop');
    });
  }

  /**
   * Used to tell the child app that it should prepare to be suspended
   * This can be received and handled by the embedded app in {@link app.lifecycle.registerBeforeSuspendOrTerminateHandler}
   * @returns A Promise that resolves when the embedded app has been given enough time to handle the suspend event.
   */
  export function suspend(timeoutInMs?: number): Promise<void> {
    console.log(`We should wait for ${timeoutInMs}ms and then finish the promise. Pick a reasonable default`);
    return sendAndHandleSdkError('beforeUnload'); // this should be sent to the child
  }

  /**
   * Used to tell the child app that it should resume execution
   * This can be received and handled by the embedded app in {@link app.lifecycle.registerOnResumeHandler}
   */
  export function resume(): void {
    sendAndHandleSdkError('load'); // this should be sent to the child
  }

  /**
   * Used to tell the child app it has focus now
   * @param navigateForward True if focus should start at the 'front' or 'top' of the embedded app, else false
   */
  export function giveFocus(navigateForward?: boolean): void {
    sendAndHandleSdkError('focusEnter', [navigateForward]); // This should be sent to the child
  }
}
