import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { SdkError } from '../public';
import { FrameContexts } from './constants';

/**
 * Namespace to interact with the stage view specific part of the SDK.
 */
export namespace stageView {
  /**
   * Parameters to open a stage view.
   */
  export interface StageViewParams {
    /**
     * The application ID of the Teams application to be opened.
     */
    appId: string;

    /**
     * The context passed into the stage view.
     */
    context: {
      /**
       * The URL of the content to display.
       */
      contentUrl?: string;

      /**
       * The Teams app website URL.
       */
      websiteUrl?: string;

      /**
       * The name of the stage view.
       */
      name?: string;

      /**
       * The entity ID.
       */
      entityId?: string;

      /**
       * The thread that initiated the request.
       */
      threadId?: string;

      /**
       * The initatiator of the stage view request.
       */
      source?: string;

      /**
       * The title to give the stage view.
       */
      title?: string;
    };
  }

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
  export function openStageView(stageViewParams: StageViewParams, callback?: (sdkError?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.stage);

    if (!stageViewParams) {
      throw new Error('[openStageView] Stage view params cannot be null');
    }

    sendMessageToParent('openStageView', [stageViewParams], callback);
  }
}
