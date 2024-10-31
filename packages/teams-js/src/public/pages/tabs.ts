import { ensureInitialized } from '../../internal/internalAPIs';
import {
  getMruTabInstancesHelper,
  getTabInstancesHelper,
  pagesTelemetryVersionNumber,
  tabsNavigateToTabHelper,
} from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { TabInformation, TabInstance, TabInstanceParameters } from '../interfaces';
import { runtime } from '../runtime';

/**
 * Provides APIs for querying and navigating between contextual tabs of an application. Unlike personal tabs,
 * contextual tabs are pages associated with a specific context, such as channel or chat.
 */
/**
 * Navigates the hosted application to the specified tab instance.
 * @param tabInstance - The destination tab instance.
 * @returns Promise that resolves when the navigation has completed.
 */
export function navigateToTab(tabInstance: TabInstance): Promise<void> {
  return tabsNavigateToTabHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_NavigateToTab),
    tabInstance,
  );
}
/**
 * Retrieves application tabs for the current user.
 * If no TabInstanceParameters are passed, the application defaults to favorite teams and favorite channels.
 * @param tabInstanceParameters - An optional set of flags that specify whether to scope call to favorite teams or channels.
 * @returns Promise that resolves with the {@link TabInformation}. Contains information for the user's tabs that are owned by this application {@link TabInstance}.
 */
export function getTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
  return getTabInstancesHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_GetTabInstances),
    tabInstanceParameters,
  );
}

/**
 * Retrieves the most recently used application tabs for the current user.
 * @param tabInstanceParameters - An optional set of flags. Note this is currently ignored and kept for future use.
 * @returns Promise that resolves with the {@link TabInformation}. Contains information for the users' most recently used tabs {@link TabInstance}.
 */
export function getMruTabInstances(tabInstanceParameters?: TabInstanceParameters): Promise<TabInformation> {
  return getMruTabInstancesHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_Tabs_GetMruTabInstances),
    tabInstanceParameters,
  );
}

/**
 * Checks if the pages.tab capability is supported by the host
 * @returns boolean to represent whether the pages.tab capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages ? (runtime.supports.pages.tabs ? true : false) : false;
}
