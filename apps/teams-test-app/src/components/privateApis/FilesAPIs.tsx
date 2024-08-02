import { app, FileOpenPreference, files, HostClientType, SdkError } from '@microsoft/teams-js';
import React, { ChangeEvent, ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from '../utils';
import { ApiContainer } from '../utils/ApiContainer';
import { ModuleWrapper } from '../utils/ModuleWrapper';

export const FileUpload: React.FC = () => {
  const fileUploadName = 'fileUpload';
  const [result, setResult] = React.useState<string>('');
  const [selectMultipleFiles, setSelectMultipleFiles] = React.useState<boolean>(false);
  const onChangeCallback = React.useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setResult(noHostSdkMsg);
      try {
        const files: FileList | null = event.target.files;
        if (files !== undefined && files !== null) {
          const fileList: string[] = [];
          Array.from(files).forEach((file) => {
            fileList.push(file.name);
          });
          setResult(fileList.join());
        }
      } catch (err) {
        setResult('Error: ' + err);
      }
    },
    [setResult],
  );

  return (
    <ApiContainer title="Upload File" result={result} name={fileUploadName}>
      <div style={{ textAlign: 'left' }}>
        <input
          id={`file_${fileUploadName}`}
          style={{ width: 'fit-content' }}
          type="file"
          name={fileUploadName + 'Button'}
          onChange={onChangeCallback}
          multiple={selectMultipleFiles}
        />
        <div>
          <input
            title="Select multiple files"
            type="checkbox"
            style={{ width: 'fit-content' }}
            name={`selectMultiple_${fileUploadName}`}
            onChange={(e) => setSelectMultipleFiles(e.target.checked)}
          />
          <label htmlFor={`selectMultiple_${fileUploadName}`}>Select multiple files</label>
        </div>
      </div>
    </ApiContainer>
  );
};

const GetCloudStorageFolders = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getCloudStorageFolders2',
    title: 'Get Cloud Storage Folders',
    onClick: {
      validateInput: (input) => {
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
    defaultInput: '"channelId1"',
  });

const AddCloudStorageFolder = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'addCloudStorageFolder2',
    title: 'Add Cloud Storage Folders',
    onClick: {
      validateInput: (input) => {
        if (!input && typeof input !== 'string') {
          throw new Error('input is required and it has to be a string.');
        }
      },
      submit: async (input, setResult) => {
        const callback = async (
          error: SdkError,
          isFolderAdded: boolean,
          folders: files.CloudStorageFolder[],
        ): Promise<void> => {
          if (error) {
            setResult(JSON.stringify(error));
          } else {
            const result = { folders, isFolderAdded };

            const hostClientType = (await app.getContext()).app.host.clientType;
            if (hostClientType === HostClientType.android) {
              // Sort the result object properties before returning for the android test app
              const sortedResult = Object.keys(result)
                .sort()
                .reduce((acc, key) => {
                  acc[key] = result[key];
                  return acc;
                }, {});
              setResult(JSON.stringify(sortedResult));
            } else {
              setResult(JSON.stringify(result));
            }
          }
        };

        await files.addCloudStorageFolder(input, callback);
        return '';
      },
    },
    defaultInput: '"channelId1"',
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
      validateInput: (input) => {
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
    defaultInput: JSON.stringify({
      channelId: 'channelId1',
      folderToDelete: {
        id: 'id1',
        title: 'title1',
        folderId: 'folderId1',
        providerType: files.CloudStorageProviderType.OneDrive,
        providerCode: files.CloudStorageProvider.Box,
        ownerDisplayName: 'This is Box',
        siteUrl: 'siteUrl1',
        serverRelativeUrl: 'serverRelativeUrl1',
        libraryType: 'libraryType1',
        accessType: 'accessType1',
      },
    }),
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
    defaultInput: JSON.stringify({
      folder: {
        id: 'id1',
        title: 'title1',
        folderId: 'folderId1',
        providerType: files.CloudStorageProviderType.OneDrive,
        providerCode: files.CloudStorageProvider.Box,
        ownerDisplayName: 'This is Box',
        siteUrl: 'siteUrl1',
        serverRelativeUrl: 'serverRelativeUrl1',
        libraryType: 'libraryType1',
        accessType: 'accessType1',
      },
      providerCode: files.CloudStorageProvider.Box,
    }),
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
      submit: async (input) => {
        await files.openCloudStorageFile(input.file, input.providerCode, input.fileOpenPreference);
        return 'openCloudStorageFile() called.';
      },
    },
    defaultInput: JSON.stringify({
      file: {
        id: 'id1',
        title: 'title1',
        isSubdirectory: false,
        type: 'txt',
        lastModified: 'yes this is a time',
        size: 123,
        objectUrl: 'objectUrl1',
        accessToken: 'accessToken1',
      },
      providerCode: files.CloudStorageProvider.Box,
      fileOpenPreference: FileOpenPreference.Web,
    }),
  });

const GetExternalProviders = (): React.ReactElement =>
  ApiWithCheckboxInput({
    name: 'getExternalProviders',
    title: 'Get External Providers',
    label: 'excludeAddedProviders',
    onClick: async (excludeAddedProviders: boolean, setResult: (result: string) => void) => {
      const callback = (error: SdkError, providers: files.IExternalProvider[]): void => {
        if (error) {
          setResult(JSON.stringify(error));
        } else {
          setResult(JSON.stringify(providers));
        }
      };
      files.getExternalProviders(excludeAddedProviders, callback);
      return '';
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
      validateInput: (x) => {
        if (!x.selectedFiles || !x.providerCode || !x.destinationFolder || !x.destinationProviderCode) {
          throw new Error(
            'Please make sure you have all four required arugments selectedfiles, providerCode, destinationFolder, and destinationProviderCode.',
          );
        }
      },
    },
    defaultInput: JSON.stringify({
      selectedFiles: [
        {
          id: 'id1',
          title: 'title1',
          isSubdirectory: false,
          type: 'txt',
          lastModified: 'yes this is a time',
          size: 123,
          objectUrl: 'objectUrl1',
          accessToken: 'accessToken1',
        },
      ],
      providerCode: files.CloudStorageProvider.Box,
      destinationFolder: {
        id: 'id1',
        title: 'title1',
        isSubdirectory: false,
        type: 'txt',
        lastModified: 'yes this is a time',
        size: 123,
        objectUrl: 'objectUrl1',
        accessToken: 'accessToken1',
      },
      destinationProviderCode: files.CloudStorageProvider.Box,
    }),
  });

const GetFileDownloads = (): ReactElement =>
  ApiWithoutInput({
    name: 'getFileDownloads',
    title: 'Get File Downloads',
    onClick: async (setResult) => {
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
  <ModuleWrapper title="Files">
    <FileUpload />
    <GetCloudStorageFolders />
    <AddCloudStorageFolder />
    <DeleteCloudStorageFolder />
    <GetCloudStorageFolderContents />
    <OpenCloudStorageFile />
    <GetExternalProviders />
    <CopyMoveFiles />
    <GetFileDownloads />
    <OpenDownloadFolder />
  </ModuleWrapper>
);

export default FilesAPIs;
