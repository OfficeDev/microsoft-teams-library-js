import { sendAndHandleSdkErrorWithVersion } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../internal/telemetry';
import { errorInvalidCount, errorInvalidResponse, errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission } from './interfaces';
import { runtime } from './runtime';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const visualMediaTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * Interact with images. Allows the app developer ask the user to get images from their camera / camera roll / file system.
 *
 * @beta
 */
export namespace visualMedia {
  const maxVisualMediaSelectionLimit = 10;
  /**
   * @hidden
   * All properties common to Image and Video Props
   *
   * @beta
   */
  interface VisualMediaProps {
    /**
     * @hidden
     * The maximum number of media items that can be selected at once is limited to values that are less than or equal to the maximum visual media selection limit.
     */
    maxVisualMediaCount: number;
  }

  /**
   * @hidden
   * The required value of the visualMedia files from gallery
   *
   * @beta
   */
  export interface GalleryProps {
    /**
     * The visualMedia source
     */
    source: Source.Gallery;
  }
  /**
   * @hidden
   * The required value of the visualMedia files from camera
   *
   * @beta
   */
  export interface CameraProps {
    /**
     * @hidden
     * The visualMedia source
     */
    source: Source.Camera;
    /**
     * @hidden
     * Optional; Specify whether users have the option to switch between the front and rear cameras. The default setting is FrontOrRear.
     * Default value is FrontOrRear
     */
    cameraRestriction?: CameraRestriction;
  }

  /**
   * @hidden
   * Indicate if user is allowed to move between front and back camera or stay in front/back camera only
   * If the camera option requested by the app isn't available, the SDK will silently default to the platform's standard camera.
   *
   * @beta
   */
  export enum CameraRestriction {
    /** User can move between front and back camera */
    FrontOrRear = 1,
    /** User can only use the front camera */
    FrontOnly = 2,
    /** User can only use the back camera */
    RearOnly = 3,
  }
  /**
   * @hidden
   * Specifies the image source
   *
   * @beta
   */
  export enum Source {
    /** The camera is the source of visual media. */
    Camera = 1,
    /** The source of visual media is the gallery. */
    Gallery = 2,
  }

  /**
   * @hidden
   * VisualMediaFile object that can be used to represent image or video from host apps.
   *
   * @beta
   */
  export interface VisualMediaFile {
    /**
     * @hidden
     * This is the base64 content of file.
     * If app needs to use this directly in HTML tags, it should convert this to a data url.
     */
    content: string;
    /**
     * @hidden
     * The size of file represented in VisualMediaFile in KB
     */
    sizeInKB: number;

    /**
     * @hidden
     * Name of the file (does not include the extension)
     */
    name: string;

    /**
     * @hidden
     * File's MIME type. More information on supported `mimeTypes`(https://docs.lens.xyz/docs/metadata-standards#supported-mime-types-for-imagesaudiovideos).
     */
    mimeType: string;
  }

  /**
   * @hidden
   * Checks whether or not visualMedia has user permission
   * @returns Promise that will resolve with true if the user had granted the app permission to media information(including Camera and Gallery permission), or with false otherwise,
   * In case of an error, promise will reject with the error.
   * @throws NOT_SUPPORTED_ON_PLATFORM Error if the DevicePermission.Media permission has not successfully granted.
   *
   * @beta
   */
  export function hasPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!image.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;
    return sendAndHandleSdkErrorWithVersion(
      getApiVersionTag(visualMediaTelemetryVersionNumber, ApiName.VisualMedia_HasPermission),
      'permissions.has',
      permissions,
    );
  }

  /**
   * @hidden
   * Requests user permission for visualMedia
   * @returns Promise that will resolve with true if the user consented permission for media(including Camera and Gallery permission), or with false otherwise,
   * In case of an error, promise will reject with the error.
   * @throws NOT_SUPPORTED_ON_PLATFORM Error if the DevicePermission.Media permission has not successfully granted.
   *
   * @beta
   */
  export function requestPermission(): Promise<boolean> {
    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!image.isSupported()) {
      throw errorNotSupportedOnPlatform;
    }
    const permissions: DevicePermission = DevicePermission.Media;
    return sendAndHandleSdkErrorWithVersion(
      getApiVersionTag(visualMediaTelemetryVersionNumber, ApiName.VisualMedia_RequestPermission),
      'permissions.request',
      permissions,
    );
  }

  /**
   * @hidden
   * To enable this image capability will let the app developer ask the user to get images from camera/local storage
   *
   * @beta
   */
  export namespace image {
    /**
     * @hidden
     * CameraImageProperties is for the image taken from the camera
     *
     * @beta
     */
    export interface CameraImageProperties extends VisualMediaProps {
      /**
       * @hidden
       * The source in CameraImageProperties should always be CameraProps
       */
      sourceProps: CameraProps;
    }

    /**
     * @hidden
     * CameraImageProperties is for the image taken from the camera
     *
     * @beta
     */
    export interface GalleryImageProperties extends VisualMediaProps {
      /**
       * @hidden
       * The source in GalleryImageProperties should always be GalleryProps
       */
      sourceProps: GalleryProps;
    }

    /**
     * @hidden
     * Capture one or multiple image(s) using camera.
     * @param cameraImageInputs - The input params to customize the image(s) to be captured
     * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
     * @throws INVALID_ARGUMENTS Error if imageInputs is null or imageInputs.maxVisualMediaCount is greater than maxVisualMediaSelectionLimit or lesser than 1.
     *
     * @beta
     */
    export async function captureImages(cameraImageInputs: CameraImageProperties): Promise<VisualMediaFile[]> {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      ensureSupported();
      ensureImageInputValid(cameraImageInputs);
      const files = await sendAndHandleSdkErrorWithVersion<VisualMediaFile[]>(
        getApiVersionTag(visualMediaTelemetryVersionNumber, ApiName.VisualMedia_Image_CaptureImages),
        'visualMedia.image.captureImages',
        cameraImageInputs,
      );
      ensureResponseValid(cameraImageInputs.maxVisualMediaCount, files);
      return files;
    }

    /**
     * @hidden
     * Upload the existing image(s) from the gallery.
     * @param galleryImageInputs - The input params to customize the image(s) to be captured
     * @returns Promise that will resolve with {@link VisualMediaFile[]} object or reject with an error.
     * @throws INVALID_ARGUMENTS Error if imageInputs is null or imageInputs.maxVisualMediaCount is greater than maxVisualMediaSelectionLimit or lesser than 1.
     *
     * @beta
     */
    export async function retrieveImages(galleryImageInputs: GalleryImageProperties): Promise<VisualMediaFile[]> {
      ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
      ensureSupported();
      ensureImageInputValid(galleryImageInputs);
      const files = await sendAndHandleSdkErrorWithVersion<VisualMediaFile[]>(
        getApiVersionTag(visualMediaTelemetryVersionNumber, ApiName.VisualMedia_Image_RetrieveImages),
        'visualMedia.image.retrieveImages',
        galleryImageInputs,
      );
      ensureResponseValid(galleryImageInputs.maxVisualMediaCount, files);
      return files;
    }

    /**
     * @hidden
     * Checks if visualMedia.image capability is supported by the host
     * @returns boolean to represent whether visualMedia.image is supported
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

    /**
     * @hidden
     * Ensure visualMedia.image capability is supported by the host
     * @throws errorNotSupportedOnPlatform error if isSupported() fails.
     *
     * @beta
     */
    function ensureSupported(): void {
      if (!isSupported()) {
        throw errorNotSupportedOnPlatform;
      }
    }
    /**
     * @hidden
     * @param imageInput the input can be either CameraImageProperties or GalleryImageProperties
     * @param source the expected Source
     * @throws error if the input check fails.
     * @beta
     */
    function ensureImageInputValid(imageInput: CameraImageProperties | GalleryImageProperties): void {
      if (
        !imageInput ||
        imageInput.maxVisualMediaCount > maxVisualMediaSelectionLimit ||
        imageInput.maxVisualMediaCount < 1
      ) {
        throw errorInvalidCount;
      }
    }

    /**
     * @hidden
     * Ensure the number of images in the response is within the maximum limit.
     * @throws error if length check fails.
     * @param maxCount the maxVisualMediaCount set in the imageInpus
     * @param response the response passed from host app
     *
     * @beta
     */
    function ensureResponseValid(maxCount: number, response: VisualMediaFile[]): void {
      // to ensure the number of images in the response is within the maximum limit.
      if (response.length > maxCount) {
        throw errorInvalidResponse;
      }
    }
  }
}
