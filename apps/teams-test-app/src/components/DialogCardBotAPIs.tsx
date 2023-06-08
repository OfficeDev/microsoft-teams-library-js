/* eslint-disable @typescript-eslint/ban-types */
import { BotAdaptiveCardDialogInfo, dialog, DialogInfo, IAppWindow, tasks } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogCardBotAPIs = (): ReactElement => {
  const childWindowRef = React.useRef<IAppWindow | null>(null);
  const openDialogHelper = (childWindow: IAppWindow, setResult: (result: string) => void): void => {
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setResult(message);
    });
    childWindowRef.current = childWindow;
  };
  const CheckDialogAdaptiveCardBotCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogAdaptiveCardBot',
      title: 'Check Capability Dialog Adaptive Card Bot',
      onClick: async () => {
        if (dialog.adaptiveCard.bot.isSupported()) {
          return 'Dialog Adaptive Card bot module is supported';
        } else {
          return 'Dialog Adaptive Card bot module is not supported';
        }
      },
    });

  const OpenAdaptiveCardBotDialog = (): ReactElement =>
    ApiWithTextInput<BotAdaptiveCardDialogInfo>({
      name: 'dialogAdaptiveCardBotOpen',
      title: 'Dialog Adaptive Card Bot Open',
      onClick: {
        validateInput: (input) => {
          if (input.card === undefined) {
            throw 'Card is undefined';
          }
          if (input.completionBotId === undefined) {
            throw 'completionBotId is undefined';
          }
        },
        submit: async (adaptiveCardBotDialogInfo, setResult) => {
          if (isTestBackCompat()) {
            const taskInfo = adaptiveCardBotDialogInfo as DialogInfo;
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
            return '';
          }
          const onComplete = (resultObj: dialog.ISdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          dialog.adaptiveCard.bot.open(adaptiveCardBotDialogInfo as BotAdaptiveCardDialogInfo, onComplete);
          return '';
        },
      },
    });
  return (
    <ModuleWrapper title="Dialog.Card.Bot">
      <CheckDialogAdaptiveCardBotCapability />
      <OpenAdaptiveCardBotDialog />
    </ModuleWrapper>
  );
};

export default DialogCardBotAPIs;
