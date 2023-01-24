/* eslint-disable @typescript-eslint/ban-types */
import { AdaptiveCardDialogInfo, dialog, DialogInfo, IAppWindow, tasks } from '@microsoft/teams-js';
import React, { ReactElement } from 'react';

import { ApiWithoutInput, ApiWithTextInput } from './utils';
import { isTestBackCompat } from './utils/isTestBackCompat';
import { ModuleWrapper } from './utils/ModuleWrapper';

const DialogCardAPIs = (): ReactElement => {
  const childWindowRef = React.useRef<IAppWindow | null>(null);
  const openDialogHelper = (childWindow: IAppWindow, setResult: (result: string) => void): void => {
    childWindow.addEventListener('message', (message: string) => {
      // Message from parent
      setResult(message);
    });
    childWindowRef.current = childWindow;
  };
  const CheckDialogAdaptiveCardCapability = (): ReactElement =>
    ApiWithoutInput({
      name: 'checkCapabilityDialogAdaptiveCard',
      title: 'Check Capability Dialog Adaptive Card',
      onClick: async () => {
        if (dialog.adaptiveCard.isSupported()) {
          return 'Dialog Adaptive Card module is supported';
        } else {
          return 'Dialog Adaptive Card module is not supported';
        }
      },
    });

  const OpenAdaptiveCardDialog = (): ReactElement =>
    ApiWithTextInput<AdaptiveCardDialogInfo>({
      name: 'dialogAdaptiveCardOpen',
      title: 'Dialog Adaptive Card Open',
      onClick: {
        validateInput: (input) => {
          if (input.card === undefined) {
            throw 'Card is undefined';
          }
        },
        submit: async (adaptiveCardDialogInfo, setResult) => {
          if (isTestBackCompat()) {
            const taskInfo = adaptiveCardDialogInfo as DialogInfo;
            const onComplete = (err: string, result: string | object): void => {
              setResult('Error: ' + err + '\nResult: ' + result);
            };
            openDialogHelper(tasks.startTask(taskInfo, onComplete), setResult);
            return '';
          }
          const onComplete = (resultObj: dialog.ISdkResponse): void => {
            setResult('Error: ' + resultObj.err + '\nResult: ' + resultObj.result);
          };
          dialog.adaptiveCard.open(adaptiveCardDialogInfo as AdaptiveCardDialogInfo, onComplete);
          return '';
        },
      },
    });
  return (
    <ModuleWrapper title="Dialog.Card">
      <CheckDialogAdaptiveCardCapability />
      <OpenAdaptiveCardDialog />
    </ModuleWrapper>
  );
};

export default DialogCardAPIs;
