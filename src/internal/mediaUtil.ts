import { media } from '../public/media';

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
