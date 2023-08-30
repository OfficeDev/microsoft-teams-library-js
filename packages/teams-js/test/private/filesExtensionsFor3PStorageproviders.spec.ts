import * as communicationModule from '../../src/internal/communication';
import { GlobalVars } from '../../src/internal/globalVars';
import { decodeAttachment } from '../../src/internal/mediaUtil';
import * as decodeAttachmentModule from '../../src/internal/mediaUtil';
import { filesExtensionsFor3PStorageproviders } from '../../src/private/filesExtensionsFor3PStorageproviders';
import { ErrorCode, SdkError } from '../../src/public';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { Utils } from '../utils';

describe('filesExtensionsFor3PStorageproviders', () => {
  const utils: Utils = new Utils();
  const mockDecodeAttachment = jest.fn();
  const mockGetFilesDragAndDropViaCallback = jest.fn();
  const mockRuntime = {};
  const mockCallback = jest.fn();
  const mockFrameContexts = {
    content: 'content',
    task: 'task',
  };
  const mockFileResults: filesExtensionsFor3PStorageproviders.FileResult[] = [];

  const mockFileChunk2: filesExtensionsFor3PStorageproviders.FileChunk = {
    chunk: 'file1chunk2',
    chunkSequence: Number.MAX_SAFE_INTEGER, // last chunk
  };
  const mockFileResult2: filesExtensionsFor3PStorageproviders.FileResult = {
    fileChunk: mockFileChunk2,
    fileType: 'mockFileType',
    fileIndex: 1, // for now it means last file we can remove
    isLastFile: true,
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.mock('../../src/internal/mediaUtil', () => ({
      decodeAttachment: mockDecodeAttachment,
    }));
    jest.mock('../../src/public/runtime', () => ({
      runtime: mockRuntime,
    }));
    jest.mock('../../src/private/filesExtensionsFor3PStorageproviders', () => ({
      getFilesDragAndDropViaCallback: () => mockGetFilesDragAndDropViaCallback,
    }));

    jest.mock('../../src/public/constants', () => ({
      FrameContexts: mockFrameContexts,
    }));

    for (let i = 0; i < 100; i++) {
      const mockFileChunk: filesExtensionsFor3PStorageproviders.FileChunk = {
        chunk: 'filechunk2',
        chunkSequence: i,
      };

      const mockFileResult: filesExtensionsFor3PStorageproviders.FileResult = {
        fileChunk: mockFileChunk,
        fileType: 'mockFileType',
        fileIndex: i + 1,
        isLastFile: false,
      };

      mockFileResults.push(mockFileResult);
    }
  });

  /**
   * Create File test cases
   */
  it('test createFile failure with null params', () => {
    const result = filesExtensionsFor3PStorageproviders.createFile([], '');
    expect(result).toBeNull();
  });

  it('test createFile failure with null assembleAttachment', () => {
    const result = filesExtensionsFor3PStorageproviders.createFile([], 'image/jpeg');
    expect(result).toBeNull();
  });

  it('test createFile failure with invalid params', () => {
    const result = filesExtensionsFor3PStorageproviders.createFile([], 'image/jpeg');
    expect(result).toBeNull();
  });

  it('test createFile success', () => {
    const assemble1: filesExtensionsFor3PStorageproviders.AssembleAttachment = decodeAttachment(
      {
        chunk: btoa('abc'),
        chunkSequence: 1,
      },
      'image/jpeg',
    );
    const assemble2: filesExtensionsFor3PStorageproviders.AssembleAttachment = decodeAttachment(
      {
        chunk: btoa('xyz'),
        chunkSequence: 2,
      },
      'image/jpeg',
    );
    const assembleAttachment: filesExtensionsFor3PStorageproviders.AssembleAttachment[] = [];
    assembleAttachment.push(assemble1);
    assembleAttachment.push(assemble2);
    const result = filesExtensionsFor3PStorageproviders.createFile(assembleAttachment, 'image/jpeg');
    expect(result).not.toBeNull();
  });

  it('should call the callback with error when callback is null', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    // eslint-disable-next-line strict-null-checks/all
    expect(() => filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('', null)).toThrowError(
      '[getDragAndDropFiles] Callback cannot be null',
    );
  });

  it('should throw error with error code INVALID_ARGUMENTS when dragAndDropInput not is provided', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('', (attachments: Blob[], error?: SdkError) => {
      if (error) {
        expect(error).not.toBeNull();
        expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      }
    });
  });

  it('should ensure initialization and call getFilesDragAndDropViaCallback when valid input is provided', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    expect(() => {
      filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('mockDragAndDropInput', mockCallback);
    }).not.toThrowError();
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback with error', async () => {
    GlobalVars.isFramelessWindow = true;
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    const mockFileChunk: filesExtensionsFor3PStorageproviders.FileChunk = {
      chunk: '',
      chunkSequence: 0,
    };
    const mockFileResult: filesExtensionsFor3PStorageproviders.FileResult = {
      fileChunk: mockFileChunk,
      fileType: 'mockFileType',
      error: {
        errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      },
      fileIndex: 0,
      isLastFile: false,
    };

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      callbackused(mockFileResult);
    }
    expect(mockCallback).toHaveBeenCalledWith([], mockFileResult.error);
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback without error [single file]', async () => {
    GlobalVars.isFramelessWindow = true;
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      // sending single file with 100 chunks
      mockFileResults.forEach((mockFileResult) => {
        callbackused(mockFileResult);
      });
      callbackused(mockFileResult2);
    }

    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining([expect.any(Blob)]), undefined); // verify we recieved 1 blob object i.e. one file
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback without error [multiple files]', async () => {
    GlobalVars.isFramelessWindow = true;
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      // creating 50 file, each having 100 chunks
      for (let i = 0; i < 50; i++) {
        mockFileResults.forEach((mockFileResult) => {
          callbackused(mockFileResult);
        });
        callbackused(mockFileResult2);
      }
    }

    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(expect.arrayContaining(Array(50).fill(expect.any(Blob))), undefined);
    const receivedArray = mockCallback.mock.calls[0][0];
    expect(receivedArray).toHaveLength(50); // verify if we received 50 files
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback with error', async () => {
    GlobalVars.isFramelessWindow = true;
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);

    jest.spyOn(decodeAttachmentModule, 'decodeAttachment').mockImplementation(() => {
      throw new Error('Mocked error from decodeAttachment');
    });

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    filesExtensionsFor3PStorageproviders.getDragAndDropFilesHandler('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      callbackused(mockFileResult2);
    }

    expect(mockCallback).toBeCalledWith([], {
      errorCode: ErrorCode.INTERNAL_ERROR,
      message: new Error('Mocked error from decodeAttachment'),
    });
  });
});
