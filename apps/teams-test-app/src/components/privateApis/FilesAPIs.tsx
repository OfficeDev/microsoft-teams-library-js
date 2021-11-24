import { FileOpenPreference, FilePreviewParameters, files } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { noHostSdkMsg } from '../../App';
import BoxAndButton from '../BoxAndButton';
import { ApiWithCheckboxInput, ApiWithoutInput, ApiWithTextInput } from '../utils';

const CheckFilesCapability = (): React.ReactElement =>
  ApiWithoutInput({
    name: 'checkCapabilityFiles',
    title: 'Check Files Capability',
    onClick: async () => `Files module ${files.isSupported() ? 'is' : 'is not'} supported`,
  });

const OpenFilePreview = (): React.ReactElement =>
  ApiWithTextInput<FilePreviewParameters>({
    name: 'openFilePreview',
    title: 'Open File Preview',
    onClick: {
      validateInput: input => {
        if (!input.entityId || !input.title || !input.type || !input.objectUrl) {
          throw new Error('entityId, title, type and objectUrl are all required on the input object.');
        }
      },
      submit: async input => {
        files.openFilePreview(input);
        return 'Called';
      },
    },
  });

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
      submit: async input => {
        const results = await files.getCloudStorageFolders(input);
        return JSON.stringify(results);
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
      submit: async input => {
        const [isFolderAdded, folders] = await files.addCloudStorageFolder(input);
        return JSON.stringify({ isFolderAdded, folders });
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
      submit: async input => {
        const result = await files.deleteCloudStorageFolder(input.channelId, input.folderToDelete);
        return JSON.stringify(result);
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
      submit: async input => {
        const result = await files.getCloudStorageFolderContents(input.folder, input.providerCode);
        return JSON.stringify(result);
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
      const result = await files.getExternalProviders(excludeAddedProviders);
      return JSON.stringify(result);
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
      submit: async input => {
        await files.copyMoveFiles(
          input.selectedFiles,
          input.providerCode,
          input.destinationFolder,
          input.destinationProviderCode,
        );
        return 'Completed';
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

const FilesAPIs = (): ReactElement => {
  // TODO: Remove once E2E scenario tests are updated to use the new version
  const [getCloudStorageFoldersRes, setGetCloudStorageFoldersRes] = React.useState('');
  const [addCloudStorageFolderRes, setAddCloudStorageFolderRes] = React.useState('');

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const returnGetCloudStorageFolders = (channelId: string): void => {
    setGetCloudStorageFoldersRes('getCloudStorageFolders()' + noHostSdkMsg);
    files
      .getCloudStorageFolders(channelId)
      .then(folders => setGetCloudStorageFoldersRes(JSON.stringify(folders)))
      .catch(err => setGetCloudStorageFoldersRes(err.errorCode.toString + ' ' + err.message));
  };

  // TODO: Remove once E2E scenario tests are updated to use the new version
  const returnAddCloudStorageFolder = (channelId: string): void => {
    setAddCloudStorageFolderRes('addCloudStorageFolder()' + noHostSdkMsg);
    files
      .addCloudStorageFolder(channelId)
      .then(([isFolderAdded, folders]) => setAddCloudStorageFolderRes(JSON.stringify({ isFolderAdded, folders })))
      .catch(err => setAddCloudStorageFolderRes(err.errorCode.toString + ' ' + err.message));
  };

  return (
    <>
      <h1>files</h1>
      <OpenFilePreview />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={returnGetCloudStorageFolders}
        output={getCloudStorageFoldersRes}
        hasInput={true}
        title="Get Cloud Storage Folders"
        name="getCloudStorageFolders"
      />
      <GetCloudStorageFolders />
      {/* TODO: Remove once E2E scenario tests are updated to use the new version */}
      <BoxAndButton
        handleClickWithInput={returnAddCloudStorageFolder}
        output={addCloudStorageFolderRes}
        hasInput={true}
        title="Add Cloud Storage Folder"
        name="addCloudStorageFolder"
      />
      <AddCloudStorageFolder />
      <DeleteCloudStorageFolder />
      <GetCloudStorageFolderContents />
      <OpenCloudStorageFile />
      <CheckFilesCapability />
      <GetExternalProviders />
      <CopyMoveFiles />
    </>
  );
};

export default FilesAPIs;
