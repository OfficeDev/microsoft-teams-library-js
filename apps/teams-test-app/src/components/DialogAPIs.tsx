import { dialog, DialogInfo, IAppWindow, ParentAppWindow } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { generateJsonParseErrorMsg, noHostSdkMsg } from '../App';
import BoxAndButton from './BoxAndButton';

const DialogAPIs = (): ReactElement => {
  const [openRes, setOpenRes] = React.useState('');
  const [resizeRes, setResizeRes] = React.useState('');
  const [submitRes, setSubmitRes] = React.useState('');
  const [capabilityCheckRes, setCapabilityCheckRes] = React.useState('');
  const [messageFromParent, setMessageFromParent] = React.useState<string>('');
  const [sendMessageToChildRes, setSendMessageToChildRes] = React.useState<string>('');
  const [sendMessageToParentRes, setSendMessageToParentRes] = React.useState<string>('');
  const childWindowRef = React.useRef<IAppWindow | null>(null);

  const openDialog = (dialogInfoInput: string): void => {
    const dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    const onComplete = (err: string, result: string): void => {
      setOpenRes('Error: ' + err + '\nResult: ' + result);
    };
    setOpenRes('dialog.open' + noHostSdkMsg);

    // Store the reference of child window in React
    const childWindow = dialog.open(dialogInfo, onComplete);
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setOpenRes(message);
    });
    childWindowRef.current = childWindow;
  };

  const resizeDialog = (dialogInfoInput: string): void => {
    const dialogInfo: DialogInfo = JSON.parse(dialogInfoInput);
    dialog.resize(dialogInfo);
    setResizeRes('Teams client SDK call dialog.resize was called');
  };

  const sendMessageToChild = (message: string): void => {
    if (childWindowRef.current && childWindowRef.current !== null) {
      const childWindow = childWindowRef.current as IAppWindow;
      childWindow.postMessage(message).then(() => {
        setSendMessageToChildRes('Message sent to child');
      });
    } else {
      setSendMessageToChildRes('childWindow doesnt exist');
    }
  };

  const sendMessageToParent = (message: string): void => {
    const parentWindow = ParentAppWindow.Instance;
    if (parentWindow) {
      parentWindow.postMessage(message).then(() => {
        setSendMessageToParentRes('Message sent to parent');
      });
    } else {
      setSendMessageToParentRes('parentWindow doesnt exist');
    }
  };

  const registerForParentMessage = (): void => {
    const parentWindow = ParentAppWindow.Instance;
    parentWindow.addEventListener('message', (message: string) => {
      setMessageFromParent(message);
    });
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
      <BoxAndButton
        handleClickWithInput={sendMessageToChild}
        output={sendMessageToChildRes}
        hasInput={true}
        title="sendMessageToChild"
        name="sendMessageToChild"
      />
      <BoxAndButton
        handleClickWithInput={sendMessageToParent}
        output={sendMessageToParentRes}
        hasInput={true}
        title="sendMessageToParent"
        name="sendMessageToParent"
      />
      <BoxAndButton
        handleClick={registerForParentMessage}
        output={messageFromParent}
        hasInput={false}
        title="registerForParentMessageInTaskModule"
        name="registerForParentMessage"
      />
    </>
  );
};

export default DialogAPIs;
