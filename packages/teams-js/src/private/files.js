"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.files = void 0;
var communication_1 = require("../internal/communication");
var internalAPIs_1 = require("../internal/internalAPIs");
var utils_1 = require("../internal/utils");
var public_1 = require("../public");
var runtime_1 = require("../public/runtime");
/**
 * @hidden
 * Hide from docs
 * ------
 * Namespace to interact with the files specific part of the SDK.
 *
 * @alpha
 */
var files;
(function (files_1) {
    /**
     * @hidden
     * Hide from docs
     * ------
     * Cloud storage providers registered with Microsoft Teams
     */
    var CloudStorageProvider;
    (function (CloudStorageProvider) {
        CloudStorageProvider["Dropbox"] = "DROPBOX";
        CloudStorageProvider["Box"] = "BOX";
        CloudStorageProvider["Sharefile"] = "SHAREFILE";
        CloudStorageProvider["GoogleDrive"] = "GOOGLEDRIVE";
        CloudStorageProvider["Egnyte"] = "EGNYTE";
        CloudStorageProvider["SharePoint"] = "SharePoint";
    })(CloudStorageProvider = files_1.CloudStorageProvider || (files_1.CloudStorageProvider = {}));
    /**
     * @hidden
     * Hide from docs
     *
     * Cloud storage provider type enums
     */
    var CloudStorageProviderType;
    (function (CloudStorageProviderType) {
        CloudStorageProviderType[CloudStorageProviderType["Sharepoint"] = 0] = "Sharepoint";
        CloudStorageProviderType[CloudStorageProviderType["WopiIntegration"] = 1] = "WopiIntegration";
        CloudStorageProviderType[CloudStorageProviderType["Google"] = 2] = "Google";
        CloudStorageProviderType[CloudStorageProviderType["OneDrive"] = 3] = "OneDrive";
        CloudStorageProviderType[CloudStorageProviderType["Recent"] = 4] = "Recent";
        CloudStorageProviderType[CloudStorageProviderType["Aggregate"] = 5] = "Aggregate";
        CloudStorageProviderType[CloudStorageProviderType["FileSystem"] = 6] = "FileSystem";
        CloudStorageProviderType[CloudStorageProviderType["Search"] = 7] = "Search";
        CloudStorageProviderType[CloudStorageProviderType["AllFiles"] = 8] = "AllFiles";
        CloudStorageProviderType[CloudStorageProviderType["SharedWithMe"] = 9] = "SharedWithMe";
    })(CloudStorageProviderType = files_1.CloudStorageProviderType || (files_1.CloudStorageProviderType = {}));
    /**
     * @hidden
     * Hide from docs
     *
     * Special Document Library enum
     */
    var SpecialDocumentLibraryType;
    (function (SpecialDocumentLibraryType) {
        SpecialDocumentLibraryType["ClassMaterials"] = "classMaterials";
    })(SpecialDocumentLibraryType = files_1.SpecialDocumentLibraryType || (files_1.SpecialDocumentLibraryType = {}));
    /**
     * @hidden
     * Hide from docs
     *
     * Document Library Access enum
     */
    var DocumentLibraryAccessType;
    (function (DocumentLibraryAccessType) {
        DocumentLibraryAccessType["Readonly"] = "readonly";
    })(DocumentLibraryAccessType = files_1.DocumentLibraryAccessType || (files_1.DocumentLibraryAccessType = {}));
    /**
     * @hidden
     * Hide from docs
     *
     * Download status enum
     */
    var FileDownloadStatus;
    (function (FileDownloadStatus) {
        FileDownloadStatus["Downloaded"] = "Downloaded";
        FileDownloadStatus["Downloading"] = "Downloading";
        FileDownloadStatus["Failed"] = "Failed";
    })(FileDownloadStatus = files_1.FileDownloadStatus || (files_1.FileDownloadStatus = {}));
    /**
     * @hidden
     * Hide from docs
     * ------
     * Gets a list of cloud storage folders added to the channel
     *
     * @param channelId - ID of the channel whose cloud storage folders should be retrieved
     */
    function getCloudStorageFolders(channelId) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
            if (!channelId || channelId.length === 0) {
                throw new Error('[files.getCloudStorageFolders] channelId name cannot be null or empty');
            }
            resolve((0, communication_1.sendAndHandleSdkError)('files.getCloudStorageFolders', channelId));
        });
    }
    files_1.getCloudStorageFolders = getCloudStorageFolders;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Initiates the add cloud storage folder flow
     * @param channelId - ID of the channel to add cloud storage folder
     */
    function addCloudStorageFolder(channelId) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
            if (!channelId || channelId.length === 0) {
                throw new Error('[files.addCloudStorageFolder] channelId name cannot be null or empty');
            }
            resolve((0, communication_1.sendMessageToParentAsync)('files.addCloudStorageFolder', [channelId]));
        }).then(function (_a) {
            var error = _a[0], isFolderAdded = _a[1], folders = _a[2];
            if (error) {
                throw error;
            }
            var result = [isFolderAdded, folders];
            return result;
        });
    }
    files_1.addCloudStorageFolder = addCloudStorageFolder;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Deletes a cloud storage folder from channel
     *
     * @param channelId - ID of the channel where folder is to be deleted
     * @param folderToDelete - cloud storage folder to be deleted
     */
    function deleteCloudStorageFolder(channelId, folderToDelete) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
            if (!channelId) {
                throw new Error('[files.deleteCloudStorageFolder] channelId name cannot be null or empty');
            }
            if (!folderToDelete) {
                throw new Error('[files.deleteCloudStorageFolder] folderToDelete cannot be null or empty');
            }
            resolve((0, communication_1.sendAndHandleSdkError)('files.deleteCloudStorageFolder', channelId, folderToDelete));
        });
    }
    files_1.deleteCloudStorageFolder = deleteCloudStorageFolder;
    /**
     * @hidden
     * Hide from docs
     * ------
     * Fetches the contents of a Cloud storage folder (CloudStorageFolder) / sub directory
     *
     * @param folder - Cloud storage folder (CloudStorageFolder) / sub directory (CloudStorageFolderItem)
     * @param providerCode - Code of the cloud storage folder provider
     */
    function getCloudStorageFolderContents(folder, providerCode) {
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
            if (!folder || !providerCode) {
                throw new Error('[files.getCloudStorageFolderContents] folder/providerCode name cannot be null or empty');
            }
            if ('isSubdirectory' in folder && !folder.isSubdirectory) {
                throw new Error('[files.getCloudStorageFolderContents] provided folder is not a subDirectory');
            }
            resolve((0, communication_1.sendAndHandleSdkError)('files.getCloudStorageFolderContents', folder, providerCode));
        });
    }
    files_1.getCloudStorageFolderContents = getCloudStorageFolderContents;
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
    function openCloudStorageFile(file, providerCode, fileOpenPreference) {
        (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
        if (!file || !providerCode) {
            throw new Error('[files.openCloudStorageFile] file/providerCode cannot be null or empty');
        }
        if (file.isSubdirectory) {
            throw new Error('[files.openCloudStorageFile] provided file is a subDirectory');
        }
        (0, communication_1.sendMessageToParent)('files.openCloudStorageFile', [file, providerCode, fileOpenPreference]);
    }
    files_1.openCloudStorageFile = openCloudStorageFile;
    /**
     * @hidden
     * Hide from docs.
     * ------
     * Opens a client-friendly preview of the specified file.
     *
     * @param file - The file to preview.
     */
    function openFilePreview(filePreviewParameters) {
        (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
        var params = [
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
        (0, communication_1.sendMessageToParent)('openFilePreview', params);
    }
    files_1.openFilePreview = openFilePreview;
    /**
     * @hidden
     * Allow 1st party apps to call this function to get the external
     * third party cloud storage accounts that the tenant supports
     * @param excludeAddedProviders: return a list of support third party
     * cloud storages that hasn't been added yet.
     */
    function getExternalProviders(excludeAddedProviders) {
        if (excludeAddedProviders === void 0) { excludeAddedProviders = false; }
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
            resolve((0, communication_1.sendAndHandleSdkError)('files.getExternalProviders', excludeAddedProviders));
        });
    }
    files_1.getExternalProviders = getExternalProviders;
    /**
     * @hidden
     * Allow 1st party apps to call this function to move files
     * among SharePoint and third party cloud storages.
     */
    function copyMoveFiles(selectedFiles, providerCode, destinationFolder, destinationProviderCode, isMove) {
        if (isMove === void 0) { isMove = false; }
        return new Promise(function (resolve) {
            (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
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
            resolve((0, communication_1.sendAndHandleSdkError)('files.copyMoveFiles', selectedFiles, providerCode, destinationFolder, destinationProviderCode, isMove));
        });
    }
    files_1.copyMoveFiles = copyMoveFiles;
    function isSupported() {
        return runtime_1.runtime.supports.files ? true : false;
    }
    files_1.isSupported = isSupported;
    function getFileDownloads(callback) {
        (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
        var wrappedFunction = function () {
            return new Promise(function (resolve) { return resolve((0, communication_1.sendAndHandleSdkError)('files.getFileDownloads', [])); });
        };
        return (0, utils_1.callCallbackWithErrorOrResultFromPromiseAndReturnPromise)(wrappedFunction, callback);
    }
    files_1.getFileDownloads = getFileDownloads;
    /**
     * @hidden
     * Hide from docs
     *
     * Open download preference folder if fileObjectId value is undefined else open folder containing the file with id fileObjectId
     * @param fileObjectId Id of the file whose containing folder should be opened
     * @param callback Callback that will be triggered post open download folder/path
     */
    function openDownloadFolder(fileObjectId, callback) {
        if (fileObjectId === void 0) { fileObjectId = undefined; }
        (0, internalAPIs_1.ensureInitialized)(public_1.FrameContexts.content);
        if (!callback) {
            throw new Error('[files.openDownloadFolder] Callback cannot be null');
        }
        (0, communication_1.sendMessageToParent)('files.openDownloadFolder', [fileObjectId], callback);
    }
    files_1.openDownloadFolder = openDownloadFolder;
})(files = exports.files || (exports.files = {}));
//# sourceMappingURL=files.js.map