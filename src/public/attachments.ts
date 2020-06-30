import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { SdkError, ErrorCode } from './interfaces';
import { frameContexts } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { generateGUID } from '../internal/utils';

/**
 * Media object returned by the select Media API
 */
export class Media {
  /**
   * Base 64 encoded media
   */
  public preview: string;

  /**
   * size of the media
   */
  public size: number;

  /**
   * GUID id serving as key for the Map on platform that provides the local uri corresponding to the key
   */
  public id: string;

  /**
   * mime type of the media
   */
  public mimeType: string;

  /**
   * Gets the media in chunks irrespecitve of size, these chunks are assembled and sent back to the webapp as file/blob
   * @param callback returns blob of media
   */
  public getMedia(callback: (error: SdkError, blob: Blob) => void): void {
    ensureInitialized(frameContexts.content, frameContexts.task);
    let actionName = generateGUID();
    let helper: MediaHelper = {
      mediaMimeType: this.mimeType,
      assembleAttachment: [],
    };
    const params = [actionName, this.id];
    GlobalVars.getMediaHandler = callback;
    this.id && callback && sendMessageRequestToParent('getMedia', params);
    function handleGetMediaRequest(response: string): void {
      if (GlobalVars.getMediaHandler) {
        let mediaResult: MediaResult = JSON.parse(response);
        if (mediaResult.error) {
          GlobalVars.getMediaHandler(mediaResult.error, null);
        } else {
          if (mediaResult.mediaChunk) {
            if (mediaResult.mediaChunk.chunkSequence <= 0) {
              let file = createFile(helper.assembleAttachment, helper.mediaMimeType);
              GlobalVars.getMediaHandler(mediaResult.error, file);
            } else {
              let assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
              helper.assembleAttachment.push(assemble);
            }
          } else {
            GlobalVars.getMediaHandler({ errorCode: ErrorCode.GENERIC_ERROR, message: 'data receieved is null' }, null);
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
interface MediaChunk {
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
interface AssembleAttachment {
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
  ensureInitialized(frameContexts.content, frameContexts.task);
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
  ensureInitialized(frameContexts.content, frameContexts.task);
  const params = [uriList];
  const messageId = sendMessageRequestToParent('viewImages', params);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Helper function to create a blob from media chunks based on their sequence
 */
function createFile(assembleAttachment: AssembleAttachment[], mimeType: string): Blob {
  let file: Blob;
  let sequence = 1;
  assembleAttachment.sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
  assembleAttachment.forEach(item => {
    if (item.sequence == sequence) {
      if (file) {
        file = new Blob([file, item.file], { type: mimeType });
      } else {
        file = new Blob([item.file], { type: mimeType });
      }
      sequence++;
    }
  });
  return file;
}

/**
 * Helper function to convert Media chunks into another object type which can be later assemebled
 * Converts base 64 encoded string to byte array and then into an array of blobs
 */
function decodeAttachment(attachment: MediaChunk, mimeType: string): AssembleAttachment {
  let decoded = atob(attachment.chunk);
  let byteNumbers = new Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    byteNumbers[i] = decoded.charCodeAt(i);
  }
  let byteArray = new Uint8Array(byteNumbers);
  let blob: Blob = new Blob([byteArray], { type: mimeType });
  let assemble: AssembleAttachment = {
    sequence: attachment.chunkSequence,
    file: blob,
  };
  return assemble;
}
