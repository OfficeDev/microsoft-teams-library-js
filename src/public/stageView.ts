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
     * The URL of the content to display.
     */
    contentUrl: string;

    /**
     * The chat or channel ID.
     */
    threadId: string;

    /**
     * The title to give the stage view.
     */
    title: string;

    /**
     * The Teams app website URL.
     */
    websiteUrl?: string;

    /**
     * The entity ID of the Teams app.
     */
    entityId?: string;
  }

  /**
   * @private
   * Feature is under development
   *
   * Opens a stage view to display a Teams app
   * @param stageViewParams The parameters to pass into the stage view.
   * @param callback Callback that will be triggered once the stage view is closed.
   *                 The callback takes as an argument an SdkError in case something happened (i.e.
   *                 no permissions to execute the API)
   */
  export function open(stageViewParams: StageViewParams, callback?: (sdkError?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!stageViewParams) {
      throw new Error('[open] Stage view params cannot be null');
    }

    sendMessageToParent('openStageView', [stageViewParams], callback);
  }
}
