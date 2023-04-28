import { ensureInitialized } from '../internal/internalAPIs';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { TabInstance } from './interfaces';
import { pages } from './pages';
import { runtime } from './runtime';
/**
 * Navigation specific part of the SDK.
 */

/** Navigation on complete handler function type */
type onCompleteHandlerFunctionType = (status: boolean, reason?: string) => void;
/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.returnFocus pages.returnFocus(navigateForward?: boolean): void} instead.
 *
 * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
 *
 * @param navigateForward - Determines the direction to focus in teams app.
 */
export function returnFocus(navigateForward?: boolean): void {
  pages.returnFocus(navigateForward);
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.tabs.navigateToTab pages.tabs.navigateToTab(tabInstance: TabInstance): Promise\<void\>} instead.
 *
 * Navigates the Microsoft Teams app to the specified tab instance.
 *
 * @param tabInstance - The tab instance to navigate to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
export function navigateToTab(tabInstance: TabInstance, onComplete?: onCompleteHandlerFunctionType): void {
  ensureInitialized(runtime);
  onComplete = onComplete ? onComplete : getGenericOnCompleteHandler();
  pages.tabs
    .navigateToTab(tabInstance)
    .then(() => {
      onComplete(true);
    })
    .catch((error: Error) => {
      onComplete(false, error.message);
    });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.navigateCrossDomain pages.navigateCrossDomain(url: string): Promise\<void\>} instead.
 *
 * Navigates the frame to a new cross-domain URL. The domain of this URL must match at least one of the
 * valid domains specified in the validDomains block of the manifest; otherwise, an exception will be
 * thrown. This function needs to be used only when navigating the frame to a URL in a different domain
 * than the current one in a way that keeps the app informed of the change and allows the SDK to
 * continue working.
 *
 * @param url - The URL to navigate the frame to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
export function navigateCrossDomain(url: string, onComplete?: onCompleteHandlerFunctionType): void {
  ensureInitialized(
    runtime,
    FrameContexts.content,
    FrameContexts.sidePanel,
    FrameContexts.settings,
    FrameContexts.remove,
    FrameContexts.task,
    FrameContexts.stage,
    FrameContexts.meetingStage,
  );
  onComplete = onComplete ? onComplete : getGenericOnCompleteHandler();
  pages
    .navigateCrossDomain(url)
    .then(() => {
      onComplete(true);
    })
    .catch((error: Error) => {
      onComplete(false, error.message);
    });
}

/**
 * @deprecated
 * As of 2.0.0, please use {@link pages.backStack.navigateBack pages.backStack.navigateBack(): Promise\<void\>} instead.
 *
 * Navigates back in the Teams client.
 * See registerBackButtonHandler for more information on when it's appropriate to use this method.
 *
 * @param onComplete - The callback to invoke when the action is complete.
 */
export function navigateBack(onComplete?: onCompleteHandlerFunctionType): void {
  ensureInitialized(runtime);
  onComplete = onComplete ? onComplete : getGenericOnCompleteHandler();
  pages.backStack
    .navigateBack()
    .then(() => {
      onComplete(true);
    })
    .catch((error: Error) => {
      onComplete(false, error.message);
    });
}
