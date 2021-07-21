import { ensureInitialized } from '../internal/internalAPIs';
import { sendMessageToParent } from '../internal/communication';
import { ErrorCode, SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace sharing {
  export const SharingAPIMessages = {
    shareWebContent: 'sharing.shareWebContent',
  };

  // More types can be added as we expand share capability
  type SharedContentType = 'URL' | 'Text';

  interface ISharedContent {
    type: SharedContentType;
  }

  // More types can be added as we expand share capability
  export type IShareRequestContentType = IURLContent;

  export interface IShareRequest<T> {
    content: T[];
  }

  export interface IURLContent extends ISharedContent {
    type: 'URL';

    /**
     * Required URL
     */
    url: string;

    /**
     * Default initial message text
     */
    message?: string;

    /**
     * Show URL preview, defaults to true
     */
    preview?: boolean;
  }

  export interface ITextContent extends ISharedContent {
    type: 'Text';

    /**
     * Default initial message text
     */
    message?: string;
  }

  /**
   * @private
   * Feature is under development
   *
   * Opens a share dialog for web content
   * @param shareWebContentRequest web content info
   * @param callback optional callback
   */
  export function shareWebContent(
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): void {
    if (!(shareWebContentRequest && shareWebContentRequest.content && shareWebContentRequest.content.length)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content is missing',
        });
      }
      return;
    }

    if (shareWebContentRequest.content.some(item => !item.type)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content type cannot be undefined',
        });
      }
      return;
    }

    if (shareWebContentRequest.content.some(item => item.type !== shareWebContentRequest.content[0].type)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content must all be of the same type',
        });
      }
      return;
    }

    // Checks for specific content types

    if (shareWebContentRequest.content[0].type === 'URL') {
      if (shareWebContentRequest.content.some(item => !item.url)) {
        if (callback) {
          callback({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
            message: 'URLs are required for URL content types',
          });
        }
        return;
      }
    }

    ensureInitialized(
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    sendMessageToParent(SharingAPIMessages.shareWebContent, [shareWebContentRequest], callback);
  }
}
