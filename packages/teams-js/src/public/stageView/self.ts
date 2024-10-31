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
 * Module for actions that can be taken by the stage view itself.
 *
 * @beta
 */
/**
 * Closes the current stage view. This function will be a no-op if called from outside of a stage view.
 * @returns Promise that resolves or rejects with an error once the stage view is closed.
 *
 * @beta
 * @throws Error if stageView.self.close is not supported in the current context or if `app.initialize()` has not resolved successfully.
 */
export function close(): Promise<void> {
  return new Promise((resolve) => {
    ensureInitialized(runtime, FrameContexts.content);

    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    resolve(
      sendAndHandleSdkError(
        getApiVersionTag(stageViewTelemetryVersionNumber, ApiName.StageView_Self_Close),
        'stageView.self.close',
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
