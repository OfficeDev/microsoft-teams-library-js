/**
 * Module to get the list of content shared in a Teams meeting
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';

const sharingTelemetryVersionNumber_v2: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Represents the data returned when calling {@link sharing.history.getContent}
 *
 * @beta
 */
export interface IContentResponse {
  /** Id of the app where the content was shared from */
  appId: string;
  /** Title of the shared content */
  title: string;
  /** Reference of the shared content */
  contentReference: string;
  /** Id of the thread where the content was shared. */
  threadId: string;
  /** Id of the user who shared the content. */
  author: string;
  /** Type of the shared content.
   * For sharing to Teams stage scenarios, this value would be `ShareToStage`
   * Other `contentType` values will be added and documented here over time
   */
  contentType: string;
}

/**
 * Get the list of content shared in a Teams meeting
 *
 * @throws Error if call capability is not supported
 * @throws Error if returned content details are invalid
 * @returns Promise that will resolve with the {@link IContentResponse} objects array
 *
 * @beta
 */
export async function getContent(): Promise<IContentResponse[]> {
  ensureInitialized(runtime, FrameContexts.sidePanel, FrameContexts.meetingStage);
  if (!isSupported()) {
    throw errorNotSupportedOnPlatform;
  }

  const contentDetails: IContentResponse[] = await sendAndHandleSdkError(
    getApiVersionTag(sharingTelemetryVersionNumber_v2, ApiName.Sharing_History_GetContent),
    'sharing.history.getContent',
  );

  return contentDetails;
}

/**
 * Checks if sharing.history capability is supported by the host
 * @returns boolean to represent whether the sharing.history capability is supported
 *
 * @throws Error if {@linkcode app.initialize} has not successfully completed
 *
 * @beta
 */
export function isSupported(): boolean {
  return ensureInitialized(runtime) && runtime.supports.sharing?.history !== undefined;
}
