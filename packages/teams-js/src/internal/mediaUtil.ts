import { media } from '../public/media';
import { people } from '../public/people';
import {
  imageOutputFormatsAPISupportVersion,
  nonFullScreenVideoModeAPISupportVersion,
  videoAndImageMediaAPISupportVersion,
} from './constants';
import { throwExceptionIfMobileApiIsNotSupported } from './internalAPIs';

/**
 * @hidden
 * Helper function to create a blob from media chunks based on their sequence
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function createFile(assembleAttachment: media.AssembleAttachment[], mimeType: string): Blob {
  if (assembleAttachment == null || mimeType == null || assembleAttachment.length <= 0) {
    return null;
  }
  let file: Blob | undefined;
  let sequence = 1;
  assembleAttachment.sort((a, b) => (a.sequence > b.sequence ? 1 : -1));
  assembleAttachment.forEach((item) => {
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
 * @hidden
 * Helper function to convert Media chunks into another object type which can be later assemebled
 * Converts base 64 encoded string to byte array and then into an array of blobs
 *
 * @internal
 * Limited to Microsoft-internal use
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
 * @hidden
 * Function throws an SdkError if the media call is not supported on current mobile version, else undefined.
 *
 * @throws an SdkError if the media call is not supported
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function throwExceptionIfMediaCallIsNotSupportedOnMobile(mediaInputs: media.MediaInputs): void {
  if (isMediaCallForVideoAndImageInputs(mediaInputs)) {
    throwExceptionIfMobileApiIsNotSupported(videoAndImageMediaAPISupportVersion);
  } else if (isMediaCallForNonFullScreenVideoMode(mediaInputs)) {
    throwExceptionIfMobileApiIsNotSupported(nonFullScreenVideoModeAPISupportVersion);
  } else if (isMediaCallForImageOutputFormats(mediaInputs)) {
    throwExceptionIfMobileApiIsNotSupported(imageOutputFormatsAPISupportVersion);
  }
}

/**
 * @hidden
 * Function returns true if the app has registered to listen to video controller events, else false.
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isVideoControllerRegistered(mediaInputs: media.MediaInputs): boolean {
  if (
    mediaInputs.mediaType == media.MediaType.Video &&
    mediaInputs.videoProps &&
    mediaInputs.videoProps.videoController
  ) {
    return true;
  }
  return false;
}

/**
 * @hidden
 * Returns true if the mediaInput params are valid and false otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function validateSelectMediaInputs(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs == null || mediaInputs.maxMediaCount > 10) {
    return false;
  }
  return true;
}

/**
 * @hidden
 * Returns true if the mediaInput params are called for mediatype Image and contains Image outputs formats, false otherwise
 *
 * @internal
 * Limited to Microsoft-internal use
 */
export function isMediaCallForImageOutputFormats(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs?.mediaType == media.MediaType.Image && mediaInputs?.imageProps?.imageOutputFormats) {
    return true;
  }
  return false;
}

/**
 * @hidden
 * Returns true if the mediaInput params are called for mediatype VideoAndImage and false otherwise
 *
 * @internal
 */
export function isMediaCallForVideoAndImageInputs(mediaInputs: media.MediaInputs): boolean {
  if (mediaInputs && (mediaInputs.mediaType == media.MediaType.VideoAndImage || mediaInputs.videoAndImageProps)) {
    return true;
  }
  return false;
}

/**
 * @hidden
 * Returns true if the mediaInput params are called for non-full screen video mode and false otherwise
 *
 * @internal
 */
export function isMediaCallForNonFullScreenVideoMode(mediaInputs: media.MediaInputs): boolean {
  if (
    mediaInputs &&
    mediaInputs.mediaType == media.MediaType.Video &&
    mediaInputs.videoProps &&
    !mediaInputs.videoProps.isFullScreenMode
  ) {
    return true;
  }
  return false;
}

/**
 * @hidden
 * Returns true if the get Media params are valid and false otherwise
 *
 * @internal
 */
export function validateGetMediaInputs(mimeType: string, format: media.FileFormat, content: string): boolean {
  if (mimeType == null || format == null || format != media.FileFormat.ID || content == null) {
    return false;
  }
  return true;
}

/**
 * @hidden
 * Returns true if the view images param is valid and false otherwise
 *
 * @internal
 */
export function validateViewImagesInput(uriList: media.ImageUri[]): boolean {
  if (uriList == null || uriList.length <= 0 || uriList.length > 10) {
    return false;
  }
  return true;
}

/**
 * @hidden
 * Returns true if the scan barcode param is valid and false otherwise
 *
 * @internal
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
 * @hidden
 * Returns true if the people picker params are valid and false otherwise
 *
 * @internal
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
