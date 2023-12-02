import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { createFile, decodeAttachment } from '../internal/mediaUtil';
import { getLogger } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

const Files3PLogger = getLogger('thirdPartyCloudStorage');

/**
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
export namespace thirdPartyCloudStorage {
  /** Get context callback function type */
  let files: FileFor3PApps[] = [];
  let helper: AttachmentListHelper = {
    fileType: '',
    assembleAttachment: [],
  };

  /**
   * Object used to represent a file
   * @beta
   *
   */
  export interface FileFor3PApps extends Blob {
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
   * @beta
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
   * @beta
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
     * File type/MIME type which is getting recieved
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
   * Helper object to assembled file chunks
   * @beta
   */
  export interface AssembleAttachment {
    /** A number representing the sequence of the attachment in the file chunks. */
    sequence: number;
    /** A Blob object representing the data of the file chunks. */
    file: Blob;
  }

  /**
   * Helper class for assembling files
   * @beta
   */
  export interface AttachmentListHelper {
    /** A string representing the MIME type of the file */
    fileType: string;
    /** An array of {@link AssembleAttachment | AssembleAttachment} objects representing files to be sent as attachment */
    assembleAttachment: AssembleAttachment[];
  }

  /**
   * Defines the Callback function received from Third Party App
   * @beta
   */
  export interface DragAndDropFileCallback {
    /** Callback from third party app */
    (files: FileFor3PApps[], error?: SdkError): void;
  }

  let callback: DragAndDropFileCallback | null = null;

  /**
   * Get drag-and-drop files using a callback.
   *
   * @param {string} dragAndDropInput - thread id/ conversation id of the chat/channel received from the app.
   * @param {DragAndDropFileCallback} dragAndDropFileCallback - callback
   *   A callback function to handle the result of the operation
   * @beta
   */
  export function getDragAndDropFiles(
    dragAndDropInput: string,
    dragAndDropFileCallback: DragAndDropFileCallback,
  ): void {
    if (!dragAndDropFileCallback) {
      throw new Error('[getDragAndDropFiles] Callback cannot be null');
    }
    if (!dragAndDropInput || dragAndDropInput === '') {
      const invalidInput: SdkError = { errorCode: ErrorCode.INVALID_ARGUMENTS };
      dragAndDropFileCallback([], invalidInput);
      return;
    }

    ensureInitialized(runtime, FrameContexts.content, FrameContexts.task);
    if (!isSupported()) {
      throw errorNotSupportedOnPlatform;
    }

    if (callback) {
      callback = null;
      throw new Error('getDragAndDropFiles cannot be called twice');
    } else {
      callback = dragAndDropFileCallback;
    }

    sendMessageToParent(
      'thirdPartyCloudStorage.getDragAndDropFiles',
      [dragAndDropInput],
      handleGetDragAndDropFilesCallbackRequest,
    );
  }

  function handleGetDragAndDropFilesCallbackRequest(fileResult: FileResult): void {
    if (callback) {
      if (fileResult && fileResult.error) {
        callback([], fileResult.error);
        callback = null;
      } else {
        if (fileResult && fileResult.fileChunk) {
          try {
            const assemble: AssembleAttachment | null = decodeAttachment(fileResult.fileChunk, fileResult.fileType);
            if (assemble) {
              helper.assembleAttachment.push(assemble);
            } else {
              Files3PLogger(
                `Received a null assemble attachment for when decoding chunk sequence ${fileResult.fileChunk.chunkSequence}; not including the chunk in the assembled file.`,
              );
              callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: 'error occurred while receiving data' });
              files = [];
              callback = null;
            }

            // we will send the maximum integer as chunkSequence to identify the last chunk
            if (fileResult.fileChunk.chunkSequence === Number.MAX_SAFE_INTEGER) {
              const fileBlob = createFile(helper.assembleAttachment, helper.fileType);

              if (fileBlob) {
                // Convert blob to File
                const receivedFile = new File([fileBlob], fileResult.fileName, {
                  type: fileBlob.type,
                });
                files.push(receivedFile);
              }

              if (fileResult.isLastFile && callback) {
                callback(files, fileResult.error);
                files = [];
                callback = null;
              }

              helper = {
                fileType: '',
                assembleAttachment: [],
              };
            }
          } catch (e) {
            if (callback) {
              callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: e });
              files = [];
              callback = null;
            }
          }
        } else {
          callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
          files = [];
          callback = null;
        }
      }
    }
  }

  /**
   * Checks if the thirdPartyCloudStorage capability is supported by the host
   * @returns boolean to represent whether the thirdPartyCloudStorage capability is supported
   *
   * @throws Error if {@linkcode app.initialize} has not successfully completed
   * @beta
   */
  export function isSupported(): boolean {
    return ensureInitialized(runtime) && runtime.supports.thirdPartyCloudStorage ? true : false;
  }
}
