import { files } from '../../src/private/files';
import { FileOpenPreference, ErrorCode } from '../../src/public';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { _minRuntimeConfigToUninitialize } from '../../src/public/runtime';
import { Utils } from '../utils';

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
    _initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (_uninitialize) {
      utils.setRuntimeConfig(_minRuntimeConfigToUninitialize);
      _uninitialize();
    }
  });

  describe('getCloudStorageFolders', () => {
    it('should not allow calls before initialization', async () => {
      await expect(() => files.getCloudStorageFolders('channelId', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
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
        'The library has not yet been initialized',
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
        'The library has not yet been initialized',
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
      ).toThrowError('The library has not yet been initialized');
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
        'The library has not yet been initialized',
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
      ).toThrowError('The library has not yet been initialized');
    });

    it('should trigger callback correctly', async () => {
      await utils.initializeWithContext('content');

      const callback = jest.fn(err => {
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
      expect(() => files.getFileDownloads(emptyCallback)).toThrowError('The library has not yet been initialized');
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
      expect(() => files.openDownloadFolder(null, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
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
    it('should send the message to parent correctly with file path as null', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.openDownloadFolder(null, callback);

      const openDownloadFolderMessage = utils.findMessageByFunc('files.openDownloadFolder');
      expect(openDownloadFolderMessage).not.toBeNull();
      utils.respondToMessage(openDownloadFolderMessage, false);
      expect(callback).toHaveBeenCalled();
    });

    // non-null file path value is interpreted as opening containing folder for the given file path
    it('should send the message to parent correctly with non-null file path', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
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
      expect(() => files.addCloudStorageProvider(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
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

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.addCloudStorageProvider(callback);

      const addCloudStorageProviderMessage = utils.findMessageByFunc('files.addCloudStorageProvider');
      expect(addCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(addCloudStorageProviderMessage, false);
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
        'The library has not yet been initialized',
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

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
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
    const addNewFileRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderNewFileContent> = {
      content: {
        providerCode: files.CloudStorageProvider.Box,
        newFileName: 'testFile',
        newFileExtension: 'docx',
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.addCloudStorageProviderFile(addNewFileRequest, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
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

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
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
        'The library has not yet been initialized',
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

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.renameCloudStorageProviderFile(renameFileRequest, callback);

      const renameCloudStorageProviderFileMessage = utils.findMessageByFunc('files.renameCloudStorageProviderFile');
      expect(renameCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(renameCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('performCloudStorageProviderFileAction', () => {
    const mockItem: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'abc.com',
      title: 'file1',
      isSubdirectory: false,
      type: 'pdf',
    };

    const cloudStorageProviderFileActionRequest: files.CloudStorageProviderRequest<files.CloudStorageProviderActionContent> = {
      content: {
        action: files.CloudStorageProviderFileAction.Upload,
        providerCode: files.CloudStorageProvider.Box,
        itemList: [mockItem],
      },
    };

    it('should not allow calls before initialization', () => {
      expect(() =>
        files.performCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, emptyCallback),
      ).toThrowError('The library has not yet been initialized');
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() =>
        files.performCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, null),
      ).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() =>
        files.performCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, emptyCallback),
      ).toThrowError('This call is only allowed in following contexts: ["content"]. Current context: "settings"');
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.performCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, callback);

      const performCloudStorageProviderFileActionMessage = utils.findMessageByFunc(
        'files.performCloudStorageProviderFileAction',
      );
      expect(performCloudStorageProviderFileActionMessage).not.toBeNull();
      utils.respondToMessage(performCloudStorageProviderFileActionMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });
});
