import { GlobalVars } from '../internal/globalVars';
import { HostClientType } from '../public/constants';
import { people } from '../public/people';
import { media } from '../public/media';
import { SdkError, ErrorCode } from '../public/interfaces';
import { isAPISupportedByPlatform } from '../internal/internalAPIs';
import { defaultSDKVersionForCompatCheck } from './constants';

/**
 * Helper function to identify if host client is either android or ios
 */
export function isHostClientMobile(): boolean {
  if (GlobalVars.hostClientType == HostClientType.android || GlobalVars.hostClientType == HostClientType.ios) {
    return true;
  }
  return false;
}

/**
 * Helper function which indicates if current API is supported on mobile or not.
 * @returns SdkError if host client is not android/ios or if the requiredVersion is not
 *          supported by platform or not. Null is returned in case of success.
 */
export function isApiSupportedOnMobile(requiredVersion: string = defaultSDKVersionForCompatCheck): SdkError {
  if (!isHostClientMobile()) {
    const notSupportedError: SdkError = { errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM };
    return notSupportedError;
  } else if (!isAPISupportedByPlatform(requiredVersion)) {
    const oldPlatformError: SdkError = { errorCode: ErrorCode.OLD_PLATFORM };
    return oldPlatformError;
  }
  return null;
}

/**
 * Helper function to create a blob from media chunks based on their sequence
 */
export function createFile(assembleAttachment: media.AssembleAttachment[], mimeType: string): Blob {
  if (assembleAttachment == null || mimeType == null || assembleAttachment.length <= 0) {
    return null;
  }
  let file: Blob;
  let sequence = 1;
  assembleAttachment.sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
  assembleAttachment.forEach(item => {
    if (item.sequence == sequence) {
      if (file) {
        file = new Blob([file, item.file], { type: mimeType });
      } else {
        file = new Blob([item.file], { type: mimeType });
      }
      sequence++;
    }
  });
  return file;
}

/**
 * Helper function to convert Media chunks into another object type which can be later assemebled
 * Converts base 64 encoded string to byte array and then into an array of blobs
 */
export function decodeAttachment(attachment: media.MediaChunk, mimeType: string): media.AssembleAttachment {
  if (attachment == null || mimeType == null) {
    return null;
  }
  const decoded = atob(attachment.chunk);
  const byteNumbers = new Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    byteNumbers[i] = decoded.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob: Blob = new Blob([byteArray], { type: mimeType });
  const assemble: media.AssembleAttachment = {
    sequence: attachment.chunkSequence,
    file: blob,
  };
  return assemble;
}

/**
 * Returns true if the mediaInput params are valid and false otherwise
 */
export function validateSelectMediaInputs(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs == null || mediaInputs.maxMediaCount > 10) {
    return false;
  }
  return true;
}

/**
 * Returns true if the mediaInput params are called for mediatype VideoAndImage and false otherwise
 */
export function isMediaCallForVideoAndImageInputs(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs) {
    if (mediaInputs.mediaType == media.MediaType.VideoAndImage || mediaInputs.videoAndImageProps) {
      return true;
    }
  }
  return false;
}

/**
 * Function returns true if the app has registered to listen to video controller events, else false.
 */
export function isVideoControllerRegistered(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs.mediaType == 2 && mediaInputs.videoProps && mediaInputs.videoProps.videoController) {
    return true;
  }
  return false;
}

/**
 * Returns true if the get Media params are valid and false otherwise
 */
export function validateGetMediaInputs(mimeType: string, format: media.FileFormat, content: string): boolean {
  if (mimeType == null || format == null || format != media.FileFormat.ID || content == null) {
    return false;
  }
  return true;
}

/**
 * Returns true if the view images param is valid and false otherwise
 */
export function validateViewImagesInput(uriList: media.ImageUri[]): boolean {
  if (uriList == null || uriList.length <= 0 || uriList.length > 10) {
    return false;
  }
  return true;
}

/**
 * Returns true if the scan barcode param is valid and false otherwise
 */
export function validateScanBarCodeInput(barCodeConfig: media.BarCodeConfig): boolean {
  if (barCodeConfig) {
    if (
      barCodeConfig.timeOutIntervalInSec === null ||
      barCodeConfig.timeOutIntervalInSec <= 0 ||
      barCodeConfig.timeOutIntervalInSec > 60
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Returns true if the people picker params are valid and false otherwise
 */
export function validatePeoplePickerInput(peoplePickerInputs: people.PeoplePickerInputs): boolean {
  if (peoplePickerInputs) {
    if (peoplePickerInputs.title) {
      if (typeof peoplePickerInputs.title !== 'string') {
        return false;
      }
    }

    if (peoplePickerInputs.setSelected) {
      if (typeof peoplePickerInputs.setSelected !== 'object') {
        return false;
      }
    }

    if (peoplePickerInputs.openOrgWideSearchInChatOrChannel) {
      if (typeof peoplePickerInputs.openOrgWideSearchInChatOrChannel !== 'boolean') {
        return false;
      }
    }
    if (peoplePickerInputs.singleSelect) {
      if (typeof peoplePickerInputs.singleSelect !== 'boolean') {
        return false;
      }
    }
  }
  return true;
}
