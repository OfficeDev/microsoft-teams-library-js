import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FrameContexts, SdkError } from '../public';

/**
 * Namespace to interact with the application entities specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace lti {
  /**
   * @private
   * Hide from docs
   * --------
   * Information on an app entity
   */
  export interface AppEntity {
    /**
     * App ID of the application
     */
    appId: string;

    /**
     * URL for the application's icon
     */
    appIconUrl: string;

    /**
     * Content URL for the app entity
     */
    contentUrl: string;

    /**
     * The display name for the app entity
     */
    displayName: string;

    /**
     * Website URL for the app entity. It is meant to be opened by the user in a browser.
     */
    websiteUrl: string;
  }

  export function selectLTIAppEntity(
    threadId: string,
    subEntityId: string,
    callback: (sdkError?: SdkError, appEntity?: AppEntity) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!threadId || threadId.length == 0) {
      throw new Error('[lti.selectLTIAppEntity] threadId name cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[lti.selectLTIAppEntity] Callback cannot be null');
    }

    sendMessageToParent('lti.selectLTIAppEntity', [threadId, subEntityId], callback);
  }

  /**
   * Open the stage view for an LTI app.
   * @param deepLink deep link.
   */
  export function openLTIStageViewer(appId: string, context: string, callback?: (sdkError?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!appId || appId.length == 0) {
      throw new Error('[lti.openLTIStageViewer] appId name cannot be null or empty');
    }

    if (!context || appId.length == 0) {
      throw new Error('[lti.openLTIStageViewer] context cannot be null or empty');
    }

    sendMessageToParent('lti.openLTIStageViewer', [appId, context], callback ? callback : () => null);
  }

  /**
   * Get auth token for an LTI app.
   * @param nonce optional once that could be sent by the LTI app
   */
  export function getAuthToken(
    nonce?: string,
    callback?: (sdkError?: SdkError, redirectUri?: string, authToken?: string) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    sendMessageToParent('lti.getAuthToken', [nonce], callback ? callback : () => null);
  }
}
