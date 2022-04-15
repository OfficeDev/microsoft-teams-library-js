import {
  sendAndHandleSdkError as sendAndHandleError,
  sendMessageToParent,
  sendMessageToParentAsync,
} from '../internal/communication';
import { ensureInitialized } from '../internal/internalAPIs';
import { callCallbackWithErrorOrResultFromPromiseAndReturnPromise } from '../internal/utils';
import { ErrorCode, FileOpenPreference, FrameContexts, SdkError } from '../public';
import { runtime } from '../public/runtime';
import { FilePreviewParameters } from './interfaces';

/**
 * @hidden
 * Hide from docs
 * ------
 * Namespace to interact with the files specific part of the SDK.
 *
 * @alpha
 */
export namespace files {
  /**
   * @hidden
   * Hide from docs
   * ------
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
   * @hidden
   * Hide from docs
   * ------
   *
   * External third-party cloud storages providers interface
   */
  export interface IExternalProvider extends IWopiService {
    providerType: CloudStorageProviderType;
    providerCode: CloudStorageProvider;
  }

  /**
   * @hidden
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
   * @hidden
   * Hide from docs
   * ------
   * Cloud storage folder interface
   */
  export interface CloudStorageFolder {
    /**
     * @hidden
     * ID of the cloud storage folder
     */
    id: string;
    /**
     * @hidden
     * Display Name/Title of the cloud storage folder
     */
    title: string;
    /**
     * @hidden
     * ID of the cloud storage folder in the provider
     */
    folderId: string;
    /**
     * @hidden
     * Type of the cloud storage folder provider integration
     */
    providerType: CloudStorageProviderType;
    /**
     * @hidden
     * Code of the supported cloud storage folder provider
     */
    providerCode: CloudStorageProvider;
    /**
     * @hidden
     * Display name of the owner of the cloud storage folder provider
     */
    ownerDisplayName: string;
    /**
     * @hidden
     * Sharepoint specific siteURL of the folder
     */
    siteUrl?: string;
    /**
     * @hidden
     * Sharepoint specific serverRelativeUrl of the folder
     */
    serverRelativeUrl?: string;
    /**
     * @hidden
     * Sharepoint specific libraryType of the folder
     */
    libraryType?: string;
    /**
     * @hidden
     * Sharepoint specific accessType of the folder
     */
    accessType?: string;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Cloud storage item interface
   */
  export interface CloudStorageFolderItem {
    /**
     * @hidden
     * ID of the item in the provider
     */
    id: string;
    /**
     * @hidden
     * Display name/title
     */
    title: string;
    /**
     * @hidden
     * Key to differentiate files and subdirectory
     */
    isSubdirectory: boolean;
    /**
     * @hidden
     * File extension
     */
    type: string;
    /**
     * @hidden
     * Last modifed time of the item
     */
    lastModifiedTime: string;
    /**
     * @hidden
     * Display size of the items in bytes
     */
    size: number;
    /**
     * @hidden
     * URL of the file
     */
    objectUrl: string;
    /**
     * @hidden
     * Temporary access token for the item
     */
    accessToken?: string;
  }

  /**
   * @hidden
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
   * @hidden
   * Hide from docs
   *
   * Special Document Library enum
   */
  export enum SpecialDocumentLibraryType {
    ClassMaterials = 'classMaterials',
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Document Library Access enum
   */
  export enum DocumentLibraryAccessType {
    Readonly = 'readonly',
  }

  /**
   * @hidden
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
   * @hidden
   * Hide from docs
   *
   * Download status enum
   */
  export enum FileDownloadStatus {
    Downloaded = 'Downloaded',
    Downloading = 'Downloading',
    Failed = 'Failed',
  }

  /**
   * @hidden
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
     * Size of the file in bytes
     */
    sizeInBytes?: number;
    /**
     * Download status
     */
    status?: FileDownloadStatus;
    /**
     * Download timestamp
     */
    timestamp: Date;
    /**
     * File name
     */
    title: string;
    /**
     * Type of file i.e. the file extension.
     */
    extension: string;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Gets a list of cloud storage folders added to the channel
   *
   * @param channelId - ID of the channel whose cloud storage folders should be retrieved
   */
  export function getCloudStorageFolders(channelId: string): Promise<CloudStorageFolder[]> {
    return new Promise<CloudStorageFolder[]>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }

      if (!channelId || channelId.length === 0) {
        throw new Error('[files.getCloudStorageFolders] channelId name cannot be null or empty');
      }

      resolve(sendAndHandleError('files.getCloudStorageFolders', channelId));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Initiates the add cloud storage folder flow
   * @param channelId - ID of the channel to add cloud storage folder
   */
  export function addCloudStorageFolder(channelId: string): Promise<[boolean, CloudStorageFolder[]]> {
    return new Promise<[SdkError, boolean, CloudStorageFolder[]]>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }

      if (!channelId || channelId.length === 0) {
        throw new Error('[files.addCloudStorageFolder] channelId name cannot be null or empty');
      }

      resolve(sendMessageToParentAsync('files.addCloudStorageFolder', [channelId]));
    }).then(([error, isFolderAdded, folders]: [SdkError, boolean, CloudStorageFolder[]]) => {
      if (error) {
        throw error;
      }
      const result: [boolean, CloudStorageFolder[]] = [isFolderAdded, folders];
      return result;
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Deletes a cloud storage folder from channel
   *
   * @param channelId - ID of the channel where folder is to be deleted
   * @param folderToDelete - cloud storage folder to be deleted
   */
  export function deleteCloudStorageFolder(channelId: string, folderToDelete: CloudStorageFolder): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }

      if (!channelId) {
        throw new Error('[files.deleteCloudStorageFolder] channelId name cannot be null or empty');
      }
      if (!folderToDelete) {
        throw new Error('[files.deleteCloudStorageFolder] folderToDelete cannot be null or empty');
      }

      resolve(sendAndHandleError('files.deleteCloudStorageFolder', channelId, folderToDelete));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
   *
   * @param folder - Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
   * @param providerCode - Code of the cloud storage folder provider
   */
  export function getCloudStorageFolderContents(
    folder: CloudStorageFolder | CloudStorageFolderItem,
    providerCode: CloudStorageProvider,
  ): Promise<CloudStorageFolderItem[]> {
    return new Promise<CloudStorageFolderItem[]>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }

      if (!folder || !providerCode) {
        throw new Error('[files.getCloudStorageFolderContents] folder/providerCode name cannot be null or empty');
      }

      if ('isSubdirectory' in folder && !folder.isSubdirectory) {
        throw new Error('[files.getCloudStorageFolderContents] provided folder is not a subDirectory');
      }

      resolve(sendAndHandleError('files.getCloudStorageFolderContents', folder, providerCode));
    });
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Open a cloud storage file in teams
   *
   * @param file - cloud storage file that should be opened
   * @param providerCode - Code of the cloud storage folder provider
   * @param fileOpenPreference - Whether file should be opened in web/inline
   */
  export function openCloudStorageFile(
    file: CloudStorageFolderItem,
    providerCode: CloudStorageProvider,
    fileOpenPreference?: FileOpenPreference.Web | FileOpenPreference.Inline,
  ): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
    }

    if (!file || !providerCode) {
      throw new Error('[files.openCloudStorageFile] file/providerCode cannot be null or empty');
    }

    if (file.isSubdirectory) {
      throw new Error('[files.openCloudStorageFile] provided file is a subDirectory');
    }

    sendMessageToParent('files.openCloudStorageFile', [file, providerCode, fileOpenPreference]);
  }

  /**
   * @hidden
   * Hide from docs.
   * ------
   * Opens a client-friendly preview of the specified file.
   *
   * @param file - The file to preview.
   */
  export function openFilePreview(filePreviewParameters: FilePreviewParameters): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
    }

    const params = [
      filePreviewParameters.entityId,
      filePreviewParameters.title,
      filePreviewParameters.description,
      filePreviewParameters.type,
      filePreviewParameters.objectUrl,
      filePreviewParameters.downloadUrl,
      filePreviewParameters.webPreviewUrl,
      filePreviewParameters.webEditUrl,
      filePreviewParameters.baseUrl,
      filePreviewParameters.editFile,
      filePreviewParameters.subEntityId,
      filePreviewParameters.viewerAction,
      filePreviewParameters.fileOpenPreference,
      filePreviewParameters.conversationId,
    ];

    sendMessageToParent('openFilePreview', params);
  }

  /**
   * @hidden
   * Allow 1st party apps to call this function to get the external
   * third party cloud storage accounts that the tenant supports
   * @param excludeAddedProviders: return a list of support third party
   * cloud storages that hasn't been added yet.
   */
  export function getExternalProviders(excludeAddedProviders = false): Promise<IExternalProvider[]> {
    return new Promise<IExternalProvider[]>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }

      resolve(sendAndHandleError('files.getExternalProviders', excludeAddedProviders));
    });
  }

  /**
   * @hidden
   * Allow 1st party apps to call this function to move files
   * among SharePoint and third party cloud storages.
   */
  export function copyMoveFiles(
    selectedFiles: CloudStorageFolderItem[] | ISharePointFile[],
    providerCode: CloudStorageProvider,
    destinationFolder: CloudStorageFolderItem | ISharePointFile,
    destinationProviderCode: CloudStorageProvider,
    isMove = false,
  ): Promise<void> {
    return new Promise<void>(resolve => {
      ensureInitialized(FrameContexts.content);
      if (!isSupported()) {
        throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
      }
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

      resolve(
        sendAndHandleError(
          'files.copyMoveFiles',
          selectedFiles,
          providerCode,
          destinationFolder,
          destinationProviderCode,
          isMove,
        ),
      );
    });
  }

  export function isSupported(): boolean {
    return runtime.supports.files ? true : false;
  }

  /**
   * @hidden
   * Hide from docs
   * ------
   * Gets list of downloads for current user
   * @param callback Callback that will be triggered post downloads load
   */
  export function getFileDownloads(): Promise<IFileItem[]>;
  /**
   * @hidden
   * Hide from docs
   * ------
   *
   * @deprecated
   * As of 2.0.0-beta.4, please use {@link file.getFileDownloads file.getFileDownloads(): Promise\<IFileItem[]\>} instead.
   * Gets list of downloads for current user
   * @param callback Callback that will be triggered post downloads load
   */
  export function getFileDownloads(callback: (error?: SdkError, files?: IFileItem[]) => void): void;
  export function getFileDownloads(callback?: (error?: SdkError, files?: IFileItem[]) => void): Promise<IFileItem[]> {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
    }

    const wrappedFunction = (): Promise<IFileItem[]> =>
      new Promise(resolve => resolve(sendAndHandleError('files.getFileDownloads', [])));

    return callCallbackWithErrorOrResultFromPromiseAndReturnPromise(wrappedFunction, callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Open download preference folder if fileObjectId value is undefined else open folder containing the file with id fileObjectId
   * @param fileObjectId Id of the file whose containing folder should be opened
   * @param callback Callback that will be triggered post open download folder/path
   */
  export function openDownloadFolder(fileObjectId: string = undefined, callback: (error?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content);
    if (!isSupported()) {
      throw Error(JSON.stringify({ errorCode: ErrorCode.NOT_SUPPORTED_ON_PLATFORM }));
    }

    if (!callback) {
      throw new Error('[files.openDownloadFolder] Callback cannot be null');
    }

    sendMessageToParent('files.openDownloadFolder', [fileObjectId], callback);
  }
}
