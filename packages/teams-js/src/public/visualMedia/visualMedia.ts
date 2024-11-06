/**
 * @hidden
 * Interact with images. Allows the app developer ask the user to get images from their camera / camera roll / file system.
 *
 * @beta
 * @module
 */

import { sendAndHandleSdkError } from '../../internal/communication';
import { ensureInitialized } from '../../internal/internalAPIs';
import { ApiName, ApiVersionNumber, getApiVersionTag } from '../../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from '../constants';
import { DevicePermission } from '../interfaces';
import { runtime } from '../runtime';
import * as image from './image';

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const visualMediaTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

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
  return sendAndHandleSdkError(
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
  return sendAndHandleSdkError(
    getApiVersionTag(visualMediaTelemetryVersionNumber, ApiName.VisualMedia_RequestPermission),
    'permissions.request',
    permissions,
  );
}

export { image };
