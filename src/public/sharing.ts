import { ensureInitialized } from '../internal/internalAPIs';
import { sendMessageToParent } from '../internal/communication';
import { ErrorCode, SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace sharing {
  export const SharingAPIMessages = {
    shareWebContent: 'sharing.shareWebContent',
  };

  // More types can be added as we expand share capability
  type ContentType = 'URL';

  interface IBaseSharedContent {
    type: ContentType;
  }

  // More types can be added as we expand share capability
  export type IShareRequestContentType = IURLContent;

  export interface IShareRequest<T> {
    content: T[];
  }

  export interface IURLContent extends IBaseSharedContent {
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
    if (!validateNonEmptyContent(shareWebContentRequest, callback)) {
      return;
    }

    if (!validateTypeConsistency(shareWebContentRequest, callback)) {
      return;
    }

    if (!validateContentForSupportedTypes(shareWebContentRequest, callback)) {
      return;
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

  // Error checks
  function validateNonEmptyContent(
    shareRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): boolean {
    if (!(shareRequest && shareRequest.content && shareRequest.content.length)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content is missing',
        });
      }
      return false;
    }
    return true;
  }

  function validateTypeConsistency(
    shareRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): boolean {
    if (shareRequest.content.some(item => !item.type)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content type cannot be undefined',
        });
      }
      return false;
    }

    if (shareRequest.content.some(item => item.type !== shareRequest.content[0].type)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content must be of the same type',
        });
      }
      return false;
    }
    return true;
  }

  function validateContentForSupportedTypes(
    shareRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): boolean {
    if (shareRequest.content[0].type === 'URL') {
      if (shareRequest.content.some(item => !item.url)) {
        if (callback) {
          callback({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
            message: 'URLs are required for URL content types',
          });
        }
        return false;
      }
    } else {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Content type is unsupported',
        });
      }
      return false;
    }
    return true;
  }
}
