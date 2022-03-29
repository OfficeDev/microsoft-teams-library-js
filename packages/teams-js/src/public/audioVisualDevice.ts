/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendAndHandleSdkError, sendMessageToParent, sendMessageToParentAsync } from '../internal/communication';
import {
  getMediaCallbackSupportVersion,
  mediaAPISupportVersion,
  scanBarCodeAPIMobileSupportVersion,
} from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  createFile,
  decodeAttachment,
  throwExceptionIfMediaCallIsNotSupportedOnMobile,
  validateGetMediaInputs,
  validateScanBarCodeInput,
  validateSelectMediaInputs,
  validateViewImagesInput,
} from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  generateGUID,
  InputFunction,
} from '../internal/utils';
import { FrameContexts, HostClientType, MediaType } from './constants';
import { ErrorCode, ImageProps, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

/**
 * @alpha
 */
// TODO - should I use Media class internally or convert to structin back-compat?
export namespace audioVisualDevice {
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

  // This should not trigger the "refresh the app scenario" because this is for setting things up
  // for use through teamsjs-sdk 2.0. If the user DOES refresh the app after calling this the iframe
  // would have the new allow parameters, but only the AppPermissions dialog should trigger the
  // "ask the user to refresh" flow
  export function requestPermission(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      resolve(sendAndHandleSdkError('location.requestPermission'));
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }

  export namespace camera {
    export interface ImageInputs {
      mediaType: MediaType.Image;
      maxMediaCount: number;
      imageProps?: ImageProps;
    }

    /**
     * Input for view images API
     */
    export interface ImageUri {
      value: string;
      type: ImageUriType;
    }

    /**
     * ID contains a mapping for content uri on platform's side, URL is generic
     */
    export enum ImageUriType {
      ID = 1,
      URL = 2,
    }

    export function selectImages(imageInputs: ImageInputs): Promise<media.Media[]> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      // Probably should clean this up, no reason to use this structure anymore
      const wrappedFunction: InputFunction<media.Media[]> = () =>
        new Promise<[SdkError, media.Media[]]>(resolve => {
          if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
            throw { errorCode: ErrorCode.OLD_PLATFORM };
          }
          throwExceptionIfMediaCallIsNotSupportedOnMobile(imageInputs);

          if (!validateSelectMediaInputs(imageInputs)) {
            throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
          }

          const params = [imageInputs];
          // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
          resolve(sendMessageToParentAsync<[SdkError, media.Media[]]>('selectMedia', params));
        }).then(([err, localAttachments]: [SdkError, media.Media[]]) => {
          // Media Attachments are final response to selectMedia
          if (!localAttachments) {
            throw err;
          }
          const mediaArray: media.Media[] = [];
          for (const attachment of localAttachments) {
            mediaArray.push(new media.Media(attachment));
          }
          return mediaArray;
        });

      return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<media.Media[]>(wrappedFunction);
    }

    /**
     * View images using native image viewer
     *
     * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
     * @returns A promise resolved when the viewing action is completed or rejected with an @see SdkError
     */
    export function viewImages(uriList: ImageUri[]): Promise<void> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      return new Promise<void>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        if (!validateViewImagesInput(uriList)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        resolve(sendAndHandleSdkError('viewImages', uriList));
      });
    }

    export function isSupported(): boolean {
      return runtime.supports.media.camera ? true : false;
    }

    export namespace barcode {
      /**
       * Scan Barcode/QRcode using camera
       *
       * @remarks
       * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
       *
       * @param config - optional input configuration to customize the barcode scanning experience
       * @returns A promise resolved with the barcode data or rejected with an @see SdkError
       */
      export function scanBarCode(config?: BarCodeConfig): Promise<string> {
        ensureInitialized(FrameContexts.content, FrameContexts.task);

        return new Promise<string>(resolve => {
          if (
            GlobalVars.hostClientType === HostClientType.desktop ||
            GlobalVars.hostClientType === HostClientType.web ||
            GlobalVars.hostClientType === HostClientType.rigel ||
            GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
            GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
            GlobalVars.hostClientType === HostClientType.teamsPhones ||
            GlobalVars.hostClientType === HostClientType.teamsDisplays
          ) {
            throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
          }

          if (!isCurrentSDKVersionAtLeast(scanBarCodeAPIMobileSupportVersion)) {
            throw { errorCode: ErrorCode.OLD_PLATFORM };
          }

          if (!validateScanBarCodeInput(config)) {
            throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
          }

          resolve(sendAndHandleSdkError('media.scanBarCode', config));
        });
      }

      /**
       * Barcode configuration supplied to scanBarCode API to customize barcode scanning experience in mobile
       * All properties in BarCodeConfig are optional and have default values in the platform
       */
      export interface BarCodeConfig {
        /**
         * Optional; Lets the developer specify the scan timeout interval in seconds
         * Default value is 30 seconds and max allowed value is 60 seconds
         */
        timeOutIntervalInSec?: number;
      }

      export function isSupported(): boolean {
        return runtime.supports.media.camera.barcode ? true : false;
      }
    }
  }
}
