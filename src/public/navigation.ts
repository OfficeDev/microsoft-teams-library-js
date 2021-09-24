import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { TabInstance } from './interfaces';
import { FrameContexts } from './constants';
import { sendMessageToParent } from '../internal/communication';

/**
 * Navigation specific part of the SDK.
 */

/**
 * Return focus to the main Teams app. Will focus search bar if navigating forward and app bar if navigating back.
 * @param navigateForward Determines the direction to focus in teams app.
 */
export function returnFocus(navigateForward?: boolean): void {
  ensureInitialized(FrameContexts.content);

  sendMessageToParent('returnFocus', [navigateForward]);
}

/**
 * Navigates the Microsoft Teams app to the specified tab instance.
 * @param tabInstance The tab instance to navigate to.
 */
export function navigateToTab(tabInstance: TabInstance, onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const errorMessage = 'Invalid internalTabInstanceId and/or channelId were/was provided';
  sendMessageToParent(
    'navigateToTab',
    [tabInstance],
    onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage),
  );
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
    FrameContexts.meetingStage,
  );

  const errorMessage =
    'Cross-origin navigation is only supported for URLs matching the pattern registered in the manifest.';
  sendMessageToParent(
    'navigateCrossDomain',
    [url],
    onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage),
  );
}

/**
 * Navigates back in the Teams client. See registerBackButtonHandler for more information on when
 * it's appropriate to use this method.
 */
export function navigateBack(onComplete?: (status: boolean, reason?: string) => void): void {
  ensureInitialized();

  const errorMessage = 'Back navigation is not supported in the current client or context.';
  sendMessageToParent('navigateBack', [], onComplete ? onComplete : getGenericOnCompleteHandler(errorMessage));
}
