import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts, SdkError } from '../public';

/**
 * @privateRemarks
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @alpha
 */
export namespace appEntity {
  /**
   * @privateRemarks
   * Hide from docs
   * --------
   * Information on an app entity
   *
   * @alpha
   */
  export interface AppEntity {
    /**
     * @privateRemarks
     * App ID of the application
     */
    appId: string;

    /**
     * @privateRemarks
     * URL for the application's icon
     */
    appIconUrl: string;

    /**
     * @privateRemarks
     * Content URL for the app entity
     */
    contentUrl: string;

    /**
     * @privateRemarks
     * The display name for the app entity
     */
    displayName: string;

    /**
     * @privateRemarks
     * Website URL for the app entity. It is meant to be opened by the user in a browser.
     */
    websiteUrl: string;
  }

  /**
   * @privateRemarks
   * Hide from docs
   * --------
   * Open the Tab Gallery and retrieve the app entity
   * @param threadId - ID of the thread where the app entity will be created
   * @param categories - A list of app categories that will be displayed in the open tab gallery
   * @param callback - Callback that will be triggered once the app entity information is available.
   *                 The callback takes two arguments: the app entity configuration, if available and
   *                 an optional SdkError in case something happened (i.e. the window was closed)
   *
   * @alpha
   */
  export function selectAppEntity(
    threadId: string,
    categories: string[],
    callback: (appEntity: AppEntity, sdkError?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!threadId || threadId.length == 0) {
      throw new Error('[appEntity.selectAppEntity] threadId name cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[appEntity.selectAppEntity] Callback cannot be null');
    }

    sendMessageToParent('appEntity.selectAppEntity', [threadId, categories], callback);
  }
}
