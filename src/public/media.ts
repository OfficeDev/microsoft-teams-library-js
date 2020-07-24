import { GlobalVars } from '../internal/globalVars';
import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { generateGUID } from '../internal/utils';
import {
  createFile,
  decodeAttachment,
  validSelectMediaInputs,
  validGetMediaInputs,
  validViewImagesInput,
} from '../internal/mediaUtil';

/**
 * This is the SDK version when captureImage API is supported on mobile.
 */
const captureImageMobileSupportVersion = '1.7.0';

/**
 * This is the SDK version when media APIs is supported on all three platforms ios, android and web.
 */
const mediaAPIVersion = '1.8.0';

/**
 * Enum for file formats supported
 */
export enum FileFormat {
  Base64 = 'base64',
  ID = 'id',
}

/**
 * File object that can be used to represent image or video or audio
 */
export class File {
  /**
   * Content of the file. When format is Base64, this is the base64 content
   * When format is ID, this is id mapping to the URI
   * When format is base64 and app needs to use this directly in HTML tags, it should convert this to dataUrl.
   */
  public content: string;

  /**
   * Format of the content
   */
  public format: FileFormat;

  /**
   * Size of the file in KB
   */
  public size: number;

  /**
   * MIME type. This can be used for constructing a dataUrl, if needed.
   */
  public mimeType: string;

  /**
   * Optional: Name of the file
   */
  public name?: string;
}

/**
 * Launch camera, capture image or choose image from gallery and return the images as a File[] object to the callback.
 * Callback will be called with an error, if there are any. App should first check the error.
 * If it is present the user can be updated with appropriate error message.
 * If error is null or undefined, then files will have the required result.
 * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
 * Note: For desktop, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
 * @see File
 * @see SdkError
 */
export function captureImage(callback: (error: SdkError, files: File[]) => void): void {
  if (!callback) {
    throw new Error('[captureImage] Callback cannot be null');
  }
  ensureInitialized(FrameContexts.content, FrameContexts.task);

  if (!GlobalVars.isFramelessWindow) {
    const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
    callback(notSupportedError, undefined);
    return;
  }

  if (!isAPISupportedByPlatform(captureImageMobileSupportVersion)) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError, undefined);
    return;
  }

  const messageId = sendMessageRequestToParent('captureImage');
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Media object returned by the select Media API
 */
export class Media extends File {
  /**
   * A preview of the file which is a lightweight representation.
   * In case of images this will be a thumbnail/compressed image in base64 encoding.
   */
  public preview: string;

  /**
   * Gets the media in chunks irrespecitve of size, these chunks are assembled and sent back to the webapp as file/blob
   * @param callback returns blob of media
   */
  public getMedia(callback: (error: SdkError, blob: Blob) => void): void {
    if (!callback) {
      throw new Error('[get Media] Callback cannot be null');
    }
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isAPISupportedByPlatform(mediaAPIVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, null);
      return;
    } else if (!validGetMediaInputs(this.mimeType, this.format, this.content)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, null);
      return;
    }
    let actionName = generateGUID();
    let helper: MediaHelper = {
      mediaMimeType: this.mimeType,
      assembleAttachment: [],
    };
    const params = [actionName, this.content];
    this.content && callback && sendMessageRequestToParent('getMedia', params);
    function handleGetMediaRequest(response: string): void {
      if (callback) {
        let mediaResult: MediaResult = JSON.parse(response);
        if (mediaResult.error) {
          callback(mediaResult.error, null);
        } else {
          if (mediaResult.mediaChunk) {
            if (mediaResult.mediaChunk.chunkSequence <= 0) {
              let file = createFile(helper.assembleAttachment, helper.mediaMimeType);
              callback(mediaResult.error, file);
            } else {
              let assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
              helper.assembleAttachment.push(assemble);
            }
          } else {
            callback({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data receieved is null' }, null);
          }
        }
      }
    }

    GlobalVars.handlers['getMedia' + actionName] = handleGetMediaRequest;
  }
}

/**
 * Input parameter supplied to the select Media API
 */
export interface MediaInputs {
  /**
   * Only one media type can be selected at a time
   */
  mediaType: MediaType;

  /**
   * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
   */
  maxMediaCount: number;

  /**
   * Additional properties for customization of select media in mobile devices
   */
  imageProps?: ImageProps;
}

/**
 *  All properties in ImageProps are optional and have default values in the platform
 */
export interface ImageProps {
  /**
   * Optional; Lets the developer specify the image source, more than one can be specified.
   * Default value is both camera and gallery
   */
  sources?: Source[];

  /**
   * Optional; Specify in which mode the camera will be opened.
   * Default value is Photo
   */
  startMode?: Mode;

  /**
   * Optional; indicate if inking on the selected Image is allowed or not
   * Default value is true
   */
  ink?: boolean;

  /**
   * Optional; indicate if user is allowed to move between front and back camera
   * Default value is true
   */
  cameraSwitcher?: boolean;

  /**
   * Optional; indicate if putting text stickers on the selected Image is allowed or not
   * Default value is true
   */
  textSticker?: boolean;

  /**
   * Optional; indicate if image filtering mode is enabled on the selected image
   * Default value is false
   */
  enableFilter?: boolean;
}

/**
 * The modes in which camera can be launched in select Media API
 */
export const enum Mode {
  Photo = 1,
  Document = 2,
  Whiteboard = 3,
  BusinessCard = 4,
}

/**
 * Specifies the image source
 */
export const enum Source {
  Camera = 1,
  Gallery = 2,
}

/**
 * Specifies the type of Media
 */
export const enum MediaType {
  Image = 1,
  Video = 2,
  ImageAndVideo = 3,
  Audio = 4,
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
export const enum ImageUriType {
  ID = 1,
  URL = 2,
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
   * chunk sequence number​
   */
  chunkSequence: number;
}

/**
 * Output of getMedia API from platform
 */
interface MediaResult {
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
 * Helper object to assembled media chunks
 */
export interface AssembleAttachment {
  sequence: number;
  file: Blob;
}

/**
 * Helper class for assembling media
 */
interface MediaHelper {
  mediaMimeType: string;
  assembleAttachment: AssembleAttachment[];
}

/**
 * Select an attachment using camera/gallery
 * @param mediaInputs The input params to customize the media to be selected
 * @param callback The callback to invoke after fetching the media
 */
export function selectMedia(mediaInputs: MediaInputs, callback: (error: SdkError, attachments: Media[]) => void): void {
  if (!callback) {
    throw new Error('[select Media] Callback cannot be null');
  }
  ensureInitialized(FrameContexts.content, FrameContexts.task);
  if (!isAPISupportedByPlatform(mediaAPIVersion)) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError, null);
    return;
  } else if (!validSelectMediaInputs(mediaInputs)) {
    const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
    callback(invalidInput, null);
    return;
  }

  const params = [mediaInputs];
  const messageId = sendMessageRequestToParent('selectMedia', params);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * View images using native image viewer
 * @param uriList urilist of images to be viewed - can be content uri or server url. supports upto 10 Images in one go
 * @param result returns back error if encountered, there will be no callback in case of success
 */
export function viewImages(uriList: ImageUri[], callback: (error?: SdkError) => void): void {
  if (!callback) {
    throw new Error('[view images] Callback cannot be null');
  }
  ensureInitialized(FrameContexts.content, FrameContexts.task);

  if (!isAPISupportedByPlatform(mediaAPIVersion)) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    callback(oldPlatformError);
    return;
  } else if (!validViewImagesInput(uriList)) {
    const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
    callback(invalidInput);
    return;
  }

  const params = [uriList];
  const messageId = sendMessageRequestToParent('viewImages', params);
  GlobalVars.callbacks[messageId] = callback;
}
