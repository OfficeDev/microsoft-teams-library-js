/* eslint-disable @typescript-eslint/explicit-member-accessibility */

import { sendAndHandleSdkError, sendMessageToParent, sendMessageToParentAsync } from '../internal/communication';
import {
  captureImageMobileSupportVersion,
  getMediaCallbackSupportVersion,
  mediaAPISupportVersion,
  nonFullScreenVideoModeAPISupportVersion,
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
  validateSelectMediaInputs,
} from '../internal/mediaUtil';
import {
  callCallbackWithErrorOrResultFromPromiseAndReturnPromise,
  callCallbackWithSdkErrorFromPromiseAndReturnPromise,
  generateGUID,
  InputFunction,
} from '../internal/utils';
import { FrameContexts } from './constants';
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

  // captureImage is just selectMedia but the host sdk stores a default set of MediaInputs. Think we should deprecate captureImage
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
    ensureInitialized(FrameContexts.content, FrameContexts.task);

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
   * Base class which holds the callback and notifies events to the host client
   */
  export abstract class MediaController<T> {
    protected controllerCallback: T;

    public constructor(controllerCallback: T) {
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
     *
     * Function to notify the host client to programatically control the experience
     * @param mediaEvent indicates what the event that needs to be signaled to the host client
     * @returns A promise resolved promise
     */
    protected notifyEventToHost(mediaEvent: MediaControllerEvent): Promise<void>;
    /**
     * @hidden
     * Hide from docs
     * --------
     *
     * @deprecated
     * As of 2.0.0-beta.3, please use {@link media.MediaController.notifyEventToHost media.MediaController.notifyEventToHost(mediaEvent: MediaControllerEvent): Promise\<void\>} instead.
     *
     * Function to notify the host client to programatically control the experience
     * @param mediaEvent indicates what the event that needs to be signaled to the host client
     * Optional; @param callback is used to send app if host client has successfully handled the notification event or not
     */
    protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: (err?: SdkError) => void): void;
    protected notifyEventToHost(mediaEvent: MediaControllerEvent, callback?: (err?: SdkError) => void): Promise<void> {
      ensureInitialized(FrameContexts.content, FrameContexts.task);

      try {
        throwExceptionIfMobileApiIsNotSupported(nonFullScreenVideoModeAPISupportVersion);
      } catch (err) {
        const wrappedRejectedErrorFn: InputFunction<void> = () => Promise.reject(err);

        return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedRejectedErrorFn, callback);
      }

      const params: MediaControllerParam = {
        mediaType: this.getMediaType(),
        mediaControllerEvent: mediaEvent,
      };

      const wrappedFunction = (): Promise<void> =>
        new Promise(resolve => resolve(sendAndHandleSdkError('media.controller', [params])));

      return callCallbackWithSdkErrorFromPromiseAndReturnPromise(wrappedFunction, callback);
    }

    /**
     * Function to programatically stop the ongoing media event
     *
     * @returns A resolved promise
     * */
    public stop(): Promise<void>;
    /**
     *
     * Function to programatically stop the ongoing media event
     *
     * @deprecated
     * As of 2.0.0-beta.3, please use {@link media.MediaController.stop media.MediaController.stop(): Promise\<void\>} instead.
     *
     * Optional; @param callback is used to send app if host client has successfully stopped the event or not
     */
    public stop(callback?: (err?: SdkError) => void): void;
    public stop(callback?: (err?: SdkError) => void): Promise<void> {
      return Promise.resolve(this.notifyEventToHost(MediaControllerEvent.StopRecording, callback));
    }
  }

  /**
   * @hidden
   * Hide from docs
   * --------
   * Events which are used to communicate between the app and the host client during the media recording flow
   */
  export enum MediaControllerEvent {
    StartRecording = 1,
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
   * Specifies the type of Media
   */
  export enum MediaType {
    Image = 1,
    Video = 2,
    VideoAndImage = 3,
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
    sequence: number;
    file: Blob;
  }
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
    ensureInitialized(FrameContexts.content, FrameContexts.task);

    const wrappedFunction: InputFunction<Media[]> = () =>
      new Promise<[SdkError, Media[], MediaControllerEvent]>(resolve => {
        if (!isCurrentSDKVersionAtLeast(mediaAPISupportVersion)) {
          throw { errorCode: ErrorCode.OLD_PLATFORM };
        }
        throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs);

        if (!validateSelectMediaInputs(mediaInputs)) {
          throw { errorCode: ErrorCode.INVALID_ARGUMENTS };
        }

        const params = [mediaInputs];
        // What comes back from native at attachments would just be objects and will be missing getMedia method on them.
        resolve(sendMessageToParentAsync<[SdkError, Media[], MediaControllerEvent]>('selectMedia', params));
      }).then(([err, localAttachments, mediaEvent]: [SdkError, Media[], MediaControllerEvent]) => {
        // MediaControllerEvent response is used to notify the app about events and is a partial response to selectMedia
        if (mediaEvent) {
          if (isVideoControllerRegistered(mediaInputs)) {
            mediaInputs.videoProps.videoController.notifyEventToApp(mediaEvent);
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

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise<Media[]>(wrappedFunction, callback);
  }

  export function isSupported(): boolean {
    return runtime.supports.media ? true : false;
  }
}
