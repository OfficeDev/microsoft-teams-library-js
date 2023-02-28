import { errorLibraryNotInitialized } from '../../src/internal/constants';
import { files } from '../../src/private/files';
import { app, ErrorCode, FileOpenPreference, SdkError } from '../../src/public';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

/* eslint-disable */
/* As part of enabling eslint on test files, we need to disable eslint checking on the specific files with
   large numbers of errors. Then, over time, we can fix the errors and reenable eslint on a per file basis. */

describe('files', () => {
  const utils = new Utils();
  const emptyCallback = (): void => {
    return;
  };

  beforeEach(() => {
    utils.processMessage = null;
    utils.messages = [];
    utils.childMessages = [];
    utils.childWindow.closed = false;
    utils.mockWindow.parent = utils.parentWindow;

    // Set a mock window for testing
    app._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (app._uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      app._uninitialize();
    }
  });

  describe('getCloudStorageFolders', () => {
    it('should not allow calls before initialization', async () => {
      await expect(() => files.getCloudStorageFolders('channelId', emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.getCloudStorageFolders('channelId', emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls with null channelId', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolders(null, emptyCallback)).toThrowError(
        '[files.getCloudStorageFolders] channelId name cannot be null or empty',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolders('channelId', null)).toThrowError();
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');
      const mockCloudStorageFolders: files.CloudStorageFolder[] = [
        {
          id: 'id',
          title: 'folder title',
          folderId: 'folderId',
          providerType: files.CloudStorageProviderType.WopiIntegration,
          providerCode: files.CloudStorageProvider.Box,
          ownerDisplayName: 'owner',
        },
      ];

      const callback = jest.fn((err, folders) => {
        expect(err).toBeFalsy();
        expect(folders).toEqual(mockCloudStorageFolders);
      });

      files.getCloudStorageFolders('channelId', callback);

      const getCloudStorageFoldersMessage = utils.findMessageByFunc('files.getCloudStorageFolders');
      expect(getCloudStorageFoldersMessage).not.toBeNull();
      utils.respondToMessage(getCloudStorageFoldersMessage, false, mockCloudStorageFolders);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('addCloudStorageFolder', () => {
    it('should not allow calls before initialization', async () => {
      await expect(() => files.addCloudStorageFolder('channelId', emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await await utils.initializeWithContext('settings');
      expect(() => files.addCloudStorageFolder('channelId', emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls with null channelId', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.addCloudStorageFolder(null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.addCloudStorageFolder('channelId', null)).toThrowError();
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');
      const mockCloudStorageFolders: files.CloudStorageFolder[] = [
        {
          id: 'id',
          title: 'folder title',
          folderId: 'folderId',
          providerType: files.CloudStorageProviderType.WopiIntegration,
          providerCode: files.CloudStorageProvider.Box,
          ownerDisplayName: 'owner',
        },
      ];

      const callback = jest.fn((err, isFolderAdded, folders) => {
        expect(err).toBeFalsy();
        expect(isFolderAdded).toEqual(true);
        expect(folders).toEqual(mockCloudStorageFolders);
      });

      files.addCloudStorageFolder('channelId', callback);

      const addCloudStorageFolderMessage = utils.findMessageByFunc('files.addCloudStorageFolder');
      expect(addCloudStorageFolderMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageFolderMessage, false, true, mockCloudStorageFolders);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('deleteCloudStorageFolder', () => {
    const mockCloudStorageFolder: files.CloudStorageFolder = {
      id: 'id',
      title: 'folder title',
      folderId: 'folderId',
      providerType: files.CloudStorageProviderType.WopiIntegration,
      providerCode: files.CloudStorageProvider.Box,
      ownerDisplayName: 'owner',
    };

    it('should not allow calls before initialization', async () => {
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls with null channelId', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder(null, mockCloudStorageFolder, emptyCallback)).toThrowError();
    });

    it('should not allow calls with null folderToDelete', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder('channelId', null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, null)).toThrowError();
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err, isFolderDeleted) => {
        expect(err).toBeFalsy();
        expect(isFolderDeleted).toEqual(true);
      });

      files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, callback);

      const deleteCloudStorageFolderMessage = utils.findMessageByFunc('files.deleteCloudStorageFolder');
      expect(deleteCloudStorageFolderMessage).not.toBeNull();
      utils.respondToMessage(deleteCloudStorageFolderMessage, false, true);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('getCloudStorageFolderContents', () => {
    const mockCloudStorageFolder: files.CloudStorageFolder = {
      id: 'id',
      title: 'folder title',
      folderId: 'folderId',
      providerType: files.CloudStorageProviderType.WopiIntegration,
      providerCode: files.CloudStorageProvider.Box,
      ownerDisplayName: 'owner',
    };

    const mockCloudStorageFolderItems: files.CloudStorageFolderItem[] = [
      {
        id: 'test2',
        title: 'test2.pptx',
        isSubdirectory: false,
        type: '.pptx',
        size: 100,
        objectUrl: 'https://api.com/test2.pptx',
        lastModifiedTime: '2021-04-14T15:08:35Z',
      },
      {
        id: 'test3',
        title: 'test3.pptx',
        isSubdirectory: false,
        type: '.pptx',
        size: 100,
        objectUrl: 'https://api.com/test3.pptx',
        lastModifiedTime: '2021-04-14T15:08:35Z',
      },
    ];

    it('should not allow calls before initialization', async () => {
      expect(() =>
        files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, emptyCallback),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() =>
        files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, emptyCallback),
      ).toThrowError('This call is only allowed in following contexts: ["content"]. Current context: "settings".');
    });

    it('should not allow calls with null folder', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.getCloudStorageFolderContents(null, files.CloudStorageProvider.Box, emptyCallback),
      ).toThrowError();
    });

    it('should not allow calls for a file item', async () => {
      await utils.initializeWithContext('content');
      const mockFileItem = mockCloudStorageFolderItems[0];
      expect(() =>
        files.getCloudStorageFolderContents(mockFileItem, files.CloudStorageProvider.Box, emptyCallback),
      ).toThrowError();
    });

    it('should not allow calls without providerCode', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolderContents(mockCloudStorageFolder, null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, null),
      ).toThrowError();
    });

    it('should trigger callback correctly for cloud storage folder', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err, contents) => {
        expect(err).toBeFalsy();
        expect(contents).toEqual(mockCloudStorageFolderItems);
      });

      files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, callback);

      const getCloudStorageFolderContentsMessage = utils.findMessageByFunc('files.getCloudStorageFolderContents');
      expect(getCloudStorageFolderContentsMessage).not.toBeNull();
      utils.respondToMessage(getCloudStorageFolderContentsMessage, false, mockCloudStorageFolderItems);
      expect(callback).toHaveBeenCalled();
    });

    it('should trigger callback correctly for cloud storage item', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err, isFolderDeleted) => {
        expect(err).toBeFalsy();
        expect(isFolderDeleted).toEqual(mockCloudStorageFolderItems);
      });

      const mockCloudStorageFolderItem: files.CloudStorageFolderItem = {
        id: 'test1',
        title: 'test',
        isSubdirectory: true,
        type: '',
        size: 100,
        objectUrl: 'https://api.com/test',
        lastModifiedTime: '2021-04-14T15:08:35Z',
      };
      files.getCloudStorageFolderContents(mockCloudStorageFolderItem, files.CloudStorageProvider.Box, callback);

      const getCloudStorageFolderContentsMessage = utils.findMessageByFunc('files.getCloudStorageFolderContents');
      expect(getCloudStorageFolderContentsMessage).not.toBeNull();
      utils.respondToMessage(getCloudStorageFolderContentsMessage, false, mockCloudStorageFolderItems);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('openCloudStorageFile', () => {
    const mockCloudStorageFolderItem: files.CloudStorageFolderItem = {
      id: 'test1',
      title: 'test.pptx',
      isSubdirectory: false,
      type: '.pptx',
      size: 100,
      objectUrl: 'https://api.com/test.pptx',
      lastModifiedTime: '2021-04-14T15:08:35Z',
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings".',
      );
    });

    it('should not allow calls without file', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.openCloudStorageFile(null, files.CloudStorageProvider.Box)).toThrowError();
    });

    it('should not allow calls without providerCode', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, null)).toThrowError();
    });

    it('should not allow calls for folder items', async () => {
      await utils.initializeWithContext('content');
      const mockFolderCloudStorageItem: files.CloudStorageFolderItem = {
        id: 'test1',
        title: 'test',
        isSubdirectory: true,
        type: '',
        size: 100,
        objectUrl: 'https://api.com/test',
        lastModifiedTime: '2021-04-14T15:08:35Z',
      };

      expect(() =>
        files.openCloudStorageFile(mockFolderCloudStorageItem, files.CloudStorageProvider.Box),
      ).toThrowError();
    });

    it('should send the message to parent if file is provided correctly', async () => {
      await utils.initializeWithContext('content');

      files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box, FileOpenPreference.Inline);

      const openCloudStorageFileMessage = utils.findMessageByFunc('files.openCloudStorageFile');
      expect(openCloudStorageFileMessage).not.toBeNull();
      expect(openCloudStorageFileMessage.args).toEqual([
        mockCloudStorageFolderItem,
        files.CloudStorageProvider.Box,
        FileOpenPreference.Inline,
      ]);
    });
  });

  describe('getExternalProviders', () => {
    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');
      const mockExternalProviders: files.IExternalProvider[] = [
        {
          name: 'google',
          description: 'google storage',
          thumbnails: [
            {
              size: 32,
              url: 'string',
            },
          ],
          providerType: files.CloudStorageProviderType.Google,
          providerCode: files.CloudStorageProvider.GoogleDrive,
        },
      ];

      const callback = jest.fn((err, providers) => {
        expect(err).toBeFalsy();
        expect(providers).toEqual(mockExternalProviders);
      });

      files.getExternalProviders(false, callback);

      const getExternalProviders = utils.findMessageByFunc('files.getExternalProviders');
      expect(getExternalProviders).not.toBeNull();
      utils.respondToMessage(getExternalProviders, false, mockExternalProviders);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('copyMoveFiles', () => {
    const mockSelectedFiles: files.CloudStorageFolderItem[] = [
      {
        id: '123',
        lastModifiedTime: '2021-04-14T15:08:35Z',
        size: 32,
        objectUrl: 'abc.com',
        title: 'file',
        isSubdirectory: false,
        type: 'type',
      },
    ];

    const mockDestinationFolder: files.CloudStorageFolderItem = {
      id: '123',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'abc.com',
      title: 'file',
      isSubdirectory: false,
      type: 'type',
    };

    const mockProviderCode = files.CloudStorageProvider.Dropbox;
    const destinationProviderCode = files.CloudStorageProvider.GoogleDrive;

    it('should not allow calls before initialization', () => {
      expect(() =>
        files.copyMoveFiles(
          mockSelectedFiles,
          mockProviderCode,
          mockDestinationFolder,
          destinationProviderCode,
          false,
          emptyCallback,
        ),
      ).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.copyMoveFiles(
        mockSelectedFiles,
        mockProviderCode,
        mockDestinationFolder,
        destinationProviderCode,
        false,
        callback,
      );
      const copyMoveFilesMessage = utils.findMessageByFunc('files.copyMoveFiles');
      expect(copyMoveFilesMessage).not.toBeNull();
      utils.respondToMessage(copyMoveFilesMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('getFileDownloads', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.getFileDownloads(emptyCallback)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.getFileDownloads(emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.getFileDownloads(null)).toThrowError();
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');
      const mockFileDownloads: files.IFileItem[] = [
        {
          timestamp: new Date(),
          title: 'title',
          extension: 'docx',
        },
      ];

      const callback = jest.fn((err, fileList) => {
        expect(err).toBeFalsy();
        expect(fileList).toEqual(mockFileDownloads);
      });

      files.getFileDownloads(callback);

      const getFileDownloadsMessage = utils.findMessageByFunc('files.getFileDownloads');
      expect(getFileDownloadsMessage).not.toBeNull();
      utils.respondToMessage(getFileDownloadsMessage, false, mockFileDownloads);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('openDownloadFolder', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.openDownloadFolder(null, emptyCallback)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.openDownloadFolder(null, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.openDownloadFolder(null, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    // null file path value is interpreted as opening cofigured download preference folder
    it('should send the message to parent correctly with file path as null', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.openDownloadFolder(null, callback);

      const openDownloadFolderMessage = utils.findMessageByFunc('files.openDownloadFolder');
      expect(openDownloadFolderMessage).not.toBeNull();
      utils.respondToMessage(openDownloadFolderMessage, false);
      expect(callback).toHaveBeenCalled();
    });

    // non-null file path value is interpreted as opening containing folder for the given file path
    it('should send the message to parent correctly with non-null file path', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.openDownloadFolder('fileObjectId', callback);

      const openDownloadFolderMessage = utils.findMessageByFunc('files.openDownloadFolder');
      expect(openDownloadFolderMessage).not.toBeNull();
      utils.respondToMessage(openDownloadFolderMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('addCloudStorageProvider', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.addCloudStorageProvider(emptyCallback)).toThrowError(new Error(errorLibraryNotInitialized));
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.addCloudStorageProvider(null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.addCloudStorageProvider(emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err, provider) => {
        expect(err).toBeFalsy();
        expect(provider).toEqual(files.CloudStorageProvider.Dropbox);
      });

      files.addCloudStorageProvider(callback);

      const addCloudStorageProviderMessage = utils.findMessageByFunc('files.addCloudStorageProvider');
      expect(addCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageProviderMessage, false, files.CloudStorageProvider.Dropbox);
      expect(callback).toHaveBeenCalled();
    });

    it('should send the message to parent correctly and handle error scenario', async () => {
      await utils.initializeWithContext('content');

      const sdkError: SdkError = {
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Error Message',
      };

      const callback = jest.fn((err) => {
        expect(err).toEqual(sdkError);
      });

      files.addCloudStorageProvider(callback);

      const addCloudStorageProviderMessage = utils.findMessageByFunc('files.addCloudStorageProvider');
      expect(addCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageProviderMessage, sdkError);
      expect(callback).toHaveBeenCalled();
    });

    it('should send the message to parent correctly, handle error scenario and validate provider value', async () => {
      await utils.initializeWithContext('content');

      const sdkError: SdkError = {
        errorCode: ErrorCode.INTERNAL_ERROR,
        message: 'Error Message',
      };

      const callback = jest.fn((err, provider) => {
        expect(err).toEqual(sdkError);
        expect(provider).toEqual(undefined);
      });

      files.addCloudStorageProvider(callback);

      const addCloudStorageProviderMessage = utils.findMessageByFunc('files.addCloudStorageProvider');
      expect(addCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageProviderMessage, sdkError, undefined);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('removeCloudStorageProvider', () => {
    const logoutRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.removeCloudStorageProvider(logoutRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.removeCloudStorageProvider(logoutRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.removeCloudStorageProvider(logoutRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.removeCloudStorageProvider(logoutRequest, callback);

      const removeCloudStorageProviderMessage = utils.findMessageByFunc('files.removeCloudStorageProvider');
      expect(removeCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(removeCloudStorageProviderMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('addCloudStorageProviderFile', () => {
    const mockDestinationFolder: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 0,
      objectUrl: 'folder1',
      title: 'folder1',
      isSubdirectory: true,
      type: 'folder',
    };
    const addNewFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderNewFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        newFileName: 'testFile',
        newFileExtension: 'docx',
        destinationFolder: mockDestinationFolder,
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.addCloudStorageProviderFile(addNewFileRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.addCloudStorageProviderFile(addNewFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.addCloudStorageProviderFile(addNewFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.addCloudStorageProviderFile(addNewFileRequest, callback);

      const addCloudStorageProviderFileMessage = utils.findMessageByFunc('files.addCloudStorageProviderFile');
      expect(addCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('renameCloudStorageProviderFile', () => {
    const mockExistingFile: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'file1.com',
      title: 'file1',
      isSubdirectory: false,
      type: 'pdf',
    };
    const mockNewFile: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'file2.com',
      title: 'file2',
      isSubdirectory: false,
      type: 'pdf',
    };
    const renameFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderRenameFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        existingFile: mockExistingFile,
        newFile: mockNewFile,
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.renameCloudStorageProviderFile(renameFileRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.renameCloudStorageProviderFile(renameFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.renameCloudStorageProviderFile(renameFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.renameCloudStorageProviderFile(renameFileRequest, callback);

      const renameCloudStorageProviderFileMessage = utils.findMessageByFunc('files.renameCloudStorageProviderFile');
      expect(renameCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(renameCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('deleteCloudStorageProviderFile', () => {
    const mockDeleteFile: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'file1.com',
      title: 'file1',
      isSubdirectory: false,
      type: 'pdf',
    };
    const mockDeleteFolder: files.CloudStorageFolderItem = {
      id: '112',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'folder1.com',
      title: 'folder1',
      isSubdirectory: true,
      type: 'folder',
    };
    const deleteFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderDeleteFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        itemList: [mockDeleteFile],
      },
    };

    const deleteFolderRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderDeleteFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        itemList: [mockDeleteFolder],
      },
    };

    const deleteFileRequestWithNullContent: files.CloudStorageProviderRequest<files.CloudStorageProviderDeleteFileContent> =
      {
        content: null,
      };

    const deleteFileRequestWithEmptyItemList: files.CloudStorageProviderRequest<files.CloudStorageProviderDeleteFileContent> =
      {
        content: {
          providerCode: files.CloudStorageProvider.Box,
          itemList: [],
        },
      };

    it('should not allow calls before initialization', () => {
      expect(() => files.deleteCloudStorageProviderFile(deleteFileRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageProviderFile(deleteFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.deleteCloudStorageProviderFile(deleteFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should not allow calls with null request', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageProviderFile(null, emptyCallback)).toThrowError(
        '[files.deleteCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with null request content', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageProviderFile(deleteFileRequestWithNullContent, emptyCallback)).toThrowError(
        '[files.deleteCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with empty itemList in request content', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.deleteCloudStorageProviderFile(deleteFileRequestWithEmptyItemList, emptyCallback),
      ).toThrowError(
        '[files.deleteCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.deleteCloudStorageProviderFile(deleteFileRequest, callback);

      const deleteCloudStorageProviderFileMessage = utils.findMessageByFunc('files.deleteCloudStorageProviderFile');
      expect(deleteCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(deleteCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('downloadCloudStorageProviderFile', () => {
    const mockDownloadFile: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'file1.com',
      title: 'file1',
      isSubdirectory: false,
      type: 'pdf',
    };
    const downloadFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderDownloadFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        itemList: [mockDownloadFile],
      },
    };
    const downloadFileRequestWithNullContent: files.CloudStorageProviderRequest<files.CloudStorageProviderDownloadFileContent> =
      {
        content: null,
      };
    const downloadFileRequestWithEmptyItemList: files.CloudStorageProviderRequest<files.CloudStorageProviderDownloadFileContent> =
      {
        content: {
          providerCode: files.CloudStorageProvider.Box,
          itemList: [],
        },
      };

    it('should not allow calls before initialization', () => {
      expect(() => files.downloadCloudStorageProviderFile(downloadFileRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.downloadCloudStorageProviderFile(downloadFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.downloadCloudStorageProviderFile(downloadFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should not allow calls with null request', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.downloadCloudStorageProviderFile(null, emptyCallback)).toThrowError(
        '[files.downloadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with null request content', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.downloadCloudStorageProviderFile(downloadFileRequestWithNullContent, emptyCallback),
      ).toThrowError(
        '[files.downloadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with empty itemList in request content', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.downloadCloudStorageProviderFile(downloadFileRequestWithEmptyItemList, emptyCallback),
      ).toThrowError(
        '[files.downloadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.downloadCloudStorageProviderFile(downloadFileRequest, callback);

      const downloadCloudStorageProviderFileMessage = utils.findMessageByFunc('files.downloadCloudStorageProviderFile');
      expect(downloadCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(downloadCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('uploadCloudStorageProviderFile', () => {
    const mockUploadFile: files.File = {
      size: 32,
      type: 'pdf',
      name: 'file1',
      lastModified: 1663767892661,
      text: () => {
        return new Promise<string>(() => 'file text');
      },
      arrayBuffer: () => {
        return new Promise<ArrayBuffer>(() => 'file text');
      },
      slice: () => new Blob(),
      stream: () => new ReadableStream(),
    };
    const userDetails: files.IFilesEntityUser = {
      displayName: 'username',
      email: 'username@email',
      mri: 'mri',
    };
    const mockDestinationFolder: files.CloudStorageFolderItem = {
      id: '112',
      lastModifiedTime: '2021-03-14T15:08:35Z',
      size: 0,
      objectUrl: 'folder1',
      title: 'folder1',
      isSubdirectory: true,
      type: 'folder',
    };
    const uploadFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderUploadFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Dropbox,
        itemList: [mockUploadFile],
        destinationFolder: mockDestinationFolder,
      },
    };
    const uploadFileRequestWithNullContent: files.CloudStorageProviderRequest<files.CloudStorageProviderUploadFileContent> =
      {
        content: null,
      };
    const uploadFileRequestWithEmptyItemList: files.CloudStorageProviderRequest<files.CloudStorageProviderUploadFileContent> =
      {
        content: {
          providerCode: files.CloudStorageProvider.Dropbox,
          itemList: [],
          destinationFolder: mockDestinationFolder,
        },
      };
    const uploadFileRequestWithNullDestinationFolder: files.CloudStorageProviderRequest<files.CloudStorageProviderUploadFileContent> =
      {
        content: {
          providerCode: files.CloudStorageProvider.Dropbox,
          itemList: [mockUploadFile],
          destinationFolder: null,
        },
      };

    it('should not allow calls before initialization', () => {
      expect(() => files.uploadCloudStorageProviderFile(uploadFileRequest, emptyCallback)).toThrowError(
        new Error(errorLibraryNotInitialized),
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.uploadCloudStorageProviderFile(uploadFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.uploadCloudStorageProviderFile(uploadFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should not allow calls with null request', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.uploadCloudStorageProviderFile(null, emptyCallback)).toThrowError(
        '[files.uploadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with null request content', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.uploadCloudStorageProviderFile(uploadFileRequestWithNullContent, emptyCallback)).toThrowError(
        '[files.uploadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with empty itemList in request content', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.uploadCloudStorageProviderFile(uploadFileRequestWithEmptyItemList, emptyCallback),
      ).toThrowError(
        '[files.uploadCloudStorageProviderFile] 3P cloud storage provider request content details are missing',
      );
    });

    it('should not allow calls with null destinationFolder request content', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.uploadCloudStorageProviderFile(uploadFileRequestWithNullDestinationFolder, emptyCallback),
      ).toThrowError('[files.uploadCloudStorageProviderFile] Invalid destination folder details');
    });

    it('should send the message to parent correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.uploadCloudStorageProviderFile(uploadFileRequest, callback);

      const uploadCloudStorageProviderFileMessage = utils.findMessageByFunc('files.uploadCloudStorageProviderFile');
      expect(uploadCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(uploadCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });
});
