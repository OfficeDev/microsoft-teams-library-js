/* eslint-disable @typescript-eslint/ban-types */
import { dialog, ParentAppWindow } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogUrlParentCommunicationAPIs = ({ childWindowRef }): ReactElement => {
  const CheckDialogParentCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogParentCommunication',
      title: 'Check Capability Dialog Parent Communication',
      onClick: async () => {
        if (dialog.url.parentCommunication.isSupported()) {
          return 'Dialog parent communication module is supported';
        } else {
          return 'Dialog parent communication module is not supported';
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
            dialog.url.parentCommunication.sendMessageToDialog(message);
            return '';
          }
        },
      },
      defaultInput: '"Hello from parent"',
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
            dialog.url.parentCommunication.sendMessageToParentFromDialog(message);
          }
          return '';
        },
      },
      defaultInput: '"Hello from child"',
    });

  const RegisterForParentMessage = (): ReactElement =>
    ApiWithoutInput({
      name: 'registerForParentMessage',
      title: 'registerForParentMessage',
      onClick: async (setResult) => {
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
          dialog.url.parentCommunication.registerOnMessageFromParent(callback);
        }
        return msg;
      },
    });

  return (
    <ModuleWrapper title="Dialog.Url.ParentCommunication">
      <CheckDialogParentCapability />
      <SendMessageToChild />
      <SendMessageToParent />
      <RegisterForParentMessage />
    </ModuleWrapper>
  );
};

export default DialogUrlParentCommunicationAPIs;
