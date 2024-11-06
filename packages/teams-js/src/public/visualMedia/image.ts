import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { maxVisualMediaSelectionLimit, VisualMediaProps } from '../../internal/visualMediaHelpers';
import { errorInvalidCount, errorInvalidResponse, errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { runtime } from '../runtime';
import { CameraProps, GalleryProps, VisualMediaFile } from './visualMedia';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const visualMediaTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * @hidden
 * To enable this image capability will let the app developer ask the user to get images from camera/local storage
 *
 * @beta
 * @module
 */

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
  const files = await sendAndHandleSdkError<VisualMediaFile[]>(
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
  const files = await sendAndHandleSdkError<VisualMediaFile[]>(
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
