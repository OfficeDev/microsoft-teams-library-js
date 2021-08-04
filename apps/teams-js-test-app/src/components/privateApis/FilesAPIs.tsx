import React, { ReactElement } from 'react';
import { FilePreviewParameters, files, SdkError } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from '../BoxAndButton';
import { generateJsonParseErrorMsg, noHubSdkMsg } from '../../App';

interface DeleteCloudStorageParams {
  channelId: string;
  folderToDelete: files.CloudStorageFolder;
}

const FilesAPIs = (): ReactElement => {
  const [openFilePreviewRes, setOpenFilePreviewRes] = React.useState('');
  const [getCloudStorageFoldersRes, setGetCloudStorageFoldersRes] = React.useState('');
  const [addCloudStorageFolderRes, setAddCloudStorageFolderRes] = React.useState('');
  const [deleteCloudStorageFolderRes, setDeleteCloudStorageFolderRes] = React.useState('');
  const [getCloudStorageFolderContentsRes, setGetCloudStorageFolderContentsRes] = React.useState('');
  const [openCloudStorageFileRes, setOpenCloudStorageFileRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const returnOpenFilePreview = (filePreviewParamsInput: string): void => {
    const filePreviewParams: FilePreviewParameters = JSON.parse(filePreviewParamsInput);
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
    const deleteCloudStorageParams: DeleteCloudStorageParams = JSON.parse(input);
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

  const getCloudStorageFolderContents = (input: string): void => {
    try {
      const parsedInput = JSON.parse(input);
      const callback = (error: SdkError, items: files.CloudStorageFolderItem[]): void => {
        if (error) {
          setGetCloudStorageFolderContentsRes(JSON.stringify(error));
        } else {
          setGetCloudStorageFolderContentsRes(JSON.stringify(items));
        }
      };
      setGetCloudStorageFolderContentsRes('getCloudStorageFolderContents()' + noHubSdkMsg);
      files.getCloudStorageFolderContents(parsedInput.folder, parsedInput.providerCode, callback);
    } catch (e) {
      if (e instanceof SyntaxError) {
        setGetCloudStorageFolderContentsRes(generateJsonParseErrorMsg());
      } else {
        setGetCloudStorageFolderContentsRes(e.toString());
      }
    }
  };

  const openCloudStorageFile = (input: string): void => {
    try {
      const parsedInput = JSON.parse(input);
      files.openCloudStorageFile(parsedInput.file, parsedInput.providerCode, parsedInput.fileOpenPreference);
      setOpenCloudStorageFileRes('openCloudStorageFile() called.');
    } catch (e) {
      if (e instanceof SyntaxError) {
        setOpenCloudStorageFileRes(generateJsonParseErrorMsg());
      } else {
        setGetCloudStorageFolderContentsRes(e.toString());
      }
    }
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
      <h1>files</h1>
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
        handleClickWithInput={getCloudStorageFolderContents}
        output={getCloudStorageFolderContentsRes}
        hasInput={true}
        title="Get Cloud Storage Folder Contents"
        name="getCloudStorageFolderContents"
      />
      <BoxAndButton
        handleClickWithInput={openCloudStorageFile}
        output={openCloudStorageFileRes}
        hasInput={true}
        title="Open Cloud Storage File"
        name="openCloudStorageFile"
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
