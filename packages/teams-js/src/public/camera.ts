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
  isVideoControllerRegistered,
  throwExceptionIfMediaCallIsNotSupportedOnMobile,
  validateGetMediaInputs,
  validateScanBarCodeInput,
  validateSelectMediaInputs,
  validateViewImagesInput,
} from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  generateGUID,
  InputFunction,
} from '../internal/utils';
import { FrameContexts, HostClientType } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

/**
 * @alpha
 */
export namespace mediaNEW {
  /**
   * Media object returned by the select Media API
   */
  export class Media extends media.File {
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
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      const wrappedFunction: InputFunction<Blob> = () =>
        new Promise<Blob>(resolve => {
          if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
            throw { errorCode: ErrorCode.OLD_PLATFORM };
          }
          if (!validateGetMediaInputs(this.mimeType, this.format, this.content)) {
            throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
          }
          // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
          if (isCurrentSDKVersionAtLeast(getMediaCallbackSupportVersion)) {
            resolve(this.getMediaViaCallback());
          } else {
            resolve(this.getMediaViaHandler());
          }
        });

      return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Blob>(wrappedFunction, callback);
    }

    private getMediaViaCallback(): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        const helper: MediaAttachmentHelper = {
          mediaMimeType: this.mimeType,
          assembleAttachment: [],
        };
        const localUriId = [this.content];
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

    private getMediaViaHandler(): Promise<Blob> {
      return new Promise<Blob>((resolve, reject) => {
        const actionName = generateGUID();
        const helper: MediaAttachmentHelper = {
          mediaMimeType: this.mimeType,
          assembleAttachment: [],
        };
        const params = [actionName, this.content];
        this.content && sendMessageToParent('getMedia', params);

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

  /**
   * Specifies the type of Media
   */
  export enum MediaType {
    Image = 1,
    Video = 2,
    VideoAndImage = 3,
    Audio = 4,
  }

  function selectMediaHelper(imageInputs: media.MediaInputs): Promise<Media[]> {
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    // Probably should clean this up, no reason to use this structure anymore
    const wrappedFunction: InputFunction<Media[]> = () =>
      new Promise<[SdkError, Media[]]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        throwExceptionIfMediaCallIsNotSupportedOnMobile(imageInputs);

        if (!validateSelectMediaInputs(imageInputs)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [imageInputs];
        // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
        resolve(sendMessageToParentAsync<[SdkError, Media[]]>('selectMedia', params));
      }).then(([err, localAttachments]: [SdkError, Media[]]) => {
        // Media Attachments are final response to selectMedia
        if (!localAttachments) {
          throw err;
        }
        const mediaArray: Media[] = [];
        for (const attachment of localAttachments) {
          mediaArray.push(new Media(attachment));
        }
        return mediaArray;
      });

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Media[]>(wrappedFunction);
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
     * @hidden
     * Hide from docs
     * --------
     * All properties common to Image and Video Props
     */
    interface MediaProps {
      /**
       * @hidden
       * Optional; Lets the developer specify the media source, more than one can be specified.
       * Default value is both camera and gallery
       */
      sources?: Source[];

      /**
       * @hidden
       * Optional; Specify in which mode the camera will be opened.
       * Default value is Photo
       */
      startMode?: CameraStartMode;

      /**
       * @hidden
       * Optional; indicate if user is allowed to move between front and back camera
       * Default value is true
       */
      cameraSwitcher?: boolean;
    }

    /**
     *  All properties in ImageProps are optional and have default values in the platform
     */
    export interface ImageProps extends MediaProps {
      /**
       * Optional; indicate if inking on the selected Image is allowed or not
       * Default value is true
       */
      ink?: boolean;

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

      /**
       * Optional; Lets the developer specify the image output formats, more than one can be specified.
       * Default value is Image.
       */
      imageOutputFormats?: ImageOutputFormats[];
    }

    /**
     * The modes in which camera can be launched in select Media API
     */
    export enum CameraStartMode {
      Photo = 1,
      Document = 2,
      Whiteboard = 3,
      BusinessCard = 4,
    }

    /**
     * Specifies the image source
     */
    export enum Source {
      Camera = 1,
      Gallery = 2,
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

    /**
     * Specifies the image output formats.
     */
    export enum ImageOutputFormats {
      IMAGE = 1,
      PDF = 2,
    }

    export function selectImages(imageInputs: ImageInputs): Promise<Media[]> {
      return selectMediaHelper(imageInputs);
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
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      const wrappedFunction: InputFunction<void> = () =>
        new Promise<void>(resolve => {
          if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
            throw { errorCode: ErrorCode.OLD_PLATFORM };
          }
          if (!validateViewImagesInput(uriList)) {
            throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
          }

          resolve(sendAndHandleSdkError('viewImages', uriList));
        });

      return callCallbackWithSdkErrorFromPromiseAndReturnPromise<void>(wrappedFunction, callback);
    }

    export function isSupported(): boolean {
      return runtime.supports.media.camera ? true : false;
    }

    export namespace video {
      /**
       * Input parameter supplied to the select Media API
       */
      export interface VideoInputs {
        /**
         * Only one media type can be selected at a time
         */
        mediaType: MediaType.Video;

        /**
         * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
         */
        maxMediaCount: number;

        /**
         * Additional properties for customization of select media - Video in mobile devices
         */
        videoProps?: VideoProps;
      }

      export interface VideoAndImageInputs {
        /**
         * Only one media type can be selected at a time
         */
        mediaType: MediaType.VideoAndImage;

        /**
         * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
         */
        maxMediaCount: number;

        /**
         * Additional properties for customization of select media - VideoAndImage in mobile devices
         */
        videoAndImageProps?: ImageProps & VideoProps;
      }

      /**
       * All properties in VideoProps are optional and have default values in the platform
       */
      export interface VideoProps extends MediaProps {
        /**
         * Optional; the maximum duration in seconds after which the recording should terminate automatically.
         * Default value is defined by the platform serving the API.
         */
        maxDuration?: number;

        /**
         * Optional; to determine if the video capturing flow needs to be launched
         * in Full Screen Mode (Lens implementation) or PictureInPicture Mode (Native implementation).
         * Default value is true, indicating video will always launch in Full Screen Mode via lens.
         */
        isFullScreenMode?: boolean;

        /**
         * Optional; controls the visibility of stop button in PictureInPicture Mode.
         * Default value is true, indicating the user will be able to stop the video.
         */
        isStopButtonVisible?: boolean;

        /**
         * Optional; setting VideoController will register your app to listen to the lifecycle events during the video capture flow.
         * Your app can also dynamically control the experience while capturing the video by notifying the host client.
         */
        videoController?: VideoController;
      }

      /**
       * Callback which will register your app to listen to lifecycle events during the video capture flow
       */
      export interface VideoControllerCallback {
        onRecordingStarted(): void;
        onRecordingStopped?(): void;
      }

      /**
       * VideoController class is used to communicate between the app and the host client during the video capture flow
       */
      export class VideoController extends media.MediaController<VideoControllerCallback> {
        protected getMediaType(): MediaType {
          return MediaType.Video;
        }

        public notifyEventToApp(mediaEvent: media.MediaControllerEvent): void {
          switch (mediaEvent) {
            case media.MediaControllerEvent.StartRecording:
              this.controllerCallback.onRecordingStarted();
              break;
            // TODO - Should discuss whether this function should be required
            case media.MediaControllerEvent.StopRecording:
              this.controllerCallback.onRecordingStopped && this.controllerCallback.onRecordingStopped();
              break;
          }
        }
      }

      // This is very similar to selectImage and selectAudio, other than the MediaControllerEvent parts
      // I can't decide if it's worth it to merge this into a single shared function that is more confusing
      // to read or keep this out as a "related but different" function
      export function selectMediaContainingVideo(mediaInputs: VideoInputs | VideoAndImageInputs): Promise<Media[]> {
        ensureInitialized(FrameContexts.content, FrameContexts.task);

        const wrappedFunction: InputFunction<Media[]> = () =>
          new Promise<[SdkError, Media[], media.MediaControllerEvent]>(resolve => {
            if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
              throw { errorCode: ErrorCode.OLD_PLATFORM };
            }
            throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs);

            if (!validateSelectMediaInputs(mediaInputs)) {
              throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
            }

            const params = [mediaInputs];
            // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
            resolve(sendMessageToParentAsync<[SdkError, Media[], media.MediaControllerEvent]>('selectMedia', params));
          }).then(([err, localAttachments, mediaEvent]: [SdkError, Media[], media.MediaControllerEvent]) => {
            // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
            if (mediaEvent) {
              if (isVideoControllerRegistered(mediaInputs)) {
                const videoController: VideoController = (mediaInputs as VideoInputs)
                  ? (mediaInputs as VideoInputs).videoProps?.videoController
                  : (mediaInputs as VideoAndImageInputs).videoAndImageProps?.videoController;
                videoController.notifyEventToApp(mediaEvent);
              }
              return [];
            }

            // Media Attachments are final response to selectMedia
            if (!localAttachments) {
              throw err;
            }
            const mediaArray: Media[] = [];
            for (const attachment of localAttachments) {
              mediaArray.push(new Media(attachment));
            }
            return mediaArray;
          });

        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Media[]>(wrappedFunction);
      }

      export function isSupported(): boolean {
        return runtime.supports.media.camera.video ? true : false;
      }
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

        ensureInitialized(FrameContexts.content, FrameContexts.task);

        const wrappedFunction: InputFunction<string> = () =>
          new Promise<string>(resolve => {
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

        return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<string>(wrappedFunction, callback);
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

  export namespace audio {
    /**
     * Input parameter supplied to the select Media API
     */
    export interface AudioInputs {
      /**
       * Only one media type can be selected at a time
       */
      mediaType: MediaType.Audio;

      /**
       * max limit of media allowed to be selected in one go, current max limit is 10 set by office lens.
       */
      maxMediaCount: number;

      /**
       * Additional properties for audio capture flows.
       */
      audioProps?: AudioProps;
    }

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

    export function selectAudio(audioInput: AudioInputs): Promise<Media[]> {
      return selectMediaHelper(audioInput);
    }

    export function isSupported(): boolean {
      return runtime.supports.media.audio ? true : false;
    }
  }
}

/**
 * TODO: RESTORE TO OLD CALLBACK FUNCTION SINCE THIS IS BACKCOMPAT ONLY?
 * WHERE SHOULD THIS LIVE?
 * Select an attachment using camera/gallery
 *
 * @deprecated
 * As of 2.0.0-beta.1, please use {@link media.selectMedia media.selectMedia(mediaInputs: MediaInputs): Promise\<Media[]\>} instead.
 *
 * @param mediaInputs - The input params to customize the media to be selected
 * @param callback - The callback to invoke after fetching the media
 */
export function selectMedia(
  mediaInputs: media.MediaInputs,
  callback: (error: SdkError, attachments: mediaNEW.Media[]) => void,
);
export function selectMedia(
  mediaInputs: media.MediaInputs,
  callback?: (error?: SdkError, attachments?: mediaNEW.Media[]) => void,
): Promise<mediaNEW.Media[]> {
  const wrappedFunction: InputFunction<mediaNEW.Media[]> = () => {
    ensureInitialized(FrameContexts.content, FrameContexts.task);
    if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
      throw { errorCode: ErrorCode.OLD_PLATFORM };
    }
    throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs);

    // Probably need to be more careful than this, but in general call the new mediaFunctions as part of back compatibility
    if (mediaInputs.imageProps) {
      return mediaNEW.camera.selectImages(mediaInputs as mediaNEW.camera.ImageInputs);
    } else if (mediaInputs.audioProps) {
      return mediaNEW.audio.selectAudio(mediaInputs as mediaNEW.audio.AudioInputs);
    } else {
      return mediaNEW.camera.video.selectMediaContainingVideo(
        (mediaInputs as mediaNEW.camera.video.VideoInputs)
          ? (mediaInputs as mediaNEW.camera.video.VideoInputs)
          : (mediaInputs as mediaNEW.camera.video.VideoAndImageInputs),
      );
    }
  };

  return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<mediaNEW.Media[]>(wrappedFunction, callback);
}
