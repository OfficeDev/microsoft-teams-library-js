import React, { ReactElement } from 'react';
import { FilePreviewParameters, openFilePreview } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const PrivateAPIs = (): ReactElement => {
  const [openFilePreviewRes, setOpenFilePreviewRes] = React.useState('');

  const returnOpenFilePreview = (filePreviewParamsInput: string): void => {
    let filePreviewParams: FilePreviewParameters = JSON.parse(filePreviewParamsInput);
    setOpenFilePreviewRes('openFilePreview()' + noHubSdkMsg);
    openFilePreview(filePreviewParams);
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
    </>
  );
};

export default PrivateAPIs;
