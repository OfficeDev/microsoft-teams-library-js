import { ensureInitialized } from '../internal/internalAPIs';
import { sendMessageToParent } from '../internal/communication';
import { ErrorCode, SdkError } from './interfaces';
import { FrameContexts } from './constants';

export namespace sharing {
  export const SharingAPIMessages = {
    shareWebContent: 'sharing.shareWebContent',
    createAssignment: 'sharing.createAssignment',
  };

  export interface IShareWebContentRequest {
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
   * EDU users only
   * Create an assignment
   */
  export interface ICreateAssignmentRequest {
    /**
     * URL to share
     */
    url?: string;

    /**
     * Assignment title
     */
    title?: string;

    /**
     * Instruction text
     */
    instruction?: string;
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
    shareWebContentRequest: IShareWebContentRequest,
    callback?: (err?: SdkError) => void,
  ): void {
    if (!(shareWebContentRequest && shareWebContentRequest.url)) {
      if (callback) {
        callback({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'URL is required.',
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

    sendMessageToParent(SharingAPIMessages.shareWebContent, [shareWebContentRequest], callback);
  }

  /**
   * @private
   * Feature is under development
   *
   * Opens a share dialog for creating a class asignment
   * @param createAssignmentRequest assignment info
   * @param callback optional callback
   */
  export function createAssignment(
    createAssignmentRequest?: ICreateAssignmentRequest,
    callback?: (err?: SdkError) => void,
  ): void {
    ensureInitialized(
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    sendMessageToParent(SharingAPIMessages.createAssignment, [createAssignmentRequest], callback);
  }
}
