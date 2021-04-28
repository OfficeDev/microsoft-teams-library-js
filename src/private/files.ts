import { sendMessageToParent } from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { FileOpenPreference, FrameContexts, SdkError } from '../public';

/**
 * Namespace to interact with the files specific part of the SDK.
 *
 * @private
 * Hide from docs
 */
export namespace files {
  /**
   * @private
   * Hide from docs
   *
   * Cloud storage providers registered with Microsoft Teams
   */
  export enum CloudStorageProvider {
    Dropbox = 'DROPBOX',
    Box = 'BOX',
    Sharefile = 'SHAREFILE',
    GoogleDrive = 'GOOGLEDRIVE',
    Egnyte = 'EGNYTE',
  }

  /**
   * @private
   * Hide from docs
   *
   * Cloud storage provider integration type
   */
  export enum CloudStorageProviderType {
    Sharepoint = 0,
    WopiIntegration = 1,
    Google = 2,
  }

  /**
   * @private
   * Hide from docs
   *
   * Cloud storage folder interface
   */
  export interface CloudStorageFolder {
    /**
     * ID of the cloud storage folder
     */
    id: string;
    /**
     * Display Name/Title of the cloud storage folder
     */
    title: string;
    /**
     * ID of the cloud storage folder in the provider
     */
    folderId: string;
    /**
     * Type of the cloud storage folder provider integration
     */
    providerType: CloudStorageProviderType;
    /**
     * Code of the supported cloud storage folder provider
     */
    providerCode: CloudStorageProvider;
    /**
     * Display name of the owner of the cloud storage folder provider
     */
    ownerDisplayName: string;
    /**
     * Sharepoint specific siteURL of the folder
     */
    siteUrl?: string;
    /**
     * Sharepoint specific serverRelativeUrl of the folder
     */
    serverRelativeUrl?: string;
    /**
     * Sharepoint specific libraryType of the folder
     */
    libraryType?: string;
    /**
     * Sharepoint specific accessType of the folder
     */
    accessType?: string;
  }

  /**
   * @private
   * Hide from docs
   *
   * Cloud storage item interface
   */
  export interface CloudStorageFolderItem {
    /**
     * ID of the item in the provider
     */
    id: string;
    /**
     * Display name/title
     */
    title: string;
    /**
     * Key to differentiate files and subdirectory
     */
    isSubdirectory: boolean;
    /**
     * File extension
     */
    type: string;
    /**
     * Last modifed time of the item
     */
    lastModifiedTime: string;
    /**
     * Display size of the items in bytes
     */
    size: number;
    /**
     * URL of the file
     */
    objectUrl: string;
    /**
     * Temporary access token for the item
     */
    accessToken?: string;
  }
  /**
   * @private
   * Hide from docs
   *
   * Gets a list of cloud storage folders added to the channel
   * @param channelId ID of the channel whose cloud storage folders should be retrieved
   * @param callback Callback that will be triggered post folders load
   */
  export function getCloudStorageFolders(
    channelId: string,
    callback: (error: SdkError, folders: CloudStorageFolder[]) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!channelId || channelId.length == 0) {
      throw new Error('[files.getCloudStorageFolders] channelId name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.getCloudStorageFolders] Callback cannot be null');
    }

    sendMessageToParent('files.getCloudStorageFolders', [channelId], callback);
  }

  /**
   * @private
   * Hide from docs
   *
   * Initiates the add cloud storage folder flow
   * @param channelId ID of the channel to add cloud storage folder
   * @param callback Callback that will be triggered post add folder flow is compelete
   */
  export function addCloudStorageFolder(
    channelId: string,
    callback: (error: SdkError, isFolderAdded: boolean, folders: CloudStorageFolder[]) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!channelId || channelId.length == 0) {
      throw new Error('[files.addCloudStorageFolder] channelId name cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.addCloudStorageFolder] Callback cannot be null');
    }

    sendMessageToParent('files.addCloudStorageFolder', [channelId], callback);
  }

  /**
   * @private
   * Hide from docs
   *
   * Deletes a cloud storage folder from channel
   * @param channelId ID of the channel where folder is to be deleted
   * @param folderToDelete cloud storage folder to be deleted
   * @param callback Callback that will be triggered post delete
   */
  export function deleteCloudStorageFolder(
    channelId: string,
    folderToDelete: CloudStorageFolder,
    callback: (error: SdkError, isFolderDeleted: boolean) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!channelId) {
      throw new Error('[files.deleteCloudStorageFolder] channelId name cannot be null or empty');
    }
    if (!folderToDelete) {
      throw new Error('[files.deleteCloudStorageFolder] folderToDelete cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.deleteCloudStorageFolder] Callback cannot be null');
    }

    sendMessageToParent('files.deleteCloudStorageFolder', [channelId, folderToDelete], callback);
  }

  /**
   * @private
   * Hide from docs
   *
   * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
   * @param folder Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
   * @param providerCode Code of the cloud storage folder provider
   * @param callback Callback that will be triggered post contents are loaded
   */
  export function getCloudStorageFolderContents(
    folder: CloudStorageFolder | CloudStorageFolderItem,
    providerCode: CloudStorageProvider,
    callback: (error: SdkError, items: CloudStorageFolderItem[]) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!folder || !providerCode) {
      throw new Error('[files.getCloudStorageFolderContents] folder/providerCode name cannot be null or empty');
    }

    if (!callback) {
      throw new Error('[files.getCloudStorageFolderContents] Callback cannot be null');
    }

    if ('isSubdirectory' in folder && !folder.isSubdirectory) {
      throw new Error('[files.getCloudStorageFolderContents] provided folder is not a subDirectory');
    }

    sendMessageToParent('files.getCloudStorageFolderContents', [folder, providerCode], callback);
  }

  /**
   * @private
   * Hide from docs
   *
   * Open a cloud storage file in teams
   * @param file cloud storage file that should be opened
   * @param providerCode Code of the cloud storage folder provider
   * @param fileOpenPreference Whether file should be opened in web/inline
   */
  export function openCloudStorageFile(
    file: CloudStorageFolderItem,
    providerCode: CloudStorageProvider,
    fileOpenPreference?: FileOpenPreference.Web | FileOpenPreference.Inline,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!file || !providerCode) {
      throw new Error('[files.openCloudStorageFile] file/providerCode cannot be null or empty');
    }

    if (file.isSubdirectory) {
      throw new Error('[files.openCloudStorageFile] provided file is a subDirectory');
    }

    sendMessageToParent('files.openCloudStorageFile', [file, providerCode, fileOpenPreference]);
  }
}
