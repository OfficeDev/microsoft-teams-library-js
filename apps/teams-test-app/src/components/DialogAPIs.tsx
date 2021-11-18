import { dialog, DialogInfo, IAppWindow, ParentAppWindow } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const DialogAPIs = (): ReactElement => {
  const childWindowRef = React.useRef<IAppWindow | null>(null);


  const OpenDialog = (): ReactElement =>
    ApiWithTextInput<DialogInfo>({
      name: 'dialogOpen',
      title: 'Dialog Open',
      onClick: {
        validateInput: input => {
          if (input.url === undefined) {
            throw new Error('Url undefined');
          }
        },
        submit: async (dialogInfo, setResult) => {
          const onComplete = (err: string, result: string | object): void => {
            setResult('Error: ' + err + '\nResult: ' + result);
          };
          // Store the reference of child window in React
          const childWindow = dialog.open(dialogInfo, onComplete);
          childWindow.addEventListener('message', (message: string) => {
            // Message from parent
            setResult(message);
          });
          childWindowRef.current = childWindow;
          return '';
        },
      },
    });

  const ResizeDialog = (): ReactElement =>
    ApiWithTextInput<DialogInfo>({
      name: 'dialogResize',
      title: 'Dialog Resize',
      onClick: async dialogInfo => {
        dialog.resize(dialogInfo);
        return 'Teams client SDK call dialog.resize was called';
      },
    });

  const SendMessageToChild = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToChild',
      title: 'sendMessageToChild',
      onClick: async message => {
        if (childWindowRef.current && childWindowRef.current !== null) {
          const childWindow = childWindowRef.current;
          await childWindow.postMessage(message);
          return 'Message sent to child';
        } else {
          return 'childWindow doesnt exist';
        }
      },
    });

  const SendMessageToParent = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToParent',
      title: 'sendMessageToParent',
      onClick: async message => {
        const parentWindow = ParentAppWindow.Instance;
        if (parentWindow) {
          await parentWindow.postMessage(message);
          return 'Message sent to parent';
        } else {
          return 'parentWindow doesn\'t exist';
        }
      },
    });

  const RegisterForParentMessage = (): ReactElement =>
    ApiWithoutInput({
      name: 'registerForParentMessage',
      title: 'registerForParentMessage',
      onClick: async setResult => {
        const parentWindow = ParentAppWindow.Instance;
        parentWindow.addEventListener('message', (message: string) => {
          setResult(message);
        });
        return 'Completed';
      },
    });

  const SubmitDialogWithInput = (): ReactElement =>
    ApiWithTextInput<{ result?: string; appIds?: string | string[] }>({
      name: 'dialogSubmitWithInput',
      title: 'Dialog Submit With Input',
      onClick: async submitInput => {
        dialog.submit(submitInput.result, submitInput.appIds);
        return '';
      },
    });

  const CheckDialogCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialog',
      title: 'Check Capability Dialog',
      onClick: async () => {
        if (dialog.isSupported()) {
          return 'Dialog module is supported';
        } else {
          return 'Dialog module is not supported';
        }
      },
    });

  return (
    <>
      <h1>dialog</h1>
      <CheckDialogCapability />
      <OpenDialog />
      <ResizeDialog />
      <SubmitDialogWithInput />
      <SendMessageToChild />
      <SendMessageToParent />
      <RegisterForParentMessage />
    </>
  );
};

export default DialogAPIs;
