import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts } from '../public';
import { AppEntityConfiguration } from '../private';

/**
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace appEntity {
  /**
   * @private
   * Hide from docs
   *
   * Open the Tab Gallery and retrieve the app entity configuration
   * @param channelId ID of the channel where the app entity will be created
   * @param categories A list of app categories that will be displayed in the open tab gallery
   * @param callback Callback that will be triggered once the app entity information is available
   */
  export function selectAppEntity(
    channelId: string,
    categories: string[],
    callback: (appEntity: AppEntityConfiguration) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    sendMessageToParent('appEntity.selectAppEntity', [channelId, categories], callback);
  }
}
