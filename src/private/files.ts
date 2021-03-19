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
    WOPI = 1,
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

  export interface CloudStorageFolderItem {
    id: string;
    lastModifiedTime: string;
    size: number;
    objectUrl: string;
    accessToken?: string;
    title: string;
    isSubdirectory: boolean;
    type: string;
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

  export function getCloudStorageFolderContents(
    folder: CloudStorageFolder | CloudStorageFolderItem,
    providerCode: CloudStorageProviderCode,
    callback: (error: SdkError, items: CloudStorageFolderItem[]) => void,
  ): void {
    if (!folder || !providerCode) {
      throw new Error('[files.getCloudStorageFolderContents] channelId name cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[files.getCloudStorageFolderContents] Callback cannot be null');
    }

    ensureInitialized();
    sendMessageToParent('files.getCloudStorageFolderContents', [folder, providerCode], callback);
  }

  export function openCloudStorageFile(
    file: CloudStorageFolderItem,
    providerCode: CloudStorageProviderCode,
    fileOpenPreference?: FileOpenPreference,
  ): void {
    if (!file || !providerCode) {
      throw new Error('[files.openCloudStorageFile] file/providerCode cannot be null or empty');
    }

    if (file.isSubdirectory) {
      throw new Error('[files.openCloudStorageFile] provider file is a subDirectory');
    }

    ensureInitialized();
    sendMessageToParent('files.openCloudStorageFile', [file, providerCode, fileOpenPreference]);
  }
}
