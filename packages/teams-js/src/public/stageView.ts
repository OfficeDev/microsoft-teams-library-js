import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * Namespace to interact with the stage view specific part of the SDK.
 */
export namespace stageView {
  /**
   * Parameters to open a stage view.
   */
  export interface StageViewParams {
    /**
     * The ID of the Teams application to be opened.
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
     * The Teams application website URL.
     */
    websiteUrl?: string;

    /**
     * The entity ID of the Teams application content being opened.
     */
    entityId?: string;
  }

  /**
   * @hidden
   * Feature is under development
   *
   * Opens a stage view to display a Teams application
   * @param stageViewParams - The parameters to pass into the stage view.
   * @returns Promise that resolves or rejects with an error once the stage view is closed.
   */
  export function open(stageViewParams: StageViewParams): Promise<void> {
    return new Promise(resolve => {
      ensureInitialized(FrameContexts.content);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (!stageViewParams) {
        throw new Error('[stageView.open] Stage view params cannot be null');
      }

      resolve(sendAndHandleSdkError('stageView.open', stageViewParams));
    });
  }

  /**
   * Checks if stageView capability is supported by the host
   * @returns true if the stageView capability is enabled in runtime.supports.stageView and
   * false if it is disabled
   */
  export function isSupported(): boolean {
    return runtime.supports.stageView ? true : false;
  }
}
