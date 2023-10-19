import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { decodeAttachment } from '../internal/mediaUtil';
import { ErrorCode, SdkError } from '../public';
import { FrameContexts } from '../public/constants';
import { runtime } from '../public/runtime';

/**
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
export namespace filesExtensionsFor3PStorageproviders {
  /**
   * Object used to represent a file
   * @beta
   *
   */
  export interface FilesFor3PApps extends Blob {
    /**
     * A number that represents the number of milliseconds since the Unix epoch
     */
    lastModified: number;
    /**
     * Name of the file
     */
    name: string;
    /**
     * file type
     */
    type: string;
    /**
     * A string containing the path of the file relative to the ancestor directory the user selected
     */
    webkitRelativePath?: string;
  }
  export interface FileChunk {
    /**
     * Base 64 data for the requested uri
     */
    chunk: string;
    /**
     * chunk sequence number
     */
    chunkSequence: number;
  }
  export interface FileResult {
    /**
     * error encountered in getDragAndDropFiles API
     */
    error?: SdkError;
    /**
     * File chunk which will be assemebled and converted into a blob
     */
    fileChunk: FileChunk;
    /**
     * File index of the file for which chunk data is getting recieved
     */
    fileIndex: number;
    /**
     * File type which is getting recieved
     */
    fileType: string;
    /**
     * Will tell if this is the last file
     */
    isLastFile: boolean;
    /**
     * Will tell the name of the file
     */
    fileName: string;
  }
  export interface AttachmentListHelper {
    fileType: string;
    assembleAttachment: AssembleAttachment[];
  }
  export interface AssembleAttachment {
    /** A number representing the sequence of the attachment in the file chunks. */
    sequence: number;
    /** A Blob object representing the data of the file chunks. */
    file: Blob;
  }

  /**
   * Get drag-and-drop files using a callback.
   *
   * @param dragAndDropInput - Input for drag-and-drop action.
   * @param callback - Callback function to handle the result.
   */
  export function getDragAndDropFilesHandler(
    dragAndDropInput: string,
    callback: (attachments: FilesFor3PApps[], error?: SdkError) => void,
  ): void {
    if (!callback) {
      throw new Error('[getDragAndDropFiles] Callback cannot be null');
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);

    if (!dragAndDropInput || dragAndDropInput === '') {
      //condition changed
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback([], invalidInput);
      return;
    }
    getFilesDragAndDropViaCallback(dragAndDropInput, callback);
  }

  function getFilesDragAndDropViaCallback(
    dragAndDropInput: string,
    callback: (attachments: FilesFor3PApps[], error?: SdkError) => void,
  ): void {
    const files: FilesFor3PApps[] = [];
    let helper: filesExtensionsFor3PStorageproviders.AttachmentListHelper = {
      fileType: '',
      assembleAttachment: [],
    };

    function handleGetDragAndDropFilesCallbackRequest(
      fileResult: filesExtensionsFor3PStorageproviders.FileResult,
    ): void {
      if (callback) {
        if (fileResult && fileResult.error) {
          callback([], fileResult.error);
        } else {
          if (fileResult && fileResult.fileChunk) {
            try {
              const assemble: filesExtensionsFor3PStorageproviders.AssembleAttachment = decodeAttachment(
                fileResult.fileChunk,
                fileResult.fileType,
              );
              helper.assembleAttachment.push(assemble);

              if (fileResult.fileChunk.chunkSequence == Number.MAX_SAFE_INTEGER) {
                const fileBlob = createFile(helper.assembleAttachment, fileResult.fileType);

                if (fileResult.isLastFile) {
                  // conver blob to File
                  const receivedFile = new File([fileBlob], fileResult.fileName, {
                    type: fileBlob.type,
                  });

                  files.push(receivedFile);

                  callback(files, fileResult.error);
                }

                helper = {
                  fileType: '',
                  assembleAttachment: [],
                };
              }
            } catch (e) {
              callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: e });
            }
          } else {
            callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
          }
        }
      }
    }
    sendMessageToParent('getDragAndDropFiles', [dragAndDropInput], handleGetDragAndDropFilesCallbackRequest);
  }

  /**
   * @hidden
   * Helper function to create a blob from file chunks based on their sequence
   *
   * @internal
   * Limited to Microsoft-internal use
   */
  export function createFile(
    assembleAttachment: filesExtensionsFor3PStorageproviders.AssembleAttachment[],
    mimeType: string,
  ): Blob {
    if (assembleAttachment == null || mimeType == null || assembleAttachment.length <= 0) {
      return null;
    }
    let file: Blob | undefined;
    let sequence = 0;
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
}
