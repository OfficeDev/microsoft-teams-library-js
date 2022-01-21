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
    SharePoint = 'SharePoint',
  }
  interface IWopiThumbnail {
    size: number;
    url: string;
  }

  interface IWopiService {
    name: string;
    description: string;
    thumbnails: IWopiThumbnail[];
  }

  /**
   * @private
   * Hide from docs
   *
   * External third-party cloud storages providers interface
   */
  export interface IExternalProvider extends IWopiService {
    providerType: CloudStorageProviderType;
    providerCode: CloudStorageProvider;
  }

  /**
   * @private
   * Hide from docs
   *
   * Cloud storage provider type enums
   */
  export enum CloudStorageProviderType {
    Sharepoint = 0,
    WopiIntegration,
    Google,
    OneDrive,
    Recent,
    Aggregate,
    FileSystem, // Used for Downloaded files on Desktop
    Search, // Used by P2P files with OSearch
    AllFiles, // Used by P2P files with AllFiles API
    SharedWithMe,
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
   * Files entity user interface
   */
  export interface IFilesEntityUser {
    /**
     * User name.
     */
    displayName: string;
    /**
     * User email.
     */
    email: string;

    /**
     * User MRI.
     */
    mri: string;
  }

  /**
   * @private
   * Hide from docs
   *
   * Special Document Library enum
   */
  export enum SpecialDocumentLibraryType {
    ClassMaterials = 'classMaterials',
  }

  /**
   * @private
   * Hide from docs
   *
   * Document Library Access enum
   */
  export enum DocumentLibraryAccessType {
    Readonly = 'readonly',
  }

  /**
   * @private
   * Hide from docs
   *
   * SharePoint file interface
   */
  export interface ISharePointFile {
    siteId?: string;
    siteUrl: string;
    objectId: string;
    objectUrl: string;
    openInWindowFileUrl: string;
    title: string;
    isFolder: boolean;
    serverRelativeUrl: string;
    lastModifiedByUser: IFilesEntityUser;
    lastModifiedTime: string;
    sentByUser: IFilesEntityUser;
    createdByUser: IFilesEntityUser;
    createdTime: string;
    size: number;
    type: string;
    spItemUrl?: string;
    libraryType?: SpecialDocumentLibraryType;
    accessType?: DocumentLibraryAccessType;
    etag?: string;
    remoteItem?: string;
    listUrl?: string;
  }

  /**
   * @private
   * Hide from docs
   *
   * Download Files interface
   */
  export interface IFileItem {
    /**
     * ID of the file metadata
     */
    objectId?: string;
    /**
     * Path of the file
     */
    path?: string;
    /**
     * Size of the file
     */
    size?: number;
    /**
     * Download status
     */
    status?: string;
    /**
     * Download timestamp
     */
    timestamp: Date | string;
    /**
     * File name
     */
    title: string;
    /**
     * Type of file
     */
    type: string;
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

    if (!channelId || channelId.length === 0) {
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

    if (!channelId || channelId.length === 0) {
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

  /**
   * @private
   * Allow 1st party apps to call this function to get the external
   * third party cloud storage accounts that the tenant supports
   * @param excludeAddedProviders: return a list of support third party
   * cloud storages that hasn't been added yet.
   */
  export function getExternalProviders(
    excludeAddedProviders = false,
    callback: (error: SdkError, providers: IExternalProvider[]) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw new Error('[files.getExternalProviders] Callback cannot be null');
    }

    sendMessageToParent('files.getExternalProviders', [excludeAddedProviders], callback);
  }

  /**
   * @private
   * Allow 1st party apps to call this function to move files
   * among SharePoint and third party cloud storages.
   */
  export function copyMoveFiles(
    selectedFiles: CloudStorageFolderItem[] | ISharePointFile[],
    providerCode: CloudStorageProvider,
    destinationFolder: CloudStorageFolderItem | ISharePointFile,
    destinationProviderCode: CloudStorageProvider,
    isMove = false,
    callback: (error?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!selectedFiles || selectedFiles.length === 0) {
      throw new Error('[files.copyMoveFiles] selectedFiles cannot be null or empty');
    }
    if (!providerCode) {
      throw new Error('[files.copyMoveFiles] providerCode cannot be null or empty');
    }
    if (!destinationFolder) {
      throw new Error('[files.copyMoveFiles] destinationFolder cannot be null or empty');
    }
    if (!destinationProviderCode) {
      throw new Error('[files.copyMoveFiles] destinationProviderCode cannot be null or empty');
    }
    if (!callback) {
      throw new Error('[files.copyMoveFiles] callback cannot be null');
    }
    sendMessageToParent(
      'files.copyMoveFiles',
      [selectedFiles, providerCode, destinationFolder, destinationProviderCode, isMove],
      callback,
    );
  }

  /**
   * @private
   * Hide from docs
   *
   * Gets list of downloads for current user
   * @param callback Callback that will be triggered post downloads load
   */
  export function getFileDownloads(callback: (error: SdkError, files: IFileItem[]) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw new Error('[files.getFileDownloads] Callback cannot be null');
    }

    sendMessageToParent('files.getFileDownloads', [], callback);
  }
}
