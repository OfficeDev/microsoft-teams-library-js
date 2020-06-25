import { ensureInitialized, sendMessageRequestToParent } from '../internal/internalAPIs';
import { SdkError, ErrorCode } from './interfaces';
import { frameContexts } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { generateGUID } from '../internal/utils';

/**
 * Media object returned by the select Media API
 */
export interface Media {
  /**
   * Base 64 encoded media
   */
  encodedData: string;

  /**
   * size of the media
   */
  size: number;

  /**
   * Platform's uri in string format
   */
  uri: string;

  /**
   * mime type of the media
   */
  mimeType: string;
}

/**
 * Input parameter supplied to the select Media API
 */
export interface MediaInputs {
  /**
   * List of media types allowed to be selected
   */
  mediaTypes: MediaType[];

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
}

/**
 * Input to getMedia API
 */
export interface MediaUri {
  /**
   * Content uri of the file to read
   */
  uri: string;

  /**
   * chunk sequence to read a particular chunk
   */
  chunkSequence?: number;
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
 * Gets the media in chunks irrespecitve of size, these chunks are assembled and sent back to the webapp as file/blob
 * @param input uri to be fetched
 * @param mimeType mimeType of file requested
 * @param callback returns blob of media
 */
export function getMedia(input: MediaUri, mimeType: string, callback: (error: SdkError, blob: Blob) => void): void {
  ensureInitialized(frameContexts.content, frameContexts.task);
  let actionName = generateGUID();
  let helper: MediaHelper = {
    mediaMimeType: mimeType,
    assembleAttachment: [],
  };
  const params = [actionName, input];
  GlobalVars.getMediaHandler = callback;
  input && callback && sendMessageRequestToParent('getMedia', params);
  function handleGetMediaRequest(response: string): void {
    if (GlobalVars.getMediaHandler) {
      let mediaResult: MediaResult = JSON.parse(response);
      if (mediaResult.error) {
        sendGetMediaResponse(mediaResult.error, null, helper);
      } else {
        if (mediaResult.mediaChunk) {
          if (mediaResult.mediaChunk.chunkSequence <= 0) {
            let file = createFile(helper.assembleAttachment, helper.mediaMimeType);
            sendGetMediaResponse(mediaResult.error, file, helper);
          } else {
            let assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
            helper.assembleAttachment.push(assemble);
          }
        } else {
          sendGetMediaResponse({ errorCode: ErrorCode.GENERIC_ERROR, message: 'data receieved is null' }, null, helper);
        }
      }
    }
  }

  GlobalVars.handlers['getMedia' + actionName] = handleGetMediaRequest;
}

/**
 * View images using native image viewer
 * @param uriList urilist of images to be viewed - can be content uri or server url
 * @param result returns back error if encountered
 */
export function viewImages(uriList: string[], callback: (error?: SdkError) => void): void {
  ensureInitialized(frameContexts.content, frameContexts.task);
  const params = [uriList];
  const messageId = sendMessageRequestToParent('viewImages', params);
  GlobalVars.callbacks[messageId] = callback;
}

/**
 * Assembles the media file
 * The response comes back in chunks, this function is responsible for stitching them back together and sending the file back to user
 *
 * @param response is a JSON string of type MediaResult
 */

function sendGetMediaResponse(error: SdkError, blob: Blob, helper: MediaHelper): void {
  helper = null;
  GlobalVars.getMediaHandler(error, blob);
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
