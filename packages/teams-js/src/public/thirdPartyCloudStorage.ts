import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { createFile, decodeAttachment } from '../internal/mediaUtil';
import { ApiName, ApiVersionNumber, getApiVersionTag, getLogger } from '../internal/telemetry';
import { errorNotSupportedOnPlatform, FrameContexts } from './constants';
import { ErrorCode, SdkError } from './interfaces';
import { runtime } from './runtime';

const Files3PLogger = getLogger('thirdPartyCloudStorage');

/**
 * v2 APIs telemetry file: All of APIs in this capability file should send out API version v2 ONLY
 */
const thirdPartyCloudStorageTelemetryVersionNumber: ApiVersionNumber = ApiVersionNumber.V_2;

/**
 * Extended files API 3P storage providers, features like sending Blob from Teams to 3P app on user
 * actions like drag and drop to compose
 * @beta
 */
export namespace thirdPartyCloudStorage {
  /**
   * Interface to assemble file chunks
   * @beta
   */
  export interface AssembleAttachment {
    /** A number representing the sequence of the attachment in the file chunks. */
    sequence: number;
    /** A Blob object representing the data of the file chunks. */
    file: Blob;
  }
  /**
   * Class to assemble files
   * @beta
   */
  class AttachmentListHelper {
    /** A string representing the MIME type of the file */
    public fileType: string;
    /** An array of {@link AssembleAttachment | AssembleAttachment} objects representing files to be sent as attachment */
    public assembleAttachment: AssembleAttachment[];

    public constructor(fileType: string, assembleAttachment: AssembleAttachment[]) {
      this.fileType = fileType;
      this.assembleAttachment = assembleAttachment;
    }
  }
  let files: FilesFor3PStorage[] = [];
  let helper: AttachmentListHelper | null = null;
  let lastChunkVal = true; // setting it to true so that the very first file and first chunk does not fail

  /**
   * Object used to represent a file
   * @beta
   *
   */
  export interface FilesFor3PStorage extends Blob {
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
    /**
     * Indicates whether this chunk is the final segment of a file
     */
    endOfFile: boolean;
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
   * Defines the callback function received from Third Party App
   * @beta
   */
  export interface DragAndDropFileCallback {
    /**
     * Defination of the callback which is received from third party app when calling {@link thirdPartyCloudStorage.getDragAndDropFiles}
     * An array of dragdropped files {@link thirdPartyCloudStorage.FilesFor3PStorage}
     * Error encountered during the API call {@link SdkError}
     */
    (files: FilesFor3PStorage[], error?: SdkError): void;
  }

  let callback: DragAndDropFileCallback | null = null;

  /**
   * Get drag-and-drop files using a callback.
   *
   * @param {string} dragAndDropInput - unique id which is a combination of replyToId + threadId of teams chat and channel.
   *   Both ReplyToId and threadId can be fetched from application context.
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
    lastChunkVal = true;

    sendMessageToParent(
      getApiVersionTag(
        thirdPartyCloudStorageTelemetryVersionNumber,
        ApiName.ThirdPartyCloudStorage_GetDragAndDropFiles,
      ),
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
            if (!lastChunkVal && fileResult.fileChunk.chunkSequence === 0) {
              // last chunk value was false
              Files3PLogger("Last chunk is not received or 'endOfFile' value for previous chunk was not set to true");
              lastChunkVal = true; // for next iteration

              callback([], {
                errorCode: ErrorCode.INTERNAL_ERROR,
                message: 'error occurred while receiving data',
              });
              files = [];
              callback = null;
            }
            const assemble: AssembleAttachment | null = decodeAttachment(fileResult.fileChunk, fileResult.fileType);
            if (assemble) {
              if (!helper) {
                // creating helper object for received file chunk
                helper = new AttachmentListHelper(fileResult.fileType, []);
              }
              helper.assembleAttachment.push(assemble);
            } else {
              Files3PLogger(
                `Received a null assemble attachment for when decoding chunk sequence ${fileResult.fileChunk.chunkSequence}; not including the chunk in the assembled file.`,
              );
              callback
                ? callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: 'error occurred while receiving data' })
                : (callback = null);
              files = [];
              callback = null;
              lastChunkVal = true;
            }

            // we will store this value to determine whether we received the last chunk of the previous file
            lastChunkVal = fileResult.fileChunk.endOfFile;
            if (fileResult.fileChunk.endOfFile && helper) {
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
                lastChunkVal = true;
              }

              helper = null;
            }
          } catch (e) {
            if (callback) {
              callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: e });
              files = [];
              callback = null;
              lastChunkVal = true;
            }
          }
        } else {
          callback([], { errorCode: ErrorCode.INTERNAL_ERROR, message: 'data received is null' });
          files = [];
          callback = null;
          lastChunkVal = true;
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
