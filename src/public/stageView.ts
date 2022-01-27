import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from '../public';
import { FrameContexts } from './constants';

/**
 * Namespace to interact with the stage view specific part of the SDK.
 */
export namespace stageView {
  /**
   * @private
   * Feature is under development
   *
   * Opens a stage view to display a Teams app
   * @param applicationId The ID of the Teams app
   * @param context The context required to launch the Teams app
   * @param callback Callback that will be triggered once the stage view is closed.
   *                 The callback takes as an argument an SdkError in case something happened (i.e.
   *                 no permissions to execute the API)
   */
  export function openStageView(
    applicationId: string,
    context: string,
    callback?: (sdkError?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content, FrameContexts.stage);

    if (!applicationId) {
      throw new Error('[openStageView] Application ID cannot be null');
    }

    if (!context) {
      throw new Error('[openStageView] Context cannot be null');
    }

    sendMessageToParent('openStageView', [applicationId, context], callback);
  }
}
