/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendMessageToParent } from '../internal/communication';
import { getMediaCallbackSupportVersion, mediaAPISupportVersion } from '../internal/constants';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { createFile, decodeAttachment, validateGetMediaInputs } from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  generateGUID,
  InputFunction,
} from '../internal/utils';
import { FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

/**
 * @alpha
 */
// TODO - should I use Media class internally or convert to structin back-compat?
export namespace mediaChunking {
  export function getMediaAsBlob(media: media.Media, callback?: (error: SdkError, blob: Blob) => void): Promise<Blob> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    const wrappedFunction: InputFunction<Blob> = () =>
      new Promise<Blob>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        if (!validateGetMediaInputs(media.mimeType, media.format, media.content)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }
        // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
        if (isCurrentSDKVersionAtLeast(getMediaCallbackSupportVersion)) {
          resolve(getMediaViaCallback(media));
        } else {
          resolve(getMediaViaHandler(media));
        }
      });

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Blob>(wrappedFunction, callback);
  }

  function getMediaViaCallback(media: media.Media): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const helper: MediaAttachmentHelper = {
        mediaMimeType: media.mimeType,
        assembleAttachment: [],
      };
      const localUriId = [media.content];
      sendMessageToParent('getMedia', localUriId, (mediaResult: MediaResult) => {
        if (mediaResult && mediaResult.error) {
          reject(mediaResult.error);
        } else if (!mediaResult || !mediaResult.mediaChunk) {
          reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
        } else if (mediaResult.mediaChunk.chunkSequence <= 0) {
          const file = createFile(helper.assembleAttachment, helper.mediaMimeType);
          resolve(file);
        } else {
          // Keep pushing chunks into assemble attachment
          const assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
          helper.assembleAttachment.push(assemble);
        }
      });
    });
  }

  function getMediaViaHandler(media: media.Media): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const actionName = generateGUID();
      const helper: MediaAttachmentHelper = {
        mediaMimeType: media.mimeType,
        assembleAttachment: [],
      };
      const params = [actionName, media.content];
      media.content && sendMessageToParent('getMedia', params);

      registerHandler('getMedia' + actionName, (response: string) => {
        try {
          const mediaResult: MediaResult = JSON.parse(response);
          if (mediaResult.error) {
            reject(mediaResult.error);
            removeHandler('getMedia' + actionName);
          } else if (!mediaResult || !mediaResult.mediaChunk) {
            reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
            removeHandler('getMedia' + actionName);
          } else if (mediaResult.mediaChunk.chunkSequence <= 0) {
            // If the chunksequence number is less than equal to 0 implies EOF
            // create file/blob when all chunks have arrived and we get 0/-1 as chunksequence number
            const file = createFile(helper.assembleAttachment, helper.mediaMimeType);
            resolve(file);
            removeHandler('getMedia' + actionName);
          } else {
            // Keep pushing chunks into assemble attachment
            const assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
            helper.assembleAttachment.push(assemble);
          }
        } catch (err) {
          // catch JSON.parse() errors
          reject({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'Error parsing the response: ' + response });
        }
      });
    });
  }

  /**
   * Helper object to assembled media chunks
   */
  export interface AssembleAttachment {
    sequence: number;
    file: Blob;
  }

  /**
   * Helper interface for assembling media
   */
  interface MediaAttachmentHelper {
    mediaMimeType: string;
    assembleAttachment: AssembleAttachment[];
  }

  /**
   * Output of getMedia API from platform
   */
  export interface MediaResult {
    /**
     * error encountered in getMedia API
     */
    error: SdkError;

    /**
     * Media chunk which will be assemebled and converted into a blob
     */
    mediaChunk: MediaChunk;
  }

  /**
   * Media chunks an output of getMedia API from platform
   */
  export interface MediaChunk {
    /**
     * Base 64 data for the requested uri
     */
    chunk: string;

    /**
     * chunk sequence number
     */
    chunkSequence: number;
  }

  // doesn't require permissions

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }
}
