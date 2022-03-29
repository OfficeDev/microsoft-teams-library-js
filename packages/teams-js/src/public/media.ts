/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendAndHandleSdkError } from '../internal/communication';
import { captureImageMobileSupportVersion } from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { ensureInitialized, isCurrentSDKVersionAtLeast } from '../internal/internalAPIs';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  InputFunction,
} from '../internal/utils';
import { audio } from './audioDevice';
import { audioVisualDevice } from './audioVisualDevice';
import * as constants from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

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
  export function captureImage(callback: (error?: SdkError, files?: File[]) => void): void;
  export function captureImage(callback?: (error?: SdkError, files?: File[]) => void): Promise<File[]> {
    ensureInitialized(constants.FrameContexts.content, constants.FrameContexts.task);

    const wrappedFunction: InputFunction<File[]> = () =>
      new Promise<File[]>(resolve => {
        if (!GlobalVars.isFramelessWindow) {
          throw { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
        }

        if (!isCurrentSDKVersionAtLeast(captureImageMobileSupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
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
    public getMedia(callback: (error: SdkError, blob: Blob) => void): void;
    public getMedia(callback?: (error: SdkError, blob: Blob) => void): Promise<Blob> {
      return audioVisualDevice.getMediaAsBlob(this, callback);
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
  export import ImageProps = audioVisualDevice.camera.ImageProps;

  /**
   * All properties in VideoProps are optional and have default values in the platform
   */
  export import VideoProps = audioVisualDevice.camera.video.VideoProps;

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
  export import VideoControllerCallback = audioVisualDevice.camera.video.VideoControllerCallback;

  /**
   * VideoController class is used to communicate between the app and the host client during the video capture flow
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import VideoController = audioVisualDevice.camera.video.VideoController;

  /**
   * @hidden
   * Hide from docs
   * --------
   * Events which are used to communicate between the app and the host client during the media recording flow
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaControllerEvent = audioVisualDevice.MediaControllerEvent;

  /**
   * The modes in which camera can be launched in select Media API
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import CameraStartMode = audioVisualDevice.camera.CameraStartMode;

  /**
   * Specifies the image source
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import Source = audioVisualDevice.camera.Source;

  // /**
  //  * Specifies the type of Media
  //  */
  export import MediaType = constants.MediaType;

  /**
   * Input for view images API
   */
  export import ImageUri = audioVisualDevice.camera.ImageUri;

  /**
   * ID contains a mapping for content uri on platform's side, URL is generic
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ImageUriType = audioVisualDevice.camera.ImageUriType;

  /**
   * Specifies the image output formats.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import ImageOutputFormats = audioVisualDevice.camera.ImageOutputFormats;

  /**
   * Media chunks an output of getMedia API from platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaChunk = audioVisualDevice.MediaChunk;

  /**
   * Output of getMedia API from platform
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import MediaResult = audioVisualDevice.MediaResult;

  /**
   * Helper object to assembled media chunks
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export import AssembleAttachment = audioVisualDevice.AssembleAttachment;

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
  export function selectMedia(mediaInputs: MediaInputs, callback: (error: SdkError, attachments: Media[]) => void);
  export function selectMedia(
    mediaInputs: MediaInputs,
    callback?: (error?: SdkError, attachments?: Media[]) => void,
  ): Promise<Media[]> {
    // Probably we should be more careful about casting this?
    const wrappedFunction: InputFunction<Media[]> = () =>
      new Promise<Media[]>(resolve => {
        if (mediaInputs.audioProps) {
          resolve(audio.selectAudio(mediaInputs as audio.AudioInputs));
        } else if (mediaInputs.videoAndImageProps) {
          resolve(
            audioVisualDevice.camera.video.selectMediaContainingVideo(
              mediaInputs as audioVisualDevice.camera.video.VideoAndImageInputs,
            ),
          );
        } else if (mediaInputs.videoProps) {
          resolve(
            audioVisualDevice.camera.video.selectMediaContainingVideo(
              mediaInputs as audioVisualDevice.camera.video.VideoInputs,
            ),
          );
        } else {
          resolve(audioVisualDevice.camera.selectImages(mediaInputs as audioVisualDevice.camera.ImageInputs));
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
  export function viewImages(uriList: ImageUri[], callback: (error?: SdkError) => void);
  export function viewImages(uriList: ImageUri[], callback?: (error?: SdkError) => void): Promise<void> {
    ensureInitialized(constants.FrameContexts.content, constants.FrameContexts.task);

    const wrappedFunction: InputFunction<void> = () => audioVisualDevice.camera.viewImages(uriList);

    return callCallbackWithSdkErrorFromPromiseAndReturnPromise<void>(wrappedFunction, callback);
  }

  /**
   * Barcode configuration supplied to scanBarCode API to customize barcode scanning experience in mobile
   * All properties in BarCodeConfig are optional and have default values in the platform
   */
  export import BarCodeConfig = audioVisualDevice.camera.barcode.BarCodeConfig;

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
  export function scanBarCode(callback: (error: SdkError, decodedText: string) => void, config?: BarCodeConfig);
  export function scanBarCode(
    callbackOrConfig?: ((error: SdkError, decodedText: string) => void) | BarCodeConfig,
    configMaybe?: BarCodeConfig,
  ): Promise<string> {
    let callback: (error: SdkError, decodedText: string) => void | undefined;
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

    const wrappedFunction: InputFunction<string> = () => audioVisualDevice.camera.barcode.scanBarCode(config);

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<string>(wrappedFunction, callback);
  }

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }
}
