import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { TabInstance } from './interfaces';
import { FrameContexts } from './constants';

/**
 * Navigation specific part of the SDK.
 */

/**
 * Return focus to the main teamsjs app. Will focus search bar if navigating foward and app bar if navigating back.
 * @param navigateForward Determines the direction to focus in teamsjs app.
 */
export function returnFocus(navigateForward?: boolean): void {
  ensureInitialized(FrameContexts.content);

  sendMessageRequestToParent('returnFocus', [navigateForward]);
}

/**
 * Navigates the Microsoft teamsjs app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export function navigateToTab(tabInstance: TabInstance, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('navigateToTab', [tabInstance]);

  const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
}

/**
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 * @param url The URL to navigate the frame to.
 */
export function navigateCrossDomain(url: string, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized(
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.remove,
    FrameContexts.task,
    FrameContexts.stage,
  );

  const messageId = sendMessageRequestToParent('navigateCrossDomain', [url]);
  const errorMessage =
    'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
}

/**
 * Navigates back in the teamsjs client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
export function navigateBack(onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const messageId = sendMessageRequestToParent('navigateBack', []);
  const errorMessage = 'Back navigation is not supported in the current client or context.';
  GlobalVars.callbacks[messageId] = onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage);
}
