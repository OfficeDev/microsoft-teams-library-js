import * as communicationModule from '../../src/internal/communication';
import * as decodeAttachmentModule from '../../src/internal/mediaUtil';
import { ErrorCode, SdkError } from '../../src/public';
import { FrameContexts, HostClientType } from '../../src/public/constants';
import { thirdPartyCloudStorage } from '../../src/public/thirdPartyCloudStorage';
import { Utils } from '../utils';

describe('thirdPartyCloudStorage', () => {
  const utils: Utils = new Utils();
  const mockDecodeAttachment = jest.fn();
  const mockGetFilesDragAndDropViaCallback = jest.fn();
  const mockRuntime = {};
  const mockCallback = jest.fn();
  const mockFrameContexts = {
    content: 'content',
    task: 'task',
  };
  const mockFileResults: thirdPartyCloudStorage.FileResult[] = [];
  const mockFileLastChunkForLastFile: thirdPartyCloudStorage.FileChunk = {
    chunk: 'file1chunk2',
    chunkSequence: 1,
    endOfFile: true,
  };

  const mockLastFileResult: thirdPartyCloudStorage.FileResult = {
    fileChunk: mockFileLastChunkForLastFile,
    fileType: 'mockFileType',
    fileIndex: Number.MAX_SAFE_INTEGER,
    isLastFile: true,
    fileName: 'TestFile',
  };

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    global.fetch = jest.fn(() => Promise.resolve({ status: 200, ok: true } as Response));

    jest.mock('../../src/internal/mediaUtil', () => ({
      decodeAttachment: mockDecodeAttachment,
    }));
    jest.mock('../../src/public/runtime', () => ({
      runtime: mockRuntime,
    }));
    jest.mock('../../src/public/thirdPartyCloudStorage', () => ({
      getFilesDragAndDropViaCallback: () => mockGetFilesDragAndDropViaCallback,
    }));

    jest.mock('../../src/public/constants', () => ({
      FrameContexts: mockFrameContexts,
    }));

    // create 1 file with 3 chunks
    for (let i = 0; i < 3; i++) {
      const mockFileChunk: thirdPartyCloudStorage.FileChunk = {
        chunk: 'filechunk2',
        chunkSequence: i,
        endOfFile: i === 2 ? true : false, // for last chunk 'endOfFile' will be true
      };

      const mockFileResult: thirdPartyCloudStorage.FileResult = {
        fileChunk: mockFileChunk,
        fileType: 'mockFileType',
        fileIndex: i + 1,
        isLastFile: false,
        fileName: 'TestFile',
      };

      mockFileResults.push(mockFileResult);
    }
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback without error [multiple files]', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      // creating 50 file, each having 3 chunks
      for (let i = 0; i < 50; i++) {
        if (i == 49) {
          callbackused(mockLastFileResult);
        } else {
          mockFileResults.forEach((mockFileResult) => {
            callbackused(mockFileResult);
          });
        }
      }
    }

    expect(mockCallback).toHaveBeenCalled();
    const receivedArray = mockCallback.mock.calls[0][0];
    expect(receivedArray).toHaveLength(50); // verify if we received 50 files
    receivedArray.forEach((file) => {
      expect(file.type).toBe('mockfiletype');
      expect(file.name).toBe('TestFile');
    });
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback with error [multiple files] when incorrect last chunk sequence', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });

    const mockFileLastChunk: thirdPartyCloudStorage.FileChunk = {
      chunk: 'file1chunk2',
      chunkSequence: Number.MAX_SAFE_INTEGER,
      endOfFile: false,
    };
    const mockFileResultnew: thirdPartyCloudStorage.FileResult = {
      fileChunk: mockFileLastChunk,
      fileType: 'mockFileType',
      fileIndex: 1,
      isLastFile: true,
      fileName: 'TestFile',
    };

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed

    if (callbackused) {
      callbackused(mockFileResultnew);

      // creating 5 file, each having 3 chunks
      for (let i = 0; i < 5; i++) {
        if (i == 4) {
          callbackused(mockLastFileResult);
        } else {
          mockFileResults.forEach((mockFileResult) => {
            callbackused(mockFileResult);
          });
        }
      }
    }
    expect(mockCallback).toHaveBeenCalled();
    expect(mockCallback).toBeCalledWith([], {
      errorCode: ErrorCode.INTERNAL_ERROR,
      message: 'error occurred while receiving data',
    });
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback without error [single file]', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      // now send last chunk
      const mockFileChunk: thirdPartyCloudStorage.FileChunk = {
        chunk: 'filechunk2',
        chunkSequence: 1,
        endOfFile: true,
      };

      const mockLastFileResult: thirdPartyCloudStorage.FileResult = {
        fileChunk: mockFileChunk,
        fileType: 'mockfiletype',
        fileIndex: 1,
        isLastFile: true,
        fileName: 'TestFile',
      };
      callbackused(mockLastFileResult);
    }

    expect(mockCallback).toHaveBeenCalled();
    const receivedArray = mockCallback.mock.calls[0][0];
    expect(receivedArray).toHaveLength(1);
    receivedArray.forEach((file) => {
      expect(file.type).toBe('mockfiletype');
      expect(file.name).toBe('TestFile');
    });
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback with an error', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });

    jest.spyOn(decodeAttachmentModule, 'decodeAttachment').mockImplementation(() => {
      throw new Error('Mocked error from decodeAttachment');
    });

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      callbackused(mockLastFileResult);
    }

    expect(mockCallback).toBeCalledWith([], {
      errorCode: ErrorCode.INTERNAL_ERROR,
      message: new Error('Mocked error from decodeAttachment'),
    });
  });

  it('should call handleGetDragAndDropFilesCallbackRequest and the callback with error', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });
    const mockFileChunk: thirdPartyCloudStorage.FileChunk = {
      chunk: '',
      chunkSequence: 0,
      endOfFile: false,
    };
    const mockFileResult: thirdPartyCloudStorage.FileResult = {
      fileChunk: mockFileChunk,
      fileType: 'mockFileType',
      error: {
        errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM,
      },
      fileIndex: 0,
      isLastFile: false,
      fileName: 'TestFile',
    };

    const sendMessageToParentSpy = jest.spyOn(communicationModule, 'sendMessageToParent');
    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    expect(sendMessageToParentSpy).toHaveBeenCalled();
    const callbackused = sendMessageToParentSpy.mock.calls[0][2]; // calling the callback which was passed
    if (callbackused) {
      callbackused(mockFileResult);
    }

    expect(mockCallback).toHaveBeenCalledWith([], mockFileResult.error);
  });

  it('should throw error when getDragAndDropFiles is called twice', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });

    thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);

    expect(() => thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback)).toThrowError(
      'getDragAndDropFiles cannot be called twice',
    );
  });

  it('should call the callback with error when callback is null', async () => {
    // eslint-disable-next-line strict-null-checks/all
    expect(() => thirdPartyCloudStorage.getDragAndDropFiles('', null)).toThrowError(
      '[getDragAndDropFiles] Callback cannot be null',
    );
  });

  it('should throw error with error code INVALID_ARGUMENTS when dragAndDropInput not is provided', async () => {
    thirdPartyCloudStorage.getDragAndDropFiles('', (attachments: Blob[], error?: SdkError) => {
      if (error) {
        expect(error).not.toBeNull();
        expect(error).toEqual({ errorCode: ErrorCode.INVALID_ARGUMENTS });
      }
    });
  });

  it('should ensure initialization and call getFilesDragAndDropViaCallback when valid input is provided', async () => {
    await utils.initializeWithContext(FrameContexts.task, HostClientType.android);
    utils.setRuntimeConfig({ apiVersion: 1, supports: { thirdPartyCloudStorage: {} } });
    expect(() => {
      thirdPartyCloudStorage.getDragAndDropFiles('mockDragAndDropInput', mockCallback);
    }).not.toThrowError();
  });
});
