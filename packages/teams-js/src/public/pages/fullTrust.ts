/**
 * @hidden
 * Hide from docs
 * ------
 * Provides APIs to interact with the full-trust part of the SDK. Limited to 1P applications
 * @internal
 * Limited to Microsoft-internal use
 * @module
 */

import { sendMessageToParent } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { pagesTelemetryVersionNumber } from '../../internal/pagesHelpers';
import { ApiName, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';

/**
 * @hidden
 * Hide from docs
 * ------
 * Place the tab into full-screen mode.
 *
 */
export function enterFullscreen(): void {
  ensureInitialized(runtime, FrameContexts.content);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_FullTrust_EnterFullscreen),
    'enterFullscreen',
    [],
  );
}

/**
 * @hidden
 * Hide from docs
 * ------
 * Reverts the tab into normal-screen mode.
 */
export function exitFullscreen(): void {
  ensureInitialized(runtime, FrameContexts.content);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }
  sendMessageToParent(
    getApiVersionTag(pagesTelemetryVersionNumber, ApiName.Pages_FullTrust_ExitFullscreen),
    'exitFullscreen',
    [],
  );
}
/**
 * @hidden
 *
 * Checks if the pages.fullTrust capability is supported by the host
 * @returns boolean to represent whether the pages.fullTrust capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.pages
    ? runtime.supports.pages.fullTrust
      ? true
      : false
    : false;
}
