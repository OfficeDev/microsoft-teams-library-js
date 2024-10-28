import { sendMessageToParent } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { FrameContexts } from '../constants';
import { runtime } from '../runtime';

/**
 * v1 APIs telemetry file: All of APIs in this capability file should send out API version v1 ONLY
 */
const meetingTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_1;

/**
 * Module for functions to control behavior of the app share button
 *
 * @hidden
 * Hide from docs.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
/**
 * Property bag for the setVisibilityInfo
 *
 * @hidden
 * Hide from docs.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
export interface ShareInformation {
  /**
   * boolean flag to set show or hide app share button
   */
  isVisible: boolean;

  /**
   * optional string contentUrl, which will override contentUrl coming from Manifest
   */
  contentUrl?: string;
}
/**
 * By default app share button will be hidden and this API will govern the visibility of it.
 *
 * This function can be used to hide/show app share button in meeting,
 * along with contentUrl (overrides contentUrl populated in app manifest)
 * @throws standard Invalid Url error
 * @param shareInformation has two elements, one isVisible boolean flag and another
 * optional string contentUrl, which will override contentUrl coming from Manifest
 *
 * @hidden
 * Hide from docs.
 *
 * @internal
 * Limited to Microsoft-internal use
 *
 * @beta
 */
export function setOptions(shareInformation: ShareInformation): void {
  ensureInitialized(runtime, FrameContexts.sidePanel);
  if (shareInformation.contentUrl) {
    new URL(shareInformation.contentUrl);
  }
  sendMessageToParent(
    getApiVersionTag(meetingTelemetryVersionNumber, ApiName.Meeting_AppShareButton_SetOptions),
    'meeting.appShareButton.setOptions',
    [shareInformation],
  );
}
