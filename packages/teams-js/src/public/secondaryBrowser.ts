import { sendAndHandleSdkError as sendAndHandleError } from '../internal/communication';
import { ensureInitialized, isHostClientMobile } from '../internal/internalAPIs';
import { isValidHttpsURL } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode } from './interfaces';
import { runtime } from './runtime';

/**
 * Namespace to power up the in-app browser experiences in the Host App.
 * For eg. opening a URL in the Host App inside a browser
 *
 * @beta
 */
export namespace secondaryBrowser {
  /**
   * Open a URL in the secondary browser aka in-app browser
   *
   * @param url Url to open in the browser
   * @returns Promise that resolve to true if the URL successfully opens in the secondaryBrowser or throws an error {@link SdkError} incase of failure
   *
   * @beta
   */
  export function open(url: URL): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content);
    if (!isSupported() || !isHostClientMobile()) {
      throw errorNotSupportedOnPlatform;
    }

    if (!url || !isValidHttpsURL(url)) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS, message: 'Invalid Url: Only https URL is allowed' };
    }
    return new Promise<boolean>((resolve) => {
      resolve(sendAndHandleError('secondaryBrowser.open', url.toString()));
    });
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
