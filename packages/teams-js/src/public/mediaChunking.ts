/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { createFile, decodeAttachment, validateGetMediaInputs } from '../internal/mediaUtil';
import { FrameContexts } from './constants';
import { AssembleAttachment, ErrorCode, MediaAttachmentHelper, SdkError } from './interfaces';
// We should not be importing this class. Should make an interface for this (the function on media isn't needed and has been replaced with mediaChunking.getMediaAsBlob)
import { media } from './media';
import { runtime } from './runtime';

/**
 * @alpha
 */
// TODO - should I use Media class internally or convert to struct in back-compat?
export namespace mediaChunking {
  export function getMediaAsBlob(media: media.Media): Promise<Blob> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    if (!validateGetMediaInputs(media.mimeType, media.format, media.content)) {
      throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
    }

    return getMediaViaCallback(media);
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

  // doesn't require permissions because only works with existing pieces of Media

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }
}
