/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendMessageToParent } from '../internal/communication';
import {
  captureImageMobileSupportVersion,
  getMediaCallbackSupportVersion,
  mediaAPISupportVersion,
  nonFullScreenVideoModeAPISupportVersion,
  scanBarCodeAPIMobileSupportVersion,
} from '../internal/constants';
import { GlobalVars } from '../internal/globalVars';
import { registerHandler, removeHandler } from '../internal/handlers';
import {
  ensureInitialized,
  isCurrentSDKVersionAtLeast,
  throwExceptionIfMobileApiIsNotSupported,
} from '../internal/internalAPIs';
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
import { generateGUID } from '../internal/utils';
import { FrameContexts, HostClientType } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

/**
 * Interact with media, including capturing and viewing images.
 */
export namespace media {
  /** Capture image callback function type. */
  type captureImageCallbackFunctionType = (error: SdkError, files: File[]) => void;
  /** Select media callback function type. */
  type selectMediaCallbackFunctionType = (error: SdkError, attachments: Media[]) => void;
  /** Error callback function type. */
  type errorCallbackFunctionType = (error?: SdkError) => void;
  /** Scan BarCode callback function type. */
  type scanBarCodeCallbackFunctionType = (error: SdkError, decodedText: string) => void;
  /** Get media callback function type. */
  type getMediaCallbackFunctionType = (error: SdkError, blob: Blob) => void;

  /**
   * Enum for file formats supported
   */
  export enum FileFormat {
    /** Base64 encoding */
    Base64 = 'base64',
    /** File id */
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
   * Launch camera, capture image or choose image from gallery and return the images as a File[] object to the callback.
   *
   * @params callback - Callback will be called with an @see SdkError if there are any.
   * If error is null or undefined, the callback will be called with a collection of @see File objects
   * @remarks
   * Note: Currently we support getting one File through this API, i.e. the file arrays size will be one.
   * Note: For desktop, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   */
  export function captureImage(callback: captureImageCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[captureImage] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

    if (!GlobalVars.isFramelessWindow) {
      const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(notSupportedError, undefined);
      return;
    }

    if (!isCurrentSDKVersionAtLeast(captureImageMobileSupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(oldPlatformError, undefined);
      return;
    }

    sendMessageToParent('captureImage', callback);
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
     * @param callback - callback is called with the @see SdkError if there is an error
     * If error is null or undefined, the callback will be called with @see Blob.
     */
    public getMedia(callback: getMediaCallbackFunctionType): void {
      if (!callback) {
        throw new Error('[get Media] Callback cannot be null');
      }
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
        const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
        /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
        callback(oldPlatformError, null);
        return;
      }
      if (!validateGetMediaInputs(this.mimeType, this.format, this.content)) {
        const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
        /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
        callback(invalidInput, null);
        return;
      }
      // Call the new get media implementation via callbacks if the client version is greater than or equal to '2.0.0'
      if (isCurrentSDKVersionAtLeast(getMediaCallbackSupportVersion)) {
        this.getMediaViaCallback(callback);
      } else {
        this.getMediaViaHandler(callback);
      }
    }

    /** Function to retrieve media content, such as images or videos, via callback. */
    private getMediaViaCallback(callback: getMediaCallbackFunctionType): void {
      const helper: MediaHelper = {
        mediaMimeType: this.mimeType,
        assembleAttachment: [],
      };
      const localUriId = [this.content];
      function handleGetMediaCallbackRequest(mediaResult: MediaResult): void {
        if (callback) {
          if (mediaResult && mediaResult.error) {
            /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
            callback(mediaResult.error, null);
          } else {
            if (mediaResult && mediaResult.mediaChunk) {
              // If the chunksequence number is less than equal to 0 implies EOF
              // create file/blob when all chunks have arrived and we get 0/-1 as chunksequence number
              if (mediaResult.mediaChunk.chunkSequence <= 0) {
                const file = createFile(helper.assembleAttachment, helper.mediaMimeType);
                callback(mediaResult.error, file);
              } else {
                // Keep pushing chunks into assemble attachment
                const assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
                helper.assembleAttachment.push(assemble);
              }
            } else {
              /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
              callback({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' }, null);
            }
          }
        }
      }
      sendMessageToParent('getMedia', localUriId, handleGetMediaCallbackRequest);
    }

    /** Function to retrieve media content, such as images or videos, via handler. */
    private getMediaViaHandler(callback: getMediaCallbackFunctionType): void {
      const actionName = generateGUID();
      const helper: MediaHelper = {
        mediaMimeType: this.mimeType,
        assembleAttachment: [],
      };
      const params = [actionName, this.content];
      this.content && callback && sendMessageToParent('getMedia', params);
      function handleGetMediaRequest(response: string): void {
        if (callback) {
          /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
          const mediaResult: MediaResult = JSON.parse(response);
          if (mediaResult.error) {
            /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
            callback(mediaResult.error, null);
            removeHandler('getMedia' + actionName);
          } else {
            if (mediaResult.mediaChunk) {
              // If the chunksequence number is less than equal to 0 implies EOF
              // create file/blob when all chunks have arrived and we get 0/-1 as chunksequence number
              if (mediaResult.mediaChunk.chunkSequence <= 0) {
                const file = createFile(helper.assembleAttachment, helper.mediaMimeType);
                callback(mediaResult.error, file);
                removeHandler('getMedia' + actionName);
              } else {
                // Keep pushing chunks into assemble attachment
                const assemble: AssembleAttachment = decodeAttachment(mediaResult.mediaChunk, helper.mediaMimeType);
                helper.assembleAttachment.push(assemble);
              }
            } else {
              /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
              callback({ errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' }, null);
              removeHandler('getMedia' + actionName);
            }
          }
        }
      }

      registerHandler('getMedia' + actionName, handleGetMediaRequest);
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
   * @hidden
   * Hide from docs
   * --------
   * Base class which holds the callback and notifies events to the host client
   */
  abstract class MediaController<T> {
    /** Callback that can be registered to handle events related to the playback and control of video content. */
    protected controllerCallback: T;

    public constructor(controllerCallback?: T) {
      this.controllerCallback = controllerCallback;
    }

    protected abstract getMediaType(): MediaType;

    /**
     * @hidden
     * Hide from docs
     * --------
     * This function will be implemented by the respective media class which holds the logic
     * of specific events that needs to be notified to the app.
     * @param mediaEvent indicates the event signed by the host client to the app
     */
    protected abstract notifyEventToApp(mediaEvent: MediaControllerEvent): void;

    /**
     * @hidden
     * Hide from docs
     * --------
     * Function to notify the host client to programatically control the experience
     * @param mediaEvent indicates what the event that needs to be signaled to the host client
     * Optional; @param callback is used to send app if host client has successfully handled the notification event or not
     */
    protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: errorCallbackFunctionType): void {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

      try {
        throwExceptionIfMobileApiIsNotSupported(nonFullScreenVideoModeAPISupportVersion);
      } catch (err) {
        if (callback) {
          callback(err);
        }
        return;
      }

      const params: MediaControllerParam = { mediaType: this.getMediaType(), mediaControllerEvent: mediaEvent };
      sendMessageToParent('media.controller', [params], (err?: SdkError) => {
        if (callback) {
          callback(err);
        }
      });
    }

    /**
     * Function to programatically stop the ongoing media event
     * Optional; @param callback is used to send app if host client has successfully stopped the event or not
     */
    public stop(callback?: errorCallbackFunctionType): void {
      this.notifyEventToHost(MediaControllerEvent.StopRecording, callback);
    }
  }

  /**
   * Callback which will register your app to listen to lifecycle events during the video capture flow
   */
  export interface VideoControllerCallback {
    /** The event is a type of callback that can be enlisted to handle various events linked to `onRecordingStarted`, which helps with playback of video content. */
    onRecordingStarted?(): void;
  }

  /**
   * VideoController class is used to communicate between the app and the host client during the video capture flow
   */
  export class VideoController extends MediaController<VideoControllerCallback> {
    /** Gets media type video. */
    protected getMediaType(): MediaType {
      return MediaType.Video;
    }
    /** Notify or send an event related to the playback and control of video content to a registered application. */
    public notifyEventToApp(mediaEvent: MediaControllerEvent): void {
      if (!this.controllerCallback) {
        // Early return as app has not registered with the callback
        return;
      }

      switch (mediaEvent) {
        case MediaControllerEvent.StartRecording:
          if (this.controllerCallback.onRecordingStarted) {
            this.controllerCallback.onRecordingStarted();
            break;
          }
      }
    }
  }

  /**
   * @beta
   * Events which are used to communicate between the app and the host client during the media recording flow
   */
  export enum MediaControllerEvent {
    /** Start recording. */
    StartRecording = 1,
    /** Stop recording. */
    StopRecording = 2,
  }

  /**
   * @hidden
   * Hide from docs
   * --------
   * Interface with relevant info to send communication from the app to the host client
   */
  interface MediaControllerParam {
    /**
     * List of team information
     */
    mediaType: media.MediaType;

    /**
     * List of team information
     */
    mediaControllerEvent: MediaControllerEvent;
  }

  /**
   * The modes in which camera can be launched in select Media API
   */
  export enum CameraStartMode {
    /** Photo mode. */
    Photo = 1,
    /** Document mode. */
    Document = 2,
    /** Whiteboard mode. */
    Whiteboard = 3,
    /** Business card mode. */
    BusinessCard = 4,
  }

  /**
   * Specifies the image source
   */
  export enum Source {
    /** Image source is camera. */
    Camera = 1,
    /** Image source is gallery. */
    Gallery = 2,
  }

  /**
   * Specifies the type of Media
   */
  export enum MediaType {
    /** Media type photo or image */
    Image = 1,
    /** Media type video. */
    Video = 2,
    /** Media type video and image. */
    VideoAndImage = 3,
    /** Media type audio. */
    Audio = 4,
  }

  /**
   * Input for view images API
   */
  export interface ImageUri {
    /** Image location */
    value: string;
    /** Image Uri type */
    type: ImageUriType;
  }

  /**
   * ID contains a mapping for content uri on platform's side, URL is generic
   */
  export enum ImageUriType {
    /** Image Id. */
    ID = 1,
    /** Image URL. */
    URL = 2,
  }

  /**
   * Specifies the image output formats.
   */
  export enum ImageOutputFormats {
    /** Outputs image.  */
    IMAGE = 1,
    /** Outputs pdf. */
    PDF = 2,
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
   * Helper object to assembled media chunks
   */
  export interface AssembleAttachment {
    /** A number representing the sequence of the attachment in the media chunks. */
    sequence: number;
    /** A Blob object representing the data of the media chunks. */
    file: Blob;
  }

  /**
   * Helper class for assembling media
   */
  interface MediaHelper {
    /** A string representing the MIME type of the media file */
    mediaMimeType: string;
    /** An array of {@link media.AssembleAttachment | AssembleAttachment} objects representing the media files to be sent as attachment */
    assembleAttachment: AssembleAttachment[];
  }

  /**
   * Select an attachment using camera/gallery
   *
   * @param mediaInputs - The input params to customize the media to be selected
   * @param callback - The callback to invoke after fetching the media
   */
  export function selectMedia(mediaInputs: MediaInputs, callback: selectMediaCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[select Media] Callback cannot be null');
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(oldPlatformError, null);
      return;
    }

    try {
      throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs);
    } catch (err) {
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(err, null);
      return;
    }

    if (!validateSelectMediaInputs(mediaInputs)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(invalidInput, null);
      return;
    }

    const params = [mediaInputs];
    // What comes back from native as attachments would just be objects and will be missing getMedia method on them
    sendMessageToParent(
      'selectMedia',
      params,
      (err: SdkError, localAttachments?: Media[], mediaEvent?: MediaControllerEvent) => {
        // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
        if (mediaEvent) {
          if (isVideoControllerRegistered(mediaInputs)) {
            /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
            mediaInputs.videoProps.videoController.notifyEventToApp(mediaEvent);
          }
          return;
        }

        // Media Attachments are final response to selectMedia
        if (!localAttachments) {
          /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
          callback(err, null);
          return;
        }

        const mediaArray: Media[] = [];
        for (const attachment of localAttachments) {
          mediaArray.push(new Media(attachment));
        }
        callback(err, mediaArray);
      },
    );
  }

  /**
   * View images using native image viewer
   *
   * @param uriList - list of URIs for images to be viewed - can be content URI or server URL. Supports up to 10 Images in a single call
   * @param callback - returns back error if encountered, returns null in case of success
   */
  export function viewImages(uriList: ImageUri[], callback: errorCallbackFunctionType): void {
    if (!callback) {
      throw new Error('[view images] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

    if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError);
      return;
    }
    if (!validateViewImagesInput(uriList)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput);
      return;
    }

    const params = [uriList];
    sendMessageToParent('viewImages', params, callback);
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

  /**
   * @deprecated
   * As of 2.1.0, please use {@link barCode.scanBarCode barCode.scanBarCode(config?: BarCodeConfig): Promise\<string\>} instead.

   * Scan Barcode/QRcode using camera
   *
   * @remarks
   * Note: For desktop and web, this API is not supported. Callback will be resolved with ErrorCode.NotSupported.
   *
   * @param callback - callback to invoke after scanning the barcode
   * @param config - optional input configuration to customize the barcode scanning experience
   */
  export function scanBarCode(callback: scanBarCodeCallbackFunctionType, config?: BarCodeConfig): void {
    if (!callback) {
      throw new Error('[media.scanBarCode] Callback cannot be null');
    }
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

    if (
      GlobalVars.hostClientType === HostClientType.desktop ||
      GlobalVars.hostClientType === HostClientType.web ||
      GlobalVars.hostClientType === HostClientType.rigel ||
      GlobalVars.hostClientType === HostClientType.teamsRoomsWindows ||
      GlobalVars.hostClientType === HostClientType.teamsRoomsAndroid ||
      GlobalVars.hostClientType === HostClientType.teamsPhones ||
      GlobalVars.hostClientType === HostClientType.teamsDisplays
    ) {
      const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(notSupportedError, null);
      return;
    }

    if (!isCurrentSDKVersionAtLeast(scanBarCodeAPIMobileSupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(oldPlatformError, null);
      return;
    }

    /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
    if (!validateScanBarCodeInput(config)) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      /* eslint-disable-next-line strict-null-checks/all */ /* Fix tracked by 5730662 */
      callback(invalidInput, null);
      return;
    }

    sendMessageToParent('media.scanBarCode', [config], callback);
  }
}
