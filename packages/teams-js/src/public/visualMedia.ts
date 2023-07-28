import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission } from './interfaces';
import { runtime } from './runtime';

/**
 * Interact with image and video. It lets the app developer ask the user to get images or video from their camera / camera roll / file system.
 * @beta
 */
export namespace visualMedia {
  /**
   * @hidden
   * Hide from docs
   * --------
   * All properties common to Image and Video Props
   * @beta
   */
  interface VisualMediaProps {
    /**
     * @hidden
     * Lets the developer specify the media source
     */
    source: Source;

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
    /**
     * max limit of media allowed to be selected in one go, current max limit is 10 set by lens-sdk.
     */
    visualMediaCount: number;
  }
  /**
   *  All properties in ImageProps are optional and have default values in the platform
   *  Additional properties for image in mobile devices
   * @beta
   */
  export interface ImageProperties extends VisualMediaProps {
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
   * The modes in which camera can be launched
   * @beta
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
   * Enum for file formats supported
   * @beta
   */
  export enum FileFormat {
    /** Base64 encoding */
    Base64 = 'base64',
    /** File id */
    ID = 'id',
  }
  /**
   * Specifies the image source
   * @beta
   */
  export enum Source {
    /** visual media source is camera. */
    Camera = 1,
    /** visual media source is gallery. */
    Gallery = 2,
  }
  /**
   * Specifies the image output formats.
   * @beta
   */
  export enum ImageOutputFormats {
    /** Outputs image.  */
    IMAGE = 1,
    /** Outputs pdf. */
    PDF = 2,
  }

  /**
   * VisualMediaFile object that can be used to represent image or video
   *
   * @beta
   */
  export class VisualMediaFile {
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
    /**
     * A preview of the file which is a lightweight representation.
     * In case of images this will be a thumbnail/compressed image in base64 encoding.
     */
    public preview: string;
  }

  /**
   * Checks whether or not visualMedia has user permission
   *
   * @beta
   * @returns Promise that will resolve with true if the user had granted the app permission to media information, or with false otherwise,
   * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
   */
  export function hasPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>((resolve) => {
      resolve(sendAndHandleSdkError('permissions.has', permissions));
    });
  }

  /**
   * Requests user permission for visualMedia
   * @beta
   * @returns Promise that will resolve with true if the user consented permission for media, or with false otherwise,
   * In case of an error, promise will reject with the error. Function can also throw a NOT_SUPPORTED_ON_PLATFORM error
   */
  export function requestPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;

    return new Promise<boolean>((resolve) => {
      resolve(sendAndHandleSdkError('permissions.request', permissions));
    });
  }

  /**
   * Checks if visualMedia capability is supported by the host
   * @returns boolean to represent whether media is supported
   * @beta
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.visualMedia && runtime.supports.permissions ? true : false;
  }

  /**
   * To enable this image capability will let the app developer ask the user to get images from camera/local storage
   * @beta
   */
  export namespace image {
    /**
     * Capture one or multiple image(s) throughing camera.
     * @beta
     * @param imageInputs - The input params to customize the image(s) to be captured
     * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
     */
    export function captureImages(imageInputs: ImageProperties): Promise<VisualMediaFile[]> {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (!imageInputs || imageInputs == null || imageInputs.visualMediaCount > 10) {
        throw new Error('Must supply the valid image(s)');
      }
      // waiting and return the response from hub-SDK
      return sendAndHandleSdkError<VisualMediaFile[]>('visualMedia.image.captureImages', imageInputs);
    }

    /**
     * Upload the existing image(s) from camera roll to the mos app.
     * @beta
     * @param imageInputs - The input params to customize the image(s) to be captured
     * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
     */
    export function uploadImages(imageInputs: ImageProperties): Promise<VisualMediaFile[]> {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
      if (
        !imageInputs ||
        imageInputs == null ||
        imageInputs.visualMediaCount > 10 ||
        imageInputs.source != Source.Gallery
      ) {
        throw new Error('Must supply the valid image(s)');
      }
      // waiting and return the response from hub-SDK
      return sendAndHandleSdkError<VisualMediaFile[]>('visualMedia.image.uploadImages', imageInputs);
    }
    /**
     * Checks if visualMedia.image capability is supported by the host
     * @returns boolean to represent whether visualMedia.image is supported
     *
     * @throws Error if {@linkcode app.initialize} has not successfully completed
     *
     * @beta
     */
    export function isSupported(): boolean {
      return ensureInitialized(runtime) &&
        runtime.supports.visualMedia &&
        runtime.supports.visualMedia.image &&
        runtime.supports.permissions
        ? true
        : false;
    }
  }

  /**
   * TODO: more function will be complete in the video capture capability feature
   * @beta
   */
  export namespace video {}
}
