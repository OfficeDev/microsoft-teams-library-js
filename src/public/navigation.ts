import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';

/**
 * Namespace to interact with the navigation specific part of the SDK.
 */
export namespace navigation {
  /**
   * Return focus to the main Teams app. Will focus search bar if navigating foward and app bar if navigating back.
   * @param navigateForward Determines the direction to focus in teams app.
   */
  export function returnFocus(navigateForward?: boolean): void {
    ensureInitialized();

    sendMessageRequestToParent('navigation.returnFocus', [navigateForward]);
  }
}
