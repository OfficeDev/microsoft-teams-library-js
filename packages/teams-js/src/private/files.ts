import { sendMessageToParent } from '../internal/communication';
import { registerHandler } from '../internal/handlers';
import { ensureInitialized } from '../internal/internalAPIs';
import { ErrorCode, FileOpenPreference, FrameContexts, SdkError } from '../public';

/**
 * @hidden
 * Hide from docs
 * ------
 * Namespace to interact with the files specific part of the SDK.
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
   *
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
   *
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
   *
   * Actions specific to 3P cloud storage provider file and / or account
   */
  export enum CloudStorageProviderFileAction {
    Download = 'DOWNLOAD',
    Upload = 'UPLOAD',
    Delete = 'DELETE',
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Interface for 3P cloud storage provider request content type
   */
  export interface CloudStorageProviderRequest<T> {
    content: T;
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Base interface for 3P cloud storage provider action request content
   */
  export interface CloudStorageProviderContent {
    providerCode: CloudStorageProvider;
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Interface representing 3P cloud storage provider add new file action.
   * The file extension represents type of file e.g. docx, pptx etc. and need not be prefixed with dot(.)
   */
  export interface CloudStorageProviderNewFileContent extends CloudStorageProviderContent {
    newFileName: string;
    newFileExtension: string;
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Interface representing 3P cloud storage provider rename existing file action
   */
  export interface CloudStorageProviderRenameFileContent extends CloudStorageProviderContent {
    existingFile: CloudStorageFolderItem | ISharePointFile;
    newFile: CloudStorageFolderItem | ISharePointFile;
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Interface representing 3P cloud storage provider actions like Upload / Download / Delete file(s)
   */
  export interface CloudStorageProviderActionContent extends CloudStorageProviderContent {
    action: CloudStorageProviderFileAction;
    itemList: CloudStorageFolderItem[] | ISharePointFile[];
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Gets a list of cloud storage folders added to the channel
   * @param channelId - ID of the channel whose cloud storage folders should be retrieved
   * @param callback - Callback that will be triggered post folders load
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
   * @hidden
   * Hide from docs
   * ------
   * Initiates the add cloud storage folder flow
   *
   * @param channelId - ID of the channel to add cloud storage folder
   * @param callback - Callback that will be triggered post add folder flow is compelete
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
   * @hidden
   * Hide from docs
   * ------
   *
   * Deletes a cloud storage folder from channel
   *
   * @param channelId - ID of the channel where folder is to be deleted
   * @param folderToDelete - cloud storage folder to be deleted
   * @param callback - Callback that will be triggered post delete
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
   * @hidden
   * Hide from docs
   * ------
   *
   * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
   *
   * @param folder - Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
   * @param providerCode - Code of the cloud storage folder provider
   * @param callback - Callback that will be triggered post contents are loaded
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
   * @hidden
   * Hide from docs
   * ------
   *
   * Open a cloud storage file in Teams
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
   * @hidden
   * Hide from docs
   *  ------
   *
   * Gets list of downloads for current user
   * @param callback Callback that will be triggered post downloads load
   */
  export function getFileDownloads(callback: (error?: SdkError, files?: IFileItem[]) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw new Error('[files.getFileDownloads] Callback cannot be null');
    }

    sendMessageToParent('files.getFileDownloads', [], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Open download preference folder if fileObjectId value is undefined else open folder containing the file with id fileObjectId
   * @param fileObjectId - Id of the file whose containing folder should be opened
   * @param callback Callback that will be triggered post open download folder/path
   */
  export function openDownloadFolder(fileObjectId: string = undefined, callback: (error?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw new Error('[files.openDownloadFolder] Callback cannot be null');
    }

    sendMessageToParent('files.openDownloadFolder', [fileObjectId], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Initiates add 3P cloud storage provider flow, where a pop up window opens for user to select required
   * 3P provider from the configured policy supported 3P provider list, following which user authentication
   * for selected 3P provider is performed on success of which the selected 3P provider support is added for user
   *
   * @param callback Callback that will be triggered post add 3P cloud storage provider action
   */
  export function addCloudStorageProvider(callback: (error?: SdkError) => void): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw getSdkError(ErrorCode.INVALID_ARGUMENTS, '[files.addCloudStorageProvider] callback cannot be null');
    }

    sendMessageToParent('files.addCloudStorageProvider', [], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Initiates signout of 3P cloud storage provider flow, which will remove the selected
   * 3P cloud storage provider from the list of added providers. No other user input and / or action
   * is required except the 3P cloud storage provider to signout from
   *
   * @param logoutRequest 3P cloud storage provider remove action request content
   * @param callback Callback that will be triggered post signout of 3P cloud storage provider action
   */
  export function removeCloudStorageProvider(
    logoutRequest: CloudStorageProviderRequest<CloudStorageProviderContent>,
    callback: (error?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw getSdkError(ErrorCode.INVALID_ARGUMENTS, '[files.removeCloudStorageProvider] callback cannot be null');
    }

    if (!(logoutRequest && logoutRequest.content)) {
      throw getSdkError(
        ErrorCode.INVALID_ARGUMENTS,
        '[files.removeCloudStorageProvider] 3P cloud storage provider request content is missing',
      );
    }

    sendMessageToParent('files.removeCloudStorageProvider', [logoutRequest], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Initiates the add 3P cloud storage file flow, which will add a new file for the given 3P provider
   *
   * @param addNewFileRequest 3P cloud storage provider add action request content
   * @param callback Callback that will be triggered post adding a new file flow is finished
   */
  export function addCloudStorageProviderFile(
    addNewFileRequest: CloudStorageProviderRequest<CloudStorageProviderNewFileContent>,
    callback: (error?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw getSdkError(ErrorCode.INVALID_ARGUMENTS, '[files.addCloudStorageProviderFile] callback cannot be null');
    }

    if (!(addNewFileRequest && addNewFileRequest.content)) {
      throw getSdkError(
        ErrorCode.INVALID_ARGUMENTS,
        '[files.addCloudStorageProviderFile] 3P cloud storage provider request content is missing',
      );
    }

    sendMessageToParent('files.addCloudStorageProviderFile', [addNewFileRequest], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Initiates the rename 3P cloud storage file flow, which will rename an existing file in the given 3P provider
   *
   * @param renameFileRequest 3P cloud storage provider rename action request content
   * @param callback Callback that will be triggered post renaming an existing file flow is finished
   */
  export function renameCloudStorageProviderFile(
    renameFileRequest: CloudStorageProviderRequest<CloudStorageProviderRenameFileContent>,
    callback: (error?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw getSdkError(ErrorCode.INVALID_ARGUMENTS, '[files.renameCloudStorageProviderFile] callback cannot be null');
    }

    if (!(renameFileRequest && renameFileRequest.content)) {
      throw getSdkError(
        ErrorCode.INVALID_ARGUMENTS,
        '[files.renameCloudStorageProviderFile] 3P cloud storage provider request content is missing',
      );
    }

    sendMessageToParent('files.renameCloudStorageProviderFile', [renameFileRequest], callback);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Initiates the 3P cloud storage provider file action (Upload / Download / Delete) flow
   *
   * Upload Action : Allows uploading file(s) to the given 3P cloud storage provider
   * Download Action : Allows downloading file(s) from the given 3P cloud storage provider
   * Delete Action : Allows deleting file(s) from the given 3P cloud storage provider
   *
   * @param cloudStorageProviderFileActionRequest 3P cloud storage provider file action (Upload / Download / Delete) request content
   * @param callback Callback that will be triggered post 3P cloud storage action
   */
  export function performCloudStorageProviderFileAction(
    cloudStorageProviderFileActionRequest: CloudStorageProviderRequest<CloudStorageProviderActionContent>,
    callback: (error?: SdkError) => void,
  ): void {
    ensureInitialized(FrameContexts.content);

    if (!callback) {
      throw getSdkError(
        ErrorCode.INVALID_ARGUMENTS,
        '[files.performCloudStorageProviderFileAction] callback cannot be null',
      );
    }

    if (!(cloudStorageProviderFileActionRequest && cloudStorageProviderFileActionRequest.content)) {
      throw getSdkError(
        ErrorCode.INVALID_ARGUMENTS,
        '[files.performCloudStorageProviderFileAction] 3P cloud storage provider request content is missing',
      );
    }

    sendMessageToParent(
      'files.performCloudStorageProviderFileAction',
      [cloudStorageProviderFileActionRequest],
      callback,
    );
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Register a handler to be called when a user's 3P cloud storage provider list changes i.e.
   * post adding / removing a 3P provider, list is updated
   *
   * @param handler - When 3P cloud storage provider list is updated this handler is called
   *
   */
  export function registerCloudStorageProviderListChangeHandler(handler: () => void): void {
    ensureInitialized();

    if (!handler) {
      throw new Error('[registerCloudStorageProviderListChangeHandler] Handler cannot be null');
    }

    registerHandler('files.cloudStorageProviderList', handler);
  }

  /**
   * @hidden
   * Hide from docs
   *
   * Register a handler to be called when a user's 3P cloud storage provider content changes i.e.
   * when file(s) is/are added / renamed / deleted / uploaded, the list of files is updated
   *
   * @param handler - When 3P cloud storage provider content is updated this handler is called
   *
   */
  export function registerCloudStorageProviderContentChangeHandler(handler: () => void): void {
    ensureInitialized();

    if (!handler) {
      throw new Error('[registerCloudStorageProviderContentChangeHandler] Handler cannot be null');
    }

    registerHandler('files.cloudStorageProviderContent', handler);
  }

  function getSdkError(errorCode: ErrorCode, message: string): SdkError {
    const sdkError: SdkError = {
      errorCode: errorCode,
      message: message,
    };
    return sdkError;
  }
}
