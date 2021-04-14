import React, { ReactElement } from 'react';
import { DialogInfo, dialog } from '@microsoft/teamsjs-app-sdk';
import BoxAndButton from './BoxAndButton';
import { noHubSdkMsg } from '../App';

const DialogAPIs = (): ReactElement => {
  const [openRes, setOpenRes] = React.useState('');
  const [resizeRes, setResizeRes] = React.useState('');
  const [submitRes, setSubmitRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const openDialog = (dialogInfoInput: string): void => {
    let dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    const onComplete = (err: string, result: string): void => {
      setOpenRes('Error: ' + err + '\nResult: ' + result);
    };
    dialog.open(dialogInfo, onComplete);
    setOpenRes('dialog.open' + noHubSdkMsg);
  };

  const resizeDialog = (dialogInfoInput: string): void => {
    let dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    dialog.resize(dialogInfo);
    setResizeRes('App SDK call dialog.resize was called');
  };

  const submitDialog = (result: string): void => {
    dialog.submit(result);
    setSubmitRes('App SDK call dialog.submit was called');
  };

  const checkDialogCapability = (): void => {
    if (dialog.isSupported()) {
      setCapabilityCheckRes('Dialog module is supported');
    } else {
      setCapabilityCheckRes('Dialog module is not supported');
    }
  };

  return (
    <>
      <BoxAndButton
        handleClick={checkDialogCapability}
        output={capabilityCheckRes}
        hasInput={false}
        title="Check Capability Dialog"
        name="checkCapabilityDialog"
      />
      <BoxAndButton
        handleClickWithInput={openDialog}
        output={openRes}
        hasInput={true}
        title="Dialog Open"
        name="dialogOpen"
      />
      <BoxAndButton
        handleClickWithInput={resizeDialog}
        output={resizeRes}
        hasInput={true}
        title="Dialog Resize"
        name="dialogResize"
      />
      <BoxAndButton
        handleClickWithInput={submitDialog}
        output={submitRes}
        hasInput={true}
        title="Dialog Submit"
        name="dialogSubmit"
      />
    </>
  );
};

export default DialogAPIs;
