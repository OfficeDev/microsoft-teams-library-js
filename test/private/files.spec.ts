import { files } from '../../src/private/files';
import { Utils } from '../utils';
import { _initialize, _uninitialize } from '../../src/public/publicAPIs';
import { FileOpenPreference } from '../../src/public';

describe('files', () => {
  const utils = new Utils();
  const emptyCallback = () => {};

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
      _uninitialize();
    }
  });

  describe('getCloudStorageFolders', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.getCloudStorageFolders('channelId', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.getCloudStorageFolders('channelId', emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null channelId', () => {
      utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolders(null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolders('channelId', null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');
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
    it('should not allow calls before initialization', () => {
      expect(() => files.addCloudStorageFolder('channelId', emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.addCloudStorageFolder('channelId', emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null channelId', () => {
      utils.initializeWithContext('content');
      expect(() => files.addCloudStorageFolder(null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => files.addCloudStorageFolder('channelId', null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');
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

    it('should not allow calls before initialization', () => {
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null channelId', () => {
      utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder(null, mockCloudStorageFolder, emptyCallback)).toThrowError();
    });

    it('should not allow calls with null folderToDelete', () => {
      utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder('channelId', null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => files.deleteCloudStorageFolder('channelId', mockCloudStorageFolder, null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');

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

    const mockCloudStorageFolderItems: files.CloudStorageFolderItem[] = [{
      id: 'test2',
      title: 'test2.pptx',
      isSubdirectory: false,
      type: '.pptx',
      size: 100,
      objectUrl: 'https://api.com/test2.pptx',
      lastModifiedTime: '2021-04-14T15:08:35Z'
    }, {
      id: 'test3',
      title: 'test3.pptx',
      isSubdirectory: false,
      type: '.pptx',
      size: 100,
      objectUrl: 'https://api.com/test3.pptx',
      lastModifiedTime: '2021-04-14T15:08:35Z'
    }];

    it('should not allow calls before initialization', () => {
      expect(() => files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with null folder', () => {
      utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolderContents(null, files.CloudStorageProvider.Box, emptyCallback)).toThrowError();
    });

    it('should not allow calls for a file item', () => {
      utils.initializeWithContext('content');
      const mockFileItem = mockCloudStorageFolderItems[0];
      expect(() => files.getCloudStorageFolderContents(mockFileItem, files.CloudStorageProvider.Box, emptyCallback)).toThrowError();
    });

    it('should not allow calls without providerCode', () => {
      utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolderContents(mockCloudStorageFolder, null, emptyCallback)).toThrowError();
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => files.getCloudStorageFolderContents(mockCloudStorageFolder, files.CloudStorageProvider.Box, null)).toThrowError();
    });

    it('should trigger callback correctly for cloud storage folder', () => {
      utils.initializeWithContext('content');

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

    it('should trigger callback correctly for cloud storage item', () => {
      utils.initializeWithContext('content');

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
        lastModifiedTime: '2021-04-14T15:08:35Z'
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
      lastModifiedTime: '2021-04-14T15:08:35Z'
    };

    it('should not allow calls before initialization', () => {
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls without file', () => {
      utils.initializeWithContext('content');
      expect(() => files.openCloudStorageFile(null, files.CloudStorageProvider.Box)).toThrowError();
    });

    it('should not allow calls without providerCode', () => {
      utils.initializeWithContext('content');
      expect(() => files.openCloudStorageFile(mockCloudStorageFolderItem, null)).toThrowError();
    });

    it('should not allow calls for folder items', () => {
      utils.initializeWithContext('content');
      const mockFolderCloudStorageItem: files.CloudStorageFolderItem = {
        id: 'test1',
        title: 'test',
        isSubdirectory: true,
        type: '',
        size: 100,
        objectUrl: 'https://api.com/test',
        lastModifiedTime: '2021-04-14T15:08:35Z'
      };

      expect(() => files.openCloudStorageFile(mockFolderCloudStorageItem, files.CloudStorageProvider.Box)).toThrowError();
    });

    it('should send the message to parent if file is provided correctly', () => {
      utils.initializeWithContext('content');

      files.openCloudStorageFile(mockCloudStorageFolderItem, files.CloudStorageProvider.Box, FileOpenPreference.Inline);

      const openCloudStorageFileMessage = utils.findMessageByFunc('files.openCloudStorageFile');
      expect(openCloudStorageFileMessage).not.toBeNull();
      expect(openCloudStorageFileMessage.args).toEqual([mockCloudStorageFolderItem, files.CloudStorageProvider.Box, FileOpenPreference.Inline]);
    });
  });

  describe("getExternalProviders", () => {
    it("should trigger callback correctly", () => {
      utils.initializeWithContext("content");
      const mockExternalProviders: files.IExternalProvider[] = [
        {
          name: "google",
          description: "google storage",
          thumbnails: [{
            size: 32,
            url: "string"
          }],
          providerType: files.CloudStorageProviderType.Google,
          providerCode: files.CloudStorageProvider.GoogleDrive
        }
      ];

      const callback = jest.fn((err, providers) => {
        expect(err).toBeFalsy();
        expect(providers).toEqual(mockExternalProviders);
      });

      files.getExternalProviders(false, callback);

      const getExternalProviders = utils.findMessageByFunc("files.getExternalProviders");
      expect(getExternalProviders).not.toBeNull();
      utils.respondToMessage(getExternalProviders, false, mockExternalProviders);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe("copyMoveFiles", () => {
    const mockSelectedFiles: files.CloudStorageFolderItem[] = [
      {
        id: "123",
        lastModifiedTime: "2021-04-14T15:08:35Z",
        size: 32,
        objectUrl: "abc.com",
        title: "file",
        isSubdirectory: false,
        type: "type"
      }
    ];

    const mockDestinationFolder: files.CloudStorageFolderItem = {
        id: "123",
        lastModifiedTime: "2021-04-14T15:08:35Z",
        size: 32,
        objectUrl: "abc.com",
        title: "file",
        isSubdirectory: false,
        type: "type"
    };

    const mockProviderCode = files.CloudStorageProvider.Dropbox;
    const destinationProviderCode = files.CloudStorageProvider.GoogleDrive;

    it("should not allow calls before initialization", () => {
      expect(() => files.copyMoveFiles(mockSelectedFiles, mockProviderCode, mockDestinationFolder, destinationProviderCode, false, emptyCallback)).toThrowError("The library has not yet been initialized");
    });

    it("should trigger callback correctly", () => {
      utils.initializeWithContext("content");

      const callback = jest.fn((err) => {
        expect(err).toBeFalsy();
      });

      files.copyMoveFiles(mockSelectedFiles, mockProviderCode, mockDestinationFolder, destinationProviderCode, false, callback);
      const copyMoveFilesMessage = utils.findMessageByFunc("files.copyMoveFiles");
      expect(copyMoveFilesMessage).not.toBeNull();
      utils.respondToMessage(copyMoveFilesMessage, false);
      expect(callback).toHaveBeenCalled();
    });
  });

  describe('getFileDownloads', () => {
    it('should not allow calls before initialization', () => {
      expect(() => files.getFileDownloads(emptyCallback)).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.getFileDownloads(emptyCallback)).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should not allow calls with empty callback', () => {
      utils.initializeWithContext('content');
      expect(() => files.getFileDownloads(null)).toThrowError();
    });

    it('should trigger callback correctly', () => {
      utils.initializeWithContext('content');
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
      expect(() => files.openDownloadFolder()).toThrowError(
        'The library has not yet been initialized',
      );
    });

    it('should not allow calls without frame context initialization', () => {
      utils.initializeWithContext('settings');
      expect(() => files.openDownloadFolder()).toThrowError(
        "This call is not allowed in the 'settings' context",
      );
    });

    it('should send the message to parent correctly', () => {
      utils.initializeWithContext('content');

      files.openDownloadFolder();

      const openDownloadFolderMessage = utils.findMessageByFunc('files.openDownloadFolder');
      expect(openDownloadFolderMessage).not.toBeNull();
      expect(openDownloadFolderMessage.args).toEqual([]);
    });
  });

});
