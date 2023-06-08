/* eslint-disable @typescript-eslint/ban-types */
import { BotUrlDialogInfo, dialog, DialogInfo, IAppWindow, tasks } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogUrlBotAPIs = (): ReactElement => {
  const childWindowRef = React.useRef<IAppWindow | null>(null);
  const openDialogHelper = (childWindow: IAppWindow, setResult: (result: string) => void): void => {
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setResult(message);
    });
    childWindowRef.current = childWindow;
  };
  const CheckDialogUrlBotCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogUrlBot',
      title: 'Check Capability Dialog Url Bot',
      onClick: async () => {
        if (dialog.url.bot.isSupported()) {
          return 'Dialog Url bot module is supported';
        } else {
          return 'Dialog Url bot module is not supported';
        }
      },
    });

  const OpenUrlBotDialog = (): ReactElement =>
    ApiWithTextInput<BotUrlDialogInfo>({
      name: 'dialogUrlBotOpen',
      title: 'Dialog Url Bot Open',
      onClick: {
        validateInput: (input) => {
          if (input.url === undefined) {
            throw 'Url is undefined';
          }
          if (input.completionBotId === undefined) {
            throw 'completionBotId is undefined';
          }
        },
        submit: async (urlBotDialogInfo, setResult) => {
          if (isTestBackCompat()) {
            const taskInfo = urlBotDialogInfo as DialogInfo;
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
            return '';
          }
          const onComplete = (resultObj: dialog.ISdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          dialog.url.bot.open(urlBotDialogInfo as BotUrlDialogInfo, onComplete);
          return '';
        },
      },
    });
  return (
    <ModuleWrapper title="Dialog.Url.Bot">
      <CheckDialogUrlBotCapability />
      <OpenUrlBotDialog />
    </ModuleWrapper>
  );
};

export default DialogUrlBotAPIs;
