import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { callCallbackWithSdkErrorFromPromiseAndReturnPromise } from '../internal/utils';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * @alpha
 */
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
   * @hidden
   * Feature is under development
   * Opens a share dialog for web content
   *
   * @param shareWebContentRequest - web content info
   * @param callback - optional callback
   *
   * @internal
   */
  export function shareWebContent(shareWebContentRequest: IShareRequest<IShareRequestContentType>): Promise<void>;
  export function shareWebContent(
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): void;
  export function shareWebContent(
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
    callback?: (err?: SdkError) => void,
  ): Promise<void> {
    ensureInitialized(
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );

    return callCallbackWithSdkErrorFromPromiseAndReturnPromise(shareWebContentHelper, callback, shareWebContentRequest);
  }

  function shareWebContentHelper(shareWebContentRequest: IShareRequest<IShareRequestContentType>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      Promise.all([
        validateNonEmptyContent(shareWebContentRequest),
        validateTypeConsistency(shareWebContentRequest),
        validateContentForSupportedTypes(shareWebContentRequest),
      ])
        .then(() => {
          resolve(sendAndHandleSdkError(SharingAPIMessages.shareWebContent, shareWebContentRequest));
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  /**
   * Functions for validating the shareRequest input parameter
   */
  function validateNonEmptyContent(shareRequest: IShareRequest<IShareRequestContentType>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!(shareRequest && shareRequest.content && shareRequest.content.length)) {
        reject({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content is missing',
        });
      }
      resolve();
    });
  }

  function validateTypeConsistency(shareRequest: IShareRequest<IShareRequestContentType>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (shareRequest.content.some(item => !item.type)) {
        reject({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content type cannot be undefined',
        });
      }
      if (shareRequest.content.some(item => item.type !== shareRequest.content[0].type)) {
        reject({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Shared content must be of the same type',
        });
      }
      resolve();
    });
  }

  function validateContentForSupportedTypes(shareRequest: IShareRequest<IShareRequestContentType>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (shareRequest.content[0].type === 'URL') {
        if (shareRequest.content.some(item => !item.url)) {
          reject({
            errorCode: ErrorCode.INVALID_ARGUMENTS,
            message: 'URLs are required for URL content types',
          });
        }
        resolve();
      } else {
        reject({
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'Content type is unsupported',
        });
      }
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.sharing ? true : false;
  }
}
