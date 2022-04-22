import { FileOpenPreference, files, SdkError } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from '../utils';

const GetCloudStorageFolders = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getCloudStorageFolders2',
    title: 'Get Cloud Storage Folders',
    onClick: {
      validateInput: input => {
        if (!input && typeof input !== 'string') {
          throw new Error('input is required and it has be a string.');
        }
      },
      submit: async (input, setResult) => {
        const callback = (error: SdkError, folders: files.CloudStorageFolder[]): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(folders));
          }
        };
        await files.getCloudStorageFolders(input, callback);
        return '';
      },
    },
  });

const AddCloudStorageFolder = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'addCloudStorageFolder2',
    title: 'Add Cloud Storage Folders',
    onClick: {
      validateInput: input => {
        if (!input && typeof input !== 'string') {
          throw new Error('input is required and it has be a string.');
        }
      },
      submit: async (input, setResult) => {
        const callback = (error: SdkError, isFolderAdded: boolean, folders: files.CloudStorageFolder[]): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify({ isFolderAdded, folders }));
          }
        };

        await files.addCloudStorageFolder(input, callback);
        return '';
      },
    },
  });

interface DeleteCloudStorageParams {
  channelId: string;
  folderToDelete: files.CloudStorageFolder;
}

const DeleteCloudStorageFolder = (): React.ReactElement =>
  ApiWithTextInput<DeleteCloudStorageParams>({
    name: 'deleteCloudStorageFolder',
    title: 'Delete Cloud Storage Folder',
    onClick: {
      validateInput: input => {
        if (!input.channelId || !input.folderToDelete) {
          throw new Error('channelId and folderToDelete are required.');
        }
      },
      submit: async (input, setResult) => {
        const callback = (error: SdkError, isFolderDeleted: boolean): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(isFolderDeleted));
          }
        };

        await files.deleteCloudStorageFolder(input.channelId, input.folderToDelete, callback);
        return '';
      },
    },
  });

interface GetCloudStorageFolderContentParams {
  folder: files.CloudStorageFolder | files.CloudStorageFolderItem;
  providerCode: files.CloudStorageProvider;
}

const GetCloudStorageFolderContents = (): React.ReactElement =>
  ApiWithTextInput<GetCloudStorageFolderContentParams>({
    name: 'getCloudStorageFolderContents',
    title: 'Get Cloud Storage Folder Contents',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: async (input, setResult) => {
        const callback = (error: SdkError, items: files.CloudStorageFolderItem[]): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult(JSON.stringify(items));
          }
        };
        await files.getCloudStorageFolderContents(input.folder, input.providerCode, callback);
        return '';
      },
    },
  });

interface OpenCloudStorageFolderParams {
  file: files.CloudStorageFolderItem;
  providerCode: files.CloudStorageProvider;
  fileOpenPreference?: FileOpenPreference.Web | FileOpenPreference.Inline;
}

const OpenCloudStorageFile = (): React.ReactElement =>
  ApiWithTextInput<OpenCloudStorageFolderParams>({
    name: 'openCloudStorageFile',
    title: 'Open Cloud Storage File',
    onClick: {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      validateInput: () => {},
      submit: async input => {
        await files.openCloudStorageFile(input.file, input.providerCode, input.fileOpenPreference);
        return 'openCloudStorageFile() called.';
      },
    },
  });

const GetExternalProviders = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'getExternalProviders',
    title: 'Get External Providers',
    label: 'excludeAddedProviders',
    onClick: async (excludeAddedProviders: boolean) => {
      let result;
      const callback = (error: SdkError, providers: files.IExternalProvider[]): void => {
        if (error) {
          result = JSON.stringify(error);
        } else {
          result = JSON.stringify(providers);
        }
      };
      await files.getExternalProviders(excludeAddedProviders, callback);
      return result;
    },
  });

interface CopyMoveFilesParams {
  selectedFiles: files.CloudStorageFolderItem[] | files.ISharePointFile[];
  providerCode: files.CloudStorageProvider;
  destinationFolder: files.CloudStorageFolderItem | files.ISharePointFile;
  destinationProviderCode: files.CloudStorageProvider;
}

const CopyMoveFiles = (): ReactElement =>
  ApiWithTextInput<CopyMoveFilesParams>({
    name: 'copyMoveFiles',
    title: 'Copy Move Files',
    onClick: {
      submit: async (input, setResult) => {
        const callback = (error?: SdkError): void => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            setResult('Completed');
          }
        };
        await files.copyMoveFiles(
          input.selectedFiles,
          input.providerCode,
          input.destinationFolder,
          input.destinationProviderCode,
          false,
          callback,
        );
        return '';
      },
      validateInput: x => {
        if (!x.selectedFiles || !x.providerCode || !x.destinationFolder || !x.destinationProviderCode) {
          throw new Error(
            'Please make sure you have all four required arugments selectedfiles, providerCode, destinationFolder, and destinationProviderCode.',
          );
        }
      },
    },
  });

const GetFileDownloads = (): ReactElement =>
  ApiWithoutInput({
    name: 'getFileDownloads',
    title: 'Get File Downloads',
    onClick: async setResult => {
      const callback = (error?: SdkError, files?: files.IFileItem[]): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(files));
        }
      };

      files.getFileDownloads(callback);
      return '';
    },
  });

const OpenDownloadFolder = (): ReactElement =>
  ApiWithoutInput({
    name: 'openDownloadFolder',
    title: 'Open Download Folder',
    onClick: async () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      files.openDownloadFolder('fileObjectId', () => {});
      return 'Opened download folder';
    },
  });

const FilesAPIs = (): ReactElement => (
  <>
    <h1>files</h1>
    <GetCloudStorageFolders />
    <AddCloudStorageFolder />
    <DeleteCloudStorageFolder />
    <GetCloudStorageFolderContents />
    <OpenCloudStorageFile />
    <GetExternalProviders />
    <CopyMoveFiles />
    <GetFileDownloads />
    <OpenDownloadFolder />
  </>
);

export default FilesAPIs;
