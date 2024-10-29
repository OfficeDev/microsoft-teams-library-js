import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { getGenericOnCompleteHandler } from '../internal/utils';
import { FrameContexts } from './constants';
import { TabInstance } from './interfaces';
import {
  backStackNavigateBackHelper,
  navigateCrossDomainHelper,
  returnFocusHelper,
  tabsNavigateToTabHelper,
} from './pages/pages';
import { runtime } from './runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const navigationTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * Navigation specific part of the SDK.
 */

/** Navigation on complete handler function type */
export type onCompleteHandlerFunctionType = (status: boolean, reason?: string) => void;
/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.returnFocus pages.returnFocus(navigateForward?: boolean): void} instead.
 *
 * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
 *
 * @param navigateForward - Determines the direction to focus in teams app.
 */
export function returnFocus(navigateForward?: boolean): void {
  returnFocusHelper(
    getApiVersionTag(navigationTelemetryVersionNumber, ApiName.Navigation_ReturnFocus),
    navigateForward,
  );
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.tabs.navigateToTab pages.tabs.navigateToTab(tabInstance: TabInstance): Promise\<void\>} instead.
 *
 * Navigates the Microsoft Teams app to the specified tab instance.
 *
 * @param tabInstance - The tab instance to navigate to.
 * @param onComplete - The callback to invoke when the action is complete.
 */
export function navigateToTab(tabInstance: TabInstance, onComplete?: onCompleteHandlerFunctionType): void {
  ensureInitialized(runtime);
  const completionHandler: onCompleteHandlerFunctionType = onComplete ?? getGenericOnCompleteHandler();
  tabsNavigateToTabHelper(
    getApiVersionTag(navigationTelemetryVersionNumber, ApiName.Navigation_NavigateToTab),
    tabInstance,
  )
    .then(() => {
      completionHandler(true);
    })
    .catch((error: Error) => {
      completionHandler(false, error.message);
    });
}

/**
 * @deprecated
 * As of 2.0.0, this API is deprecated and can be replaced by the standard JavaScript
 * API, window.location.href, when navigating the app to a new cross-domain URL. Any URL
 * that is redirected to must be listed in the validDomains block of the manifest. Please
 * remove any calls to this API.
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
  const completionHandler: onCompleteHandlerFunctionType = onComplete ?? getGenericOnCompleteHandler();
  navigateCrossDomainHelper(
    getApiVersionTag(navigationTelemetryVersionNumber, ApiName.Navigation_NavigateCrossDomain),
    url,
  )
    .then(() => {
      completionHandler(true);
    })
    .catch((error: Error) => {
      completionHandler(false, error.message);
    });
}

/**
 * @deprecated
 * As of TeamsJS v2.0.0, please use {@link pages.backStack.navigateBack pages.backStack.navigateBack(): Promise\<void\>} instead.
 *
 * Navigates back in the Teams client.
 * See registerBackButtonHandler for more information on when it's appropriate to use this method.
 *
 * @param onComplete - The callback to invoke when the action is complete.
 */
export function navigateBack(onComplete?: onCompleteHandlerFunctionType): void {
  ensureInitialized(runtime);
  const completionHandler: onCompleteHandlerFunctionType = onComplete ?? getGenericOnCompleteHandler();
  backStackNavigateBackHelper(getApiVersionTag(navigationTelemetryVersionNumber, ApiName.Navigation_NavigateBack))
    .then(() => {
      completionHandler(true);
    })
    .catch((error: Error) => {
      completionHandler(false, error.message);
    });
}
