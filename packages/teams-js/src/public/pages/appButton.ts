import { registerHandlerHelper } from '../../internal/handlers';
import { ensureInitialized } from '../../internal/internalAPIs';
import { pagesTelemetryVersionNumber } from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { handlerFunctionType } from './pages';

/**
 * Provides APIs to interact with the app button part of the SDK.
 */
/**
 * Registers a handler for clicking the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when the personal app button is clicked in the app bar.
 */
export function onClick(handler: handlerFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnClick),
    'appButtonClick',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Registers a handler for entering hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when entering hover of the personal app button in the app bar.
 */
export function onHoverEnter(handler: handlerFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnHoverEnter),
    'appButtonHoverEnter',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Registers a handler for exiting hover of the app button.
 * Only one handler can be registered at a time. A subsequent registration replaces an existing registration.
 * @param handler - The handler to invoke when exiting hover of the personal app button in the app bar.
 */
export function onHoverLeave(handler: handlerFunctionType): void {
  registerHandlerHelper(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_AppButton_OnHoverLeave),
    'appButtonHoverLeave',
    handler,
    [FrameContexts.content],
    () => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    },
  );
}

/**
 * Checks if pages.appButton capability is supported by the host
 * @returns boolean to represent whether the pages.appButton capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages
    ? runtime.supports.pages.appButton
      ? true
      : false
    : false;
}
