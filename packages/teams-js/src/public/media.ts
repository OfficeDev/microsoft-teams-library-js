/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendAndHandleSdkError, sendMessageToParent } from '../internal/communication';
import {
  captureImageMobileSupportVersion,
  getMediaCallbackSupportVersion,
  mediaAPISupportVersion,
} from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import { createFile, decodeAttachment, validateGetMediaInputs } from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  generateGUID,
  InputFunction,
} from '../internal/utils';
import { audio } from './audioDevice';
import { barcodeDevice } from './barcodeDevice';
import { cameraDevice } from './cameraDevice';
import * as constants from './constants';
import * as interfaces from './interfaces';
import { mediaChunking } from './mediaChunking';
import { runtime } from './runtime';
import { videoDevice } from './videoDevice';

/**
 * @alpha
 */
export namespace media {
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
     * Size of the file in KB
     */
    public size: number;

    /**
     * MIME type. This can be used for constructing a dataUrl, if needed.
     */
    public mimeType: string;

    /**
     * Optional: Name of the file
     */
    public name?: string;
  }

  /**
   * Launch camera, capture image or choose image from gallery and return the images as a File[] object
   *
   * @remarks
   * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
   * Note: For desktop, this API is not supported. Promise will be rejected with ErrorCode.NotSupported.
   *
   * @returns A promise resolved with a collection of @see File objects or rejected with an @see SdkError
   */
  export function captureImage(): Promise<File[]>;
  /**
   * Launch camera, capture image or choose image from gallery and return the images as a File[] object
   *
   * @param callback - Callback to invoke when the image is captured.
   *
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link media.captureImage media.captureImage(): Promise\<File[]\>} instead.
   *
   * @remarks
   * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
   * Note: For desktop, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   */
  export function captureImage(callback: (error?: interfaces.SdkError, files?: File[]) => void): void;
  export function captureImage(callback?: (error?: interfaces.SdkError, files?: File[]) => void): Promise<File[]> {
    ensureInitialized(constants.FrameContexts.content, constants.FrameContexts.task);

    const wrappedFunction: InputFunction<File[]> = () =>
      new Promise<File[]>(resolve => {
        if (!GlobalVars.isFramelessWindow) {
          throw { errorCode: interfaces.ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
        }

        if (!isCurrentSDKVersionAtLeast(captureImageMobileSupportVersion)) {
          throw { errorCode: interfaces.ErrorCode.OLD_PLATFORM };
        }

        resolve(sendAndHandleSdkError('captureImage'));
      });

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<File[]>(wrappedFunction, callback);
  }

  /**
   * Media object returned by the select Media API
   */
  export class Media extends File {
    constructor(that: Media = null) {
      super();
      if (that) {
        this.content = that.content;
        this.format = that.format;
        this.mimeType = that.mimeType;
        this.name = that.name;
        this.preview = that.preview;
        this.size = that.size;
      }
    }

    /**
     * A preview of the file which is a lightweight representation.
     * In case of images this will be a thumbnail/compressed image in base64 encoding.
     */
    public preview: string;

    /**
     * Gets the media in chunks irrespective of size, these chunks are assembled and sent back to the webapp as file/blob
     *
     * @returns A promise resolved with the @see Blob or rejected with a @see SdkError
     */
    public getMedia(): Promise<Blob>;
    /**
     * Gets the media in chunks irrespective of size, these chunks are assembled and sent back to the webapp as file/blob
     *
     * @deprecated
     * As of 2.0.0-beta.1, please use {@link media.Media.getMedia media.Media.getMedia(): Promise\<Blob\>} instead.
     *
     * @param callback - returns blob of media
     */
    public getMedia(callback: (error: interfaces.SdkError, blob: Blob) => void): void;
    public getMedia(callback?: (error: interfaces.SdkError, blob: Blob) => void): Promise<Blob> {
      const wrappedFunction: InputFunction<Blob> = () =>
        new Promise<Blob>(resolve => {
          if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
            throw { errorCode: interfaces.ErrorCode.OLD_PLATFORM };
          }
          if (!validateGetMediaInputs(this.mimeType, this.format, this.content)) {
            throw { errorCode: interfaces.ErrorCode.INVALID_ARGUMENTS };
          }
          // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
          if (isCurrentSDKVersionAtLeast(getMediaCallbackSupportVersion)) {
            resolve(mediaChunking.getMediaAsBlob(this));
          } else {
            resolve(this.getMediaViaHandler(this));
          }
        });
      return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Blob>(wrappedFunction, callback);
    }

    private getMediaViaHandler(media: media.Media): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        const actionName = generateGUID();
        const helper: interfaces.MediaAttachmentHelper = {
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
              reject({ errorCode: interfaces.ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
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
            reject({
              errorCode: interfaces.ErrorCode.INTERNAL_ERROR,
              message: 'Error parsing the response: ' + response,
            });
          }
        });
      });
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
     * Additional properties for customization of select media - Image in mobile devices
     */
    imageProps?: ImageProps;

    /**
     * Additional properties for customization of select media - Video in mobile devices
     */
    videoProps?: VideoProps;

    /**
     * Additional properties for customization of select media - VideoAndImage in mobile devices
     */
    videoAndImageProps?: VideoAndImageProps;

    /**
     * Additional properties for audio capture flows.
     */
    audioProps?: AudioProps;
  }

  /**
   *  All properties in ImageProps are optional and have default values in the platform
   */
  export import ImageProps = interfaces.ImageProps;

  /**
   * All properties in VideoProps are optional and have default values in the platform
   */
  export import VideoProps = interfaces.VideoProps;

  /**
   * All properties in VideoAndImageProps are optional and have default values in the platform
   */
  export interface VideoAndImageProps extends ImageProps, VideoProps {}

  /**
   *  All properties in AudioProps are optional and have default values in the platform
   */
  export interface AudioProps {
    /**
     * Optional; the maximum duration in minutes after which the recording should terminate automatically
     * Default value is defined by the platform serving the API.
     */
    maxDuration?: number;
  }

  /**
   * Callback which will register your app to listen to lifecycle events during the video capture flow
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import VideoControllerCallback = videoDevice.VideoControllerCallback;

  /**
   * VideoController class is used to communicate between the app and the host client during the video capture flow
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import VideoController = videoDevice.VideoController;

  /**
   * @hidden
   * Hide from docs
   * --------
   * Events which are used to communicate between the app and the host client during the media recording flow
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaControllerEvent = constants.MediaControllerEvent;

  /**
   * The modes in which camera can be launched in select Media API
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import CameraStartMode = constants.CameraStartMode;

  /**
   * Specifies the image source
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Source = constants.Source;

  // /**
  //  * Specifies the type of Media
  //  */
  export import MediaType = constants.MediaType;

  /**
   * Input for view images API
   */
  export import ImageUri = interfaces.ImageUri;

  /**
   * ID contains a mapping for content uri on platform's side, URL is generic
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ImageUriType = interfaces.ImageUriType;

  /**
   * Specifies the image output formats.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ImageOutputFormats = constants.ImageOutputFormats;

  /**
   * Media chunks an output of getMedia API from platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaChunk = mediaChunking.MediaChunk;

  /**
   * Output of getMedia API from platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaResult = mediaChunking.MediaResult;

  /**
   * Helper object to assembled media chunks
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import AssembleAttachment = mediaChunking.AssembleAttachment;

  /**
   * Select an attachment using camera/gallery
   *
   * @param mediaInputs - The input params to customize the media to be selected
   * @returns  A promise resolved with an array of media data or rejected with an @see SdkError
   */
  export function selectMedia(mediaInputs: MediaInputs): Promise<Media[]>;
  /**
   * Select an attachment using camera/gallery
   *
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link media.selectMedia media.selectMedia(mediaInputs: MediaInputs): Promise\<Media[]\>} instead.
   *
   * @param mediaInputs - The input params to customize the media to be selected
   * @param callback - The callback to invoke after fetching the media
   */
  export function selectMedia(
    mediaInputs: MediaInputs,
    callback: (error: interfaces.SdkError, attachments: Media[]) => void,
  );
  export function selectMedia(
    mediaInputs: MediaInputs,
    callback?: (error?: interfaces.SdkError, attachments?: Media[]) => void,
  ): Promise<Media[]> {
    // Probably we should be more careful about casting this?
    const wrappedFunction: InputFunction<Media[]> = () =>
      new Promise<Media[]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: interfaces.ErrorCode.OLD_PLATFORM };
        }

        if (mediaInputs.audioProps) {
          resolve(audio.selectAudio(mediaInputs as audio.AudioInputs));
        } else if (mediaInputs.videoAndImageProps) {
          resolve(videoDevice.selectMediaContainingVideo(mediaInputs as videoDevice.VideoAndImageInputs));
        } else if (mediaInputs.videoProps) {
          resolve(videoDevice.selectMediaContainingVideo(mediaInputs as videoDevice.VideoInputs));
        } else {
          resolve(cameraDevice.selectImages(mediaInputs as cameraDevice.ImageInputs));
        }
      });

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Media[]>(wrappedFunction, callback);
  }

  /**
   * View images using native image viewer
   *
   * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
   * @returns A promise resolved when the viewing action is completed or rejected with an @see SdkError
   */
  export function viewImages(uriList: ImageUri[]): Promise<void>;
  /**
   * View images using native image viewer
   *
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link media.viewImages media.viewImages(uriList: ImageUri[]): Promise\<void\>} instead.
   *
   * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
   * @param callback - returns back error if encountered, returns null in case of success
   */
  export function viewImages(uriList: ImageUri[], callback: (error?: interfaces.SdkError) => void);
  export function viewImages(uriList: ImageUri[], callback?: (error?: interfaces.SdkError) => void): Promise<void> {
    ensureInitialized(constants.FrameContexts.content, constants.FrameContexts.task);

    const wrappedFunction: InputFunction<void> = () => cameraDevice.viewImages(uriList);

    return callCallbackWithSdkErrorFromPromiseAndReturnPromise<void>(wrappedFunction, callback);
  }

  /**
   * Barcode configuration supplied to scanBarCode API to customize barcode scanning experience in mobile
   * All properties in BarCodeConfig are optional and have default values in the platform
   */
  export import BarCodeConfig = barcodeDevice.BarCodeConfig;

  /**
   * Scan Barcode/QRcode using camera
   *
   * @remarks
   * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   * @param config - optional input configuration to customize the barcode scanning experience
   * @returns A promise resolved with the barcode data or rejected with an @see SdkError
   */
  export function scanBarCode(config?: BarCodeConfig): Promise<string>;
  /**
   * Scan Barcode/QRcode using camera
   *
   * @remarks
   * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   * @deprecated
   * As of 2.0.0-beta.1, please use {@link media.scanBarCode media.scanBarCode(config?: BarCodeConfig): Promise\<string\>} instead.
   *
   * @param callback - callback to invoke after scanning the barcode
   * @param config - optional input configuration to customize the barcode scanning experience
   */
  export function scanBarCode(
    callback: (error: interfaces.SdkError, decodedText: string) => void,
    config?: BarCodeConfig,
  );
  export function scanBarCode(
    callbackOrConfig?: ((error: interfaces.SdkError, decodedText: string) => void) | BarCodeConfig,
    configMaybe?: BarCodeConfig,
  ): Promise<string> {
    let callback: (error: interfaces.SdkError, decodedText: string) => void | undefined;
    let config: BarCodeConfig | undefined;

    // Because the callback isn't the second parameter in the original v1 method we need to
    // do a bit of trickery to see which of the two ways were used to call into
    // the flow and if the first parameter is a callback (v1) or a config object (v2)

    if (callbackOrConfig === undefined) {
      // no first parameter - the second one might be a config, definitely no callback
      config = configMaybe;
    } else {
      if (typeof callbackOrConfig === 'object') {
        // the first parameter is an object - it's the config! No callback.
        config = callbackOrConfig;
      } else {
        // otherwise, it's a function, so a callback. The second parameter might be a callback
        callback = callbackOrConfig;
        config = configMaybe;
      }
    }

    ensureInitialized(constants.FrameContexts.content, constants.FrameContexts.task);

    const wrappedFunction: InputFunction<string> = () => barcodeDevice.scanBarCode(config);

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<string>(wrappedFunction, callback);
  }

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }
}
