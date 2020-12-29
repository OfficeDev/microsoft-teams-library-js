import { media } from './media';
import { ErrorCode, SdkError } from './interfaces';
import { ensureInitialized, isAPISupportedByPlatform, sendMessageRequestToParent } from '../internal/internalAPIs';
import { GlobalVars } from '../internal/globalVars';

/**
 * Namespace with services to control the background filters
 */
export namespace backgroundFilters {
  const backgroundFiltersAPISupportVersion = '0.0.0';

  export interface FilterImageUri extends media.ImageUri {
    type: media.ImageUriType.URL;
    isSelected: boolean;
    isUploaded: boolean;
  }

  /**
   * Select an image to be used as background filter in the current or next meet
   * @param image A background filter image
   * @param callback Callback to invoke when the image is selected
   */
  export function select(image: media.ImageUri, callback: (error?: SdkError) => void): void {
    if (!callback) {
      throw new Error('[backgroundFilters.select] Callback cannot be null');
    }
    ensureInitialized();
    if (!isAPISupportedByPlatform(backgroundFiltersAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError);
      return;
    }
    if (!image) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput);
      return;
    }

    const messageId = sendMessageRequestToParent('backgroundFilters.select', [image]);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Get the filter images
   * @param callback Callback to invoke with the image list
   */
  export function get(callback: (error: SdkError | null, images: FilterImageUri[]) => void): void {
    if (!callback) {
      throw new Error('[backgroundFilters.get] Callback cannot be null');
    }
    ensureInitialized();
    if (!isAPISupportedByPlatform(backgroundFiltersAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, null);
      return;
    }

    const messageId = sendMessageRequestToParent('backgroundFilters.get', []);
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Get only the current filter
   * @param callback Callback to invoke with the current filter
   */
  export function getCurrent(callback: (error: SdkError | null, image: FilterImageUri) => void): void {
    if (!callback) {
      throw new Error('[backgroundFilters.getCurrent] Callback cannot be null');
    }
    ensureInitialized();
    if (!isAPISupportedByPlatform(backgroundFiltersAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, null);
      return;
    }

    const messageId = sendMessageRequestToParent('backgroundFilters.getCurrent');
    GlobalVars.callbacks[messageId] = callback;
  }

  /**
   * Upload an image to the background filters
   * @param image Image to be uploaded
   * @param callback Callback function
   */
  export function upload(
    image: media.Media | media.ImageUri,
    callback: (error: SdkError | null, image: FilterImageUri) => void,
  ): void {
    if (!callback) {
      throw new Error('[backgroundFilters.upload] Callback cannot be null');
    }
    ensureInitialized();
    if (!isAPISupportedByPlatform(backgroundFiltersAPISupportVersion)) {
      const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
      callback(oldPlatformError, null);
      return;
    }
    if (!image) {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, null);
      return;
    }

    const messageId = sendMessageRequestToParent('backgroundFilters.upload', [image]);
    GlobalVars.callbacks[messageId] = callback;
  }
}
