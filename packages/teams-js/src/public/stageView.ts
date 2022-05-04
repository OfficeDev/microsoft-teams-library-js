import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise } from '../internal/utils';
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
     * The entity ID of the Teams app content being opened.
     */
    entityId?: string;
  }

  /**
   * @hidden
   * Feature is under development
   *
   * Opens a stage view to display a Teams app
   * @param stageViewParams The parameters to pass into the stage view.
   *
   */
  export function open(stageViewParams: StageViewParams): Promise<void>;
  /**
   * @hidden
   * Feature is under development
   *
   * @deprecated
   * As of 2.0.0, please use {@link stageView.open stageView.open(): Promise\<void\>} instead.
   *
   * Opens a stage view to display a Teams app
   * @param stageViewParams The parameters to pass into the stage view.
   * Optional; @param callback Callback that will be triggered once the stage view is closed.
   *                 The callback takes as an argument an SdkError in case something happened (i.e.
   *                 no permissions to execute the API)
   */
  export function open(stageViewParams: StageViewParams, callback?: (sdkError?: SdkError) => void): void;
  export function open(stageViewParams: StageViewParams, callback?: (sdkError?: SdkError) => void): Promise<void> {
    ensureInitialized(FrameContexts.content);

    if (!stageViewParams) {
      throw new Error('[stageView.open] Stage view params cannot be null');
    }
    const wrappedFunction = (): Promise<void> =>
      new Promise(resolve => resolve(sendAndHandleSdkError('stageView.open', stageViewParams)));

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
  }
}
