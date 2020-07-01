import { AssembleAttachment, MediaChunk } from '../public/media';
/**
 * Helper function to create a blob from media chunks based on their sequence
 */
export function createFile(assembleAttachment: AssembleAttachment[], mimeType: string): Blob {
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
export function decodeAttachment(attachment: MediaChunk, mimeType: string): AssembleAttachment {
  let decoded = atob(attachment.chunk);
  let byteNumbers = new Array(decoded.length);
  for (let i = 0; i < decoded.length; i++) {
    byteNumbers[i] = decoded.charCodeAt(i);
  }
  let byteArray = new Uint8Array(byteNumbers);
  let blob: Blob = new Blob([byteArray], { type: mimeType });
  let assemble: AssembleAttachment = {
    sequence: attachment.chunkSequence,
    file: blob,
  };
  return assemble;
}
