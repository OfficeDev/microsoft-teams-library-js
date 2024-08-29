import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { callCallbackWithSdkErrorFromPromiseAndReturnPromise, InputFunction } from '../internal/utils';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

const sharingTelemetryVersionNumber_v1: ApiVersionNumber = ApiVersionNumber.V_1;
const sharingTelemetryVersionNumber_v2: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Namespace to open a share dialog for web content.
 * For more info, see [Share to Teams from personal app or tab](https://learn.microsoft.com/microsoftteams/platform/concepts/build-and-test/share-to-teams-from-personal-app-or-tab)
 */
export namespace sharing {
  /** shareWebContent callback function type */
  export type shareWebContentCallbackFunctionType = (err?: SdkError) => void;

  /** Type of message that can be sent or received by the sharing APIs */
  export const SharingAPIMessages = {
    /**
     * Share web content message.
     * @internal
     */
    shareWebContent: 'sharing.shareWebContent',
  };

  // More types can be added as we expand share capability
  type ContentType = 'URL';

  /** Represents parameters for base shared content. */
  interface IBaseSharedContent {
    /** Shared content type  */
    type: ContentType;
  }

  // More types can be added as we expand share capability
  /** IShareRequestContentType defines share request type. */
  export type IShareRequestContentType = IURLContent;

  /** Represents IShareRequest parameters interface.
   * @typeparam T - The identity type
   */
  export interface IShareRequest<T> {
    /** Content of the share request. */
    content: T[];
  }

  /** Represents IURLContent parameters. */
  export interface IURLContent extends IBaseSharedContent {
    /** Type */
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
   * Feature is under development
   * Opens a share dialog for web content
   *
   * @param shareWebContentRequest - web content info
   * @returns Promise that will be fulfilled when the operation has completed
   */
  export function shareWebContent(shareWebContentRequest: IShareRequest<IShareRequestContentType>): Promise<void>;
  /**
   * @deprecated
   * As of TeamsJS v2.0.0, please use {@link sharing.shareWebContent sharing.shareWebContent(shareWebContentRequest: IShareRequest\<IShareRequestContentType\>): Promise\<void\>} instead.
   *
   * Feature is under development
   * Opens a share dialog for web content
   *
   * @param shareWebContentRequest - web content info
   * @param callback - optional callback
   */
  export function shareWebContent(
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
    callback: shareWebContentCallbackFunctionType,
  ): void;
  export function shareWebContent(
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
    callback?: shareWebContentCallbackFunctionType,
  ): Promise<void> {
    // validate the given input (synchronous check)
    try {
      validateNonEmptyContent(shareWebContentRequest);
      validateTypeConsistency(shareWebContentRequest);
      validateContentForSupportedTypes(shareWebContentRequest);
    } catch (err) {
      //return the error via callback(v1) or rejected promise(v2)
      const wrappedFunction: InputFunction<void> = () => Promise.reject(err);
      return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedFunction, callback);
    }
    ensureInitialized(
      runtime,
      FrameContexts.content,
      FrameContexts.sidePanel,
      FrameContexts.task,
      FrameContexts.stage,
      FrameContexts.meetingStage,
    );
    const apiVersionTag = callback
      ? getApiVersionTag(sharingTelemetryVersionNumber_v1, ApiName.Sharing_ShareWebContent)
      : getApiVersionTag(sharingTelemetryVersionNumber_v2, ApiName.Sharing_ShareWebContent);
    return callCallbackWithSdkErrorFromPromiseAndReturnPromise(
      shareWebContentHelper,
      callback,
      apiVersionTag,
      shareWebContentRequest,
    );
  }

  function shareWebContentHelper(
    apiVersionTag: string,
    shareWebContentRequest: IShareRequest<IShareRequestContentType>,
  ): Promise<void> {
    return new Promise<void>((resolve) => {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      resolve(sendAndHandleSdkError(apiVersionTag, SharingAPIMessages.shareWebContent, shareWebContentRequest));
    });
  }

  /**
   * Functions for validating the shareRequest input parameter
   */
  function validateNonEmptyContent(shareRequest: IShareRequest<IShareRequestContentType>): void {
    if (!(shareRequest && shareRequest.content && shareRequest.content.length)) {
      const err: SdkError = {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Shared content is missing',
      };
      throw err;
    }
  }

  function validateTypeConsistency(shareRequest: IShareRequest<IShareRequestContentType>): void {
    let err: SdkError | undefined;
    if (shareRequest.content.some((item) => !item.type)) {
      err = {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Shared content type cannot be undefined',
      };
      throw err;
    }
    if (shareRequest.content.some((item) => item.type !== shareRequest.content[0].type)) {
      err = {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Shared content must be of the same type',
      };
      throw err;
    }
  }

  function validateContentForSupportedTypes(shareRequest: IShareRequest<IShareRequestContentType>): void {
    let err: SdkError | undefined;
    if (shareRequest.content[0].type === 'URL') {
      if (shareRequest.content.some((item) => !item.url)) {
        err = {
          errorCode: ErrorCode.INVALID_ARGUMENTS,
          message: 'URLs are required for URL content types',
        };
        throw err;
      }
    } else {
      err = {
        errorCode: ErrorCode.INVALID_ARGUMENTS,
        message: 'Content type is unsupported',
      };
      throw err;
    }
  }

  /**
   * Checks if the sharing capability is supported by the host
   * @returns boolean to represent whether the sharing capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.sharing ? true : false;
  }

  /**
   * Namespace to get the list of content shared in a Teams meeting
   *
   * @beta
   */
  export namespace history {
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
  }
}
