/**
 * Module for actions that can be taken by the stage view itself.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const stageViewTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Closes the current stage view. This function will be a no-op if called from outside of a stage view.
 * @param result - Optional opaque serialized result for the host's original launch callback.
 * An empty string is a result. Requires the host to advertise `stageView.self.closeResult` support;
 * otherwise the request is rejected without closing. The SDK does not interpret the result.
 * @returns Promise that resolves or rejects with an error once the stage view is closed.
 * The promise acknowledges closing; it does not return the result to the closing application.
 *
 * @beta
 * @throws Error if stageView.self.close is not supported in the current context or if `app.initialize()` has not resolved successfully.
 */
export function close(result?: string): Promise<void> {
  return new Promise((resolve) => {
    if (!ensureInitialized(runtime, FrameContexts.content) || !isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (result !== undefined) {
      if (typeof result !== 'string') {
        throw new Error('[stageView.self.close] Result must be a string');
      }
      if (!runtime.supports.stageView?.self?.closeResult) {
        throw errorNotSupportedOnPlatform;
      }
    }

    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(stageViewTelemetryVersionNumber, ApiName.StageView_Self_Close),
        'stageView.self.close',
        ...(result === undefined ? [] : [result]),
      ),
    );
  });
}

/**
 * Checks if stageView.self capability is supported by the host
 * @beta
 * @returns boolean to represent whether the stageView.self capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.stageView?.self !== undefined;
}
