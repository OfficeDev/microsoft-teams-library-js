import React, { ReactElement } from 'react';
import { FilePreviewParameters, files, SdkError } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from '../BoxAndButton';
import { noHubSdkMsg } from '../../App';

interface DeleteCloudStorageParams {
  channelId: string;
  folderToDelete: files.CloudStorageFolder;
}

const FilesAPIs = (): ReactElement => {
  const [openFilePreviewRes, setOpenFilePreviewRes] = React.useState('');
  const [getCloudStorageFoldersRes, setGetCloudStorageFoldersRes] = React.useState('');
  const [addCloudStorageFolderRes, setAddCloudStorageFolderRes] = React.useState('');
  const [deleteCloudStorageFolderRes, setDeleteCloudStorageFolderRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const returnOpenFilePreview = (filePreviewParamsInput: string): void => {
    let filePreviewParams: FilePreviewParameters = JSON.parse(filePreviewParamsInput);
    setOpenFilePreviewRes('openFilePreview()' + noHubSdkMsg);
    files.openFilePreview(filePreviewParams);
  };

  const returnGetCloudStorageFolders = (channelId: string): void => {
    setGetCloudStorageFoldersRes('getCloudStorageFolders()' + noHubSdkMsg);
    files.getCloudStorageFolders(channelId, (err: SdkError, folders: files.CloudStorageFolder[]): void => {
      if (err) {
        setGetCloudStorageFoldersRes(err.errorCode.toString + ' ' + err.message);
        return;
      }
      setGetCloudStorageFoldersRes(JSON.stringify(folders));
    });
  };

  const returnAddCloudStorageFolder = (channelId: string): void => {
    setAddCloudStorageFolderRes('addCloudStorageFolder()' + noHubSdkMsg);
    files.addCloudStorageFolder(
      channelId,
      (err: SdkError, isFolderAdded: boolean, folders: files.CloudStorageFolder[]): void => {
        if (err) {
          setAddCloudStorageFolderRes(err.errorCode.toString + ' ' + err.message);
          return;
        }
        setAddCloudStorageFolderRes(JSON.stringify({ isFolderAdded, folders }));
      },
    );
  };

  const returnDeleteCloudStorageFolder = (input: string): void => {
    let deleteCloudStorageParams: DeleteCloudStorageParams = JSON.parse(input);
    setDeleteCloudStorageFolderRes('deleteCloudStorageFolder()' + noHubSdkMsg);
    files.deleteCloudStorageFolder(
      deleteCloudStorageParams.channelId,
      deleteCloudStorageParams.folderToDelete,
      (err: SdkError, isFolderDeleted: boolean): void => {
        if (err) {
          setDeleteCloudStorageFolderRes(err.errorCode.toString + ' ' + err.message);
          return;
        }
        setDeleteCloudStorageFolderRes(JSON.stringify(isFolderDeleted));
      },
    );
  };

  const checkFilesCapability = (): void => {
    if (files.isSupported()) {
      setCapabilityCheckRes('Files module is supported');
    } else {
      setCapabilityCheckRes('Files module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClickWithInput={returnOpenFilePreview}
        output={openFilePreviewRes}
        hasInput={true}
        title="Open File Preview"
        name="openFilePreview"
      />
      <BoxAndButton
        handleClickWithInput={returnGetCloudStorageFolders}
        output={getCloudStorageFoldersRes}
        hasInput={true}
        title="Get Cloud Storage Folders"
        name="getCloudStorageFolders"
      />
      <BoxAndButton
        handleClickWithInput={returnAddCloudStorageFolder}
        output={addCloudStorageFolderRes}
        hasInput={true}
        title="Add Cloud Storage Folder"
        name="addCloudStorageFolder"
      />
      <BoxAndButton
        handleClickWithInput={returnDeleteCloudStorageFolder}
        output={deleteCloudStorageFolderRes}
        hasInput={true}
        title="Delete Cloud Storage Folder"
        name="deleteCloudStorageFolder"
      />
      <BoxAndButton
        handleClick={checkFilesCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Files"
        name="checkCapabilityFiles"
      />
    </>
  );
};

export default FilesAPIs;
