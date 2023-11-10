import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { createFile, decodeAttachment } from '../internal/mediaUtil';
import { getLogger } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { media } from './media';
import { runtime } from './runtime';

const Files3PLogger = getLogger('thirdPartyStorageProviders');

/**
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
export namespace thirdPartyStorageProviders {
  /** Get context callback function type */
  export type ThirdPartyAppCallback = (attachments: FilesFor3PApps[], error?: SdkError) => void;

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

  /**
   * File chunks an output of getDragAndDropFiles API from platform
   */
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

  /**
   * Output of getDragAndDropFiles API from platform
   */
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
   * @param {string} dragAndDropInput - The input related to the drag-and-drop operation.
   * @param {ThirdPartyAppCallback} callback -
   *   A callback function to handle the result of the operation
   */
  export function getDragAndDropFiles(dragAndDropInput: string, callback: ThirdPartyAppCallback): void {
    if (!callback) {
      throw new Error('[getDragAndDropFiles] Callback cannot be null');
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

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
          if (fileResult && fileResult.fileChunk) {
            try {
              const assemble: media.AssembleAttachment | null = decodeAttachment(
                fileResult.fileChunk,
                fileResult.fileType,
              );
              if (assemble) {
                helper.assembleAttachment.push(assemble);
              } else {
                Files3PLogger(
                  `Received a null assemble attachment for when decoding chunk sequence ${fileResult.fileChunk.chunkSequence}; not including the chunk in the assembled file.`,
                );
              }

              // we will send the maximum integer as chunkSequence to identify the last chunk
              if (fileResult.fileChunk.chunkSequence == Number.MAX_SAFE_INTEGER) {
                const fileBlob = createFile(helper.assembleAttachment, fileResult.fileType);

                if (fileResult.isLastFile && fileBlob) {
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
      'thirdPartyStorageProviders.getDragAndDropFiles',
      [dragAndDropInput],
      handleGetDragAndDropFilesCallbackRequest,
    );
  }

  /**
   * Checks if the thirdPartyStorageProviders capability is supported by the host
   * @returns boolean to represent whether the thirdPartyStorageProviders capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.thirdPartyStorageProviders ? true : false;
  }
}
