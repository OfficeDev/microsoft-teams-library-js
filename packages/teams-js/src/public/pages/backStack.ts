/**
 * Provides APIs for handling the user's navigational history.
 * @module
 */

import { sendMessageToParent } from '../../internal/communication';
import { registerHandler } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import {
  backStackNavigateBackHelper,
  handleBackButtonPress,
  pagesTelemetryVersionNumber,
  setBackButtonPressHandler,
} from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { isNullOrUndefined } from '../../internal/typeCheckUtilities';
import { errorNotSupportedOnPlatform } from '../constants';
import { runtime } from '../runtime';

/** Back button handler function */
export type backButtonHandlerFunctionType = () => boolean;

/**
 * @hidden
 * Register backButtonPress handler.
 *
 * @internal
 * Limited to Microsoft-internal use.
 */
export function _initialize(): void {
  registerHandler(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_RegisterBackButtonPressHandler),
    'backButtonPress',
    handleBackButtonPress,
    false,
  );
}

/**
 * Navigates back in the hosted application. See {@link pages.backStack.registerBackButtonHandler} for notes on usage.
 * @returns Promise that resolves when the navigation has completed.
 */
export function navigateBack(): Promise<void> {
  return backStackNavigateBackHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_NavigateBack),
  );
}

/**
 * Registers a handler for user presses of the host client's back button. Experiences that maintain an internal
 * navigation stack should use this handler to navigate the user back within their frame. If an application finds
 * that after running its back button handler it cannot handle the event it should call the navigateBack
 * method to ask the host client to handle it instead.
 * @param handler - The handler to invoke when the user presses the host client's back button.
 */
export function registerBackButtonHandler(handler: backButtonHandlerFunctionType): void {
  registerBackButtonHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_BackStack_RegisterBackButtonHandler),
    handler,
    () => {
      if (!isNullOrUndefined(handler) && !isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * @hidden
 * Undocumented helper function with shared code between deprecated version and current version of the registerBackButtonHandler API.
 *
 * @internal
 * Limited to Microsoft-internal use
 * @param apiVersionTag - The tag indicating API version number with name
 * @param handler - The handler to invoke when the user presses the host client's back button.
 * @param versionSpecificHelper - The helper function containing logic pertaining to a specific version of the API.
 */
export function registerBackButtonHandlerHelper(
  apiVersionTag: string,
  handler: () => boolean,
  versionSpecificHelper?: () => void,
): void {
  // allow for registration cleanup even when not finished initializing
  !isNullOrUndefined(handler) && ensureInitialized(runtime);
  if (versionSpecificHelper) {
    versionSpecificHelper();
  }
  setBackButtonPressHandler(handler);
  !isNullOrUndefined(handler) && sendMessageToParent(apiVersionTag, 'registerHandler', ['backButton']);
}

/**
 * Checks if the pages.backStack capability is supported by the host
 * @returns boolean to represent whether the pages.backStack capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages
    ? runtime.supports.pages.backStack
      ? true
      : false
    : false;
}
