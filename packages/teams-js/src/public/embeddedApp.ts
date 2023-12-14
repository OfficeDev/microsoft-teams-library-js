import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
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
   *
   * @param embeddedAppId The app id of an application that is being embedded in your app.
   * Your app owns the iframe that is hosting the embedded app and must call this function
   * and wait for the promise to resolve before
   * @returns a Promise that resolves when the host has done what it needs to to respond to teamsjs messages successfully
   */
  export function start(embeddedAppId: string, embeddedAppOrigin: string): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content); // which frame contexts do we allow this from?

    return sendAndHandleSdkError('embeddedApp.start', {
      embeddedAppId: embeddedAppId,
      embeddedAppOrigin: embeddedAppOrigin,
    });
  }

  /**
   * This function tells the host that you are about to close the embedded app
   */
  export function stop(): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content); // which frame contexts do we allow this from?

    return sendAndHandleSdkError('embeddedApp.stop');
  }
}
