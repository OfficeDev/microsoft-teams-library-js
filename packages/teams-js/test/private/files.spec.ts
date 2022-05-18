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

  describe('add3PCloudStorageProvider', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.add3PCloudStorageProvider(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.add3PCloudStorageProvider(null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.add3PCloudStorageProvider(emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.add3PCloudStorageProvider(callback);

      const add3PCloudStorageProviderMessage = utils.findMessageByFunc('files.add3PCloudStorageProvider');
      expect(add3PCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(add3PCloudStorageProviderMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('remove3PCloudStorageProvider', () => {
    const logoutRequest: files.I3PCloudStorageProviderRequest<files.I3PCloudStorageProviderLogoutRequestContentType> = {
      content: {
        action: files.CloudStorageProviderFileAction.Logout,
        providerCode: files.CloudStorageProvider.Box
      }
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.remove3PCloudStorageProvider(logoutRequest, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.remove3PCloudStorageProvider(logoutRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.remove3PCloudStorageProvider(logoutRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.remove3PCloudStorageProvider(logoutRequest, callback);

      const remove3PCloudStorageProviderMessage = utils.findMessageByFunc('files.remove3PCloudStorageProvider');
      expect(remove3PCloudStorageProviderMessage).not.toBeNull();
      utils.respondToMessage(remove3PCloudStorageProviderMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('add3PCloudStorageProviderFile', () => {
    const addNewFileRequest: files.I3PCloudStorageProviderRequest<files.I3PCloudStorageProviderNewFileRequestContentType> = {
      content: {
        action: files.CloudStorageProviderFileAction.New,
        providerCode: files.CloudStorageProvider.Box,
        newFileName: 'testFile',
        newFileType: 'pdf',
      }
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.add3PCloudStorageProviderFile(addNewFileRequest, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.add3PCloudStorageProviderFile(addNewFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.add3PCloudStorageProviderFile(addNewFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.add3PCloudStorageProviderFile(addNewFileRequest, callback);

      const add3PCloudStorageProviderFileMessage = utils.findMessageByFunc('files.add3PCloudStorageProviderFile');
      expect(add3PCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(add3PCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });
  
  describe('rename3PCloudStorageProviderFile', () => {
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
    const renameFileRequest: files.I3PCloudStorageProviderRequest<files.I3PCloudStorageProviderRenameFileRequestContentType> = {
      content: {
        action: files.CloudStorageProviderFileAction.Rename,
        providerCode: files.CloudStorageProvider.Box,
        existingFile: mockExistingFile,
        newFile: mockNewFile,
      }
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.rename3PCloudStorageProviderFile(renameFileRequest, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.rename3PCloudStorageProviderFile(renameFileRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.rename3PCloudStorageProviderFile(renameFileRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.rename3PCloudStorageProviderFile(renameFileRequest, callback);

      const rename3PCloudStorageProviderFileMessage = utils.findMessageByFunc('files.rename3PCloudStorageProviderFile');
      expect(rename3PCloudStorageProviderFileMessage).not.toBeNull();
      utils.respondToMessage(rename3PCloudStorageProviderFileMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('perform3PCloudStorageProviderFileAction', () => {
    const mockItem: files.CloudStorageFolderItem = {
      id: '111',
      lastModifiedTime: '2021-04-14T15:08:35Z',
      size: 32,
      objectUrl: 'abc.com',
      title: 'file1',
      isSubdirectory: false,
      type: 'pdf',
    };
    
    const cloudStorageProviderFileActionRequest: files.I3PCloudStorageProviderRequest<files.I3PCloudStorageProviderActionRequestContentType> = {
      content: {
        action: files.CloudStorageProviderFileAction.Upload,
        providerCode: files.CloudStorageProvider.Box,
        itemList: [mockItem],
      }
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.perform3PCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls with empty callback', async () => {
      await utils.initializeWithContext('content');
      expect(() => files.perform3PCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, null)).toThrowError();
    });

    it('should not allow calls without frame context initialization', async () => {
      await utils.initializeWithContext('settings');
      expect(() => files.perform3PCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, emptyCallback)).toThrowError(
        'This call is only allowed in following contexts: ["content"]. Current context: "settings"',
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      const callback = jest.fn(err => {
        expect(err).toBeFalsy();
      });

      files.perform3PCloudStorageProviderFileAction(cloudStorageProviderFileActionRequest, callback);

      const perform3PCloudStorageProviderFileActionMessage = utils.findMessageByFunc('files.perform3PCloudStorageProviderFileAction');
      expect(perform3PCloudStorageProviderFileActionMessage).not.toBeNull();
      utils.respondToMessage(perform3PCloudStorageProviderFileActionMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });
});
