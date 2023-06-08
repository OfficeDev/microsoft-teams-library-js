import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { isValidHttpsURL } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to power up the in-app browser experiences in the Host App.
 * For e.g., opening a URL in the Host App inside a browser
 *
 * @beta
 */
export namespace secondaryBrowser {
  /**
   * Open a URL in the secondary browser aka in-app browser
   *
   * @param url Url to open in the browser
   * @returns Promise that successfully resolves if the URL  opens in the secondaryBrowser
   * or throws an error {@link SdkError} incase of failure before starting navigation
   *
   * @remarks Any error that happens after navigation begins is handled by the platform browser component and not returned from this function.
   * @beta
   */
  export function open(url: URL): Promise<void> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (!url || !isValidHttpsURL(url)) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Invalid Url: Only https URL is allowed' };
    }

    return sendAndHandleSdkError('secondaryBrowser.open', url.toString());
  }

  /**
   * Checks if secondaryBrowser capability is supported by the host
   * @returns boolean to represent whether secondaryBrowser is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.secondaryBrowser ? true : false;
  }
}
