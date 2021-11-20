/* eslint-disable @typescript-eslint/ban-types */
import { dialog, DialogInfo } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateJsonParseErrorMsg, noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const DialogAPIs = (): ReactElement => {
  const [openRes, setOpenRes] = React.useState('');
  const [resizeRes, setResizeRes] = React.useState('');
  const [submitRes, setSubmitRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');

  const openDialog = (dialogInfoInput: string): void => {
    const dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    const onComplete = (err: string, result: string | object): void => {
      setOpenRes('Error: ' + err + '\nResult: ' + result);
    };
    setOpenRes('dialog.open' + noHostSdkMsg);
    dialog.open(dialogInfo, onComplete);
  };

  const resizeDialog = (dialogInfoInput: string): void => {
    const dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    dialog.resize(dialogInfo);
    setResizeRes('Teams client SDK call dialog.resize was called');
  };

  const submitDialogWithInput = (submitDialogInput: string): void => {
    if (submitDialogInput.length == 0) {
      dialog.submit();
      setSubmitRes('Teams client SDK call dialog.submit was called with no arguments');
    } else {
      try {
        const parsedInput = JSON.parse(submitDialogInput);
        dialog.submit(parsedInput.result, parsedInput.appIds);
        setSubmitRes('Teams client SDK call dialog.submit was called with arguments');
      } catch (error) {
        if (error instanceof SyntaxError) {
          setSubmitRes(generateJsonParseErrorMsg());
        } else if (error instanceof Error) {
          setSubmitRes(error.message);
        } else {
          setSubmitRes(JSON.stringify(error));
        }
      }
    }
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
      <h1>dialog</h1>
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
        handleClickWithInput={submitDialogWithInput}
        output={submitRes}
        hasInput={true}
        title="Dialog Submit With Input"
        name="dialogSubmitWithInput"
      />
    </>
  );
};

export default DialogAPIs;
