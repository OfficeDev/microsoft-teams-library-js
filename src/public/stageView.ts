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
     * Required
     */
    appId: string;

    /**
     * The URL of the content to display.
     * Required
     */
    contentUrl: string;

    /**
     * The Teams app website URL.
     * Not required but still used to populate an open website button in stage view.
     */
    websiteUrl?: string;

    /**
     * The name of the stage view.
     * Delete seems unused
     */
    name?: string;

    /**
     * The entity ID.
     * Not sure
     */
    entityId?: string;

    /**
     * The chat or channel ID.
     * Not sure
     */
    threadId?: string;

    /**
     * The initatiator of the stage view request.
     * Delete seems unused
     */
    source?: string;

    /**
     * The title to give the stage view.
     * Used by the error dialog.  Should this be required?
     */
    title?: string;
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
  export function openStageView(stageViewParams: StageViewParams, callback?: (sdkError?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.stage);

    if (!stageViewParams) {
      throw new Error('[openStageView] Stage view params cannot be null');
    }

    sendMessageToParent('openStageView', [stageViewParams], callback);
  }
}
