import { sendAndHandleSdkError } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { errorInvalidCount, errorInvalidResponse, errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { DevicePermission } from './interfaces';
import { runtime } from './runtime';

/**
 * @hidden
 * Hide from docs
 * --------
 * Interact with image and video. It lets the app developer ask the user to get images or video from their camera / camera roll / file system.
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
     * max limit of media allowed to be selected in one go, only values <= maxVisualMediaSelectionLimit are supported.
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
     * Optional; indicate if user is allowed to move between front and back camera
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
    /** visual media source is camera. */
    Camera = 1,
    /** visual media source is gallery. */
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
     * File's MIME type.
     * Please check https://docs.lens.xyz/docs/metadata-standards#supported-mime-types-for-imagesaudiovideos about more information of mimeType.
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
    return sendAndHandleSdkError('permissions.has', permissions);
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
    return sendAndHandleSdkError('permissions.request', permissions);
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

      /**
       * @hidden
       * Optional; The common additional properties for image
       */
      commonImageProps?: ImageProperties;
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

      /**
       * @hidden
       * Optional; The common additional properties for image
       */
      commonImageProps?: ImageProperties;
    }

    /**
     * @hidden
     * Additional properties for image
     * All properties in ImageProperties are optional and have default values
     *
     * @beta
     */
    export interface ImageProperties {
      /**
       * @hidden
       * Optional; indicate if inking on the selected Image is allowed or not
       * If set to true but the platform (web/desktop) does not support inking, this feature will be silently ignored.
       * Default value is false
       */
      shouldAllowInkingOnImages?: boolean;

      /**
       * @hidden
       * Optional; indicate if putting text stickers on the selected Image is allowed or not
       * If set to true but the platform (web/desktop) does not support text stickers, this feature will be silently ignored.
       * Default value is false
       */
      shouldAllowTextStickersOnImages?: boolean;

      /**
       * @hidden
       * Optional; indicate if the filter mode is enabled on the selected image.
       * Enabling this value allows the host app to apply filters to images when selecting them from the gallery or taking photos with the camera.
       * If set to true but the platform (web/desktop) does not support filter mode, this feature will be silently ignored.
       * Default value is false
       */
      enableFilterOnImages?: boolean;
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
      ensureImageInputValided(cameraImageInputs);
      // waiting the response from host apps
      const files = await sendAndHandleSdkError<VisualMediaFile[]>(
        'visualMedia.image.captureImages',
        cameraImageInputs,
      );
      ensureResponseValided(cameraImageInputs.maxVisualMediaCount, files);
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
      ensureImageInputValided(galleryImageInputs);
      // waiting the response from host apps
      const files = await sendAndHandleSdkError<VisualMediaFile[]>(
        'visualMedia.image.retrieveImages',
        galleryImageInputs,
      );
      ensureResponseValided(galleryImageInputs.maxVisualMediaCount, files);
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
    function ensureImageInputValided(imageInput: CameraImageProperties | GalleryImageProperties): void {
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
    function ensureResponseValided(maxCount: number, response: VisualMediaFile[]): void {
      // to ensure the number of images in the response is within the maximum limit.
      if (response.length > maxCount) {
        throw errorInvalidResponse;
      }
    }
  }
}
