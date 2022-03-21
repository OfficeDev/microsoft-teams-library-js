/* eslint-disable @typescript-eslint/ban-types */
import {
  dialog,
  DialogInfo,
  DialogSize,
  IAppWindow,
  ParentAppWindow,
  SdkResponse,
  TaskInfo,
  tasks,
  UrlDialogInfo,
} from '@microsoft/teams-js';
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

  const StartTask = (): ReactElement =>
    ApiWithTextInput<DialogInfo | TaskInfo>({
      name: 'dialogOpen',
      title: 'Start Task',
      onClick: {
        validateInput: input => {
          if (input.url === undefined) {
            throw new Error('Url undefined');
          }
        },
        submit: async (taskInfo, setResult) => {
          const onComplete = (err: string, result: string | object): void => {
            setResult('Error: ' + err + '\nResult: ' + result);
          };
          openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
          return '';
        },
      },
    });

  const OpenDialog = (): ReactElement =>
    ApiWithTextInput<UrlDialogInfo>({
      name: 'dialogOpen_v2',
      title: 'Dialog Open',
      onClick: {
        validateInput: input => {
          if (input.url === undefined) {
            throw new Error('Url undefined');
          }
        },
        submit: async (urlDialogInfo, setResult) => {
          const onComplete = (resultObj: SdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          const messageFromChildHandler: dialog.PostMessageChannel = (message: string): void => {
            // Message from parent
            setResult(message);
          };
          dialog.open(urlDialogInfo, onComplete, messageFromChildHandler);
          return '';
        },
      },
    });

  const UpdateTaskModule = (): ReactElement =>
    ApiWithTextInput<TaskInfo>({
      name: 'updateTaskModule',
      title: 'Update Task Module',
      onClick: {
        validateInput: input => {
          if (input.height === undefined && input.width === undefined) {
            throw new Error('Height and width undefined');
          }
        },
        submit: async (taskInfo, setResult) => {
          tasks.updateTask(taskInfo);
          setResult('Teams client SDK call tasks.updateTask was called');
          return '';
        },
      },
    });

  const ResizeDialog = (): ReactElement =>
    ApiWithTextInput<DialogSize>({
      name: 'dialogResize',
      title: 'Dialog Resize',
      onClick: {
        validateInput: input => {
          if (!input) {
            throw new Error('input is undefined');
          }
        },
        submit: {
          withPromise: async (dimensions, setResult) => {
            dialog.update.resize(dimensions);
            setResult('Teams client SDK call dailog.update.resize was called');
            return '';
          },
          //For V1 back compatibility
          withCallback: (taskInfo, setResult) => {
            tasks.updateTask(taskInfo);
            setResult('Teams client SDK call tasks.updateTask was called');
          },
        },
      },
    });

  const CheckDialogResizeCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityResizeDialog',
      title: 'Check Capability Resize Dialog',
      onClick: async () => {
        if (dialog.update.isSupported()) {
          return 'Dialog.update module is supported';
        } else {
          return 'Dialog.update module is not supported';
        }
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

  const SendMessageToChild_v2 = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToChild_v2',
      title: 'sendMessageToChild_v2',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validateInput: () => {},
        submit: async (message, setResult) => {
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
          const dialogInfo = {
            url: 'someUrl',
            size: {
              height: 5,
              width: 5,
            },
          };
          const sendMessageToDialogHandler = dialog.open(dialogInfo);
          sendMessageToDialogHandler(message, onComplete);
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

  const SendMessageToParent_v2 = (): ReactElement =>
    ApiWithTextInput<string>({
      name: 'sendMessageToParent_v2',
      title: 'sendMessageToParent_v2',
      onClick: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        validateInput: () => {},
        submit: async (message, setResult) => {
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
          dialog.sendMessageToParentFromDialog(message, onComplete);
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

  const RegisterForParentMessage_v2 = (): ReactElement =>
    ApiWithoutInput({
      name: 'registerForParentMessage_v2',
      title: 'registerForParentMessage_v2',
      onClick: async setResult => {
        dialog.registerOnMessageFromParent((message: string) => {
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
      <StartTask />
      <OpenDialog />
      <UpdateTaskModule />
      <ResizeDialog />
      <CheckDialogResizeCapability />
      <SubmitDialogWithInput />
      <SendMessageToChild />
      <SendMessageToChild_v2 />
      <SendMessageToParent />
      <SendMessageToParent_v2 />
      <RegisterForParentMessage />
      <RegisterForParentMessage_v2 />
    </>
  );
};

export default DialogAPIs;
