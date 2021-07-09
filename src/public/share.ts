import { ensureInitialized } from '../internal/internalAPIs';
import { sendMessageToParent } from '../internal/communication';
import { ErrorCode, SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace share {
  export const ShareAPIMessages = {
    shareLink: 'shareLink',
  };

  export interface IShareLinkRequest {
    url: string;
  }

  /**
   * @private
   * Feature is under development
   *
   * Opens a share-in-teams dialog with a shared url.
   * @param shareLinkRequest shared item info, including the URL
   * @param callback optional callback
   */
  export function shareLink(shareLinkRequest: IShareLinkRequest, callback?: (err?: SdkError) => void): void {
    if (!(shareLinkRequest && shareLinkRequest.url)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Url is required.',
        });
      }
      return;
    }

    ensureInitialized(
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    sendMessageToParent(ShareAPIMessages.shareLink, [shareLinkRequest], callback);
  }
}
