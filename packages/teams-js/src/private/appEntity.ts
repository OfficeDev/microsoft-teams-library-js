import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../public/constants';
import { SdkError } from '../public/interfaces';
import { runtime } from '../public/runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const appEntityTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * @hidden
 * Module to interact with the application entities specific part of the SDK.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
/**
 * @hidden
 *
 * Information on an app entity
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export interface AppEntity {
  /**
   * @hidden
   * ID of the application
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  appId: string;

  /**
   * @hidden
   * URL for the application's icon
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  appIconUrl: string;

  /**
   * @hidden
   * Content URL for the app entity
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  contentUrl: string;

  /**
   * @hidden
   * The display name for the app entity
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  displayName: string;

  /**
   * @hidden
   * Website URL for the app entity. It is meant to be opened by the user in a browser.
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  websiteUrl: string;
}

/**
 * @hidden
 * Hide from docs
 * --------
 * Open the Tab Gallery and retrieve the app entity
 * @param threadId ID of the thread where the app entity will be created
 * @param categories A list of application categories that will be displayed in the opened tab gallery
 * @param subEntityId An object that will be made available to the application being configured
 *                      through the Context's subEntityId field.
 * @param callback Callback that will be triggered once the app entity information is available.
 *                 The callback takes two arguments: an SdkError in case something happened (i.e.
 *                 no permissions to execute the API) and the app entity configuration, if available
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function selectAppEntity(
  threadId: string,
  categories: string[],
  subEntityId: string,
  callback: (sdkError?: SdkError, appEntity?: AppEntity) => void,
): void {
  ensureInitialized(runtime, FrameContexts.content);

  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  if (!threadId || threadId.length == 0) {
    throw new Error('[appEntity.selectAppEntity] threadId name cannot be null or empty');
  }

  if (!callback) {
    throw new Error('[appEntity.selectAppEntity] Callback cannot be null');
  }

  sendMessageToParent(
    getApiVersionTag(appEntityTelemetryVersionNumber, ApiName.AppEntity_SelectAppEntity),
    'appEntity.selectAppEntity',
    [threadId, categories, subEntityId],
    callback,
  );
}

/**
 * @hidden
 *
 * Checks if the appEntity capability is supported by the host
 * @returns boolean to represent whether the appEntity capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.appEntity ? true : false;
}
