import { FrameContexts, HostClientType } from '../public/constants';
import { ErrorCode, SdkError } from '../public';
import {
  ensureInitialized,
} from '../internal/internalAPIs';
import {
  createFile,
  decodeAttachment,
} from '../internal/mediaUtil';
import { sendMessageToParent } from '../internal/communication';
import { runtime } from '../public/runtime';


/**
 * @hidden
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
export namespace filesExtensionsFor3PStorageproviders {
  /**
  * @hidden
  * Object used to represent a file
  * @beta
  *
  */
  export interface File extends Blob {
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
    fileType: string;
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
    error: SdkError;
    /**
    * File chunk which will be assemebled and converted into a blob
   */
   fileChunk: FileChunk;
   /**
   * File index of the file for which chunk data is getting recieved
   */
  
   fileIndex: number
  }
  export interface AttachmentListHelper {
    fileType: string; // Adjust the actual type if needed
    assembleAttachment: AssembleAttachment[]; // Assuming AssembleAttachment is another type
  };
  export interface AssembleAttachment {
    /** A number representing the sequence of the attachment in the media chunks. */
    sequence: number;
    /** A Blob object representing the data of the media chunks. */
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
    callback: (error: SdkError, attachments: Blob[]) => void, // mahima changed files to blob
  ): void {
    if (!callback) {
      throw new Error('[getDragAndDropFiles] Callback cannot be null');
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task); //added runTime

    if (dragAndDropInput && dragAndDropInput !== '') {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      callback(invalidInput, []);
      return;
    }
    getFilesDragAndDropViaCallback(dragAndDropInput, callback);
  }

  function getFilesDragAndDropViaCallback(dragAndDropInput: string, callback: (error: SdkError, attachments: Blob[]) => void) {
  const files: Blob[] = [];
    const helper: filesExtensionsFor3PStorageproviders.AttachmentListHelper = {
      // Assuming AttachmentListHelper definition
      fileType: this.mimeType,
      assembleAttachment: [],
    };

    function handleGetDragAndDropFilesCallbackRequest(fileResult: filesExtensionsFor3PStorageproviders.FileResult): void { // mahima: added filesExtensionsFor3PStorageproviders to access FileResults
      if (callback) {
        if (fileResult && fileResult.error) {
          callback(fileResult.error, []);
        } else {
          if (fileResult && fileResult.fileChunk) {
            if (fileResult.fileChunk.chunkSequence <= 0) {
              const file = createFile(
                helper.assembleAttachment, // changed
                helper.fileType,
              );
              files.push(file);
              if (getFilesDragAndDropViaCallback.arguments.attachments.length === fileResult.fileIndex) { // mahima changed
                callback(fileResult.error, files);
              }
            } else {
              const assemble: filesExtensionsFor3PStorageproviders.AssembleAttachment = decodeAttachment( // changed
                fileResult.fileChunk, // mahima removed chunk
                helper.fileType, // Assuming you have a 'mediaMimeType' property
              );
              helper.assembleAttachment.push(assemble);
            }
          } else {
            callback(
              { errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' },
              [],
            );
          }
        }
      }
    }

    sendMessageToParent(
      'getDradAndDropFiles', // mahima Fix typo: 'getDradAndDropFiles' to 'getDragAndDropFiles'
      [dragAndDropInput], //mahima added [] compile
      handleGetDragAndDropFilesCallbackRequest,
    );
  }
}

