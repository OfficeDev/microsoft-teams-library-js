import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { createFile, decodeAttachment } from '../internal/mediaUtil';
import { ErrorCode, SdkError } from '../public';
import { FrameContexts } from '../public/constants';
import { media } from '../public/media';
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
     * Error encountered in getDragAndDropFiles API
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
     * Indicates whether this file is the last one in a sequence.
     */
    isLastFile: boolean;
    /**
     * The name of the file.
     */
    fileName: string;
  }

  /**
   * Helper class for assembling files
   */
  export interface AttachmentListHelper {
    /** A string representing the MIME type of the file */
    fileType: string;
    /** An array of {@link media.AssembleAttachment | AssembleAttachment} objects representing the media files to be sent as attachment */
    assembleAttachment: media.AssembleAttachment[];
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
    let helper: AttachmentListHelper = {
      fileType: '',
      assembleAttachment: [],
    };

    function handleGetDragAndDropFilesCallbackRequest(fileResult: FileResult): void {
      if (callback) {
        if (fileResult && fileResult.error) {
          callback([], fileResult.error);
        } else {
          if (fileResult && fileResult.fileChunk && media) {
            try {
              const assemble: media.AssembleAttachment = decodeAttachment(fileResult.fileChunk, fileResult.fileType);
              helper.assembleAttachment.push(assemble);

              // we will send the maximum integer as chunkSequence to identify the last chunk
              if (fileResult.fileChunk.chunkSequence == Number.MAX_SAFE_INTEGER) {
                const fileBlob = createFile(helper.assembleAttachment, fileResult.fileType);

                if (fileResult.isLastFile) {
                  // Convert blob to File
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
    sendMessageToParent(
      'filesExtensionsFor3PStorageproviders.getDragAndDropFiles',
      [dragAndDropInput],
      handleGetDragAndDropFilesCallbackRequest,
    );
  }
}
