import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FileOpenPreference, SdkError } from '../public';

/**
 * Namespace to interact with the files specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace files {
  export type CloudStorageProviderCode = 'DROPBOX' | 'BOX' | 'SHAREFILE' | 'GOOGLEDRIVE' | 'EGNYTE';

  export enum CloudStorageProviderType {
    Sharepoint = 0,
    WopiIntegration = 1,
    Google = 2,
  }

  export interface CloudStorageFolder {
    id: string;
    title: string;
    folderId: string;
    providerType: CloudStorageProviderType;
    providerCode: CloudStorageProviderCode;
    ownerDisplayName: string;
    siteUrl?: string;
    serverRelativeUrl?: string;
    libraryType?: string;
    accessType?: string;
  }

  export function getCloudStorageFolders(
    channelId: string,
    callback: (error: SdkError, folders: CloudStorageFolder[]) => void,
  ): void {
    if (!channelId || channelId.length == 0) {
      throw new Error('[files.getCloudStorageFolders] channelId name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.getCloudStorageFolders] Callback cannot be null');
    }

    ensureInitialized();
    sendMessageToParent('files.getCloudStorageFolders', [channelId], callback);
  }

  export function addCloudStorageFolder(
    channelId: string,
    callback: (error: SdkError, isFolderAdded: boolean, folders: CloudStorageFolder[]) => void,
  ): void {
    if (!channelId || channelId.length == 0) {
      throw new Error('[files.addCloudStorageFolder] channelId name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.addCloudStorageFolder] Callback cannot be null');
    }

    ensureInitialized();
    sendMessageToParent('files.addCloudStorageFolder', [channelId], callback);
  }

  export function deleteCloudStorageFolder(
    channelId: string,
    folderToDelete: CloudStorageFolder,
    callback: (error: SdkError, isFolderDeleted: boolean) => void,
  ): void {
    if (!channelId || !folderToDelete) {
      throw new Error('[files.deleteCloudStorageFolder] channelId name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.deleteCloudStorageFolder] Callback cannot be null');
    }

    ensureInitialized();
    sendMessageToParent('files.deleteCloudStorageFolder', [channelId, folderToDelete], callback);
  }
}
