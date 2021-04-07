import { files } from '../../src/private/files';
import { Utils } from '../utils';
import { core } from '../../src/public/publicAPIs';

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
    core._initialize(utils.mockWindow);
  });

  afterEach(() => {
    // Reset the object since it's a singleton
    if (core._uninitialize) {
      core._uninitialize();
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
});
