import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { pagesTelemetryVersionNumber } from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
//eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as pages from './pages';

/**
 * Provides functions for navigating within your own app
 *
 * @remarks
 * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
 */
/**
 * Parameters provided to the {@link navigateTo} function
 */
export interface NavigateWithinAppParams {
  /**
   * The developer-defined unique ID for the page defined in the manifest or when first configuring
   * the page. (Known as {@linkcode Context.entityId} prior to TeamsJS v2.0.0)
   */
  pageId: string;

  /**
   * Optional developer-defined unique ID describing the content to navigate to within the page. This
   * can be retrieved from the Context object {@link app.PageInfo.subPageId | app.Context.page.subPageId}
   */
  subPageId?: string;
}

/**
 * Navigate within the currently running app
 *
 * @remarks
 * If you are looking to navigate to a different app, use {@link pages.navigateToApp}.
 *
 * @param params Parameters for the navigation
 * @returns `Promise` that will resolve if the navigation was successful and reject if not
 */
export function navigateTo(params: NavigateWithinAppParams): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_CurrentApp_NavigateTo),
        'pages.currentApp.navigateTo',
        params,
      ),
    );
  });
}

/**
 * Navigate to the currently running app's first static page defined in the application
 * manifest.
 *
 * @returns `Promise` that will resolve if the navigation was successful and reject if not
 */
export function navigateToDefaultPage(): Promise<void> {
  return new Promise<void>((resolve) => {
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.settings,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_CurrentApp_NavigateToDefaultPage),
        'pages.currentApp.navigateToDefaultPage',
      ),
    );
  });
}

/**
 * Checks if pages.currentApp capability is supported by the host
 * @returns boolean to represent whether the pages.currentApp capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages
    ? runtime.supports.pages.currentApp
      ? true
      : false
    : false;
}
