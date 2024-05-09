/* eslint-disable @typescript-eslint/ban-types */
import { dialog, DialogInfo, IAppWindow, ParentAppWindow, tasks, UrlDialogInfo } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogUrlAPIs = ({ childWindowRef }): ReactElement => {
  const openDialogHelper = (childWindow: IAppWindow, setResult: (result: string) => void): void => {
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setResult(message);
    });
    childWindowRef.current = childWindow;
  };

  const CheckDialogUrlCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogUrl',
      title: 'Check Capability Dialog Url',
      onClick: async () => {
        if (dialog.url.isSupported()) {
          return 'Dialog Url module is supported';
        } else {
          return 'Dialog Url module is not supported';
        }
      },
    });

  const OpenDialog = (): ReactElement =>
    ApiWithTextInput<UrlDialogInfo | DialogInfo>({
      name: 'dialogOpen',
      title: 'Dialog Open',
      onClick: {
        validateInput: (input) => {
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
          dialog.url.open(urlDialogInfo as UrlDialogInfo, onComplete, messageFromChildHandler);
          return '';
        },
      },
      defaultInput: JSON.stringify({
        url: 'https://localhost:4000',
        title: 'Dialog Title',
        size: 'large',
      }),
    });

  const SubmitDialogWithInput = (): ReactElement =>
    ApiWithTextInput<{ result?: string; appIds?: string | string[] }>({
      name: 'dialogSubmitWithInput',
      title: 'Dialog Submit With Input',
      onClick: {
        validateInput: (input) => {
          if (input.result === undefined && input.appIds === undefined) {
            throw new Error('Result and appIds undefined');
          }
        },
        submit: {
          withPromise: async (submitInput) => {
            dialog.url.submit(submitInput.result, submitInput.appIds);
            return '';
          },
          withCallback: (submitInput) => {
            tasks.submitTask(submitInput.result, submitInput.appIds);
          },
        },
      },
      defaultInput: JSON.stringify({
        result: 'Success',
        appIds: ['appId1', 'appId2'],
      }),
    });

  return (
    <ModuleWrapper title="Dialog.Url">
      <CheckDialogUrlCapability />
      <OpenDialog />
      <SubmitDialogWithInput />
    </ModuleWrapper>
  );
};

export default DialogUrlAPIs;
