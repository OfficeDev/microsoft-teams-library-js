/* eslint-disable @typescript-eslint/ban-types */
import { dialog, DialogInfo, IAppWindow, ParentAppWindow, TaskInfo, tasks } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';

const DialogAPIs = (): ReactElement => {
  const childWindowRef = React.useRef<IAppWindow | null>(null);

  const openDialogHelper = (childWindow: IAppWindow, setResult: (result: string) => void): void => {
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setResult(message);
    });
    childWindowRef.current = childWindow;
  };

  const OpenDialog = (): ReactElement =>
    ApiWithTextInput<DialogInfo | TaskInfo>({
      name: 'dialogOpen',
      title: 'Dialog Open',
      onClick: {
        validateInput: input => {
          if (input.url === undefined) {
            throw new Error('Url undefined');
          }
        },
        submit: {
          withPromise: async (dialogInfo, setResult) => {
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            openDialogHelper(dialog.open(dialogInfo, onComplete), setResult);
            return '';
          },
          withCallback: (taskInfo, setResult) => {
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            // Store the reference of child window in React
            openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
          },
        },
      },
    });

  const ResizeDialog = (): ReactElement =>
    ApiWithTextInput<DialogInfo | TaskInfo>({
      name: 'dialogResize',
      title: 'Dialog Resize',
      onClick: {
        validateInput: input => {
          if (input.height === undefined && input.width === undefined) {
            throw new Error('Height and width undefined');
          }
        },
        submit: {
          withPromise: async dialogInfo => {
            dialog.resize(dialogInfo);
            return 'Teams client SDK call dialog.resize was called';
          },
          withCallback: (taskInfo, setResult) => {
            tasks.updateTask(taskInfo);
            setResult('Teams client SDK call tasks.updateTask was called');
          },
        },
      },
    });

  const SendMessageToChild = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToChild',
      title: 'sendMessageToChild',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validateInput: () => {},
        submit: async (message, setResult) => {
          if (childWindowRef.current && childWindowRef.current !== null) {
            const childWindow = childWindowRef.current;
            const onComplete = (status: boolean, reason?: string): void => {
              if (!status) {
                if (reason) {
                  setResult(JSON.stringify(reason));
                } else {
                  setResult("Status is false but there's no reason?! This shouldn't happen.");
                }
              } else {
                setResult('Message sent to child');
              }
            };
            childWindow.postMessage(message, onComplete);
          } else {
            setResult("childWindow doesn't exist");
          }
          return '';
        },
      },
    });

  const SendMessageToParent = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToParent',
      title: 'sendMessageToParent',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validateInput: () => {},
        submit: async (message, setResult) => {
          const parentWindow = ParentAppWindow.Instance;
          if (parentWindow) {
            const onComplete = (status: boolean, reason?: string): void => {
              if (!status) {
                if (reason) {
                  setResult(JSON.stringify(reason));
                } else {
                  setResult("Status is false but there's no reason?! This shouldn't happen.");
                }
              } else {
                setResult('Message sent to parent');
              }
            };
            parentWindow.postMessage(message, onComplete);
          } else {
            setResult("parentWindow doesn't exist");
          }
          return '';
        },
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
      onClick: {
        validateInput: input => {
          if (input.result === undefined && input.appIds === undefined) {
            throw new Error('Result and appIds undefined');
          }
        },
        submit: {
          withPromise: async submitInput => {
            dialog.submit(submitInput.result, submitInput.appIds);
            return '';
          },
          withCallback: submitInput => {
            tasks.submitTask(submitInput.result, submitInput.appIds);
          },
        },
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
