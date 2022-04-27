/* eslint-disable @typescript-eslint/ban-types */
import { dialog, DialogInfo, DialogSize, IAppWindow, ParentAppWindow, tasks, UrlDialogInfo } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';

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
    ApiWithTextInput<UrlDialogInfo | DialogInfo>({
      name: 'dialogOpen',
      title: 'Dialog Open',
      onClick: {
        validateInput: input => {
          if (input.url === undefined) {
            throw new Error('Url undefined');
          }
        },
        submit: async (urlDialogInfo, setResult) => {
          if (isTestBackCompat()) {
            const taskInfo = urlDialogInfo as DialogInfo;
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
            return '';
          }
          const onComplete = (resultObj: dialog.ISdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          const messageFromChildHandler: dialog.PostMessageChannel = (message: string): void => {
            // Message from parent
            setResult(message);
          };
          dialog.open(urlDialogInfo as UrlDialogInfo, onComplete, messageFromChildHandler);
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
        submit: async (dimensions, setResult) => {
          if (isTestBackCompat()) {
            tasks.updateTask(dimensions);
          } else {
            dialog.update.resize(dimensions);
          }
          setResult('Teams client SDK call dialog.update.resize was called');
          return '';
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
          if (isTestBackCompat()) {
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
          } else {
            setResult('Message sent to child');
            dialog.sendMessageToDialog(message);
            return '';
          }
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
          if (isTestBackCompat()) {
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
          } else {
            setResult('Message sent to parent');
            dialog.sendMessageToParentFromDialog(message);
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
        let msg = 'Completed';
        if (isTestBackCompat()) {
          const parentWindow = ParentAppWindow.Instance;
          parentWindow.addEventListener('message', (message: string) => {
            setResult(message);
          });
        } else {
          const callback = (message: string): void => {
            msg = message;
            setResult(message);
          };
          dialog.registerOnMessageFromParent(callback);
        }
        return msg;
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
      <CheckDialogResizeCapability />
      <SubmitDialogWithInput />
      <SendMessageToChild />
      <SendMessageToParent />
      <RegisterForParentMessage />
    </>
  );
};

export default DialogAPIs;
