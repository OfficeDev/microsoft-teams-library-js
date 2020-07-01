import { GlobalVars } from '../internal/globalVars';
import { SdkError, ErrorCode } from './interfaces';
import { ensureInitialized, sendMessageRequestToParent, isAPISupportedByPlatform } from '../internal/internalAPIs';
import { FrameContexts } from './constants';
import { generateGUID } from '../internal/utils';
import { createFile, decodeAttachment } from '../internal/mediaUtil';

/**
 * This is the SDK version when captureImage API is supported on mobile.
 */
const captureImageMobileSupportVersion = '1.7.0';

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
   * Format of the content
   */
  public format: FileFormat;

  /**
   * Content of the file. When format is Base64, this is the base64 content
   * When format is URI, this is the URI
   * When format is base64 and app needs to use this directly in HTML tags, it should convert this to dataUrl.
   */
  public content: string;

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
   * In case of images this can be a thumbnail in base64 encoding.
   * In case of video this could be a gif with some preview. In case of audio, this could be
   * few seconds of the actual audio clip.
   */
  public preview: string;

  /**
   * Gets the media in chunks irrespecitve of size, these chunks are assembled and sent back to the webapp as file/blob
   * @param callback returns blob of media
   */
  public getMedia(callback: (error: SdkError, blob: Blob) => void): void {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
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
            callback({ errorCode: ErrorCode.GENERIC_ERROR, message: 'data receieved is null' }, null);
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
   * List of media types allowed to be selected
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
  //todo: Remove Video before PR
  Video = 5,
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
  //todo: Remove Video before PR
  Video = 2,
  // Both image and video
  Gallery = 3,
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

export interface ImageUri {
  value: string;
  type: ImageUriType;
}

export const enum ImageUriType {
  ID = 1,
  URL = 2,
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
class MediaHelper {
  public mediaMimeType: string;
  public assembleAttachment: AssembleAttachment[];
}

/**
 * Select an attachment using camera/gallery
 * @param mediaInputs The input params to customize the media to be selected
 * @param callback The callback to invoke after fetching the media
 */
export function selectMedia(mediaInputs: MediaInputs, callback: (error: SdkError, attachments: Media[]) => void): void {
  ensureInitialized(FrameContexts.content, FrameContexts.task);
  const params = [mediaInputs];
  const messageId = sendMessageRequestToParent('selectMedia', params);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * View images using native image viewer
 * @param uriList urilist of images to be viewed - can be content uri or server url
 * @param result returns back error if encountered
 */
export function viewImages(uriList: ImageUri[], callback: (error?: SdkError) => void): void {
  ensureInitialized(FrameContexts.content, FrameContexts.task);
  const params = [uriList];
  const messageId = sendMessageRequestToParent('viewImages', params);
  GlobalVars.callbacks[messageId] = callback;
}
