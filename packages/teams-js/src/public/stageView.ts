import { sendAndHandleSdkErrorWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const stageViewTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Namespace to interact with the stage view specific part of the SDK.
 *
 *  @beta
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
    title?: string;

    /**
     * The Teams application website URL.
     */
    websiteUrl?: string;

    /**
     * The entity ID of the Teams application content being opened.
     */
    entityId?: string;

    /**
     * The open mode for stage content.
     * Optional param: if not passed, hosts can choose their default openMode.
     * If a host does not support any specific openMode, It will fallback to StageViewOpenMode.modal.
     */
    openMode?: StageViewOpenMode;
  }

  /**
   * The open mode for stage content.
   */
  export enum StageViewOpenMode {
    /**
     * Open the content in a modal.
     */
    modal = 'modal',
    /**
     * Open the content in a popped-out window.
     */
    popout = 'popout',
    /**
     * Open the content in a popped-out window with chat collaboration.
     */
    popoutWithChat = 'popoutWithChat',
  }

  /**
   * @hidden
   * Feature is under development
   *
   * Opens a stage view to display a Teams application
   * @beta
   * @param stageViewParams - The parameters to pass into the stage view.
   * @returns Promise that resolves or rejects with an error once the stage view is closed.
   */
  export function open(stageViewParams: StageViewParams): Promise<void> {
    return new Promise((resolve) => {
      ensureInitialized(runtime, FrameContexts.content);

      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }

      if (!stageViewParams) {
        throw new Error('[stageView.open] Stage view params cannot be null');
      }

      resolve(
        sendAndHandleSdkErrorWithVersion(
          getApiVersionTag(stageViewTelemetryVersionNumber, ApiName.StageView_Open),
          'stageView.open',
          stageViewParams,
        ),
      );
    });
  }

  /**
   * Checks if stageView capability is supported by the host
   * @beta
   * @returns boolean to represent whether the stageView capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   *
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.stageView ? true : false;
  }
}
